import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotesListPage from "./pages/NotesListPage";
import NoteCreatePage from "./pages/NoteCreatePage";
import NotePage from "./pages/NotePage";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import CodeDemoPage from "./pages/CodeDemoPage";
import PrivacyPolicy from "./pages/PrivacyPage";
import LoadingScreen from "./components/LoadingScreen";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { loading } = useAuth();

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/notes" element={<NotesListPage />} />
      <Route path="/notes/create" element={<NoteCreatePage />} />
      <Route path="/notes/:id" element={<NotePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/code-demo" element={<CodeDemoPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}
