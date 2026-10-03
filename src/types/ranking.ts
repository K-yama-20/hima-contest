export type RankingPeriod = 
    | "day"
    | "week"
    | "month"
    | "year"
    | "all";

export type RankingRecord = {
  user_id: string;
  display_name: string;
  total_hp: number;
  total_raw_score: number;
  play_count: number;
  rank_no: number;
};
