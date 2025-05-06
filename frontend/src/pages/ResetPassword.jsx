import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Form.css';
import { resetPasswordConfirm } from '../api'; // Import the API function instead of axios

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Use the API function from your api.js file which handles base URL and auth
      await resetPasswordConfirm(uid, token, password);

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        // Combine all error messages into one string
        const messages = Object.values(data).flat().join(' ');
        setError(messages || 'Failed to reset password.');
      } else {
        setError('Failed to reset password.');
      }
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="flex-column">
            <label>Enter your new password</label>
          </div>
          <div className="inputForm">
            <input
              type="password"
              className="input"
              placeholder="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="inputForm">
            <input
              type="password"
              className="input"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button className="button-submit" type="submit">Reset Password</button>
          {success && (
            <p className="p" style={{ color: 'green' }}>
              Password reset successful! Redirecting to login...
            </p>
          )}
          {error && (
            <p className="p" style={{ color: 'red' }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;