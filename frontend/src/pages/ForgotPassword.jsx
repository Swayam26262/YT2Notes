import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Form.css';
import { passwordReset } from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await passwordReset(email);
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.email) {
        setError(data.email[0]);
      } else {
        setError('Failed to send reset email.');
      }
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
            <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
              <g id="Layer_3" data-name="Layer 3">
                <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
              </g>
            </svg>
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
          {submitted && (
            <p className="p" style={{ color: 'green' }}>
              If this email exists, a reset link has been sent.
            </p>
          )}
          {error && (
            <p className="p" style={{ color: 'red' }}>
              {error}
            </p>
          )}
          <p className="p">
            Remember your password?{' '}
            <span className="span" onClick={() => navigate('/login')}>
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 