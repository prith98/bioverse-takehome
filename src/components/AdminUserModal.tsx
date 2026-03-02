"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AnsweredQuestionnaire } from "@/lib/types";

interface AdminUserModalProps {
  userId: number | null;
  username: string;
  onClose: () => void;
}

export default function AdminUserModal({
  userId,
  username,
  onClose,
}: AdminUserModalProps) {
  const [data, setData] = useState<AnsweredQuestionnaire[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId === null) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/users/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setData(json.questionnaires);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Dialog
      open={userId !== null}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{username}&apos;s Responses</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-gray-500 py-4">Loading…</p>
        )}

        {!loading && data && data.length === 0 && (
          <p className="text-sm text-gray-500 py-4">No answers yet.</p>
        )}

        {!loading && data && data.length > 0 && (
          <div className="space-y-6 pt-2">
            {data.map((q, qi) => (
              <div key={qi} className="space-y-3">
                <h3 className="font-semibold text-gray-900 capitalize border-b pb-1">
                  {q.questionnaireName}
                </h3>
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
      </DialogContent>
    </Dialog>
  );
}
