import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LoginPage } from './pages/LoginPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VideoProvider } from './context/VideoContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage onComplete={() => {}} />;
  }

  return (
    <VideoProvider>
      <RouterProvider router={router} />
    </VideoProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
