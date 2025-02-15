// pages/loading.jsx
import React from 'react';
import './styles/errorpage.css';

const ErrorPage = () => {
  return (
    <div className="errorpage-con">
      <img src="./loading/errorpage.png" className="errorpageimg" />
      <h2 style={{color:'black'}} className="errorpage-text">ERROR 404: PAGE NOT FOUND</h2>
    </div>
  );
};

export default ErrorPage;