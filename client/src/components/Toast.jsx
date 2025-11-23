// client/src/components/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-rose-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${styles[type]}`}>
      <div className="flex items-center gap-3">
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white text-xl">&times;</button>
      </div>
    </div>
  );
}