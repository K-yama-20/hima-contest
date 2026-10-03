import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getRanking } from "../services/ranking";

import type {
  RankingPeriod,
  RankingRecord,
} from "../types/ranking";

const periods: {
  value: RankingPeriod;
  label: string;
}[] = [
  { value: "day", label: "今日" },
  { value: "week", label: "今週" },
  { value: "month", label: "今月" },
  { value: "year", label: "今年" },
  { value: "all", label: "歴代" },
];

function RankingPage() {
  const [period, setPeriod] =
    useState<RankingPeriod>("day");

  const [ranking, setRanking] =
    useState<RankingRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data =
          await getRanking(period);

        setRanking(data);

      } catch (error) {
        console.error(
          "ランキング取得エラー:",
          error
        );

        setErrorMessage(
          "ランキングの取得に失敗しました。"
        );

      } finally {
        setLoading(false);
      }
    };

    loadRanking();

  }, [period]);

  return (
    <div className="app">

      <header className="header">
        <h1>暇人ランキング</h1>
        <p>
          暇であることを、証明せよ。
        </p>
      </header>

      <main className="main">

        <Link
          to="/"
          className="back-button"
        >
          ← ホームに戻る
        </Link>

        <div className="ranking-tabs">

          {periods.map((item) => (

            <button
              key={item.value}

              className={
                period === item.value
                  ? "ranking-tab active"
                  : "ranking-tab"
              }

              onClick={() =>
                setPeriod(item.value)
              }
            >
              {item.label}
            </button>

          ))}

        </div>

        <section className="ranking-page-card">

          {loading ? (

            <div className="ranking-empty">
              ランキングを読み込み中...
            </div>

          ) : errorMessage ? (

            <div className="ranking-empty">
              {errorMessage}
            </div>

          ) : ranking.length === 0 ? (

            <div className="ranking-empty">
              この期間の記録はありません。
            </div>

          ) : (

            <div className="ranking-list">

              {ranking.map((record) => {

                const medal =
                  record.rank_no === 1
                    ? "🥇"
                    : record.rank_no === 2
                      ? "🥈"
                      : record.rank_no === 3
                        ? "🥉"
                        : "";

                return (
                  <div
                    className="ranking-row ranking-page-row"
                    key={record.user_id}
                  >

                    <div className="ranking-user">

                      <span className="ranking-number">
                        {medal ||
                          `#${record.rank_no}`}
                      </span>

                      <span>
                        {record.display_name}
                      </span>

                    </div>

                    <strong>
                      {record.total_hp.toLocaleString()}{" "}
                      HP
                    </strong>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default RankingPage;
