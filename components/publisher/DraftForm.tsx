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

  const isEditing = !!editingDraft;

  useEffect(() => {
    if (editingDraft) {
      setTitle(editingDraft.title);
      setBody(editingDraft.body);
    } else {
      setTitle("");
      setBody("");
    }
  }, [editingDraft]);

  const handleSubmit = () => {
    if (isEditing && editingDraft) {
      onUpdate(editingDraft.id, title, body);
    } else {
      onAdd(title, body);
    }
    setTitle("");
    setBody("");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {isEditing ? "Edit Draft" : "Create New Draft"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="w-full gap-2"
          disabled={!title || !body}
        >
          <Plus className="h-4 w-4" />
          {isEditing ? "Update Draft" : "Add Draft"}
        </Button>
        {isEditing && (
          <Button variant="outline" onClick={onCancelEdit} className="w-full">
            Cancel Edit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
