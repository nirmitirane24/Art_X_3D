import React from 'react';
import './CancellationAndRefund.css';
import { useNavigate } from 'react-router-dom';

const CancellationAndRefund = () => {
    const navigate = useNavigate();
  return (
    <div className="cancellation-container">
      <h1 className="cancellation-title">Cancellation and Refund Policy</h1>

      <p className="cancellation-paragraph">
        Due to the nature of our services, all purchases are non-refundable. Once a purchase is made, it cannot be cancelled or refunded.
      </p>

      <p className="cancellation-paragraph">
        We strive to provide high-quality services. If you encounter any discrepancies or issues with your purchase, please contact us immediately. We will review each case individually and attempt to resolve any issues in accordance with applicable rules and regulations.
      </p>

      <p className="cancellation-paragraph">
        We reserve the right to refuse refunds in cases where it is determined that the discrepancy is due to misuse or abuse of our services.
      </p>

      <p className="cancellation-paragraph">
        By purchasing our services, you acknowledge and agree to this non-refundable policy.
      </p>

      <p className="cancellation-contact">
        For any questions or concerns, please contact us via email at{' '}
        <a href="mailto:aniketvm1104@gmail.com" className="cancellation-link">
          aniketvm1104@gmail.com
        </a>
        .
      </p>
      <button className='backbutton' onClick={()=>{navigate('/')}}> Back </button>
    </div>
  );
};

export default CancellationAndRefund;