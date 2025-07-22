"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound } from "lucide-react";

type LoginFormProps = {
  role: string;
  correctPassword?: string;
  onLoginSuccess: () => void;
};

export default function LoginForm({ role, correctPassword, onLoginSuccess }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // In a real app, this would be a call to an auth service.
    // For this scaffold, we use a simple hardcoded password.
    if (password === correctPassword) {
      onLoginSuccess();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">{role} Access</CardTitle>
            <CardDescription>Please enter the password to proceed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="text-center text-lg tracking-widest"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
