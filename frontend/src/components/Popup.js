import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';


export default function Popup({ title, content, onClose, onSendToBackend, isLoading }) {
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

  const handleKeyPress = (event) => {
    if(event.key === 'Enter' && inputValue.trim()){
      handleSendToBackend() ;
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        ref={popupRef}
        className="w-3/4 h-5/6 bg-black bg-opacity-70 backdrop-blur-sm text-white border border-gray-600 shadow-2xl flex flex-col rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.8) 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <div className="relative p-6 border-b border-gray-700 text-center">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-auto p-6">
          <ReactMarkdown
            children={content}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
              p: ({node, ...props}) => <p className="my-2" {...props} />,
              code: ({node, inline, className, children, ...props}) => { 
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match?(
                  <CodeBlock
                    code={String(children).replace(/\n$/,'')}
                    language={match[1]}
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) ;
              }
            }}
          />
        </div>
        <div className="p-4 bg-gray-800 bg-opacity-50 flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow mr-2 p-2 rounded border border-gray-600 bg-gray-700 bg-opacity-50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
          />
          <button
            onClick={handleSendToBackend}
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-200"
          >
            {isLoading ? 'Loading...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}