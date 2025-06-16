import React from 'react';
import { useCurrentFrame, interpolate, Easing, spring } from 'remotion';
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { BarChart, FileText, GitCommit, PlusCircle, MinusCircle } from 'lucide-react';
import { FPS } from '../config';

interface StatsSceneProps {
  prDetails: GitHubPullRequest;
}

const StatItem: React.FC<{ icon: React.ElementType, label: string, value: number, colorClass: string, delay: number }> = 
  ({ icon: Icon, label, value, colorClass, delay }) => {
  const frame = useCurrentFrame();
  const animationProgress = spring({
    frame: frame - delay,
    fps: FPS,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const animatedValue = Math.round(interpolate(animationProgress, [0, 1], [0, value]));

  return (
    <div 
      className="flex flex-col items-center p-6 bg-card/70 backdrop-blur-sm rounded-lg shadow-md w-48 h-48 justify-center glassmorphism"
      style={{ 
        opacity: animationProgress,
        transform: `scale(${animationProgress}) translateY(${interpolate(animationProgress, [0,1], [20,0])}px)`
      }}
    >
      <Icon className={`w-12 h-12 mb-2 ${colorClass}`} />
      <p className={`text-4xl font-bold ${colorClass}`}>{animatedValue}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};


export const StatsScene: React.FC<StatsSceneProps> = ({ prDetails }) => {
  return (
    <SceneContainer title="Pull Request Stats">
      <div className="grid grid-cols-2 gap-6 md:gap-8">
        <StatItem icon={GitCommit} label="Commits" value={prDetails.commits || 0} colorClass="text-primary" delay={0} />
        <StatItem icon={FileText} label="Files Changed" value={prDetails.changed_files || 0} colorClass="text-yellow-500" delay={10} />
        <StatItem icon={PlusCircle} label="Lines Added" value={prDetails.additions || 0} colorClass="text-accent" delay={20} />
        <StatItem icon={MinusCircle} label="Lines Deleted" value={prDetails.deletions || 0} colorClass="text-destructive" delay={30} />
      </div>
    </SceneContainer>
  );
};
