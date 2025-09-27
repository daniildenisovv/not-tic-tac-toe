"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import WebApp from "@twa-dev/sdk";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramContextType {
  webApp: typeof WebApp | null;
  user: TelegramUser | null;
  isLoading: boolean;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isLoading: true,
  isReady: false,
});

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<typeof WebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") {
      if (typeof window === "undefined") {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Initialize Telegram Web App
      WebApp.ready();
      WebApp.expand();

      // Set theme
      WebApp.setHeaderColor("#1a1a1a");
      WebApp.setBackgroundColor("#000000");

      setWebApp(WebApp);
      setUser(WebApp.initDataUnsafe?.user || null);
      setIsReady(true);
      setIsLoading(false);

      // Enable main button if needed
      WebApp.MainButton.setText("Start Game");
      WebApp.MainButton.show();
    } catch (error) {
      console.error("Error initializing Telegram Web App:", error);
      setIsLoading(false);
    }
  }, [isMounted]);

  const value = {
    webApp,
    user,
    isLoading,
    isReady,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}
