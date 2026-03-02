"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AdminUserModal from "@/components/AdminUserModal";
import type { UserRow } from "@/lib/types";

interface AdminTableProps {
  users: UserRow[];
}

export default function AdminTable({ users }: AdminTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  return (
    <>
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Questionnaires Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-400 py-8">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedUser(user)}
              >
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <Badge variant={user.completedCount > 0 ? "default" : "secondary"}>
                    {user.completedCount}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminUserModal
        userId={selectedUser?.id ?? null}
        username={selectedUser?.username ?? ""}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}
