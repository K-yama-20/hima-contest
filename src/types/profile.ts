import type { GameId } from "../config/gamePoints";

export type Profile = {
  user_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

export type GameStat = {
  game_id: GameId;
  total_raw_score: number;
  total_hp: number;
  play_count: number;
};
