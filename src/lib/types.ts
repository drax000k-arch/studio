export type DecisionOption = {
  id: string;
  value: string;
};

export type Decision = {
  subject: string;
  options: DecisionOption[];
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
  };
  subject: string;
  options: string[];
  aiRecommendation: string;
  aiJustification: string;
  postedAt: string;
  commentCount: number;
};
