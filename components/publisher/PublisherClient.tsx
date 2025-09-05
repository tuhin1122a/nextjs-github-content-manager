"use client";

import { useDrafts } from "@/hooks/useDrafts";
import { useGitHubFiles } from "@/hooks/useGitHubFiles";
import { publishAllDrafts } from "@/lib/api";
import { GitHubFile } from "@/types";
import { useState } from "react";

import { DraftForm } from "./DraftForm";
import { GitHubDraftsViewer } from "./GitHubDraftsViewer";
import { LocalDraftsList } from "./LocalDraftsList";

interface PublisherClientProps {
  initialFiles: GitHubFile[];
}

export function PublisherClient({ initialFiles }: PublisherClientProps) {
  // State for co-ordination between components
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Custom hooks for logic and state management
  // Pass the server-fetched data to the hook
  const {
    files,
    loading: githubLoading,
    refetch,
  } = useGitHubFiles("drafts", initialFiles);
  const { drafts, addDraft, updateDraft, deleteDraft, clearAllDrafts } =
    useDrafts();

  const editingDraft = drafts.find((d) => d.id === editingDraftId) || null;

  const handleUpdateDraft = (id: string, title: string, body: string) => {
    updateDraft(id, title, body);
    setEditingDraftId(null); // Exit editing mode
  };

  const handleCancelEdit = () => {
    setEditingDraftId(null);
  };

  const handlePublish = async () => {
    if (drafts.length === 0) return alert("No drafts to publish!");
    if (!confirm(`Are you sure you want to publish ${drafts.length} draft(s)?`))
      return;

    setIsPublishing(true);
    try {
      const data = await publishAllDrafts(drafts);
      if (data.success) {
        alert("Drafts published successfully!");
        clearAllDrafts();
      } else {
        alert("Failed to publish drafts. Check console.");
        console.error("Publishing error:", data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing drafts. See console for details.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <GitHubDraftsViewer
        files={files}
        loading={githubLoading}
        onRefresh={refetch}
      />

      <div className="space-y-6">
        <DraftForm
          editingDraft={editingDraft}
          onAdd={addDraft}
          onUpdate={handleUpdateDraft}
          onCancelEdit={handleCancelEdit}
        />

        <LocalDraftsList
          drafts={drafts}
          onEdit={setEditingDraftId}
          onDelete={deleteDraft}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
      </div>
    </main>
  );
}
