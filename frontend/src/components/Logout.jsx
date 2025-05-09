import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../utils/tokenStorage';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = () => {
      console.log("Logging out...");
      
      // Clear all tokens from both localStorage and cookies
      clearTokens();
      console.log("All tokens cleared");
      
      // Redirect to login page (not /logout which would cause a circular redirect)
      navigate('/login');
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">Logging out...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Logout; 