import { Draft, PublishResult } from "@/types";
import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

// GitHub configuration from environment variables
const OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER!;
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO!;
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH!;
const COMMITTER = {
  name: process.env.GITHUB_COMMITTER_NAME!,
  email: process.env.GITHUB_COMMITTER_EMAIL!,
};
const DRAFTS_PATH = process.env.NEXT_PUBLIC_DRAFTS_PATH!;

/**
 * Ensures that the drafts folder exists in the repository.
 * If it does not exist, creates a .gitkeep file to initialize the folder.
 */
async function ensureFolder(octokit: Octokit) {
  try {
    await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path: DRAFTS_PATH, branch: BRANCH }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 404) {
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: OWNER,
        repo: REPO,
        path: `${DRAFTS_PATH}/.gitkeep`,
        message: "Create drafts folder",
        content: Buffer.from("").toString("base64"),
        branch: BRANCH,
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
async function getFileSha(octokit: Octokit, path: string) {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
      { owner: OWNER, repo: REPO, path, branch: BRANCH }
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
 */
export async function POST(req: Request) {
  try {
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

    await ensureFolder(octokit);

    const results: PublishResult[] = [];

    for (const draft of drafts) {
      if (!draft.title?.trim()) {
        results.push({
          draft: draft.title || "EMPTY_TITLE",
          response: "Skipped due to empty title",
        });
        continue;
      }

      const safeTitle = draft.title.replace(/[^a-zA-Z0-9-_]/g, "_");
      const path = `${DRAFTS_PATH}/${safeTitle}.md`;
      const content = Buffer.from(`# ${draft.title}\n\n${draft.body}`).toString(
        "base64"
      );

      try {
        const sha = await getFileSha(octokit, path);

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
