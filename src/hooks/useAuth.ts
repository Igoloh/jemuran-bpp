import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'Admin' | 'User' | null>(null);
  const [userSection, setUserSection] = useState<'IPDS' | 'NERACA' | 'DISTRIBUSI' | 'SOSIAL' | 'PRODUKSI' | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let mounted = true;
    let inactivityTimeout: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      setLastActivity(Date.now());
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          window.location.reload();
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleActivity = () => {
      if (isAuthenticated) {
        resetInactivityTimer();
      }
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error checking auth status:', error);
          setIsAuthenticated(false);
          setUserRole(null);
          setUserSection(null);
          return;
        }
        
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
        if (session?.user.email) {
          const username = session.user.email.split('@')[0].toLowerCase();
          
          if (username === 'ppk.8104') {
            setUserRole('Admin');
            setUserSection(null);
          } else {
            setUserRole('User');
            const section = username.split('.')[0].toUpperCase();
            setUserSection(section as 'IPDS' | 'NERACA' | 'DISTRIBUSI' | 'SOSIAL' | 'PRODUKSI');
          }

          if (isAuth) {
            resetInactivityTimer();
          }
        } else {
          setUserRole(null);
          setUserSection(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setUserSection(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        if (session?.user.email) {
          const username = session.user.email.split('@')[0].toLowerCase();
          
          if (username === 'ppk.8104') {
            setUserRole('Admin');
            setUserSection(null);
          } else {
            setUserRole('User');
            const section = username.split('.')[0].toUpperCase();
            setUserSection(section as 'IPDS' | 'NERACA' | 'DISTRIBUSI' | 'SOSIAL' | 'PRODUKSI');
          }
        }
        resetInactivityTimer();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserSection(null);
        clearTimeout(inactivityTimeout);
      }
      
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(inactivityTimeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  return { isAuthenticated, isLoading, userRole, userSection };
};