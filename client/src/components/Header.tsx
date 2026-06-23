import { useState } from 'react';
import { Moon, Sun, LogOut, Zap, ShieldCheck, User, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AdminLogin from '@/pages/AdminLogin';
import { toast } from 'sonner';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { admin, isAdmin, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out of admin mode.');
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLoginTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b ${className}`}
        style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 80, 140, 0.4)',
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">BOM Class Hub</h1>
              <p className="text-xs text-muted-foreground">{getCurrentDate()}</p>
            </div>
          </div>

          {/* Centre credit */}
          <div className="hidden md:flex items-center text-xs text-muted-foreground">
            <span>Developed by</span>
            <span className="ml-1 font-semibold text-primary">Pranav</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Admin session badge */}
            {isAdmin && admin && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full pulse-badge"
                style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.4)',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">{admin.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatLoginTime(admin.loginTime)}
                </span>
              </div>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="glow-border"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </Button>

            {/* Admin button */}
            {isAdmin ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2"
                style={{ borderColor: 'rgba(220, 50, 50, 0.5)', color: 'rgb(220, 100, 100)' }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                onClick={() => setShowLogin(true)}
                className="neon-button gap-2"
              >
                <User className="w-4 h-4" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Login portal overlay */}
      {showLogin && <AdminLogin onClose={() => setShowLogin(false)} />}
    </>
  );
}
