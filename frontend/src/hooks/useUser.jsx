import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import logger from '../utils/logger';

const UserContext = createContext(null);

const USER_STORAGE_KEY = 'ecoguide_anon_id';
const USER_REG_KEY = 'ecoguide_anon_registered';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let id = localStorage.getItem(USER_STORAGE_KEY);
    const registered = localStorage.getItem(USER_REG_KEY) === 'true';
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_STORAGE_KEY, id);
      localStorage.setItem(USER_REG_KEY, 'false');
    }
    setUser({ id, name: 'Anonymous', isRegistered: registered });
    setLoading(false);
  }, []);

  const registerUser = async (customId) => {
    const userIdToUse = customId || user?.id;
    if (!userIdToUse) return null;

    try {
      const backendUser = await userService.createOrFind({
        name: 'Anonymous',
        email: `${userIdToUse}@ecoguide.ai`,
      });

      localStorage.setItem(USER_STORAGE_KEY, backendUser.id);
      localStorage.setItem(USER_REG_KEY, 'true');

      const updatedUser = {
        id: backendUser.id,
        name: backendUser.name,
        isRegistered: true,
      };
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      logger.error('Failed to register anonymous user on backend:', err);
      throw err;
    }
  };

  const resetUser = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(USER_STORAGE_KEY, newId);
    localStorage.setItem(USER_REG_KEY, 'false');
    const newUser = { id: newId, name: 'Anonymous', isRegistered: false };
    setUser(newUser);
    return newUser;
  };

  return (
    <UserContext.Provider value={{ user, loading, registerUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
