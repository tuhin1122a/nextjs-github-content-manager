"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Draft } from "@/types";
import { Edit, Trash2 } from "lucide-react";

interface LocalDraftsListProps {
  drafts: Draft[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: () => Promise<void>;
  isPublishing: boolean;
}

export function LocalDraftsList({
  drafts,
  onEdit,
  onDelete,
  onPublish,
  isPublishing,
}: LocalDraftsListProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Local Drafts ({drafts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
          {drafts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No drafts yet!
            </p>
          ) : (
            drafts.map((d) => (
              <div
                key={d.id}
                className="border border-border rounded-lg p-4 bg-card/50 flex justify-between items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{d.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {d.body.substring(0, 100)}
                    {d.body.length > 100 && "..."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(d.id)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive-outline"
                    size="icon"
                    onClick={() => onDelete(d.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {drafts.length > 0 && (
          <Button
            onClick={onPublish}
            disabled={isPublishing}
            className="w-full mt-4"
            size="lg"
          >
            {isPublishing
              ? "Publishing..."
              : `Publish All Drafts (${drafts.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
