import React from 'react';
import './ShippingAndDelivery.css';
import { useNavigate } from 'react-router-dom';

const ShippingAndDelivery = () => {
    const navigate = useNavigate();
  return (
    <div className="shipping-container">
      <h1 className="shipping-title">Shipping and Delivery Policy</h1>

      <p className="shipping-paragraph">
        As a SaaS (Software as a Service) provider, we do not offer physical products. Our services are delivered electronically, and no shipping or physical delivery is required.
      </p>

      <p className="shipping-paragraph">
        Upon successful purchase, you will receive immediate access to our services and features via our platform. Details on how to access the service will be sent to your registered email address.
      </p>

      <p className="shipping-paragraph">
        If you encounter any issues accessing our services after purchase, please contact us immediately.
      </p>

      <p className="shipping-contact">
        For any questions or assistance, please contact us via email at{' '}
        <a href="mailto:aniketvm1104@gmail.com" className="shipping-link">
          aniketvm1104@gmail.com
        </a>
        .
      </p>
      <button className='backbutton' onClick={()=>{navigate('/')}}> Back </button>
    </div>
  );
};

export default ShippingAndDelivery;