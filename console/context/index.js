import { defaultPreferences } from "libs/api-storage";
import { userPreferences, updateUserPreferences } from "libs/api-storage";
import { createContext, useContext, useEffect, useState } from "react";

const InitialState = {
  ready: false,
  user: null,
  preferences: defaultPreferences, 
  setPreference: () => {},
  setUser: () => {}
}

export const UserContext = createContext(InitialState);

export const useUserContext = () => useContext(UserContext);

export const WithUserContext = ({children}) => {
  const [ inited, setInited ] = useState(false);
  const [ user, setUser ] = useState(null);
  const [ preferences, setPreferences ] = useState(defaultPreferences);

  const setPreference = (key, value) => 
    setPreferences(pref => ({...pref, [key]: value}));

  useEffect(() => {
    userPreferences()
      .then(setPreferences)
      .then(() => setInited(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if(!inited) return;
    updateUserPreferences(preferences);
  }, [inited, preferences]);

  return (
    <UserContext.Provider value={{
        ready: inited,
        preferences, 
        setPreference,
        user,
        setUser
      }}>
      {children}
    </UserContext.Provider>
  );
}