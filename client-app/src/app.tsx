import * as React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Container from './components/Container/Container';
import AuthModal from './components/AuthModal/AuthModal';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
        <Header />
        <main className="flex-grow">
          <Container />
        </main>
        <Footer />
        <AuthModal />
      </div>
    </AuthProvider>
  );
};

export default App;
