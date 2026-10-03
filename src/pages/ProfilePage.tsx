import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

import type { GameId } from "../config/gamePoints";
import { supabase } from "../lib/supabase";
import {
  getFallbackDisplayName,
  getMyGameStats,
  getProfile,
  updateMyDisplayName,
} from "../services/profile";
import { getDailyRanking } from "../services/ranking";
import type { GameStat, Profile } from "../types/profile";
import type { RankingRecord } from "../types/ranking";

const gameDetails: Record<
  GameId,
  {
    icon: string;
    name: string;
    unit: string;
  }
> = {
  tap: {
    icon: "👆",
    name: "無限連打",
    unit: "タップ",
  },
  hold: {
    icon: "⏱️",
    name: "長押し耐久",
    unit: "秒",
  },
  scroll: {
    icon: "📜",
    name: "無限スクロール",
    unit: "px",
  },
  circle: {
    icon: "🌀",
    name: "ぐるぐる選手権",
    unit: "周",
  },
  marathon: {
    icon: "🏃",
    name: "暇人マラソン",
    unit: "歩",
  },
};

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const [dailyRecord, setDailyRecord] =
    useState<RankingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfilePage = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!currentUser) {
          navigate("/login", {
            replace: true,
            state: {
              from: location.pathname,
            },
          });
          return;
        }

        const [loadedProfile, loadedStats, dailyRanking] =
          await Promise.all([
            getProfile(currentUser.id),
            getMyGameStats(),
            getDailyRanking(),
          ]);

        if (!active) {
          return;
        }

        const fallbackName = getFallbackDisplayName(
          currentUser.id
        );

        setUser(currentUser);
        setProfile(loadedProfile);
        setDisplayName(
          loadedProfile?.display_name ?? fallbackName
        );
        setGameStats(loadedStats);
        setDailyRecord(
          dailyRanking.find(
            (record) => record.user_id === currentUser.id
          ) ?? null
        );
      } catch (error) {
        console.error("プロフィール取得エラー:", error);

        if (active) {
          setErrorMessage(
            "プロフィールの取得に失敗しました。"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfilePage();

    return () => {
      active = false;
    };
  }, [location.pathname, navigate]);

  const totalHp = useMemo(
    () =>
      gameStats.reduce(
        (total, stat) => total + stat.total_hp,
        0
      ),
    [gameStats]
  );

  const totalPlayCount = useMemo(
    () =>
      gameStats.reduce(
        (total, stat) => total + stat.play_count,
        0
      ),
    [gameStats]
  );

  const saveDisplayName = async () => {
    const normalizedName = displayName.trim();

    setSaveMessage("");

    if (
      normalizedName.length < 1 ||
      normalizedName.length > 20
    ) {
      setSaveMessage(
        "表示名は1〜20文字で入力してください。"
      );
      return;
    }

    setSaving(true);

    try {
      const updatedProfile =
        await updateMyDisplayName(normalizedName);

      setProfile(updatedProfile);
      setDisplayName(updatedProfile.display_name);
      setSaveMessage("表示名を保存しました。");
    } catch (error) {
      console.error("プロフィール保存エラー:", error);
      setSaveMessage("表示名の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>プロフィール</h1>
        <p>あなたの暇人記録を確認できます。</p>
      </header>

      <main className="main">
        <Link to="/" className="back-button">
          ← ホームに戻る
        </Link>

        {loading ? (
          <div className="profile-state">
            プロフィールを読み込み中...
          </div>
        ) : errorMessage ? (
          <div className="profile-state">
            <p>{errorMessage}</p>
            <button
              className="profile-retry-button"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        ) : user ? (
          <>
            <section className="profile-card">
              <div className="profile-heading">
                <div className="profile-avatar" aria-hidden="true">
                  {(profile?.display_name ?? displayName).slice(0, 1)}
                </div>

                <div>
                  <p className="profile-label">表示名</p>
                  <h2>
                    {profile?.display_name ??
                      getFallbackDisplayName(user.id)}
                  </h2>
                </div>
              </div>

              <div className="profile-name-form">
                <label htmlFor="display-name">
                  表示名を変更
                </label>

                <div className="profile-name-controls">
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                      setSaveMessage("");
                    }}
                    maxLength={20}
                    disabled={saving}
                  />

                  <button
                    onClick={saveDisplayName}
                    disabled={saving}
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                </div>

                <div className="profile-form-footer">
                  <span>{displayName.length}/20文字</span>
                  {saveMessage && <strong>{saveMessage}</strong>}
                </div>
              </div>
            </section>

            <section className="profile-summary-grid">
              <div className="profile-summary-card primary">
                <span>累計暇人ポイント</span>
                <strong>{totalHp.toLocaleString()} HP</strong>
              </div>

              <div className="profile-summary-card">
                <span>今日のポイント</span>
                <strong>
                  {(dailyRecord?.total_hp ?? 0).toLocaleString()} HP
                </strong>
              </div>

              <div className="profile-summary-card">
                <span>今日の順位</span>
                <strong>
                  {dailyRecord
                    ? `#${dailyRecord.rank_no}`
                    : "未参加"}
                </strong>
              </div>

              <div className="profile-summary-card">
                <span>総プレイ回数</span>
                <strong>{totalPlayCount.toLocaleString()} 回</strong>
              </div>
            </section>

            <section className="profile-game-section">
              <h2>ゲーム別の累計記録</h2>

              <div className="profile-game-grid">
                {gameStats.map((stat) => {
                  const details = gameDetails[stat.game_id];

                  return (
                    <article
                      className="profile-game-card"
                      key={stat.game_id}
                    >
                      <div className="profile-game-title">
                        <span aria-hidden="true">
                          {details.icon}
                        </span>
                        <h3>{details.name}</h3>
                      </div>

                      <dl>
                        <div>
                          <dt>累計記録</dt>
                          <dd>
                            {stat.total_raw_score.toLocaleString()} {details.unit}
                          </dd>
                        </div>
                        <div>
                          <dt>獲得HP</dt>
                          <dd>{stat.total_hp.toLocaleString()} HP</dd>
                        </div>
                        <div>
                          <dt>プレイ回数</dt>
                          <dd>{stat.play_count.toLocaleString()} 回</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default ProfilePage;
