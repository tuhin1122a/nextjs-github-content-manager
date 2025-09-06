"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Draft } from "@/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface DraftFormProps {
  editingDraft: Draft | null;
  onAdd: (title: string, body: string) => void;
  onUpdate: (id: string, title: string, body: string) => void;
  onCancelEdit: () => void;
}

export function DraftForm({
  editingDraft,
  onAdd,
  onUpdate,
  onCancelEdit,
}: DraftFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!editingDraft;

  useEffect(() => {
    if (editingDraft) {
      setTitle(editingDraft.title);
      setBody(editingDraft.body);
    } else {
      setTitle("");
      setBody("");
    }
    setError("");
  }, [editingDraft]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Both Title and Body are required");
      return;
    }

    if (isEditing && editingDraft) {
      onUpdate(editingDraft.id, title.trim(), body.trim());
    } else {
      onAdd(title.trim(), body.trim());
    }

    setTitle("");
    setBody("");
    setError("");
  };

  const inputStyle =
    "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800";

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {isEditing ? "Edit Draft" : "Create New Draft"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Enter → submit
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`min-h-[120px] resize-none ${inputStyle}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Enter → submit, new line block
                  handleSubmit();
                }
              }}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={!title && !body}
          >
            <Plus className="h-4 w-4" />
            {isEditing ? "Update Draft" : "Add Draft"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="w-full"
            >
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </form>
    </Card>
  );
}
