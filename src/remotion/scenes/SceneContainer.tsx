import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';
import { Card } from '@/components/ui/card'; // Shadcn card for glassmorphism base

interface SceneContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string; // Optional title for the scene
  bgImage?: string; // Optional background image for the scene
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ children, className, title, bgImage }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) });
  const scale = interpolate(frame, [0, 20], [0.95, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1)) });

  return (
    <AbsoluteFill 
      className={`flex items-center justify-center p-8 font-body ${className || ''}`}
      style={{ 
        opacity, 
        transform: `scale(${scale})`,
        // background: bgImage ? `url(${staticFile(bgImage)}) center/cover` : 'transparent',
      }}
    >
      {/* 
        Using a div instead of ShadCN Card directly because Remotion rendering works better with basic HTML.
        The glassmorphism styles will be applied via Tailwind classes.
      */}
      <div className="glassmorphism rounded-xl w-full h-full p-8 flex flex-col items-center justify-center relative overflow-hidden">
         {bgImage && <Img src={staticFile(bgImage)} className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10" />}
        {title && (
          <h2 
            className="font-headline text-5xl text-primary mb-8 text-shadow-md"
            style={{
              opacity: interpolate(frame, [5, 25], [0,1], {extrapolateRight: 'clamp'}),
              transform: `translateY(${interpolate(frame, [5,25], [20,0], {extrapolateRight: 'clamp'})}px)`
            }}
          >
            {title}
          </h2>
        )}
        <div className="flex-grow w-full flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
