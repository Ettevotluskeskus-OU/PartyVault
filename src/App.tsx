import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import PhotoCapture from './components/PhotoCapture';
import HomePage from './components/HomePage';
import BottomNav from './components/BottomNav';
import MediaGallery from './components/MediaGallery';
import Slideshow from './components/Slideshow';
import Moods from './components/Moods';

// Create a new component for the routes
function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handlePhotoTaken = (photo: string) => {
    console.log('Photo taken:', photo);
  };

  const handleLogin = async (partyName: string, password: string) => {
    console.log('Login attempt:', partyName, password);
    setIsAuthenticated(true);
  };

  // Protected Route wrapper with BottomNav
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return (
      <>
        <div className="pb-16">
          {children}
        </div>
        <BottomNav />
      </>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomePage onPhotoTaken={handlePhotoTaken} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/capture" 
        element={
          <ProtectedRoute>
            <PhotoCapture onPhotoTaken={handlePhotoTaken} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/video" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
              <h1 className="text-2xl font-bold text-white">Video Collage</h1>
              {/* Add your video collage component here */}
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              {/* Add your profile component here */}
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/slideshow" 
        element={
          <ProtectedRoute>
            <Slideshow />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/moods" 
        element={
          <ProtectedRoute>
            <Moods />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;