import * as React from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LandingView from './components/Landing/LandingView';
import DashboardView from './components/Dashboard/DashboardView';
import AuthModal from './components/AuthModal/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white antialiased">
      <Navbar />
      <main className="flex-grow">
        {isAuthenticated ? <DashboardView /> : <LandingView />}
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
