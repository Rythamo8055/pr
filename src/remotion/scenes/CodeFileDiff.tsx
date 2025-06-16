import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring } from 'remotion';
import type { GitHubFile } from '@/lib/github-types';
import { DiffMatchPatch } from 'diff-match-patch';
import { FPS } from '../config';

interface CodeFileDiffProps {
  file: GitHubFile;
  diffContent: string; // Combined diff string
}

function parseDiffForFile(diffContent: string, filename: string): string {
  const fileDiffRegex = new RegExp(`diff --git a/${filename} b/${filename}\\n(?:index [\\da-f]+\\.\\.[\\da-f]+(?: [\\d]+)?\\n)?(?:--- a/${filename}\\n)?(?:\\+\\+\\+ b/${filename}\\n)?(@@.*?@@(?:\\n[^@].*?)*)`, 's');
  const match = diffContent.match(fileDiffRegex);
  return match ? match[1] : `Diff not found for ${filename}`;
}

export const CodeFileDiff: React.FC<CodeFileDiffProps> = ({ file, diffContent }) => {
  const frame = useCurrentFrame();
  const dmp = new DiffMatchPatch();

  // Attempt to parse the specific file's patch from the combined diff or use file.patch
  let filePatch = file.patch || parseDiffForFile(diffContent, file.filename);
  
  // If still no patch, create a synthetic one for added/removed files
  if (!filePatch || filePatch.startsWith("Diff not found")) {
    if (file.status === 'added') {
      filePatch = `@@ -0,0 +1,${file.additions} @@\n${'+'.repeat(file.additions).split('').join('\n+')}`; // Placeholder lines
    } else if (file.status === 'removed') {
      filePatch = `@@ -1,${file.deletions} +0,0 @@\n${'-'.repeat(file.deletions).split('').join('\n-')}`; // Placeholder lines
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

  const containerHeight = 500; // Max height for the diff container
  const lineHeight = 24;
  const totalContentHeight = lines.length * lineHeight;

  const scrollProgress = interpolate(frame, [FPS * 0.5, FPS * 7.5], [0, 1], { // Scroll over 7 seconds
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  const translateY = interpolate(
    scrollProgress,
    [0, 1],
    [0, Math.min(0, containerHeight - totalContentHeight)]
  );

  const titleOpacity = spring({ frame, fps: FPS, config: { stiffness: 100, damping: 15 } });
  const titleY = interpolate(titleOpacity, [0,1], [20,0]);

  return (
    <AbsoluteFill className="flex flex-col items-center justify-start p-4 bg-background/80 backdrop-blur-sm rounded-lg">
      <h3 
        className="font-headline text-2xl text-primary mb-3 p-2 bg-secondary/50 rounded-md shadow"
        style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`}}
      >
        {file.filename}
      </h3>
      <div
        className="w-full max-w-3xl font-code text-sm rounded-md overflow-hidden border border-border"
        style={{ height: `${containerHeight}px`, backgroundColor: 'rgba(var(--muted-rgb), 0.5)' }}
      >
        <div style={{ transform: `translateY(${translateY}px)` }}>
          {lines.map((line, index) => {
            const lineOpacity = interpolate(frame, [index * 2, index * 2 + FPS/2], [0,1], {extrapolateRight: 'clamp'});
            const lineX = interpolate(frame, [index * 2, index * 2 + FPS/2], [-20,0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.ease)});
            
            let bgClass = 'bg-transparent';
            let textClass = 'text-foreground';
            if (line.type === 'added') {
              bgClass = 'bg-accent/20';
              textClass = 'text-accent-foreground'; // This should be a dark color for light accent
            } else if (line.type === 'deleted') {
              bgClass = 'bg-destructive/20';
              textClass = 'text-destructive-foreground'; // This should be a dark color for light destructive
            } else if (line.type === 'header') {
              bgClass = 'bg-muted';
              textClass = 'text-muted-foreground';
            }

            return (
              <pre
                key={line.key}
                className={`px-4 py-0.5 whitespace-pre-wrap ${bgClass} ${textClass}`}
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
