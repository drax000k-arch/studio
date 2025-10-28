export type DecisionOption = {
  id: string;
  value: string;
};

export type Decision = {
  id: string;
  subject: string;
  options: string[];
  userContext?: string;
  recommendation: string;
  justification: string;
  createdAt: string;
};

export type DecisionResult = {
  recommendation: string;
  justification: string;
};

export type CommunityPost = {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
    uid: string;
  };
  subject: string;
  options: string[];
  aiRecommendation: string;
  aiJustification: string;
  createdAt: string;
  commentCount: number;
};
