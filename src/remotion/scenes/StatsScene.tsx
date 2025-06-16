
import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'; // Added useVideoConfig
import type { GitHubPullRequest } from '@/lib/github-types';
import { SceneContainer } from './SceneContainer';
import { FileText, GitCommit, PlusCircle, MinusCircle } from 'lucide-react';
import { FPS } from '../config'; // FPS is already available

// Reusable Counter component
const Counter: React.FC<{ from: number; to: number; durationInFrames?: number }> = ({ from, to, durationInFrames = FPS }) => {
    const frame = useCurrentFrame();
    // Animate count up over specified duration, defaulting to 1 second
    const count = interpolate(frame, [0, durationInFrames], [from, to], {
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
  delay: number; // delay in frames
  isCounter?: boolean; // To use the Counter component
  counterDuration?: number; // Duration for counter animation in frames
}

const StatItem: React.FC<StatItemProps> = 
  ({ icon: Icon, label, value, colorClass, delay, isCounter = false, counterDuration = FPS }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // Get fps from hook

  const itemSpring = spring({
    fps,
    frame: frame - delay,
    config: {
      damping: 15, // Slightly more bounce
      stiffness: 120,
      mass: 0.8,
    },
  });

  const itemOpacity = itemSpring;
  const itemScale = itemSpring;
  const itemTranslateY = interpolate(itemSpring, [0, 1], [30, 0]);

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
        {isCounter ? <Counter from={0} to={value} durationInFrames={counterDuration} /> : value}
      </p>
      <p className="text-xs md:text-sm text-muted-foreground mt-1 text-center">{label}</p>
    </div>
  );
};

// Bar component for additions/deletions
const StatBar: React.FC<{ label: string; value: number; maxValue: number; colorClass: string; barBgClass: string; delay: number; icon: React.ElementType }> =
  ({ label, value, maxValue, colorClass, barBgClass, delay, icon: Icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barSpring = spring({
    fps,
    frame: frame - delay,
    config: { damping: 200, stiffness: 150 }
  });
  
  const barWidthPercent = interpolate(barSpring, [0, 1], [0, Math.min(100, (value / Math.max(1,maxValue)) * 100) ]);

  const itemOpacity = barSpring;
  const itemTranslateY = interpolate(barSpring, [0,1], [20,0]);

  return (
    <div 
      className="flex flex-col items-start p-3 bg-card/60 backdrop-blur-md rounded-lg shadow-md w-full glassmorphism mb-3"
      style={{opacity:itemOpacity, transform: `translateY(${itemTranslateY}px)`}}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${colorClass}`} />
          <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        </div>
        <span className={`text-sm font-bold ${colorClass}`}>
          <Counter from={0} to={value} durationInFrames={FPS*1.5}/>
        </span>
      </div>
      <div className={`w-full h-4 rounded ${barBgClass} overflow-hidden`}>
        <div
          className={`h-full rounded ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${barWidthPercent}%`, backgroundColor: `hsl(var(--${colorClass.replace('text-','')}))` }}
        />
      </div>
    </div>
  );
}


export const StatsScene: React.FC<StatsSceneProps> = ({ prDetails }) => {
  const maxChanges = Math.max(1, prDetails.additions || 0, prDetails.deletions || 0);
  return (
    <SceneContainer title="Pull Request Stats">
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
        <StatItem icon={GitCommit} label="Commits" value={prDetails.commits || 0} colorClass="text-primary" delay={0} isCounter counterDuration={FPS} />
        <StatItem icon={FileText} label="Files Changed" value={prDetails.changed_files || 0} colorClass="text-yellow-500" delay={FPS * 0.2} isCounter counterDuration={FPS} />
      </div>
      <div className="w-full max-w-md">
        <StatBar 
            icon={PlusCircle} 
            label="Lines Added" 
            value={prDetails.additions || 0} 
            maxValue={maxChanges} 
            colorClass="text-accent" 
            barBgClass="bg-accent/20" 
            delay={FPS * 0.4} 
        />
        <StatBar 
            icon={MinusCircle} 
            label="Lines Deleted" 
            value={prDetails.deletions || 0} 
            maxValue={maxChanges}
            colorClass="text-destructive" 
            barBgClass="bg-destructive/20" 
            delay={FPS * 0.6}
        />
      </div>
    </SceneContainer>
  );
};
