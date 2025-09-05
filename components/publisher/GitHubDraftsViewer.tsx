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
  // Soft color palette for cards
  const colors = [
    "bg-blue-50 dark:bg-blue-900/40",
    "bg-green-50 dark:bg-green-900/40",
    "bg-purple-50 dark:bg-purple-900/40",
    "bg-pink-50 dark:bg-pink-900/40",
    "bg-yellow-50 dark:bg-yellow-900/40",
    "bg-indigo-50 dark:bg-indigo-900/40",
    "bg-teal-50 dark:bg-teal-900/40",
  ];

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-row justify-between items-center pb-4">
        <CardTitle className="text-xl font-semibold">
          GitHub Drafts (Read-Only - {files.length})
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

      {/* Scrollable Card Content */}
      <CardContent className="space-y-4 overflow-auto flex-1">
        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No markdown files found in the GitHub repository.</p>
        ) : (
          files.map((file) => (
            <Card
              key={file.sha}
              className={`${getRandomColor()} border border-gray-200 dark:border-gray-700 rounded-lg shadow-md`}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {file.name}
                </CardTitle>
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
