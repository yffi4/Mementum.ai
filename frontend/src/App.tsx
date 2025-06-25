import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotesListPage from "./pages/NotesListPage";
import NoteCreatePage from "./pages/NoteCreatePage";
import NotePage from "./pages/NotePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/notes" element={<NotesListPage />} />
      <Route path="/notes/create" element={<NoteCreatePage />} />
      <Route path="/notes/:id" element={<NotePage />} />
    </Routes>
  );
}
