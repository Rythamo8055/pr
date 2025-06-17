
// @ts-nocheck
// Disabling TypeScript checks for this file due to Octokit and GitHub API types complexity.
// Production applications should have proper type checking.
"use server";

import { Octokit } from "octokit";
import type { PRData, GitHubPullRequest, GitHubCommit, GitHubFile, GitHubCheckRun } from "@/lib/github-types";
import { extractCodeInsights } from "@/ai/flows/extract-code-insights";
import { cache } from 'react'; // Added React cache

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.warn("GITHUB_TOKEN environment variable is not set. GitHub API requests may be rate-limited or fail for private repositories.");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

interface ParsedPRUrl {
  owner: string;
  repo: string;
  pull_number: number;
}

function parseGitHubPRUrl(url: string): ParsedPRUrl | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      pull_number: parseInt(match[3], 10),
    };
  }
  return null;
}

export const getPRData = cache(async (prUrl: string): Promise<PRData | { error: string }> => {
  const parsedUrl = parseGitHubPRUrl(prUrl);
  if (!parsedUrl) {
    return { error: "Invalid GitHub PR URL." };
  }

  const { owner, repo, pull_number } = parsedUrl;

  try {
    // 1. Fetch PR details
    const prDetailsResponse = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });
    
    let prDetails = prDetailsResponse.data as unknown as GitHubPullRequest;
     // Add a custom 'merged' state for convenience if merged_at is present
    if (prDetails.merged_at && prDetails.state === 'closed') {
      prDetails.state = 'merged';
    }


    // 2. Fetch PR commits
    const commitsResponse = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number,
    });
    const commits = commitsResponse.data as unknown as GitHubCommit[];

    // 3. Fetch PR files and diff
    // To get the raw diff, we use the .diff media type
    const diffResponse = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: "diff",
      },
    });
    const diff = diffResponse.data as unknown as string;

    // Fetch file list separately for more detailed file info
    const filesResponse = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number,
    });
    const files = filesResponse.data as unknown as GitHubFile[];


    // 4. Fetch CI/CD check status (Check Runs for the PR's head SHA)
    let checkRuns: GitHubCheckRun[] = [];
    if (prDetails.head.sha) {
      const checkRunsResponse = await octokit.rest.checks.listForRef({
        owner,
        repo,
        ref: prDetails.head.sha,
      });
      checkRuns = checkRunsResponse.data.check_runs as unknown as GitHubCheckRun[];
    }

    // 5. Generate Code Insights using GenAI flow
    let codeInsights: string | undefined;
    if (diff) {
      try {
        const insightsResult = await extractCodeInsights({ codeDiff: diff });
        codeInsights = insightsResult.insights;
      } catch (e) {
        console.error("Failed to extract code insights:", e);
        // Proceed without insights if the AI flow fails
      }
    }
    
    return {
      prDetails,
      commits,
      files,
      diff,
      checkRuns,
      codeInsights,
    };
  } catch (error: any) {
    console.error("Error fetching PR data from GitHub API:", error);
    if (error.status === 404) {
        return { error: "Pull Request not found. Please check the URL or repository permissions." };
    }
    if (error.status === 401 || error.status === 403) {
        return { error: "GitHub API authentication error. Check your GITHUB_TOKEN."}
    }
    return { error: `Failed to fetch PR data: ${error.message}` };
  }
});

