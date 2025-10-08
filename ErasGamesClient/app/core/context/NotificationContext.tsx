import React, {createContext, useContext, useState, ReactNode} from 'react';

interface NotificationData {
  type: 'daily_quiz' | 'test' | 'generic';
  title?: string;
  message?: string;
  quizId?: string;
  dropTime?: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  showNotification: (data: NotificationData) => void;
  hideNotification: () => void;
  notificationData: NotificationData | null;
  isNotificationVisible: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({children}: NotificationProviderProps) {
  const [notificationData, setNotificationData] =
    useState<NotificationData | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const showNotification = (data: NotificationData) => {
    setNotificationData(data);
    setIsNotificationVisible(true);
  };

  const hideNotification = () => {
    setIsNotificationVisible(false);
    // Clear data after animation completes
    setTimeout(() => {
      setNotificationData(null);
    }, 300);
  };

  const contextValue: NotificationContextType = {
    showNotification,
    hideNotification,
    notificationData,
    isNotificationVisible,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
}