import React, { useEffect } from 'react';

const BuyMeCoffeeButton = () => {
  useEffect(() => {
    // Dynamically load the script
    const script = document.createElement('script');
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.async = true;
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', 'kucchi09');
    script.setAttribute('data-color', '#BD5FFF');
    script.setAttribute('data-emoji', '');
    script.setAttribute('data-font', 'Poppins');
    script.setAttribute('data-text', 'Buy me a coffee');
    script.setAttribute('data-outline-color', '#000000');
    script.setAttribute('data-font-color', '#ffffff');
    script.setAttribute('data-coffee-color', '#FFDD00');
    
    document.body.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <a href="https://www.buymeacoffee.com/kucchi09" 
         target="_blank" 
         rel="noopener noreferrer" 
         className="bmc-button"
         style={{
           display: 'flex',
           alignItems: 'center',
           backgroundColor: '#BD5FFF',
           color: '#ffffff',
           borderRadius: '8px',
           padding: '10px 15px',
           textDecoration: 'none',
           fontFamily: 'Poppins, sans-serif'
         }}>
        ☕ Buy me a coffee
      </a>
    </div>
  );
};

export default BuyMeCoffeeButton;