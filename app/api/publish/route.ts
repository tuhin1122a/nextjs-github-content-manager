import { Draft } from "@/types";
import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

// Interface for publishing result of each draft
interface PublishResult {
  draft: string;
  response?: unknown;
  error?: string;
}

// GitHub repository configuration
const OWNER = "tuhin1122a";
const REPO = "E-com-Store";
const COMMITTER = { name: "Tuhinur", email: "tuhinrahmna48@gmail.com" };
const DRAFTS_PATH = "drafts";

/**
 * Ensures that the drafts folder exists in the repository.
 * If it does not exist, creates a .gitkeep file to initialize the folder.
 */
async function ensureFolder(octokit: Octokit, branch: string) {
  try {
    await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      {
        owner: OWNER,
        repo: REPO,
        path: DRAFTS_PATH,
        branch,
      }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 404) {
      // Folder does not exist; create a .gitkeep file
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: OWNER,
        repo: REPO,
        path: `${DRAFTS_PATH}/.gitkeep`,
        message: "Create drafts folder",
        content: Buffer.from("").toString("base64"),
        branch,
        committer: COMMITTER,
      });
    } else {
      throw new Error(e.message || "Error checking folder");
    }
  }
}

/**
 * Retrieves the SHA of a file in the repository if it exists.
 * Returns undefined if the file does not exist.
 */
async function getFileSha(octokit: Octokit, path: string, branch: string) {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path, branch }
    );
    return (data as { sha: string }).sha;
  } catch (err: unknown) {
    const e = err as { status?: number };
    if (e.status === 404) return undefined;
    throw err;
  }
}

/**
 * Handles POST requests to publish drafts to GitHub.
 * Accepts an array of Draft objects, creates/updates markdown files in the repository,
 * and returns the result of each draft operation.
 */
export async function POST(req: Request) {
  try {
    // Parse request body and validate drafts
    const { drafts }: { drafts: Draft[] } = await req.json();
    if (!drafts?.length)
      return NextResponse.json(
        { error: "No drafts provided" },
        { status: 400 }
      );

    const token = process.env.GITHUB_TOKEN;
    if (!token)
      return NextResponse.json(
        { error: "GitHub token not set" },
        { status: 500 }
      );

    const octokit = new Octokit({ auth: token });

    // Retrieve repository information to detect default branch
    const { data: repoInfo } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner: OWNER,
        repo: REPO,
      }
    );
    const BRANCH = repoInfo.default_branch;

    // Ensure the drafts folder exists before publishing
    await ensureFolder(octokit, BRANCH);

    const results: PublishResult[] = [];

    // Iterate through each draft and publish it
    for (const draft of drafts) {
      if (!draft.title?.trim()) {
        results.push({
          draft: draft.title || "EMPTY_TITLE",
          response: "Skipped due to empty title",
        });
        continue;
      }

      // Sanitize title for file name
      const safeTitle = draft.title.replace(/[^a-zA-Z0-9-_]/g, "_");
      const path = `${DRAFTS_PATH}/${safeTitle}.md`;
      const content = Buffer.from(`# ${draft.title}\n\n${draft.body}`).toString(
        "base64"
      );

      try {
        // Check if file already exists to get SHA for update
        const sha = await getFileSha(octokit, path, BRANCH);

        // Create or update file in the repository
        const res = await octokit.request(
          "PUT /repos/{owner}/{repo}/contents/{path}",
          {
            owner: OWNER,
            repo: REPO,
            path,
            message: sha
              ? `Update draft ${draft.title}`
              : `Create draft ${draft.title}`,
            committer: COMMITTER,
            content,
            branch: BRANCH,
            ...(sha && { sha }),
          }
        );

        results.push({ draft: draft.title, response: res.data });
      } catch (err: unknown) {
        const e = err as { message?: string };
        results.push({
          draft: draft.title,
          error: e.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json(
      { error: e.message || "Failed to publish drafts" },
      { status: 500 }
    );
  }
}
