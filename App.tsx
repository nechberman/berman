
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { api } from './services/api';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Rooms from './pages/Rooms';
import People from './pages/People';
import Tasks from './pages/Tasks';
import Admin from './pages/Admin';
import BusAttendance from './pages/BusAttendance';
import Places from './pages/Places';

// Context for simple Auth
export const AuthContext = React.createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
}>({ user: null, setUser: () => {} });

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, setUser } = React.useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { path: '/schedule', label: 'לו״ז', icon: '📅' },
    { path: '/rooms', label: 'חדרים', icon: '🛏️' },
    { path: '/people', label: 'צוות/תלמידים', icon: '👥' },
    { path: '/places', label: 'מקומות', icon: '📍' },
    { path: '/attendance', label: 'נוכחות', icon: '📝' },
    { path: '/tasks', label: 'משימות', icon: '✅' },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ path: '/admin', label: 'ניהול', icon: '⚙️' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-rubik">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://shtilim.org/wp-content/uploads/2023/01/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%9C%D7%90-%D7%A8%D7%A7%D7%A2-%D7%A9%D7%91%D7%99%D7%9C%D7%99-%D7%94%D7%AA%D7%95%D7%A8%D7%94-1536x606.png" 
                alt="Logo" 
                className="h-10 w-auto bg-white rounded-md p-1"
              />
              <div className="text-lg font-bold tracking-tight text-white hidden xs:block">מחנה חורף תשפ"ו</div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2 space-x-reverse">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        isActive ? 'bg-white/15 text-white shadow-sm' : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
                <button onClick={handleLogout} className="text-red-200 hover:text-white hover:bg-red-900/30 px-3 py-2 rounded-lg text-sm font-medium transition mr-2">
                  יציאה
                </button>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white/10 inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-white/20 focus:outline-none"
              >
                <span className="sr-only">פתח תפריט</span>
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-indigo-900 border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3 ${
                    location.pathname === item.path ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="block w-full text-right px-3 py-3 rounded-md text-base font-medium text-red-300 hover:text-white hover:bg-red-900/50 mt-4 flex items-center gap-3"
              >
                <span className="text-xl">🚪</span>
                יציאה
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children, roleRequired }: { children?: React.ReactNode, roleRequired?: UserRole }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) return <div className="p-8 text-center text-red-600">אין לך הרשאות לצפות בדף זה.</div>;
  return <Layout>{children}</Layout>;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to={user ? "/schedule" : "/login"} />} />
          
          <Route path="/schedule" element={
            <ProtectedRoute><Schedule /></ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute><Rooms /></ProtectedRoute>
          } />
          <Route path="/people" element={
            <ProtectedRoute><People /></ProtectedRoute>
          } />
           <Route path="/places" element={
            <ProtectedRoute><Places /></ProtectedRoute>
          } />
          <Route path="/attendance" element={
             <ProtectedRoute><BusAttendance /></ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute><Tasks /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roleRequired={UserRole.ADMIN}><Admin /></ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
