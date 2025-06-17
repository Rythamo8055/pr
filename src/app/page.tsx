
"use client";

import React, { useState, useEffect } from 'react';
import { UrlForm } from '@/components/pr-visualizer/UrlForm';
import { VideoPlayer } from '@/components/pr-visualizer/VideoPlayer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { getPRData } from '@/app/actions/github';
import type { PRData } from '@/lib/github-types';
import type { HistoryEntry } from '@/lib/history-types';
import { COMPOSITION_ID } from '@/remotion/config';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Progress } from "@/components/ui/progress"; // Import Progress component

const MAX_HISTORY_ITEMS = 10;

export default function HomePage() {
  const [prData, setPrData] = useState<PRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    // Preload sounds or other assets if necessary
  }, []);

  const addToHistory = (prUrl: string, data: PRData) => {
    if (typeof window !== 'undefined') {
      try {
        const newEntry: HistoryEntry = {
          id: String(data.prDetails.number),
          title: data.prDetails.title,
          prUrl: prUrl, // Use the submitted URL
          timestamp: Date.now(),
          repoName: data.prDetails.base.repo?.full_name || prUrl.split('/').slice(3, 5).join('/'),
        };

        const historyString = localStorage.getItem('prVisualizationHistory');
        let history: HistoryEntry[] = historyString ? JSON.parse(historyString) : [];
        
        history = history.filter(entry => entry.prUrl !== newEntry.prUrl);
        history.unshift(newEntry);
        history = history.slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem('prVisualizationHistory', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save to history:", e);
      }
    }
  };

  const handleFormSubmit = async (formData: { prUrl: string }) => {
    setIsLoading(true);
    setError(null);
    setPrData(null);

    const result = await getPRData(formData.prUrl);

    if ('error' in result) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error Fetching PR Data",
        description: result.error,
      });
    } else {
      setPrData(result);
      addToHistory(formData.prUrl, result);
      setVideoKey(Date.now());
    }
    setIsLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-secondary/30">
      <UrlForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      {isLoading && (
        <div className="mt-8 flex flex-col items-center glassmorphism p-8 rounded-xl w-full max-w-lg">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-primary-foreground">Fetching PR data & preparing video...</p>
          <Progress value={50} className="w-full mt-3 h-2 animate-pulse" /> {/* Indeterminate progress bar */}
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="mt-8 max-w-lg glassmorphism">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && prData && (
        <VideoPlayer key={videoKey} prData={prData} compositionId={COMPOSITION_ID} />
      )}
      
      {!isLoading && !prData && !error && (
         <div className="mt-12 text-center max-w-xl p-8 glassmorphism rounded-xl">
            <Image 
              src="https://placehold.co/600x400.png"
              alt="Illustration of code merging or video editing"
              width={600}
              height={400}
              className="rounded-lg mb-6 shadow-lg mx-auto"
              data-ai-hint="code collaboration"
              priority={true}
            />
            <h2 className="text-2xl font-headline text-primary-foreground mb-2">Visualize Your Pull Requests</h2>
            <p className="text-muted-foreground">
              Get a dynamic video summary of your GitHub pull requests. See stats, code changes, commit history, and CI/CD status at a glance. 
              Just paste a PR URL above to get started!
            </p>
          </div>
      )}
    </main>
  );
}
