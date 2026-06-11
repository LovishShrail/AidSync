import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-40 transition-opacity" />
        
        <div 
          className={`z-10 bg-white rounded-lg shadow-xl overflow-hidden w-full ${maxWidth} transition-all transform`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b px-6 py-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;