import React from 'react';
import './ContactUs.css';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
    const navigate = useNavigate();
  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>

      <p className="contact-paragraph">
        For any inquiries or assistance, please contact us via email:
      </p>

      <p className="contact-email">
        <a href="mailto:aniketvm1104@gmail.com" className="contact-link">
          aniketvm1104@gmail.com
        </a>
      </p>
      <button className='backbutton' onClick={()=>{navigate('/')}}> Back </button>
    </div>
  );
};

export default ContactUs;