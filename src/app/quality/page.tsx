
"use client";

import { useState } from "react";
import LoginForm from "@/components/login-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

function QualityDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="font-headline text-2xl font-semibold pl-20">Quality Team</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Welcome</CardTitle>
                    <CardDescription>This is the quality dashboard. More features coming soon!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>You can manage quality control processes and view reports here.</p>
                </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}


export default function QualityPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginForm
        role="Quality Team"
        correctPassword="quality123"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <QualityDashboard />;
}
