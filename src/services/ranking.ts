import { supabase } from "../lib/supabase";
import {
  getFallbackDisplayName,
  getProfilesByUserIds,
} from "./profile";
import type { RankingPeriod, RankingRecord } from "../types/ranking";

type RankingRpcRecord = Omit<RankingRecord, "display_name">;

export async function getRanking(
    period: RankingPeriod
): Promise<RankingRecord[]> {

  const { data, error } = await supabase.rpc(
    "get_leaderboard",
    {
        p_period: period,
    }
  );
    
  if (error) {
    throw error;
  }

  const records = (data ?? []) as RankingRpcRecord[];

  let displayNames = new Map<string, string>();

  try {
    displayNames = await getProfilesByUserIds(
      records.map((record) => record.user_id)
    );
  } catch (profileError) {
    console.error(
      "プロフィール名の取得に失敗しました:",
      profileError
    );
  }

  return records.map((record) => ({
    ...record,
    display_name:
      displayNames.get(record.user_id) ??
      getFallbackDisplayName(record.user_id),
  }));
}

export async function getDailyRanking() {
    return getRanking("day");
}
