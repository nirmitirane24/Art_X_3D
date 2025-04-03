import React from 'react';
import './TermsAndConditions.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
    const navigate = useNavigate();
  return (
    <div className="terms-container">
      <h1 className="terms-title">Terms & Conditions</h1>

      <section className="terms-section">
        <h2 className="terms-section-title">1. Account Creation</h2>
        <p className="terms-paragraph">
          Users can create accounts on our platform. By creating an account, you agree to abide by these Terms & Conditions.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">2. User-Generated Content</h2>
        <p className="terms-paragraph">
          Users can create and upload content, including text and images. By uploading content, you confirm that you own or have the necessary rights to use such content.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">3. Copyright Infringement & DMCA</h2>
        <p className="terms-paragraph">
          We comply with the Digital Millennium Copyright Act (DMCA). Copyright infringement notices should be sent to: <a href="mailto:aniketvm1104@gmail.com" className="terms-link">aniketvm1104@gmail.com</a>.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">4. Purchases & Payments</h2>
        <p className="terms-paragraph">
          Users can buy goods, items, or services through one-time payments. We do not guarantee refunds unless explicitly stated.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">5. Subscription Plans & Free Trials</h2>
        <p className="terms-paragraph">
          We offer subscription plans. Free trials may be available at our discretion.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">6. Ownership of Content & Trademarks</h2>
        <p className="terms-paragraph">
          All content, logos, visual designs, and trademarks on our platform are our exclusive property and may not be used without permission.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">7. User Feedback</h2>
        <p className="terms-paragraph">
          By providing feedback or suggestions, you grant us the right to use them without compensation or credits.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">8. Promotions & Contests</h2>
        <p className="terms-paragraph">
          We may offer promotions, contests, and sweepstakes. Participation will be subject to specific terms.
        </p>
      </section>

      <section className="terms-section">
        <h2 className="terms-section-title">9. Contact Information</h2>
        <p className="terms-paragraph">
          For any questions regarding these Terms & Conditions, users can contact us via:
        </p>
        <ul className="terms-list">
          <li>Email: <a href="mailto:aniketvm1104@gmail.com" className="terms-link">aniketvm1104@gmail.com</a></li>
          <li>Website Contact Page:artx3d.vercel.app</li>
        </ul>
      </section>

      <p className="terms-footer">
        By using our platform, you agree to these Terms & Conditions. We reserve the right to update these terms at any time.
      </p>
      <button className='backbutton' onClick={()=>{navigate('/')}}> Back </button>
    </div>
  );
};

export default TermsAndConditions;