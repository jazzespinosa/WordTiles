export type FeedbackCategory =
  | 'BUG'
  | 'SUGGESTION'
  | 'RECOMMENDATION'
  | 'GENERAL';

export interface FeedbackDto {
  category: FeedbackCategory;
  subject: string;
  description: string;
  isAnonymous: boolean;
  allowContact: boolean;
}

export interface FeedbackResponse {
  feedbackId: number;
}

export interface CategoryOption {
  value: FeedbackCategory;
  label: string;
  icon: string;
  color: string;
}
