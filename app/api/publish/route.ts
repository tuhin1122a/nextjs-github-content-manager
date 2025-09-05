import { Draft } from "@/types";
import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

interface PublishResult {
  draft: string;
  response?: unknown;
  error?: string;
}

interface GitHubFileData {
  sha: string;
}

export async function POST(req: Request) {
  try {
    const { drafts }: { drafts: Draft[] } = await req.json();
    if (!drafts || drafts.length === 0) {
      return NextResponse.json(
        { error: "No drafts provided" },
        { status: 400 }
      );
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = "tuhin1122a";
    const REPO = "E-com-Store";

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GitHub token not set" },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const { data: repoInfo } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      { owner: OWNER, repo: REPO }
    );
    const BRANCH = repoInfo.default_branch;

    const draftsPath = "drafts";

    // Ensure folder exists
    try {
      await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
        { owner: OWNER, repo: REPO, path: draftsPath, branch: BRANCH }
      );
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) {
        await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
          owner: OWNER,
          repo: REPO,
          path: `${draftsPath}/.gitkeep`,
          message: "Create drafts folder",
          content: Buffer.from("").toString("base64"),
          branch: BRANCH,
          committer: { name: "Tuhinur", email: "tuhinrahmna48@gmail.com" },
        });
      } else {
        return NextResponse.json(
          { error: e.message || "Error checking folder" },
          { status: 500 }
        );
      }
    }

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
      const path = `drafts/${safeTitle}.md`;
      const content = Buffer.from(`# ${draft.title}\n\n${draft.body}`).toString(
        "base64"
      );

      let sha: string | undefined;

      // Check if file exists
      try {
        const { data: fileData } = await octokit.request(
          "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
          { owner: OWNER, repo: REPO, path, branch: BRANCH }
        );
        sha = (fileData as GitHubFileData).sha;
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        if (e.status !== 404) {
          results.push({ draft: draft.title, error: e.message });
          continue;
        }
      }

      try {
        const res = await octokit.request(
          "PUT /repos/{owner}/{repo}/contents/{path}",
          {
            owner: OWNER,
            repo: REPO,
            path,
            message: sha
              ? `Update draft ${draft.title}`
              : `Create draft ${draft.title}`,
            committer: { name: "Tuhinur", email: "tuhinrahmna48@gmail.com" },
            content,
            branch: BRANCH,
            ...(sha && { sha }),
          }
        );
        results.push({ draft: draft.title, response: res.data });
      } catch (err: unknown) {
        const e = err as { message?: string };
        results.push({ draft: draft.title, error: e.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json(
      { error: e.message ?? "Failed to publish drafts" },
      { status: 500 }
    );
  }
}
