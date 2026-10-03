import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type {User} from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  getFallbackDisplayName,
  getProfile,
} from "../services/profile";
import { getDailyRanking } from "../services/ranking";
import type { RankingRecord } from "../types/ranking";

function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [ranking, setRanking] = useState<RankingRecord[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  useEffect(() => {
    const loadUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        setUser(user);
    };

    loadUser();

    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setUser(session?.user ?? null);
        }
    );
    return () => {
            subscription.unsubscribe();
        };
    }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await getProfile(user.id);

        if (active) {
          setDisplayName(
            profile?.display_name ??
              getFallbackDisplayName(user.id)
          );
        }
      } catch (error) {
        console.error(
          "プロフィールの取得に失敗しました",
          error
        );

        if (active) {
          setDisplayName(getFallbackDisplayName(user.id));
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const loadRanking = async () => {
        try {
            const data = await getDailyRanking();

            setRanking(data);
        } catch (error) {
            console.error(
                "ランキングの取得に失敗しました",
                error
            );
        } finally {
            setRankingLoading(false);
        }
    };

    loadRanking();
  }, []);

  const myRanking = user ? ranking.find(
    (record) => record.user_id === user.id
  )
  : undefined;



  return (
    <div className="app">
      <header className="header">
        <h1>暇人コンテスト</h1>
        <p>暇であることを、競技にする。</p>

        <div className="auth-status">
            {user ? (
                <>
                    <Link to="/profile">
                        {displayName || "プロフィール"}
                    </Link>
                    
                    <button 
                        onClick={async () => {
                            await supabase.auth.signOut();
                        }}
                    >
                        ログアウト
                    </button>
                </>
            ) : (
                <Link to="/login">
                    ログイン / 新規登録
                </Link>
            )}
        </div>
      </header>

      <main className="main">
        <section className="summary-card">
          <p className="label">今日の暇人ポイント</p>
          <p className="score">
            {myRanking
              ? `${myRanking.total_hp.toLocaleString()} HP`
              : "0 HP"}
          </p>
            
          <p className="rank">
            {myRanking
              ? `今日の順位：#${myRanking.rank_no}`
              : "今日の順位：未参加"}
          </p>
        </section>

        <section>
          <h2>ゲーム一覧</h2>

          <div className="game-grid">
            <Link to="/games/tap" className="game-card">
              <span className="icon">👆</span>
              <span className="game-name">無限連打</span>
              <span className="game-description">
                ひたすらボタンを押し続ける
              </span>
            </Link>

            <Link to="/games/hold" className="game-card">
              <span className="icon">⏱️</span>
              <span className="game-name">長押し耐久</span>
              <span className="game-description">
                ただひたすら押し続ける
              </span>
            </Link>

            <Link to="/games/scroll" className="game-card">
              <span className="icon">📜</span>
              <span className="game-name">無限スクロール</span>
              <span className="game-description">
                どこまでもスクロールする
              </span>
            </Link>

            <Link to="/games/circle" className="game-card">
              <span className="icon">🌀</span>
              <span className="game-name">ぐるぐる選手権</span>
              <span className="game-description">
                指でひたすら円を描く
              </span>
            </Link>

            <Link to="/games/marathon" className="game-card">
              <span className="icon">🏃</span>
              <span className="game-name">暇人マラソン</span>
              <span className="game-description">
                左右交互に押して進み続ける
              </span>
            </Link>
          </div>
        </section>

        <section className="ranking-preview">
          <div className="section-heading">
            <h2>今日のランキング</h2>
            <Link to="/ranking" className="text-button">
                もっと見る
            </Link>
          </div>

          <div className="ranking-list">
            {rankingLoading ? (
                <div className="ranking-empty">
                    ランキングを読み込み中...
                </div>
            ) : ranking.length === 0 ? (
                <div className="ranking-empty">
                    今日はまだ誰も参加していません。
                </div>
            ) : (ranking.slice(0,3).map((record) => {
                const medal = 
                record.rank_no === 1
                  ? "🥇"
                  : record.rank_no ===2
                    ? "🥈"
                    : record.rank_no === 3
                      ? "🥉"
                      : "";
                
                return (
                    <div
                      className="ranking-row"
                      key={record.user_id}
                    >
                        <span>
                           {medal} {record.display_name}
                        </span>

                        <strong>
                            {record.total_hp.toLocaleString()} HP
                        </strong>
                    </div>
                );
            }))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
