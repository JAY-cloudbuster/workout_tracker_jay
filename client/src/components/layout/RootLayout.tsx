import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Dumbbell, 
  Home, 
  LogOut, 
  Menu, 
  Settings, 
  User, 
  X,
  LineChart,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { cn } from '../../lib/utils';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Dumbbell, label: 'Workouts', path: '/workouts' },
    { icon: ClipboardList, label: 'Programs', path: '/programs' },
    { icon: Activity, label: 'Exercises', path: '/exercises' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: LineChart, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border glass sticky top-0 z-30">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Dumbbell className="h-6 w-6" />
          <span>GymTracker</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-muted"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl md:text-2xl">
            <Dumbbell className="h-6 w-6 md:h-8 md:w-8" />
            <span>GymTracker</span>
          </div>
          <button 
            className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.username}</p>
            </div>
          </div>
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors mb-1"
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
