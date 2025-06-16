import React from 'react';
import { Composition, Sequence, AbsoluteFill } from 'remotion';
import type { PRData } from '@/lib/github-types';
import { TitleScene } from './scenes/TitleScene';
import { StatsScene } from './scenes/StatsScene';
import { CodeDiffScene } from './scenes/CodeDiffScene';
import { CommitHistoryScene } from './scenes/CommitHistoryScene';
import { CICDStatusScene } from './scenes/CICDStatusScene';
import { FinalScene } from './scenes/FinalScene';
import { 
  COMPOSITION_ID, FPS, WIDTH, HEIGHT, 
  calculateVideoDuration, DURATION_TITLE_SCENE, DURATION_STATS_SCENE, 
  DURATION_PER_FILE_DIFF, MAX_FILES_TO_SHOW, DURATION_COMMIT_HISTORY_SCENE, 
  DURATION_CICD_STATUS_SCENE, DURATION_FINAL_SCENE, DURATION_TRANSITION
} from './config';

interface MyCompositionProps {
  prData: PRData;
}

export const MyComposition: React.FC<MyCompositionProps> = ({ prData }) => {
  const { durationInFrames } = calculateVideoDuration(prData);

  let currentStartFrame = 0;
  
  const titleSceneDuration = DURATION_TITLE_SCENE * FPS;
  const statsSceneDuration = DURATION_STATS_SCENE * FPS;
  
  const filesToShowCount = Math.min(prData.files.length, MAX_FILES_TO_SHOW);
  const codeDiffSceneDuration = filesToShowCount > 0 ? (filesToShowCount * DURATION_PER_FILE_DIFF * FPS) : 0;
  
  const commitHistorySceneDuration = prData.commits.length > 0 ? (DURATION_COMMIT_HISTORY_SCENE * FPS) : 0;
  const cicdStatusSceneDuration = prData.checkRuns.length > 0 ? (DURATION_CICD_STATUS_SCENE * FPS) : 0;
  const finalSceneDuration = DURATION_FINAL_SCENE * FPS;
  const transitionDuration = DURATION_TRANSITION * FPS;

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Sequence from={currentStartFrame} durationInFrames={titleSceneDuration}>
        <TitleScene prDetails={prData.prDetails} />
      </Sequence>
      { (currentStartFrame += titleSceneDuration + transitionDuration) }

      <Sequence from={currentStartFrame} durationInFrames={statsSceneDuration}>
        <StatsScene prDetails={prData.prDetails} />
      </Sequence>
      { (currentStartFrame += statsSceneDuration + transitionDuration) }
      
      {filesToShowCount > 0 && (
        <Sequence from={currentStartFrame} durationInFrames={codeDiffSceneDuration}>
          <CodeDiffScene files={prData.files.slice(0, filesToShowCount)} diffContent={prData.diff} codeInsights={prData.codeInsights} />
        </Sequence>
      )}
      {filesToShowCount > 0 && (currentStartFrame += codeDiffSceneDuration + transitionDuration)}

      {commitHistorySceneDuration > 0 && (
        <Sequence from={currentStartFrame} durationInFrames={commitHistorySceneDuration}>
          <CommitHistoryScene commits={prData.commits} />
        </Sequence>
      )}
      {commitHistorySceneDuration > 0 && (currentStartFrame += commitHistorySceneDuration + transitionDuration)}
      
      {cicdStatusSceneDuration > 0 && (
        <Sequence from={currentStartFrame} durationInFrames={cicdStatusSceneDuration}>
          <CICDStatusScene checkRuns={prData.checkRuns} />
        </Sequence>
      )}
      {cicdStatusSceneDuration > 0 && (currentStartFrame += cicdStatusSceneDuration + transitionDuration)}

      <Sequence from={currentStartFrame} durationInFrames={finalSceneDuration}>
        <FinalScene prDetails={prData.prDetails} />
      </Sequence>
    </AbsoluteFill>
  );
};

// This is where you would register the composition if this were the entry point for Remotion CLI
// For @remotion/player, the component itself is sufficient.
// However, to enable Remotion CLI commands like `remotion render`, we need a Root file.
// Let's assume a `remotion/Root.tsx` handles the <Composition> registration.
// For now, this file primarily defines the component logic for the player.
