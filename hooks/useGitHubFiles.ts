"use client";

import { GitHubFile } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useGitHubFiles(
  folder: string = "drafts",
  initialFiles: GitHubFile[] = []
) {
  const [files, setFiles] = useState<GitHubFile[]>(initialFiles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/drafts?folder=${encodeURIComponent(folder)}`
      );
      if (!res.ok) throw new Error("Failed to fetch drafts");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, refetch: fetchFiles };
}
