import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { calculateEstimatedHimaPoint } from "../config/gamePoints";
import { submitGameScore } from "../services/score";

function ScrollGamePage() {
  const [distance, setDistance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      const diff = Math.abs(
        currentScrollY - lastScrollYRef.current
      );

      setDistance((prev) => prev + diff);

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const reset = () => {
    setDistance(0);
    setMessage("");
    lastScrollYRef.current = window.scrollY;
  };

  const saveScore = async () => {
    const rawScore = Math.floor(distance);

    if (rawScore <= 0) {
      setMessage(
        "まだスクロールしていません。"
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "スコアを保存するにはログインしてください。"
      );
      setSaving(false);
      return;
    }

    try {
      await submitGameScore("scroll", rawScore);

      setMessage(
        `${rawScore.toLocaleString()} px の記録を保存しました！`
      );

      setDistance(0);
      lastScrollYRef.current = window.scrollY;
    } catch (error) {
      console.error("スコア保存エラー:", error);
      setMessage(
        "スコアの保存に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  const expectedHp =
    calculateEstimatedHimaPoint("scroll", Math.floor(distance));

  return (
    <div className="app">

      <header className="header">
        <h1>無限スクロール</h1>
        <p>
          ひたすら上下にスクロールしてください。
        </p>
      </header>

      <main className="main scroll-game-main">

        <Link
          to="/"
          className="back-button"
        >
          ← ホームに戻る
        </Link>

        <section className="scroll-status-card">

          <p className="tap-label">
            総スクロール距離
          </p>

          <p className="scroll-distance">
            {Math.floor(
              distance
            ).toLocaleString()} px
          </p>

          <p className="tap-hp">
            獲得予定：
            {expectedHp} HP
          </p>

          <button
            className="save-button"
            onClick={saveScore}
            disabled={saving}
          >
            {saving
              ? "保存中..."
              : "記録を保存"}
          </button>

          <button
            className="reset-button"
            onClick={reset}
          >
            リセット
          </button>

          {message && (
            <p className="save-message">
              {message}
            </p>
          )}

        </section>

        <section className="scroll-track">

          {Array.from({
            length: 30,
          }).map((_, index) => (
            <div
              className="scroll-marker"
              key={index}
            >
              <span>
                {index + 1}
              </span>

              <p>
                まだ暇ですね。
              </p>
            </div>
          ))}

        </section>

      </main>

    </div>
  );
}

export default ScrollGamePage;
