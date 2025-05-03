import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'Admin' | 'User' | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) throw error;
        
        setIsAuthenticated(!!session);
        
        if (session?.user.email) {
          const username = session.user.email.split('@')[0].toLowerCase();
          setUserRole(username === 'ppk.8104' ? 'Admin' : 'User');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
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

      setIsAuthenticated(!!session);
      
      if (session?.user.email) {
        const username = session.user.email.split('@')[0].toLowerCase();
        setUserRole(username === 'ppk.8104' ? 'Admin' : 'User');
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAuthenticated, isLoading, userRole };
};