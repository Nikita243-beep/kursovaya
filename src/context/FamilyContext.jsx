import { createContext, useContext, useEffect, useState } from 'react';
import { FAMILY_MEMBERS_KEY } from '../constants/storage';

const FamilyContext = createContext(null);

export function FamilyProvider({ children }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAMILY_MEMBERS_KEY);
      setMembers(saved ? JSON.parse(saved) : []);
    } catch {
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(members));
  }, [members]);

  const addMember = (name) => {
    setMembers((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
  };

  const removeMember = (name) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  return (
    <FamilyContext.Provider value={{ members, addMember, removeMember }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return ctx;
}

