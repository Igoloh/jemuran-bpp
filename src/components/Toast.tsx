import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
      <CheckCircle className="h-5 w-5 mr-2" />
      <span>{message}</span>
    </div>
  );
}

export default Toast;