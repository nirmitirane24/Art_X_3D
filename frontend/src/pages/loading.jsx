import React, { useState, useEffect } from 'react';
import './styles/loadingpage.css';

const LoadingPage = ({ onLoaded }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onLoaded) onLoaded();
    }, 5000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="loading-container">
      <img src="./loading/loading3.gif" className="loading-gif" />
    </div>
  );
};

export default LoadingPage;
