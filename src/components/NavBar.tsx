"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  username: string;
}

export default function NavBar({ username }: NavBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Bioverse</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{username}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
