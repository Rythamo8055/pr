
import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'; 
import type { GitHubCheckRun } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { CheckCircle, XCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react'; 

const getOverallStatus = (checkRuns: GitHubCheckRun[]): {
  status: 'success' | 'failure' | 'pending' | 'mixed' | 'unknown'; 
  icon: React.ElementType;
  text: string;
  colorClass: string;
} => {
  if (checkRuns.length === 0) {
    return { status: 'unknown', icon: HelpCircle, text: 'No Checks Found', colorClass: 'text-yellow-500' }; 
  }

  const allCompleted = checkRuns.every(run => run.status === 'completed');

  if (!allCompleted) {
    const anyInProgress = checkRuns.some(run => run.status === 'in_progress' || run.status === 'queued');
    if (anyInProgress) {
      return { status: 'pending', icon: Clock, text: 'Checks In Progress...', colorClass: 'text-blue-500' };
    }
  }

  const anyFailure = checkRuns.some(run => run.conclusion === 'failure' || run.conclusion === 'timed_out' || run.conclusion === 'cancelled');
  if (anyFailure) {
    return { status: 'failure', icon: XCircle, text: 'Some Checks Failed', colorClass: 'text-destructive' };
  }

  const allSuccessful = checkRuns.every(run => run.conclusion === 'success' || run.conclusion === 'skipped' || run.conclusion === 'neutral');
   if (allSuccessful && allCompleted) {
    return { status: 'success', icon: CheckCircle, text: 'All Checks Passed!', colorClass: 'text-accent' };
  }

  if (allCompleted) {
    return { status: 'mixed', icon: AlertCircle, text: 'Checks Completed', colorClass: 'text-yellow-500' };
  }

  return { status: 'pending', icon: Clock, text: 'Checks Status Pending...', colorClass: 'text-blue-500' };
};

interface CICDStatusSceneProps {
  checkRuns: GitHubCheckRun[];
}

export const CICDStatusScene: React.FC<CICDStatusSceneProps> = ({ checkRuns }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); 
  const { icon: Icon, text, colorClass } = getOverallStatus(checkRuns);

  const iconSpring = spring({
    fps,
    frame,
    config: { mass: 0.7, damping: 12, stiffness: 110 }, 
  });

  const iconScale = iconSpring;
  const iconOpacity = iconSpring;

  const textSpring = spring({
    fps,
    frame: frame - fps * 0.3, 
    config: { mass: 0.6, damping: 16, stiffness: 130}
  });
  const textOpacity = textSpring;
  const textY = interpolate(textSpring, [0, 1], [15, 0]);

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
