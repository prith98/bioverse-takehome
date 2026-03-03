"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Invalid username or password.");
      return;
    }

    const { role } = await res.json();
    router.push(role === "admin" ? "/admin" : "/questionnaires");
  }

  function openRegister() {
    setRegUsername("");
    setRegPassword("");
    setIsAdmin(false);
    setRegError("");
    setRegisterOpen(true);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: regUsername, password: regPassword, role: isAdmin ? "admin" : "user" }),
    });

    setRegLoading(false);

    if (!res.ok) {
      let message = "Something went wrong.";
      try {
        const data = await res.json();
        message = data.error ?? message;
      } catch {
        // non-JSON error body, keep default message
      }
      setRegError(message);
      return;
    }

    setRegisterOpen(false);
    setUsername(regUsername);
    setSuccessMsg("Account created! You can now sign in.");
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bioverse</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={openRegister}
                className="text-gray-900 underline underline-offset-2 hover:text-gray-600"
              >
                Create one
              </button>
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create an account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="reg-username">Username</Label>
              <Input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="reg-admin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="reg-admin" className="font-normal cursor-pointer">
                Admin access
              </Label>
            </div>
            {regError && (
              <p className="text-sm text-red-500">{regError}</p>
            )}
            <Button type="submit" className="w-full" disabled={regLoading}>
              {regLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-lg shadow-lg whitespace-nowrap">
          {successMsg}
        </div>
      )}
    </div>
  );
}
