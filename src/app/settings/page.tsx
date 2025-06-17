
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const { toast } = useToast();

  const applyTheme = useCallback((theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('appTheme') as Theme | null;
    const initialTheme = storedTheme || 'system';
    setCurrentTheme(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('appTheme', theme);
    applyTheme(theme);
    toast({
      title: "Theme Updated",
      description: `Switched to ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme.`,
    });
  };
  
  const handleToggleDarkMode = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    handleThemeChange(newTheme);
  };


  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-secondary/30 pt-10 md:pt-16">
      <Card className="w-full max-w-lg glassmorphism">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">Settings</CardTitle>
          </div>
          <CardDescription>Manage your application preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme-toggle" className="text-lg font-medium">Appearance</Label>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
              <div className="flex items-center">
                {currentTheme === 'dark' ? <Moon className="mr-2 h-5 w-5 text-primary" /> : <Sun className="mr-2 h-5 w-5 text-primary" />}
                <span className="text-card-foreground">
                  Dark Mode: {currentTheme === 'dark' ? 'On' : (currentTheme === 'light' ? 'Off' : 'System Default')}
                </span>
              </div>
              <Switch
                id="theme-toggle"
                checked={currentTheme === 'dark'}
                onCheckedChange={handleToggleDarkMode}
                aria-label="Toggle dark mode"
              />
            </div>
            <p className="text-xs text-muted-foreground">
                Note: Toggling Dark Mode currently overrides 'System' preference. For system preference, please reload or select manually if needed. (Full Light/Dark/System choice coming soon).
            </p>
          </div>

          <div className="text-center py-6">
            <p className="text-muted-foreground text-base">
              More settings will be available here in the future.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
