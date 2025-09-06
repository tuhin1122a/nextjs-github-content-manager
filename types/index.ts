export interface GitHubFile {
  name: string;
  content: string;
}

export interface Draft {
  id: string;
  title: string;
  body: string;
  createdAt: Date; // ✅ Add this line
}

export interface DraftFormProps {
  editingDraft: Draft | null;
  onAdd: (title: string, body: string) => void;
  onUpdate: (id: string, title: string, body: string) => void;
  onCancel?: () => void; // optional
}
export interface PublishResult {
  draft: string;
  response?: unknown;
  error?: string;
}

export interface DraftFormProps {
  editingDraft: Draft | null;
  onAdd: (title: string, body: string) => void;
  onUpdate: (id: string, title: string, body: string) => void;
  onCancelEdit: () => void;
}
