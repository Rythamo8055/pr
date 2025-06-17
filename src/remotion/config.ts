
import type { PRData } from "@/lib/github-types";

export const COMPOSITION_ID = 'PRVisualizer';
export const FPS = 24; // Reduced from 30
export const WIDTH = 1280;
export const HEIGHT = 720;

// Scene duration estimates in seconds
export const DURATION_TITLE_SCENE = 4; 
export const DURATION_STATS_SCENE = 5; 
export const DURATION_PER_FILE_DIFF = 5; // Reduced from 7
export const MAX_FILES_TO_SHOW = 3; // Reduced from 5
export const DURATION_COMMIT_HISTORY_SCENE = 5; 
export const DURATION_CICD_STATUS_SCENE = 3; 
export const DURATION_FINAL_SCENE = 4; 

// Transition duration
export const DEFAULT_TRANSITION_DURATION_IN_FRAMES = FPS * 0.5; // Reduced from 0.75 seconds

export const calculateVideoDuration = (prData: PRData | null): { durationInFrames: number; width: number; height: number; fps: number } => {
  if (!prData) {
    // Default duration if no PR data, adjust if needed based on new FPS
    return { durationInFrames: FPS * 15, width: WIDTH, height: HEIGHT, fps: FPS }; 
  }

  let totalSeconds = 0;
  totalSeconds += DURATION_TITLE_SCENE;
  totalSeconds += DURATION_STATS_SCENE;

  const filesToShow = Math.min(prData.files.length, MAX_FILES_TO_SHOW);
  if (filesToShow > 0) {
    totalSeconds += (filesToShow * DURATION_PER_FILE_DIFF);
  }

  if (prData.commits.length > 0) {
    totalSeconds += DURATION_COMMIT_HISTORY_SCENE;
  }

  if (prData.checkRuns.length > 0) {
    totalSeconds += DURATION_CICD_STATUS_SCENE;
  }

  totalSeconds += DURATION_FINAL_SCENE;

  let actualSceneCount = 0;
  if (DURATION_TITLE_SCENE > 0) actualSceneCount++;
  if (DURATION_STATS_SCENE > 0) actualSceneCount++;
  if (filesToShow > 0 && DURATION_PER_FILE_DIFF > 0) actualSceneCount++;
  if (prData.commits.length > 0 && DURATION_COMMIT_HISTORY_SCENE > 0) actualSceneCount++;
  if (prData.checkRuns.length > 0 && DURATION_CICD_STATUS_SCENE > 0) actualSceneCount++;
  if (DURATION_FINAL_SCENE > 0) actualSceneCount++;

  const numberOfTransitions = Math.max(0, actualSceneCount -1);
  totalSeconds += numberOfTransitions * (DEFAULT_TRANSITION_DURATION_IN_FRAMES / FPS);


  return {
    durationInFrames: Math.ceil(totalSeconds * FPS),
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
  };
};

