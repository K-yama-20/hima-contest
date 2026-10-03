import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage(
        "登録しました。確認メールが届いた場合は、メール内のリンクを開いてください。"
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const requestedPath = (
        location.state as { from?: unknown } | null
      )?.from;

      navigate(
        requestedPath === "/profile" ? "/profile" : "/",
        { replace: true }
      );
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>暇人コンテスト</h1>
        <p>
          {mode === "login"
            ? "ログイン"
            : "暇人コンテストに参加する"}
        </p>
      </header>

      <main className="main">
        <section className="auth-card">
          <div className="auth-tabs">
            <button
              className={
                mode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              ログイン
            </button>

            <button
              className={
                mode === "signup"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              新規登録
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              メールアドレス
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="example@example.com"
                required
              />
            </label>

            <label>
              パスワード
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="パスワード"
                required
                minLength={6}
              />
            </label>

            <button
              className="auth-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "処理中..."
                : mode === "login"
                  ? "ログイン"
                  : "アカウント作成"}
            </button>
          </form>

          {message && (
            <p className="auth-message">{message}</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
