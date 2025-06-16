
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing, useVideoConfig } from 'remotion';

interface SceneContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  bgImage?: string; 
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ children, className, title, bgImage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene entry animation (subtle fade and scale)
  const sceneEntryProgress = interpolate(frame, [0, fps * 0.5], [0, 1], { 
    extrapolateRight: 'clamp', 
    easing: Easing.out(Easing.ease) 
  });
  const sceneOpacity = sceneEntryProgress;
  const sceneScale = interpolate(sceneEntryProgress, [0, 1], [0.98, 1]);


  let finalBgSrc: string | undefined = undefined;
  let isExternalImage = false;
  if (bgImage) {
    if (bgImage.startsWith('http://') || bgImage.startsWith('https://')) {
      finalBgSrc = bgImage;
      isExternalImage = true;
    } else {
      try {
        finalBgSrc = staticFile(bgImage);
      } catch (e) {
        console.error(`Error loading static file for bgImage "${bgImage}":`, e);
        finalBgSrc = undefined; // Fallback if staticFile fails
      }
    }
  }
  
  // Title animation
  const titleOpacity = interpolate(frame, [fps * 0.2, fps * 0.7], [0,1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.ease)});
  const titleY = interpolate(frame, [fps * 0.2, fps * 0.7], [20,0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(0.5))});


  return (
    <AbsoluteFill 
      className={`flex items-center justify-center p-4 md:p-8 font-body ${className || ''}`}
      style={{ 
        opacity: sceneOpacity, 
        transform: `scale(${sceneScale})`,
      }}
    >
      <div className="glassmorphism rounded-xl w-full h-full p-6 md:p-8 flex flex-col items-center justify-start relative overflow-hidden">
         {finalBgSrc && (
            <Img 
                src={finalBgSrc} 
                className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10" 
                data-ai-hint={isExternalImage ? "background image" : "tech pattern"} // Generic hint if external
            />
         )}
        {title && (
          <h2 
            className="font-headline text-4xl md:text-5xl text-primary mb-6 md:mb-8 text-shadow-md text-center"
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`
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
