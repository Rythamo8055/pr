import React from 'react';
import { useCurrentFrame, interpolate, Easing, spring } from 'remotion';
import type { GitHubCheckRun } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { FPS } from '../config';

interface CICDStatusSceneProps {
  checkRuns: GitHubCheckRun[];
}

const getOverallStatus = (checkRuns: GitHubCheckRun[]): {
  status: 'success' | 'failure' | 'pending' | 'mixed';
  icon: React.ElementType;
  text: string;
  colorClass: string;
} => {
  if (checkRuns.length === 0) {
    return { status: 'pending', icon: AlertCircle, text: 'No Checks Found', colorClass: 'text-yellow-500' };
  }

  const allCompleted = checkRuns.every(run => run.status === 'completed');
  const allSuccessful = checkRuns.every(run => run.conclusion === 'success');
  const anyFailure = checkRuns.some(run => run.conclusion === 'failure' || run.conclusion === 'timed_out' || run.conclusion === 'cancelled');

  if (!allCompleted) {
    return { status: 'pending', icon: Clock, text: 'Checks In Progress...', colorClass: 'text-blue-500' };
  }
  if (allSuccessful) {
    return { status: 'success', icon: CheckCircle, text: 'All Checks Passed!', colorClass: 'text-accent' };
  }
  if (anyFailure) {
    return { status: 'failure', icon: XCircle, text: 'Some Checks Failed', colorClass: 'text-destructive' };
  }
  return { status: 'mixed', icon: AlertCircle, text: 'Checks Completed with Mixed Results', colorClass: 'text-yellow-500' };
};

export const CICDStatusScene: React.FC<CICDStatusSceneProps> = ({ checkRuns }) => {
  const frame = useCurrentFrame();
  const { icon: Icon, text, colorClass, status } = getOverallStatus(checkRuns);

  const animationProgress = spring({
    frame,
    fps: FPS,
    config: {
      mass: 0.8,
      damping: 10,
      stiffness: 100,
    },
  });

  const iconScale = interpolate(animationProgress, [0, 1], [0.5, 1]);
  const textOpacity = interpolate(animationProgress, [0.5, 1], [0, 1]);
  const textY = interpolate(animationProgress, [0.5, 1], [20, 0]);

  return (
    <SceneContainer title="CI/CD Status">
      <div className="flex flex-col items-center justify-center">
        <Icon
          className={`w-32 h-32 md:w-48 md:h-48 mb-8 ${colorClass}`}
          style={{ transform: `scale(${iconScale})` }}
        />
        <p 
          className={`font-headline text-4xl md:text-5xl font-semibold ${colorClass} text-shadow-sm`}
          style={{ opacity: textOpacity, transform: `translateY(${textY}px)`}}
        >
          {text}
        </p>
        
        {/* Optional: List individual checks if space/time allows */}
        {/* For brevity, this is omitted but could be added with further animation */}
      </div>
    </SceneContainer>
  );
};
