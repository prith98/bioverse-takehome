"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import AdminUserModal from "@/components/AdminUserModal";
import AdminMultiModal, { type MultiSelection } from "@/components/AdminMultiModal";
import type { UserRow, QuestionnaireRow } from "@/lib/types";

interface AdminTableProps {
  users: UserRow[];
  questionnaires: QuestionnaireRow[];
}

interface SingleModal {
  userId: number;
  username: string;
  questionnaireId: number | null;
  questionnaireName: string | null;
}

export default function AdminTable({ users, questionnaires }: AdminTableProps) {
  const [singleModal, setSingleModal] = useState<SingleModal | null>(null);
  const [multiMode, setMultiMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Map<string, MultiSelection>>(new Map());
  const [showMultiModal, setShowMultiModal] = useState(false);

  function toggleMultiMode() {
    setMultiMode((m) => !m);
    setSelectedCells(new Map());
  }

  function toggleCell(user: UserRow, q: QuestionnaireRow) {
    const key = `${user.id}-${q.id}`;
    setSelectedCells((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, {
          userId: user.id,
          username: user.username,
          questionnaireId: q.id,
          questionnaireName: q.name,
        });
      }
      return next;
    });
  }

  const multiSelections = Array.from(selectedCells.values());

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant={multiMode ? "default" : "outline"}
          size="sm"
          onClick={toggleMultiMode}
        >
          {multiMode ? "Exit multi-select" : "Multi-select"}
        </Button>
        {multiMode && selectedCells.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCells(new Map())}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setShowMultiModal(true)}>
              Show selected ({selectedCells.size})
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              {questionnaires.map((q) => (
                <TableHead key={q.id} className="text-center capitalize">
                  {q.name}
                </TableHead>
              ))}
              <TableHead className="text-center">Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2 + questionnaires.length}
                  className="text-center text-gray-400 py-8"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id} className={multiMode ? "" : "cursor-pointer hover:bg-gray-50"}>
                {/* Username cell — opens all-questionnaires modal in normal mode */}
                <TableCell
                  className={`font-medium ${!multiMode ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (!multiMode) {
                      setSingleModal({ userId: user.id, username: user.username, questionnaireId: null, questionnaireName: null });
                    }
                  }}
                >
                  {user.username}
                </TableCell>

                {/* Questionnaire cells */}
                {questionnaires.map((q) => {
                  const key = `${user.id}-${q.id}`;
                  const isSelected = selectedCells.has(key);
                  return (
                    <TableCell
                      key={q.id}
                      className={`text-center cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 ring-2 ring-inset ring-blue-400"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={(e) => {
                        if (multiMode) {
                          toggleCell(user, q);
                        } else {
                          e.stopPropagation();
                          setSingleModal({ userId: user.id, username: user.username, questionnaireId: q.id, questionnaireName: q.name });
                        }
                      }}
                    >
                      {user.completedByQuestionnaire[q.id] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                  );
                })}

                {/* Completed count cell */}
                {(() => {
                  const count = questionnaires.filter(
                    (q) => user.completedByQuestionnaire[q.id]
                  ).length;
                  return (
                    <TableCell className="text-center text-sm font-medium text-gray-700">
                      {count} / {questionnaires.length}
                    </TableCell>
                  );
                })()}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Single-user modal (normal mode) */}
      <AdminUserModal
        userId={singleModal?.userId ?? null}
        username={singleModal?.username ?? ""}
        questionnaireId={singleModal?.questionnaireId}
        questionnaireName={singleModal?.questionnaireName}
        onClose={() => setSingleModal(null)}
      />

      {/* Multi-select modal */}
      <AdminMultiModal
        open={showMultiModal}
        selections={multiSelections}
        onClose={() => setShowMultiModal(false)}
      />
    </>
  );
}
