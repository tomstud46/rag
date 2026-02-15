import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminPanel } from './components/AdminPanel';
import { ChatWidget } from './components/ChatWidget';
import { AuthPage } from './components/AuthPage';
import { AccountPage } from './components/AccountPage';
import { NotificationPage } from './components/NotificationPage';
import { User, ChatSession } from './types';
import { apiService } from './services/apiService';
import { GoogleOAuthProvider } from '@react-oauth/google';

export type PageType = 'chat' | 'knowledge' | 'account' | 'notifications';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('chat');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize current user & sessions
  useEffect(() => {
    const initApp = async () => {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const savedSessions = localStorage.getItem(`chat_sessions_${currentUser.id}`);
        if (savedSessions) setSessions(JSON.parse(savedSessions));
      }
      setIsAuthLoading(false);
    };
    initApp();
  }, []);

  // Handle login from AuthPage
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    const savedSessions = localStorage.getItem(`chat_sessions_${newUser.id}`);
    setSessions(savedSessions ? JSON.parse(savedSessions) : []);
  };

  // Update user profile
  const handleUpdateUser = (updatedUser: User) => setUser(updatedUser);

  // Logout
  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setCurrentPage('chat');
    setSessions([]);
  };

  // Save chat sessions
  const saveSessions = (updatedSessions: ChatSession[]) => {
    if (!user) return;
    setSessions(updatedSessions);
    localStorage.setItem(`chat_sessions_${user.id}`, JSON.stringify(updatedSessions));
  };

  // -------------------------
  // PageWrapper Component
  // -------------------------
  interface PageWrapperProps {
    active: boolean;
    children: React.ReactNode;
  }

  const PageWrapper: React.FC<PageWrapperProps> = ({ active, children }) => (
    <div
      className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
        active
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-10'
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none z-0'
      }`}
    >
      {children}
    </div>
  );

  // -------------------------
  // Render loading screen
  // -------------------------
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-[#4ade80] uppercase tracking-[0.5em] animate-pulse">
            Initializing System
          </p>
        </div>
      </div>
    );
  }

  // -------------------------
  // Show AuthPage if no user
  // -------------------------
  if (!user)
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthPage onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );

  // -------------------------
  // Main App Render
  // -------------------------
  return (
    <div className="min-h-screen bg-[#0a0c10] overflow-hidden flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-1 relative h-[calc(100vh-80px)] mt-20 overflow-hidden">
        <PageWrapper active={currentPage === 'chat'}>
          <ChatWidget
            user={user}
            sessions={sessions}
            onSessionsChange={saveSessions}
            onLogout={handleLogout}
          />
        </PageWrapper>

        <PageWrapper active={currentPage === 'knowledge'}>
          <div className="h-full overflow-y-auto custom-scrollbar p-10">
            <AdminPanel />
          </div>
        </PageWrapper>

        <PageWrapper active={currentPage === 'account'}>
          <div className="h-full overflow-y-auto custom-scrollbar p-10">
            <AccountPage
              user={user}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
            />
          </div>
        </PageWrapper>

        <PageWrapper active={currentPage === 'notifications'}>
          <div className="h-full overflow-y-auto custom-scrollbar p-10">
            <NotificationPage />
          </div>
        </PageWrapper>
      </main>
    </div>
  );
};

export default App;
