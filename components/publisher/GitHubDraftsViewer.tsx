"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubFile } from "@/types";
import { RefreshCw } from "lucide-react";
import { marked } from "marked";

interface GitHubDraftsViewerProps {
  files: GitHubFile[];
  loading: boolean;
  onRefresh: () => void;
}

export function GitHubDraftsViewer({
  files,
  loading,
  onRefresh,
}: GitHubDraftsViewerProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center pb-4">
        <CardTitle className="text-xl font-semibold">
          GitHub Drafts (Read-Only)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-auto">
        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No markdown files found in the GitHub repository.</p>
        ) : (
          files.map((file) => (
            <Card
              key={file.sha}
              className="bg-card/50 border border-border shadow-sm"
            >
              <CardHeader>
                <CardTitle>{file.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: file.content
                      ? marked(file.content)
                      : "<em>No content available</em>",
                  }}
                />
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
