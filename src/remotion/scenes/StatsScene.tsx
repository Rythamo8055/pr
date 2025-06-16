
import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { FileText, GitCommit, PlusCircle, MinusCircle } from 'lucide-react';

const Counter: React.FC<{ from: number; to: number; durationInFrames?: number }> = ({ from, to, durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const actualDuration = durationInFrames || fps; 

    const count = interpolate(frame, [0, actualDuration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return <span>{Math.round(count)}</span>;
};

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  colorClass: string;
  delayFactor: number; 
  isCounter?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label, value, colorClass, delayFactor, isCounter = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const itemSpring = spring({
    fps,
    frame,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    },
    delay: fps * delayFactor, 
  });

  const itemOpacity = itemSpring;
  const itemScale = itemSpring;
  const itemTranslateY = interpolate(itemSpring, [0, 1], [20, 0]);

  return (
    <div
      className="flex flex-col items-center p-4 md:p-6 bg-card/60 backdrop-blur-md rounded-xl shadow-lg w-40 h-40 md:w-48 md:h-48 justify-center glassmorphism"
      style={{
        opacity: itemOpacity,
        transform: `scale(${itemScale}) translateY(${itemTranslateY}px)`
      }}
    >
      <Icon className={`w-10 h-10 md:w-12 md:h-12 mb-2 ${colorClass}`} />
      <p className={`text-3xl md:text-4xl font-bold ${colorClass}`}>
        {isCounter ? <Counter from={0} to={value} /> : value}
      </p>
      <p className="text-xs md:text-sm text-muted-foreground mt-1 text-center">{label}</p>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; maxValue: number; colorClass: string; barBgClass: string; delayFactor: number; icon: React.ElementType }> =
  ({ label, value, maxValue, colorClass, barBgClass, delayFactor, icon: Icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barSpring = spring({
    fps,
    frame: frame - (fps * delayFactor), 
    config: { damping: 18, stiffness: 130 }
  });

  const barWidthPercent = interpolate(barSpring, [0, 1], [0, Math.min(100, (value / Math.max(1, maxValue)) * 100)]);
  const opacity = barSpring;
  const translateY = interpolate(barSpring, [0,1], [15,0]);


  return (
    <div
      className="flex flex-col items-start p-3 bg-card/60 backdrop-blur-md rounded-lg shadow-md w-full glassmorphism mb-3"
      style={{opacity: opacity, transform: `translateY(${translateY}px)`}}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${colorClass}`} />
          <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        </div>
        <span className={`text-sm font-bold ${colorClass}`}>
          <Counter from={0} to={value} durationInFrames={fps * 1.2} />
        </span>
      </div>
      <div className={`w-full h-4 rounded ${barBgClass} overflow-hidden`}>
        <div
          className={`h-full rounded transition-all duration-500 ease-out`}
          style={{ width: `${barWidthPercent}%`, backgroundColor: `hsl(var(--${colorClass.replace('text-','')}))` }}
        />
      </div>
    </div>
  );
}

interface StatsSceneProps {
  prDetails: GitHubPullRequest;
}

export const StatsScene: React.FC<StatsSceneProps> = ({ prDetails }) => {
  const maxChanges = Math.max(1, prDetails.additions || 0, prDetails.deletions || 0);
  const { fps } = useVideoConfig();

  return (
    <SceneContainer title="Pull Request Stats">
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
        <StatItem icon={GitCommit} label="Commits" value={prDetails.commits || 0} colorClass="text-primary" delayFactor={0} isCounter />
        <StatItem icon={FileText} label="Files Changed" value={prDetails.changed_files || 0} colorClass="text-yellow-500" delayFactor={0.2} isCounter />
      </div>
      <div className="w-full max-w-md">
        <StatBar
            icon={PlusCircle}
            label="Lines Added"
            value={prDetails.additions || 0}
            maxValue={maxChanges}
            colorClass="text-accent"
            barBgClass="bg-accent/20"
            delayFactor={0.4}
        />
        <StatBar
            icon={MinusCircle}
            label="Lines Deleted"
            value={prDetails.deletions || 0}
            maxValue={maxChanges}
            colorClass="text-destructive"
            barBgClass="bg-destructive/20"
            delayFactor={0.6}
        />
      </div>
    </SceneContainer>
  );
};
