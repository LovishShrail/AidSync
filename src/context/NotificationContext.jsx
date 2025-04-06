import React, { createContext, useContext, useState } from 'react';
import Alert from '../components/common/Alert';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', timeout = 5000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (timeout) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const success = (message, timeout) => addNotification(message, 'success', timeout);
  
  const error = (message, timeout) => addNotification(message, 'error', timeout);
  
  const info = (message, timeout) => addNotification(message, 'info', timeout);
  
  const warning = (message, timeout) => addNotification(message, 'warning', timeout);

  return (
    <NotificationContext.Provider 
      value={{ notifications, addNotification, removeNotification, success, error, info, warning }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <Alert 
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}