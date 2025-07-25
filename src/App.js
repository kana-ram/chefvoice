import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import SavedPage from './pages/SavedRecipesPage';
import RecipePage from './pages/RecipeDetailPage';
import VoicePage from './pages/VoiceAssistantPage';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';

import './App.css';

function AppLayout() {
  const location = useLocation();
  
  // ✅ FIXED: Hide navbar on /auth and /error
  const hideNavbar = location.pathname === '/auth' || location.pathname === '/error';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<SavedPage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/voice/:id" element={<VoicePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
