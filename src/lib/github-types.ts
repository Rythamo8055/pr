export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubBranch {
  ref: string;
  sha: string;
  repo?: {
    full_name: string;
  };
}

export interface GitHubPullRequest {
  id: number;
  html_url: string;
  number: number;
  title: string;
  user: GitHubUser | null;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  state: 'open' | 'closed' | 'merged'; // 'merged' is a custom state for convenience
  merged: boolean | null;
  merged_by: GitHubUser | null;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  head: GitHubBranch; // Source branch
  base: GitHubBranch; // Target branch
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name?: string | null;
      email?: string | null;
      date?: string | null;
    };
    committer: {
      name?: string | null;
      email?: string | null;
      date?: string | null;
    };
    message: string;
  };
  author: GitHubUser | null;
  html_url: string;
}

export interface GitHubFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string; // Diff patch for the file
  previous_filename?: string; // For renamed files
}

export interface GitHubCheckRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
  html_url: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface GitHubCheckSuite {
    id: number;
    status: 'queued' | 'in_progress' | 'completed' | null;
    conclusion:
        | 'success'
        | 'failure'
        | 'neutral'
        | 'cancelled'
        | 'skipped'
        | 'timed_out'
        | 'action_required'
        | null;
    head_sha: string;
    check_runs_url: string;
}


export interface PRData {
  prDetails: GitHubPullRequest;
  commits: GitHubCommit[];
  files: GitHubFile[];
  diff: string; // Combined diff string
  checkRuns: GitHubCheckRun[];
  codeInsights?: string;
}
