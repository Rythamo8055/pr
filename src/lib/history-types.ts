
export interface HistoryEntry {
  id: string; // Using PR number as string
  title: string;
  prUrl: string;
  timestamp: number; // Date.now()
  repoName: string; // e.g., owner/repo
}
