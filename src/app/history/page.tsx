
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History as HistoryIcon, Trash2, Copy, ExternalLink } from "lucide-react";
import type { HistoryEntry } from '@/lib/history-types';
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('prVisualizationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    }
  }, []);

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prVisualizationHistory');
      setHistory([]);
      toast({ title: "History Cleared", description: "Your visualization history has been cleared." });
    }
  };

  const handleRevisualize = (prUrl: string) => {
    // For now, just navigate to home. Ideally, pass the URL as a query param.
    // Or, have the form on home page potentially pre-fill from a query param.
    // Simplest for now: copy URL and let user paste.
    navigator.clipboard.writeText(prUrl).then(() => {
      toast({ title: "URL Copied!", description: "PR URL copied to clipboard. Paste it on the Visualize page." });
      router.push('/');
    }).catch(err => {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy URL." });
    });
  };

  const openPrUrl = (prUrl: string) => {
    window.open(prUrl, '_blank');
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-secondary/30 pt-10 md:pt-16">
      <Card className="w-full max-w-2xl glassmorphism">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HistoryIcon className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-3xl">Visualization History</CardTitle>
            </div>
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
              </Button>
            )}
          </div>
          <CardDescription>
            Previously visualized pull requests. History is stored locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">
                No visualization history yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Visualize a PR on the main page to see it here.
              </p>
              <Button onClick={() => router.push('/')} className="mt-6">
                Visualize a PR
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[50vh] max-h-[600px] pr-4">
              <ul className="space-y-3">
                {history.map((entry) => (
                  <li key={entry.id + entry.timestamp} className="p-4 border rounded-lg bg-card/50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-primary text-lg truncate max-w-md" title={entry.title}>
                          {entry.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {entry.repoName} - PR #{entry.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Visualized on: {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                       <Button variant="ghost" size="icon" onClick={() => openPrUrl(entry.prUrl)} title="Open PR on GitHub">
                          <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Button>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" onClick={() => handleRevisualize(entry.prUrl)}>
                        <Copy className="mr-2 h-4 w-4" /> Copy & Visualize
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
