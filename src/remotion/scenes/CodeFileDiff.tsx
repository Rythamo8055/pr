
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion'; // Added useVideoConfig
import type { GitHubFile } from '@/lib/github-types';
import { diff_match_patch } from 'diff-match-patch';
import { FPS } from '../config';

interface CodeFileDiffProps {
  file: GitHubFile;
  diffContent: string; // Combined diff string
}

function parseDiffForFile(diffContent: string, filename: string): string {
  const fileDiffRegex = new RegExp(`diff --git a/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} b/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n(?:index [\\da-f]+\\.\\.[\\da-f]+(?: [\\d]+)?\\n)?(?:--- a/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n)?(?:\\+\\+\\+ b/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n)?(@@.*?@@(?:\\n[^@].*?)*)`, 's');
  const match = diffContent.match(fileDiffRegex);
  return match ? match[1] : `Diff not found for ${filename}`;
}

export const CodeFileDiff: React.FC<CodeFileDiffProps> = ({ file, diffContent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // Get FPS from useVideoConfig
  const dmp = new diff_match_patch();

  let filePatch = file.patch || parseDiffForFile(diffContent, file.filename);
  
  if (!filePatch || filePatch.startsWith("Diff not found")) {
    if (file.status === 'added') {
      filePatch = `@@ -0,0 +1,${file.additions} @@\n${'+'.repeat(file.additions).split('').map((_, i) => `+Added line ${i+1}`).join('\n')}`;
    } else if (file.status === 'removed') {
      filePatch = `@@ -1,${file.deletions} +0,0 @@\n${'-'.repeat(file.deletions).split('').map((_,i)=> `-Removed line ${i+1}`).join('\n')}`;
    } else {
      filePatch = `Patch data unavailable for ${file.filename}`;
    }
  }

  const lines = filePatch.split('\n').map((line, index) => {
    let type: 'context' | 'added' | 'deleted' | 'header' = 'context';
    if (line.startsWith('+') && !line.startsWith('+++')) type = 'added';
    else if (line.startsWith('-') && !line.startsWith('---')) type = 'deleted';
    else if (line.startsWith('@@')) type = 'header';
    return { text: line, type, key: `line-${index}` };
  });

  const containerHeight = 480; // Adjusted height
  const lineHeight = 22; // Adjusted line height
  const totalContentHeight = lines.length * lineHeight;

  // Scroll animation adjusted: start sooner, last longer
  const scrollProgress = interpolate(frame, [fps * 0.3, fps * (FPS - 0.5)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  const translateY = interpolate(
    scrollProgress,
    [0, 1],
    [0, Math.min(0, containerHeight - totalContentHeight)]
  );

  const titleOpacity = spring({ frame, fps, config: { stiffness: 100, damping: 15 }, delay: fps * 0.1 });
  const titleY = interpolate(titleOpacity, [0,1], [15,0]);

  return (
    <AbsoluteFill className="flex flex-col items-center justify-start p-3 bg-background/70 backdrop-blur-sm rounded-lg">
      <h3
        className="font-headline text-xl text-primary mb-2 p-1.5 bg-card/80 rounded-md shadow-sm"
        style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`}}
      >
        {file.filename} ({file.status})
      </h3>
      <div
        className="w-full max-w-3xl font-code text-xs rounded-md overflow-hidden border border-border/70 custom-scrollbar"
        style={{ height: `${containerHeight}px`, backgroundColor: 'hsl(var(--card))' }} // Use card for a slightly more opaque bg
      >
        <div style={{ transform: `translateY(${translateY}px)` }}>
          {lines.map((line, index) => {
            // Staggered line appearance
            const lineSpring = spring({frame, fps, delay: index * 1.5 + fps * 0.2, config: {stiffness: 150, damping: 20}});
            const lineOpacity = lineSpring;
            const lineX = interpolate(lineSpring, [0,1], [-15,0]);
            
            let bgClass = 'bg-transparent';
            // Using actual theme colors for text for better contrast
            let textClass = 'text-card-foreground'; 
            if (line.type === 'added') {
              bgClass = 'bg-accent/15'; // Slightly more subtle background
              textClass = 'text-accent'; // Use the accent color itself for text
            } else if (line.type === 'deleted') {
              bgClass = 'bg-destructive/15'; // Slightly more subtle background
              textClass = 'text-destructive'; // Use the destructive color itself for text
            } else if (line.type === 'header') {
              bgClass = 'bg-muted/50';
              textClass = 'text-muted-foreground';
            }

            return (
              <pre
                key={line.key}
                className={`px-3 py-0.5 whitespace-pre-wrap ${bgClass} ${textClass}`}
                style={{ minHeight: `${lineHeight}px`, opacity: lineOpacity, transform: `translateX(${lineX}px)` }}
              >
                {line.text || ' '}
              </pre>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
