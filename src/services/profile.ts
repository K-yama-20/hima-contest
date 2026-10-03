import { GAME_POINT_RATES } from "../config/gamePoints";
import type { GameId } from "../config/gamePoints";
import { supabase } from "../lib/supabase";
import type { GameStat, Profile } from "../types/profile";

const gameIds = Object.keys(GAME_POINT_RATES) as GameId[];

export function getFallbackDisplayName(userId: string) {
  return `暇人-${userId.slice(0, 6)}`;
}

export async function getProfile(
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Profile | null;
}

export async function getProfilesByUserIds(
  userIds: string[]
): Promise<Map<string, string>> {
  const uniqueUserIds = [...new Set(userIds)];

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", uniqueUserIds);

  if (error) {
    throw error;
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.user_id,
      profile.display_name,
    ])
  );
}

export async function updateMyDisplayName(
  displayName: string
): Promise<Profile> {
  const normalizedName = displayName.trim();

  if (
    normalizedName.length < 1 ||
    normalizedName.length > 20
  ) {
    throw new Error("表示名は1〜20文字で入力してください。");
  }

  const { data, error } = await supabase.rpc(
    "update_my_display_name",
    {
      p_display_name: normalizedName,
    }
  );

  if (error) {
    throw error;
  }

  const updatedProfile = Array.isArray(data) ? data[0] : data;

  if (!updatedProfile) {
    throw new Error("更新後のプロフィールを取得できませんでした。");
  }

  return updatedProfile as Profile;
}

export async function getMyGameStats(): Promise<GameStat[]> {
  const { data, error } = await supabase.rpc(
    "get_my_game_stats"
  );

  if (error) {
    throw error;
  }

  const records = (data ?? []) as Array<{
    game_id: string;
    total_raw_score: number;
    total_hp: number;
    play_count: number;
  }>;

  const recordsByGame = new Map(
    records.map((record) => [record.game_id, record])
  );

  return gameIds.map((gameId) => {
    const record = recordsByGame.get(gameId);

    return {
      game_id: gameId,
      total_raw_score: Number(record?.total_raw_score ?? 0),
      total_hp: Number(record?.total_hp ?? 0),
      play_count: Number(record?.play_count ?? 0),
    };
  });
}
