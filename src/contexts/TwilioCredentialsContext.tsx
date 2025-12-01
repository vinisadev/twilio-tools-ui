'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  isValid: boolean;
  accountInfo?: {
    friendlyName: string;
    status: string;
    type: string;
  };
}

interface TwilioCredentialsContextType {
  credentials: TwilioCredentials | null;
  setCredentials: (credentials: TwilioCredentials | null) => void;
  clearCredentials: () => void;
  isCredentialsValid: boolean;
}

const TwilioCredentialsContext = createContext<TwilioCredentialsContextType | undefined>(undefined);

export function TwilioCredentialsProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentialsState] = useState<TwilioCredentials | null>(null);

  // Load credentials from localStorage on mount
  useEffect(() => {
    const storedCredentials = localStorage.getItem('twilio_credentials');
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials);
        setCredentialsState(parsed);
      } catch (error) {
        console.error('Error parsing stored credentials:', error);
        localStorage.removeItem('twilio_credentials');
      }
    }
  }, []);

  const setCredentials = (newCredentials: TwilioCredentials | null) => {
    setCredentialsState(newCredentials);
    if (newCredentials) {
      localStorage.setItem('twilio_credentials', JSON.stringify(newCredentials));
    } else {
      localStorage.removeItem('twilio_credentials');
    }
  };

  const clearCredentials = () => {
    setCredentialsState(null);
    localStorage.removeItem('twilio_credentials');
  };

  const isCredentialsValid = credentials?.isValid === true;

  return (
    <TwilioCredentialsContext.Provider
      value={{
        credentials,
        setCredentials,
        clearCredentials,
        isCredentialsValid,
      }}
    >
      {children}
    </TwilioCredentialsContext.Provider>
  );
}

export function useTwilioCredentials() {
  const context = useContext(TwilioCredentialsContext);
  if (context === undefined) {
    throw new Error('useTwilioCredentials must be used within a TwilioCredentialsProvider');
  }
  return context;
}