import React, { useState, useEffect, useRef } from 'react';

const Popup = ({ title, content, onClose, onSendToBackend, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSendToBackend = () => {
    onSendToBackend(inputValue);
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div 
        ref={popupRef}
        className="w-4/5 h-4/5 bg-cyan-100 text-cyan-900 shadow-2xl flex flex-col rounded-lg overflow-hidden"
      >
        <div className="relative p-6 border-b border-cyan-200">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-cyan-600 hover:text-cyan-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-auto p-6">
          <div className="text-lg mb-8 whitespace-pre-wrap">{content}</div>
        </div>
        <div className="p-4 bg-cyan-200 flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow mr-2 p-2 rounded border border-cyan-300 bg-cyan-50 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleSendToBackend}
            disabled={isLoading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;