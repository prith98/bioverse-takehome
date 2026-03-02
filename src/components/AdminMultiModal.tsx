"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AnsweredQuestionnaire } from "@/lib/types";

export interface MultiSelection {
  userId: number;
  username: string;
  questionnaireId: number;
  questionnaireName: string;
}

interface UserResult {
  userId: number;
  username: string;
  questionnaires: AnsweredQuestionnaire[];
}

interface AdminMultiModalProps {
  open: boolean;
  selections: MultiSelection[];
  onClose: () => void;
}

export default function AdminMultiModal({
  open,
  selections,
  onClose,
}: AdminMultiModalProps) {
  const [results, setResults] = useState<UserResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || selections.length === 0) {
      setResults(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Deduplicate by userId, preserving order of first appearance
    const seen = new Map<number, string>();
    for (const s of selections) {
      if (!seen.has(s.userId)) seen.set(s.userId, s.username);
    }

    // Build a set of questionnaireIds per user
    const wantedByUser = new Map<number, Set<number>>();
    for (const s of selections) {
      if (!wantedByUser.has(s.userId)) wantedByUser.set(s.userId, new Set());
      wantedByUser.get(s.userId)!.add(s.questionnaireId);
    }

    Promise.all(
      Array.from(seen.entries()).map(([userId, username]) =>
        fetch(`/api/admin/users/${userId}`)
          .then((r) => r.json())
          .then((json) => {
            const wanted = wantedByUser.get(userId) ?? new Set();
            const filtered: AnsweredQuestionnaire[] = (
              json.questionnaires as AnsweredQuestionnaire[]
            ).filter((q) => wanted.has(q.questionnaireId));
            return { userId, username, questionnaires: filtered };
          })
      )
    ).then((data) => {
      if (!cancelled) {
        setResults(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, selections]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selected Responses</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-gray-500 py-4">Loading…</p>
        )}

        {!loading && results && results.length > 0 && (
          <div className="pt-2 space-y-0">
            {results.map((user, ui) => (
              <div key={user.userId} className={ui > 0 ? "border-t mt-4 pt-4" : ""}>
                <div className="bg-gray-50 rounded px-3 py-2 mb-3">
                  <span className="font-semibold text-gray-900">{user.username}</span>
                </div>

                {user.questionnaires.length === 0 ? (
                  <p className="text-sm text-gray-400 pl-1">No answers yet.</p>
                ) : (
                  <div className="space-y-4">
                    {user.questionnaires.map((q, qi) => (
                      <div key={qi} className="space-y-2">
                        <h4 className="font-medium text-gray-800 capitalize border-b pb-1">
                          {q.questionnaireName}
                        </h4>
                        <div className="space-y-3">
                          {q.questions.map((qa, i) => (
                            <div key={i} className="text-sm space-y-1">
                              <p className="text-gray-700">
                                <span className="font-medium">Q:</span> {qa.questionText}
                              </p>
                              <p className="text-gray-600 pl-4">
                                <span className="font-medium">A:</span>{" "}
                                {qa.answer.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
