import { createContext, useContext, useState, useEffect } from 'react';
import { getBabies, getAuthToken } from '../api';

const BabyContext = createContext();

export const useBabyContext = () => {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error('useBabyContext must be used within BabyProvider');
  }
  return context;
};

export const BabyProvider = ({ children }) => {
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for logout event to clear baby data
  useEffect(() => {
    const handleLogout = () => {
      setBabies([]);
      setSelectedBaby(null);
      localStorage.removeItem('selectedBabyId');
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  // Listen for login event to refetch babies
  useEffect(() => {
    const handleLogin = async () => {
      // Small delay to ensure auth token is set
      setTimeout(async () => {
        const token = getAuthToken();
        if (token) {
          try {
            const babiesData = await getBabies().catch((error) => {
              console.error('Error fetching babies after login:', error);
              return [];
            });
            
            if (babiesData && babiesData.length > 0) {
              setBabies(babiesData);
              
              // Select first active or first baby
              const activeBaby = babiesData.find(b => b.is_active) || babiesData[0];
              setSelectedBaby(activeBaby);
              if (activeBaby) {
                localStorage.setItem('selectedBabyId', activeBaby.id);
              }
            } else {
              setBabies([]);
              setSelectedBaby(null);
              localStorage.removeItem('selectedBabyId');
            }
          } catch (error) {
            console.error('Error in login handler:', error);
          }
        }
      }, 100);
    };

    window.addEventListener('login', handleLogin);
    return () => window.removeEventListener('login', handleLogin);
  }, []);

  // Fetch babies whenever auth token changes
  useEffect(() => {
    let isMounted = true;

    const fetchBabies = async () => {
      try {
        const token = getAuthToken();
        if (token && isMounted) {
          setLoading(true);
          const babiesData = await getBabies().catch((error) => {
            console.error('Error fetching babies:', error);
            return [];
          });
          
          if (!isMounted) return;
          
          if (babiesData && babiesData.length > 0) {
            setBabies(babiesData);
            
            // Get selected baby from localStorage
            const savedBabyId = localStorage.getItem('selectedBabyId');
            
            // Check if the saved baby ID actually belongs to this user
            const savedBaby = savedBabyId ? babiesData.find(b => b.id === parseInt(savedBabyId)) : null;
            
            if (savedBaby) {
              setSelectedBaby(savedBaby);
            } else {
              // If saved baby doesn't exist in current user's babies, select first one
              const activeBaby = babiesData.find(b => b.is_active) || babiesData[0];
              setSelectedBaby(activeBaby);
              if (activeBaby) {
                localStorage.setItem('selectedBabyId', activeBaby.id);
              } else {
                localStorage.removeItem('selectedBabyId');
              }
            }
          } else {
            // No babies found - clear selected baby
            setBabies([]);
            setSelectedBaby(null);
            localStorage.removeItem('selectedBabyId');
          }
          setLoading(false);
        } else if (!token && isMounted) {
          // No token - clear babies
          setBabies([]);
          setSelectedBaby(null);
          localStorage.removeItem('selectedBabyId');
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching babies:', error);
          setBabies([]);
          setSelectedBaby(null);
          localStorage.removeItem('selectedBabyId');
          setLoading(false);
        }
      }
    };

    // Check token immediately and listen for storage changes
    const token = getAuthToken();
    if (token) {
      // Small delay to ensure API is ready after login
      const timer = setTimeout(fetchBabies, 500);
      
      // Listen for storage changes (e.g., logout in another tab)
      const handleStorageChange = (e) => {
        if (e.key === 'auth_token') {
          if (!e.newValue) {
            // Auth token was removed - clear baby data
            if (isMounted) {
              setBabies([]);
              setSelectedBaby(null);
              localStorage.removeItem('selectedBabyId');
            }
          } else {
            // Auth token changed (new user logged in) - refetch babies
            if (isMounted) {
              fetchBabies();
            }
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
        window.removeEventListener('storage', handleStorageChange);
      };
    } else {
      // No token, clear state
      setBabies([]);
      setSelectedBaby(null);
      localStorage.removeItem('selectedBabyId');
      setLoading(false);
    }
  }, []);

  const handleSelectBaby = (baby) => {
    setSelectedBaby(baby);
    localStorage.setItem('selectedBabyId', baby.id);
  };

  const refreshBabies = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        setLoading(true);
        const babiesData = await getBabies().catch(() => []);
        if (babiesData && babiesData.length > 0) {
          setBabies(babiesData);
          const savedBabyId = localStorage.getItem('selectedBabyId');
          
          // Check if saved baby ID actually belongs to this user
          const savedBaby = savedBabyId ? babiesData.find(b => b.id === parseInt(savedBabyId)) : null;
          
          if (savedBaby) {
            setSelectedBaby(savedBaby);
          } else {
            // If saved baby doesn't exist in current user's babies, select first one
            const activeBaby = babiesData.find(b => b.is_active) || babiesData[0];
            setSelectedBaby(activeBaby);
            if (activeBaby) {
              localStorage.setItem('selectedBabyId', activeBaby.id);
            } else {
              localStorage.removeItem('selectedBabyId');
            }
          }
        } else {
          // No babies found - clear selected baby
          setBabies([]);
          setSelectedBaby(null);
          localStorage.removeItem('selectedBabyId');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing babies:', error);
      setLoading(false);
    }
  };

  const value = {
    babies,
    selectedBaby,
    setSelectedBaby: handleSelectBaby,
    loading,
    setBabies,
    refreshBabies
  };

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
};

export default BabyContext;
