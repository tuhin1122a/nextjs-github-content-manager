"use client";

import { Draft } from "@/types";
import { useEffect, useState } from "react";

const LOCAL_STORAGE_KEY = "markdown_drafts";

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Draft[] = (JSON.parse(stored) as Draft[]).map((d) => ({
          ...d,
          createdAt: new Date(d.createdAt),
        }));
        setDrafts(parsed);
      }
    } catch (err) {
      console.error("Error parsing drafts from localStorage", err);
    }
  }, []);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const addDraft = (title: string, body: string) => {
    if (!title.trim() || !body.trim()) return;
    const newDraft: Draft = {
      id: Date.now().toString(),
      title,
      body,
      createdAt: new Date(),
    };
    setDrafts((prev) => [...prev, newDraft]);
  };

  const updateDraft = (id: string, title: string, body: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title, body } : d))
    );
  };

  const deleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const clearAllDrafts = () => setDrafts([]);

  return { drafts, addDraft, updateDraft, deleteDraft, clearAllDrafts };
}
