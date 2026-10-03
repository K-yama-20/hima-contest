import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { calculateEstimatedHimaPoint } from "../config/gamePoints";
import { submitGameScore } from "../services/score";

type NextFoot = "left" | "right";

function MarathonGamePage() {
  const [steps, setSteps] = useState(0);
  const [nextFoot, setNextFoot] =
    useState<NextFoot>("left");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const pressFoot = (foot: NextFoot) => {
    if (foot !== nextFoot) {
      setMessage(
        `${nextFoot === "left" ? "左" : "右"}を押してください。`
      );
      return;
    }

    setMessage("");

    setSteps((prev) => prev + 1);

    setNextFoot(
      foot === "left"
        ? "right"
        : "left"
    );
  };

  const reset = () => {
    setSteps(0);
    setNextFoot("left");
    setMessage("");
  };

  const saveScore = async () => {
    if (steps <= 0) {
      setMessage(
        "まだ1歩も進んでいません。"
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
      await submitGameScore("marathon", steps);

      setMessage(
        `${steps.toLocaleString()}歩の記録を保存しました！`
      );

      setSteps(0);
      setNextFoot("left");
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
    calculateEstimatedHimaPoint("marathon", steps);

  const distanceMeters =
    steps * 0.7;

  return (
    <div className="app">
      <header className="header">
        <h1>暇人マラソン</h1>

        <p>
          左右交互に押して、ひたすら進んでください。
        </p>
      </header>

      <main className="main">

        <Link
          to="/"
          className="back-button"
        >
          ← ホームに戻る
        </Link>

        <section className="marathon-game">

          <p className="tap-label">
            現在の歩数
          </p>

          <p className="marathon-steps">
            {steps.toLocaleString()}
            <span> 歩</span>
          </p>

          <p className="marathon-distance">
            約 {distanceMeters.toFixed(1)} m
          </p>

          <p className="tap-hp">
            獲得予定：
            {expectedHp} HP
          </p>

          <div className="marathon-runner">
            🏃
          </div>

          <p className="marathon-next">
            次は
            <strong>
              {nextFoot === "left"
                ? " 左 "
                : " 右 "}
            </strong>
            を押してください
          </p>

          <div className="marathon-buttons">

            <button
              className={
                nextFoot === "left"
                  ? "foot-button active"
                  : "foot-button"
              }
              onClick={() =>
                pressFoot("left")
              }
            >
              👟 LEFT
            </button>

            <button
              className={
                nextFoot === "right"
                  ? "foot-button active"
                  : "foot-button"
              }
              onClick={() =>
                pressFoot("right")
              }
            >
              RIGHT 👟
            </button>

          </div>

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

export default MarathonGamePage;
