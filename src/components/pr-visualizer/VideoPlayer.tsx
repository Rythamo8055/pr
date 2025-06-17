
"use client"; 

import React, { useRef, useState, useEffect } from 'react';
import type { PlayerRef } from '@remotion/player'; 
import type { PRData } from '@/lib/github-types';
import { MyComposition } from '@/remotion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { calculateVideoDuration } from '@/remotion/config';
import { LoadingSpinner } from '@/components/ui/loading-spinner'; // Changed from Button to LoadingSpinner
import { Terminal, Loader2, CheckCircle } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground rounded-md aspect-video">
      <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
      <p>Loading Video Player...</p>
    </div>
  ),
});

interface VideoPlayerProps {
  prData: PRData | null;
  compositionId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ prData, compositionId }) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [isPlayerComponentReady, setIsPlayerComponentReady] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const { toast } = useToast();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const successSoundBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new window.AudioContext();
      const loadSuccessSound = async () => {
        try {
          const response = await fetch('/sounds/notification.mp3');
          if (!response.ok) {
            console.warn('Failed to load notification sound, response not OK:', response.statusText);
            return;
          }
          const arrayBuffer = await response.arrayBuffer();
          if (audioContextRef.current) {
            successSoundBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
          }
        } catch (error) {
          console.warn("Failed to load or decode success sound:", error);
        }
      };
      loadSuccessSound();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSuccessSound = () => {
    if (audioContextRef.current && successSoundBufferRef.current && audioContextRef.current.state === 'running') {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = successSoundBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start();
    } else if (audioContextRef.current && audioContextRef.current.state !== 'running') {
        audioContextRef.current.resume().then(() => {
            if (successSoundBufferRef.current && audioContextRef.current) {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = successSoundBufferRef.current;
                source.connect(audioContextRef.current.destination);
                source.start();
            }
        }).catch(e => console.warn("Could not resume audio context for sound:", e));
    }
  };

  const startClientSideRenderAndDownload = async () => {
    if (!playerRef.current || !prData) {
      setRecordingError("Player or PR data not ready.");
      setProgressMessage("Error: Player or PR data not available.");
      return;
    }
    if (typeof playerRef.current.record !== 'function') {
      setRecordingError("Player's record method is unavailable. The player might still be initializing.");
      setProgressMessage("Error: Player recording function not ready.");
      return;
    }
    
    setHasRecordingStarted(true);
    setIsRecording(true);
    setRecordingError(null);
    setProgressMessage("Initializing video generation...");
    
    console.warn("PR Visualizer: Starting client-side video recording. Performance will depend on your computer's resources. This might be slower than local development previews. Please keep this tab active.");

    try {
      setProgressMessage("Recording video... This may take several minutes. Please keep this tab active for best results.");
      const blob = await playerRef.current.record({
        quality: 0.8,
        codec: 'vp8',
        // bitrate: '2M' // Bitrate can be adjusted if needed
      });
      
      if (blob) {
        setProgressMessage("Finalizing video... Download will start shortly.");
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pr-visualizer-${prData.prDetails.number || 'video'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        playSuccessSound();
        toast({
          title: "Download Started",
          description: "Your video recording has completed and download has started.",
        });
        setProgressMessage("Video generated! Download has started.");
      } else {
        setRecordingError("Recording failed: No data was received from the player.");
        setProgressMessage("Error: Recording failed to produce video data.");
         toast({
          variant: "destructive",
          title: "Recording Error",
          description: "Recording failed: No data was received from the player.",
        });
      }
    } catch (err: any) {
      console.error("Error recording video:", err);
      setRecordingError(`Error recording video: ${err.message || 'Unknown error'}`);
      setProgressMessage(`Error: ${err.message || 'Unknown video recording error'}`);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: `An error occurred: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (prData && isPlayerComponentReady && !isRecording && !hasRecordingStarted && !recordingError) {
      startClientSideRenderAndDownload();
    }
  }, [prData, isPlayerComponentReady, isRecording, hasRecordingStarted, recordingError]);
  
  useEffect(() => {
    // Reset recording state if prData changes (for new PR visualization)
    setHasRecordingStarted(false);
    setIsRecording(false);
    setRecordingError(null);
    setProgressMessage("");
  }, [prData]);


  if (!prData) {
    return null; 
  }

  const { durationInFrames, width, height, fps } = calculateVideoDuration(prData);

  return (
    <Card className="w-full max-w-4xl mt-8 glassmorphism">
      <CardContent className="p-4 md:p-6">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border border-border shadow-inner">
          <Player
            ref={playerRef}
            component={MyComposition}
            inputProps={{ prData }}
            durationInFrames={durationInFrames}
            compositionWidth={width}
            compositionHeight={height}
            fps={fps}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls
            loop={false}
            showVolumeControls={false}
            clickToPlay
            onReady={() => {
              setIsPlayerComponentReady(true);
            }}
            onError={(e) => {
              console.error("Remotion Player Error:", e);
              setRecordingError(`Player error: ${e.message}`);
              setProgressMessage(`Player error: ${e.message}`);
              toast({
                variant: "destructive",
                title: "Player Error",
                description: "The video player encountered an error.",
              });
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center p-4 md:p-6 pt-0 md:pt-0 min-h-[80px]">
        {isRecording && !recordingError && (
          <div className="flex flex-col items-center text-center">
            <LoadingSpinner size="md" className="mb-2" />
            <p className="text-primary animate-pulse">{progressMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">Please keep this browser tab active for best results.</p>
          </div>
        )}
        {!isRecording && recordingError && (
          <Alert variant="destructive" className="w-full">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Generation Error</AlertTitle>
            <AlertDescription>{recordingError} <br /> {progressMessage}</AlertDescription>
          </Alert>
        )}
        {!isRecording && !recordingError && progressMessage && (
          <div className="flex items-center text-center">
            <CheckCircle className="w-6 h-6 text-accent mr-2" />
            <p className="text-accent">{progressMessage}</p>
          </div>
        )}
         {!isRecording && !recordingError && !progressMessage && prData && (
            <p className="text-muted-foreground">Video player ready. Preparing generation...</p>
        )}
      </CardFooter>
    </Card>
  );
};
