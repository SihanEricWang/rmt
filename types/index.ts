// types/index.ts
export type TeacherListItem = {
  id: string;
  full_name: string;
  subject: string | null;

  avg_quality: number | null;
  review_count: number;
  pct_would_take_again: number | null;
  avg_difficulty: number | null;
};
