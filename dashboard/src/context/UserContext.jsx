import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/apiClient';

const UserContext = createContext(null);

const CLIENT_KEY_STORAGE = 'commandcenter_client_key';

function getOrCreateClientKey() {
  let key = localStorage.getItem(CLIENT_KEY_STORAGE);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(CLIENT_KEY_STORAGE, key);
  }
  return key;
}

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const clientKey = getOrCreateClientKey();

    api.post('/users/ensure', { clientKey })
      .then((user) => {
        setUserId(user.id);
        setIsNew(user.isNew);
        setIsReady(true);
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to backend');
      });
  }, []);

  return (
    <UserContext.Provider value={{ userId, isReady, error, isNew }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
