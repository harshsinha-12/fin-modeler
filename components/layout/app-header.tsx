"use client";

import { Button } from "@/components/ui/button";
import { Bell, ChevronDown } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here's your financial overview.
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* Workspace Selector */}
        <Button variant="outline" className="gap-2">
          My Workspace
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
