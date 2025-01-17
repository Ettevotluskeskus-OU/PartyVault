import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const logout = () => {
    // Clear any auth tokens/state
    localStorage.removeItem('isAuthenticated');
    // Redirect to login
    navigate('/login');
  };

  return { logout };
} 