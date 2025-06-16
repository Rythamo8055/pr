"use client";

import React, { useState, useEffect } from 'react';
import { UrlForm } from '@/components/pr-visualizer/UrlForm';
import { VideoPlayer } from '@/components/pr-visualizer/VideoPlayer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { getPRData } from '@/app/actions/github';
import type { PRData } from '@/lib/github-types';
import { COMPOSITION_ID } from '@/remotion/config';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

export default function HomePage() {
  const [prData, setPrData] = useState<PRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState(Date.now()); // To force re-render of Player
  const { toast } = useToast();

  // Preload background image for Remotion scenes if any are defined with staticFile
  useEffect(() => {
    // Example: if you had a staticFile('background.png') in a scene
    // new window.Image().src = '/background.png'; // Assuming it's in public folder
    // For this project, we use a placeholder directly or a generated one.
    // No specific preload needed for a dynamically placed one based on current code.
    // Adding a placeholder for the tech background image used in TitleScene
    new window.Image().src = '/tech-background.png';
  }, []);


  const handleFormSubmit = async (data: { prUrl: string }) => {
    setIsLoading(true);
    setError(null);
    setPrData(null);

    const result = await getPRData(data.prUrl);

    if ('error' in result) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error Fetching PR Data",
        description: result.error,
      });
    } else {
      setPrData(result);
      setVideoKey(Date.now()); // Update key to re-mount Player with new props
    }
    setIsLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-secondary/30">
      <UrlForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      {isLoading && (
        <div className="mt-8 flex flex-col items-center glassmorphism p-8 rounded-xl">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-primary-foreground">Fetching PR data & preparing video...</p>
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
              src="https://placehold.co/600x400.png" // Placeholder image
              alt="Illustration of code merging or video editing"
              width={600}
              height={400}
              className="rounded-lg mb-6 shadow-lg mx-auto"
              data-ai-hint="code collaboration"
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
