
import React, { useState, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewTradePage from './pages/NewTradePage';
import TradeHistoryPage from './pages/TradeHistoryPage';
import TradeDetailPage from './pages/TradeDetailPage';
import ProfilePage from './pages/ProfilePage';
import RealTimeFlowPage from './pages/RealTimeFlowPage';
import AdminPage from './pages/AdminPage';
import PsychologistPage from './pages/PsychologistPage';
import SettingsPage from './pages/SettingsPage'; // Nova página
import Sidebar from './components/Sidebar';
import Header from './components/Header';

interface User {
  username: string;
  role: 'admin' | 'user';
}

export const DataContext = createContext<{
  excelData: any[];
  setExcelData: (data: any[]) => void;
}>({
  excelData: [],
  setExcelData: () => { },
});

const Layout: React.FC<{ children: React.ReactNode, user: User }> = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background-dark text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fluxo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [excelData, setExcelData] = useState<any[]>([]);

  const handleLogin = (username: string) => {
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';
    const newUser: User = { username, role };
    setUser(newUser);
    localStorage.setItem('fluxo_user', JSON.stringify(newUser));
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DataContext.Provider value={{ excelData, setExcelData }}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout user={user}><DashboardPage /></Layout>} />
          <Route path="/flow" element={<Layout user={user}><RealTimeFlowPage /></Layout>} />
          <Route path="/journal" element={<Layout user={user}><TradeHistoryPage /></Layout>} />
          <Route path="/new-trade" element={<Layout user={user}><NewTradePage /></Layout>} />
          <Route path="/trade/:id" element={<Layout user={user}><TradeDetailPage /></Layout>} />
          <Route path="/profile" element={<Layout user={user}><ProfilePage /></Layout>} />
          <Route path="/psychologist" element={<Layout user={user}><PsychologistPage /></Layout>} />
          <Route path="/settings" element={<Layout user={user}><SettingsPage /></Layout>} />
          <Route
            path="/admin"
            element={
              user.role === 'admin'
                ? <Layout user={user}><AdminPage /></Layout>
                : <Navigate to="/" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </DataContext.Provider>
  );
};

export default App;
