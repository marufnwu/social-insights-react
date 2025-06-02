import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocialMedia } from '../../contexts/SocialMediaContext';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your authorization...');
  const location = useLocation();
  const navigate = useNavigate();
  const { processOAuthCallback } = useSocialMedia();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const provider = params.get('state')?.split(':')[0]; // Assuming state format: provider:randomString
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Authorization failed: ${error}`);
      // Close window after short delay on web
      setTimeout(() => {
        window.close();
      }, 3000);
      return;
    }

    if (!code || !provider) {
      setStatus('error');
      setMessage('Missing required parameters. Authorization cannot be completed.');
      return;
    }

    const handleCallback = async () => {
      try {
        await processOAuthCallback(provider, code);
        setStatus('success');
        setMessage(`Successfully connected to ${provider}!`);
        // Close this popup window after success
        setTimeout(() => {
          window.opener?.postMessage({ type: 'oauth-success', provider }, '*');
          window.close();
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(`Failed to connect: ${error.response?.data?.message || error.message}`);
      }
    };

    handleCallback();
  }, [location, processOAuthCallback]);

  // Styles for the centered message
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      {status === 'processing' && (
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-success mb-3" style={{ fontSize: '3rem' }}>✓</div>
      )}
      
      {status === 'error' && (
        <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>✗</div>
      )}
      
      <h3>{message}</h3>
      
      {status !== 'processing' && (
        <p className="text-muted mt-3">This window will close automatically...</p>
      )}
    </div>
  );
};

export default OAuthCallback;