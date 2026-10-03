import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { calculateEstimatedHimaPoint } from "../config/gamePoints";
import { submitGameScore } from "../services/score";

const TWO_PI = Math.PI * 2;

function CircleGamePage() {
  const [rotationCount, setRotationCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const circleRef = useRef<HTMLDivElement | null>(null);

  const previousAngleRef = useRef<number | null>(null);

  const accumulatedAngleRef = useRef(0);

  const getPointerData = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (!circleRef.current) {
      return null;
    }

    const rect =
      circleRef.current.getBoundingClientRect();

    const centerX =
      rect.left + rect.width / 2;

    const centerY =
      rect.top + rect.height / 2;

    const x =
      event.clientX - centerX;

    const y =
      event.clientY - centerY;

    const radius =
      Math.sqrt(x * x + y * y);

    const angle =
      Math.atan2(y, x);

    return {
      radius,
      angle,
    };
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const pointerData =
      getPointerData(event);

    if (!pointerData) {
      return;
    }

    /*
      円の中心付近は角度が不安定になるので、
      ある程度外側だけを有効範囲にする
    */
    if (
      pointerData.radius < 60 ||
      pointerData.radius > 170
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    previousAngleRef.current =
      pointerData.angle;

    setIsDrawing(true);
    setMessage("");
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (!isDrawing) {
      return;
    }

    const pointerData =
      getPointerData(event);

    if (!pointerData) {
      return;
    }

    /*
      有効な円周付近から大きく外れた場合は
      カウントしない
    */
    if (
      pointerData.radius < 50 ||
      pointerData.radius > 180
    ) {
      previousAngleRef.current =
        pointerData.angle;

      return;
    }

    if (
      previousAngleRef.current === null
    ) {
      previousAngleRef.current =
        pointerData.angle;

      return;
    }

    let angleDifference =
      pointerData.angle -
      previousAngleRef.current;

    /*
      atan2では
      +π → -π
      の境界で角度が飛ぶため補正する
    */
    if (angleDifference > Math.PI) {
      angleDifference -= TWO_PI;
    }

    if (angleDifference < -Math.PI) {
      angleDifference += TWO_PI;
    }

    /*
      時計回りでも反時計回りでも
      移動量として加算する
    */
    accumulatedAngleRef.current +=
      Math.abs(angleDifference);

    /*
      2π rad = 1周
    */
    if (
      accumulatedAngleRef.current >=
      TWO_PI
    ) {
      const completedRotations =
        Math.floor(
          accumulatedAngleRef.current /
            TWO_PI
        );

      setRotationCount(
        (prev) =>
          prev + completedRotations
      );

      accumulatedAngleRef.current =
        accumulatedAngleRef.current %
        TWO_PI;
    }

    previousAngleRef.current =
      pointerData.angle;
  };

  const stopDrawing = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    setIsDrawing(false);

    previousAngleRef.current = null;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  };

  const reset = () => {
    setRotationCount(0);

    accumulatedAngleRef.current = 0;
    previousAngleRef.current = null;

    setIsDrawing(false);
    setMessage("");
  };

  const saveScore = async () => {
    if (rotationCount <= 0) {
      setMessage(
        "まだ1周もしていません。"
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
      await submitGameScore("circle", rotationCount);

      setMessage(
        `${rotationCount.toLocaleString()}周の記録を保存しました！`
      );

      setRotationCount(0);

      accumulatedAngleRef.current = 0;
      previousAngleRef.current = null;
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
    calculateEstimatedHimaPoint("circle", rotationCount);

  return (
    <div className="app">

      <header className="header">
        <h1>ぐるぐる選手権</h1>

        <p>
          円の周りをひたすらぐるぐるしてください。
        </p>
      </header>

      <main className="main">

        <Link
          to="/"
          className="back-button"
        >
          ← ホームに戻る
        </Link>

        <section className="circle-game">

          <p className="tap-label">
            現在の周回数
          </p>

          <p className="circle-count">
            {rotationCount.toLocaleString()}
            <span> 周</span>
          </p>

          <p className="tap-hp">
            獲得予定：
            {expectedHp} HP
          </p>

          <div
            ref={circleRef}
            className={
              isDrawing
                ? "circle-area drawing"
                : "circle-area"
            }
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              stopDrawing
            }
            onPointerCancel={
              stopDrawing
            }
          >

            <div className="circle-center">
              <span>
                {isDrawing
                  ? "ぐるぐる！"
                  : "ここを回す"}
              </span>
            </div>

          </div>

          <p className="circle-guide">
            円周付近を押したまま回してください
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

      </main>

    </div>
  );
}

export default CircleGamePage;
