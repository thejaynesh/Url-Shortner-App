import * as React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Container from './components/Container/Container';

interface IAppProps {
}

const App: React.FunctionComponent<IAppProps> = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header />
      <main className="flex-grow">
        <Container />
      </main>
      <Footer />
    </div>
  );
};

export default App;
