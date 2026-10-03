import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TapGamePage from "./pages/TapGamePage";
import AuthPage from "./pages/AuthPage";
import RankingPage from "./pages/RankingPage";
import HoldGamePage from "./pages/HoldGamePage";
import ScrollGamePage from "./pages/ScrollGamePage";
import CircleGamePage from "./pages/CircleGamePage";
import MarathonGamePage from "./pages/MarathonGamePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/tap" element={<TapGamePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/games/hold" element={<HoldGamePage />} />
      <Route path="/games/scroll" element={<ScrollGamePage />} />
      <Route path="/games/circle" element={<CircleGamePage />} />
      <Route path="/games/marathon" element={<MarathonGamePage />} />
    </Routes>
  );
}

export default App;
