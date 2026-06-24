import { ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Dumbbell, 
  Home, 
  LogOut, 
  Menu, 
  Settings, 
  X,
  LineChart,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { cn } from '../../lib/utils';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { AnimatePresence, motion } from 'framer-motion';


interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Journal', path: '/' },
    { icon: Dumbbell, label: 'Workouts', path: '/workouts' },
    { icon: Activity, label: 'Exercises', path: '/exercises' },
    { icon: ClipboardList, label: 'Programs', path: '/programs' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: LineChart, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-serif font-semibold text-xl tracking-wide">GymTracker</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 border-b-2 border-primary"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-muted/50 py-1 px-2 rounded-full transition-colors outline-none">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border-border/50 shadow-2xl">
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-sm font-medium font-serif">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeSwitcher />
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2 rounded-md text-foreground hover:bg-muted/50"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card border-l border-border/50 shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="font-serif font-semibold text-xl">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-medium text-base",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-3 px-2 mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium font-serif truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-4xl px-4 py-8 md:py-12">
          {/* Framer Motion page transitions can wrap children here later */}
          {children}
        </div>
      </main>
    </div>
  );
}
