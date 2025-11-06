import { createContext, useState, useEffect, useContext } from "react";
import { getAuthUser, clearAuthData, getUserProfile } from "@/lib/auth";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authUser = getAuthUser();
        if (authUser) {
          setUser(authUser);
          const userProfile = await getUserProfile(authUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    clearAuthData();
    setUser(null);
    setProfile(null);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    setProfile(newUser);
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
