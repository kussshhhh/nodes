import React from 'react';

const Popup = ({ title, content, onClose, onSendToBackend }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 z-50 flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6 flex-grow overflow-auto">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <div className="text-lg mb-8">{content}</div>
        </div>
        <div className="p-6 bg-gray-100 rounded-b-lg flex justify-end items-center">
          
        </div>
      </div>
    </div>
  );
};

export default Popup;