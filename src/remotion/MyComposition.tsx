
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions'; // Changed to springTiming
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import type { PRData } from '@/lib/github-types';
import { TitleScene } from './scenes/TitleScene';
import { StatsScene } from './scenes/StatsScene';
import { CodeDiffScene } from './scenes/CodeDiffScene';
import { CommitHistoryScene } from './scenes/CommitHistoryScene';
import { CICDStatusScene } from './scenes/CICDStatusScene';
import { FinalScene } from './scenes/FinalScene';
import { 
  FPS,
  DURATION_TITLE_SCENE, DURATION_STATS_SCENE, 
  DURATION_PER_FILE_DIFF, MAX_FILES_TO_SHOW, DURATION_COMMIT_HISTORY_SCENE, 
  DURATION_CICD_STATUS_SCENE, DURATION_FINAL_SCENE,
  DEFAULT_TRANSITION_DURATION_IN_FRAMES // Import new constant
} from './config';

interface MyCompositionProps {
  prData: PRData;
}

// Use springTiming for transitions by default
const defaultSpringTransition = springTiming({ 
  durationInFrames: DEFAULT_TRANSITION_DURATION_IN_FRAMES, // Use value from config
  config: { damping: 200, stiffness: 150, mass: 0.8 } 
});

export const MyComposition: React.FC<MyCompositionProps> = ({ prData }) => {
  const titleSceneDuration = DURATION_TITLE_SCENE * FPS;
  const statsSceneDuration = DURATION_STATS_SCENE * FPS;
  
  const filesToShowCount = Math.min(prData.files.length, MAX_FILES_TO_SHOW);
  const codeDiffSceneDuration = filesToShowCount > 0 ? (filesToShowCount * DURATION_PER_FILE_DIFF * FPS) : 0;
  
  const commitHistorySceneDuration = prData.commits.length > 0 ? (DURATION_COMMIT_HISTORY_SCENE * FPS) : 0;
  const cicdStatusSceneDuration = prData.checkRuns.length > 0 ? (DURATION_CICD_STATUS_SCENE * FPS) : 0;
  const finalSceneDuration = DURATION_FINAL_SCENE * FPS;

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={titleSceneDuration}>
          <TitleScene prDetails={prData.prDetails} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={defaultSpringTransition}
          presentation={slide({direction: 'from-right'})}
        />
        <TransitionSeries.Sequence durationInFrames={statsSceneDuration}>
          <StatsScene prDetails={prData.prDetails} />
        </TransitionSeries.Sequence>
      
        {filesToShowCount > 0 && (
          <>
            <TransitionSeries.Transition
              timing={defaultSpringTransition}
              presentation={fade()}
            />
            <TransitionSeries.Sequence durationInFrames={codeDiffSceneDuration}>
              <CodeDiffScene files={prData.files.slice(0, filesToShowCount)} diffContent={prData.diff} codeInsights={prData.codeInsights} />
            </TransitionSeries.Sequence>
          </>
        )}

        {commitHistorySceneDuration > 0 && (
          <>
            <TransitionSeries.Transition
              timing={defaultSpringTransition}
              presentation={slide({direction: 'from-bottom'})}
            />
            <TransitionSeries.Sequence durationInFrames={commitHistorySceneDuration}>
              <CommitHistoryScene commits={prData.commits} />
            </TransitionSeries.Sequence>
          </>
        )}
      
        {cicdStatusSceneDuration > 0 && (
           <>
            <TransitionSeries.Transition
              timing={defaultSpringTransition}
              presentation={fade()}
            />
            <TransitionSeries.Sequence durationInFrames={cicdStatusSceneDuration}>
              <CICDStatusScene checkRuns={prData.checkRuns} />
            </TransitionSeries.Sequence>
          </>
        )}

        <TransitionSeries.Transition
          timing={defaultSpringTransition}
          presentation={slide({direction: 'from-top'})}
        />
        <TransitionSeries.Sequence durationInFrames={finalSceneDuration}>
          <FinalScene prDetails={prData.prDetails} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
