
import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'; // Added useVideoConfig
import type { GitHubCheckRun } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { CheckCircle, XCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react'; // Added HelpCircle for unknown
import { FPS } from '../config'; // FPS is already available

const getOverallStatus = (checkRuns: GitHubCheckRun[]): {
  status: 'success' | 'failure' | 'pending' | 'mixed' | 'unknown'; // Added unknown
  icon: React.ElementType;
  text: string;
  colorClass: string;
} => {
  if (checkRuns.length === 0) {
    return { status: 'unknown', icon: HelpCircle, text: 'No Checks Found', colorClass: 'text-yellow-500' }; // Changed from pending to unknown
  }

  const allCompleted = checkRuns.every(run => run.status === 'completed');
  
  if (!allCompleted) {
    const anyInProgress = checkRuns.some(run => run.status === 'in_progress' || run.status === 'queued');
    if (anyInProgress) {
      return { status: 'pending', icon: Clock, text: 'Checks In Progress...', colorClass: 'text-blue-500' };
    }
    // If not all completed and none in progress/queued, it's a bit ambiguous, could be mixed or an issue.
    // For simplicity, if some completed with failure, it's failure.
  }
  
  // From here, assume all relevant checks are 'completed' or we prioritize failure
  const anyFailure = checkRuns.some(run => run.conclusion === 'failure' || run.conclusion === 'timed_out' || run.conclusion === 'cancelled');
  if (anyFailure) {
    return { status: 'failure', icon: XCircle, text: 'Some Checks Failed', colorClass: 'text-destructive' };
  }

  const allSuccessful = checkRuns.every(run => run.conclusion === 'success' || run.conclusion === 'skipped' || run.conclusion === 'neutral');
   if (allSuccessful && allCompleted) { // Ensure all are completed and successful/skipped/neutral
    return { status: 'success', icon: CheckCircle, text: 'All Checks Passed!', colorClass: 'text-accent' };
  }

  // If not all successful (and no outright failures), and all completed, it's mixed.
  if (allCompleted) {
    return { status: 'mixed', icon: AlertCircle, text: 'Checks Completed', colorClass: 'text-yellow-500' }; // Simpler text for mixed
  }

  // Fallback for any other state (e.g. only queued checks that never started, or odd combinations)
  return { status: 'pending', icon: Clock, text: 'Checks Status Pending...', colorClass: 'text-blue-500' };
};

export const CICDStatusScene: React.FC<CICDStatusSceneProps> = ({ checkRuns }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // Get fps from hook
  const { icon: Icon, text, colorClass, status } = getOverallStatus(checkRuns);

  // A powerful spring for the icon animation
  const iconScale = spring({
    fps,
    frame,
    config: { mass: 0.8, damping: 10, stiffness: 100 },
  });

  const iconOpacity = iconScale; // Tie opacity to scale

  // Text animation, slightly delayed
  const textOpacity = spring({
    fps,
    frame: frame - fps * 0.2, // Delay text appearance
    config: { mass: 0.5, damping: 15, stiffness: 120}
  });
  const textY = interpolate(textOpacity, [0, 1], [20, 0]);

  return (
    <SceneContainer title="CI/CD Status">
      <div className="flex flex-col items-center justify-center">
        <Icon
          className={`w-32 h-32 md:w-48 md:h-48 mb-8 ${colorClass}`}
          style={{ 
            transform: `scale(${iconScale})`,
            opacity: iconOpacity 
          }}
        />
        <p 
          className={`font-headline text-4xl md:text-5xl font-semibold ${colorClass} text-shadow-sm text-center`}
          style={{ opacity: textOpacity, transform: `translateY(${textY}px)`}}
        >
          {text}
        </p>
        
      </div>
    </SceneContainer>
  );
};
