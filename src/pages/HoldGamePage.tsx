import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { calculateEstimatedHimaPoint } from "../config/gamePoints";
import { submitGameScore } from "../services/score";

function HoldGamePage() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startHolding = () => {
    if (isHolding) return;

    setMessage("");
    setIsHolding(true);

    startTimeRef.current = Date.now() - elapsedMs;

    intervalRef.current = window.setInterval(() => {
      if (startTimeRef.current === null) return;

      setElapsedMs(
        Date.now() - startTimeRef.current
      );
    }, 50);
  };

  const stopHolding = () => {
    setIsHolding(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stopHolding();

    setElapsedMs(0);
    startTimeRef.current = null;
    setMessage("");
  };

  const saveScore = async () => {
    if (isHolding) {
      setMessage(
        "長押しを終了してから保存してください。"
      );
      return;
    }

    const seconds = Math.floor(
      elapsedMs / 1000
    );

    if (seconds <= 0) {
      setMessage(
        "まだ1秒以上長押ししていません。"
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
      await submitGameScore("hold", seconds);

      setMessage(
        `${seconds}秒の記録を保存しました！`
      );

      setElapsedMs(0);
      startTimeRef.current = null;
    } catch (error) {
      console.error("スコア保存エラー:", error);
      setMessage(
        "スコアの保存に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  const totalSeconds =
    elapsedMs / 1000;

  const displaySeconds =
    totalSeconds.toFixed(1);

  const expectedHp =
    calculateEstimatedHimaPoint("hold", Math.floor(totalSeconds));

  return (
    <div className="app">

      <header className="header">
        <h1>長押し耐久</h1>
        <p>
          ただひたすら、押し続けてください。
        </p>
      </header>

      <main className="main">

        <Link
          to="/"
          className="back-button"
        >
          ← ホームに戻る
        </Link>

        <section className="hold-game">

          <p className="tap-label">
            長押し時間
          </p>

          <p className="hold-time">
            {displaySeconds} 秒
          </p>

          <p className="tap-hp">
            獲得予定：
            {expectedHp} HP
          </p>

          <button
            className={
              isHolding
                ? "hold-button holding"
                : "hold-button"
            }
            onPointerDown={startHolding}
            onPointerUp={stopHolding}
            onPointerLeave={stopHolding}
            onPointerCancel={stopHolding}
          >
            {isHolding
              ? "そのまま押せ！"
              : "長押し"}
          </button>

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

      </main>
    </div>
  );
}

export default HoldGamePage;
