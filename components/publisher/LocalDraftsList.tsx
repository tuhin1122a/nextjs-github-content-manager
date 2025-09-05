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
  // Soft color palette
  const colors = [
    "bg-blue-50 dark:bg-blue-900/40",
    "bg-green-50 dark:bg-green-900/40",
    "bg-purple-50 dark:bg-purple-900/40",
    "bg-pink-50 dark:bg-pink-900/40",
    "bg-yellow-50 dark:bg-yellow-900/40",
    "bg-indigo-50 dark:bg-indigo-900/40",
    "bg-teal-50 dark:bg-teal-900/40",
  ];

  // Random color generator
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Local Drafts ({drafts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 max-h-[400px] overflow-auto pr-2">
          {drafts.length === 0 ? (
            <p className="text-center py-8">No drafts yet!</p>
          ) : (
            drafts.map((d) => (
              <div
                key={d.id}
                className={`border border-border rounded-lg p-4 flex justify-between items-start gap-2 shadow-sm ${getRandomColor()}`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-gray-800 dark:text-gray-100">
                    {d.title}
                  </h3>
                  <p className="text-sm line-clamp-2">
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
                    variant="destructive" // Fixed variant
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
