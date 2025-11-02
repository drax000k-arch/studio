'use client';

export type DecisionStatus = 'Pending' | 'Completed' | 'Failed';

export type Decision = {
  id: string;
  subject: string;
  options: string[];
  userContext?: string;
  recommendation: string;
  justification: string;
  createdAt: string;
  status?: DecisionStatus;
};

export type DecisionResult = {
  recommendation: string;
  justification: string;
};

export type CommunityPost = {
  id: string;
  author: {
    name: string | null;
    avatarUrl: string | null;
    uid?: string;
  };
  subject: string;
  options: string[];
  aiRecommendation: string;
aiJustification: string;
  createdAt: string;
  postedAt?: string;
  commentCount: number;
  votes: { [option: string]: number };
  voters: { [uid: string]: string }; // Maps user ID to their chosen option
};
