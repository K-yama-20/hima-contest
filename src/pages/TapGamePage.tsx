import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { calculateEstimatedHimaPoint } from "../config/gamePoints";
import { submitGameScore } from "../services/score";

function TapGamePage() {
  const [tapCount, setTapCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const saveScore = async () => {
    setSaving(true);
    setMessage("");

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        setMessage("スコアを保存するにはログインしてください。");
        setSaving(false);
        return;
    }

    if (tapCount === 0) {
        setMessage("まだ1回もタップしていません。");
        setSaving(false);
        return;
    }

    try {
        await submitGameScore("tap", tapCount);

        setMessage(
            `${tapCount.toLocaleString()}タップを保存しました！`
        );

        setTapCount(0);
    } catch (error) {
        console.error("スコア保存エラー:", error);
        setMessage("スコアの保存に失敗しました。");
    } finally {
        setSaving(false);
    }
    };

  return (
    <div className="app">
      <header className="header">
        <h1>無限連打</h1>
        <p>時間の許す限り、ひたすら押してください。</p>
      </header>

      <main className="main">
        <Link to="/" className="back-button">
          ← ホームに戻る
        </Link>

        <section className="tap-game">
          <p className="tap-label">現在のタップ数</p>

          <p className="tap-count">
            {tapCount.toLocaleString()}
          </p>

          <p className="tap-hp">
            獲得予定：
            {calculateEstimatedHimaPoint("tap", tapCount)} HP
          </p>

          <button
            className="tap-button"
            onClick={() => setTapCount((prev) => prev + 1)}
          >
            TAP
          </button>

          <button
            className="save-button"
            onClick={saveScore}
            disabled={saving}
          >
            {saving ? "保存中..." : "記録を保存"}
          </button>

          <button
            className="reset-button"
            onClick={() => setTapCount(0)}
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

export default TapGamePage;
