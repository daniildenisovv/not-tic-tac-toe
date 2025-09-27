"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramContextType {
  webApp: any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  const [webApp, setWebApp] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
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

    const initWebApp = async () => {
      try {
        // Dynamic import of WebApp
        const { default: WebApp } = await import("@twa-dev/sdk");

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
      } catch (error) {
        console.error("Error initializing Telegram Web App:", error);
        setIsLoading(false);
      }
    };

    initWebApp();
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
