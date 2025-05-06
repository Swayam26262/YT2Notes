import React, { useState } from 'react';
import '../styles/Form.css';
import { passwordReset } from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await passwordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Failed to send reset email.');
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="flex-column">
            <label>Enter your email to reset password</label>
          </div>
          <div className="inputForm">
            <input
              type="email"
              className="input"
              placeholder="Enter your Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="button-submit" type="submit">Send Reset Link</button>
          {submitted && <p className="p" style={{ color: 'green' }}>If this email exists, a reset link has been sent.</p>}
          {error && <p className="p" style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 