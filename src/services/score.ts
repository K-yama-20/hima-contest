import { supabase } from "../lib/supabase";
import type { GameId } from "../config/gamePoints";

export async function submitGameScore(
  gameId: GameId,
  rawScore: number
) {
  const { data, error } =
    await supabase.rpc(
      "submit_game_score",
      {
        p_game_id: gameId,
        p_raw_score: Math.floor(rawScore),
      }
    );

  if (error) {
    throw error;
  }

  return data;
}
