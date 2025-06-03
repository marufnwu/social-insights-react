import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlug, faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {
  faYoutube,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import { useSocialMedia } from '../../contexts/SocialMediaContext';

const ConnectionManager = () => {
  const {
    providers,
    connections,
    loadingProviders,
    loadingConnections,
    getLoginUrl,
    disconnectProvider,
    processOAuthCallback,
    refreshConnections
  } = useSocialMedia();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  // Add event listener for messages from the popup window
  useEffect(() => {
    const handleMessage = async (event) => {
      // Add debug logging
      console.log('Received postMessage event:', event);
      console.log('Message data:', event.data);

      // Check if the message is from our OAuth popup with the correct type
      if (event.data && event.data.type === 'OAUTH_CALLBACK' && event.data.payload) {
        const { provider, code, userId } = event.data.payload;

        console.log('Received OAUTH_CALLBACK message with payload:', event.data.payload);

        if (!provider || !code) {
          console.error('Missing required OAuth parameters in callback');
          setError('Missing required OAuth parameters in callback');
          return;
        }

        console.log(`Processing OAuth callback for ${provider} with code ${code.substring(0, 10)}...`);
        setProcessing(true);
        setError('');

        try {
          // Process the OAuth code received from the popup
          await processOAuthCallback(provider, code);
          setSuccess(`Successfully connected to ${provider}!`);
          refreshConnections();
        } catch (error) {
          console.error('OAuth processing error:', error);
          setError(`Failed to complete connection: ${error.response?.data?.message || error.message}`);
        } finally {
          setProcessing(false);
        }
      }
    };

    // Add event listener for 'message' event
    window.addEventListener('message', handleMessage);

    // Return cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [processOAuthCallback, refreshConnections]);

  const handleConnect = async (provider) => {
    try {
      setError('');
      setSuccess('');
      console.log(`Getting login URL for ${provider}...`);
      const loginUrl = await getLoginUrl(provider);
      console.log(`Opening OAuth window for ${provider} with URL: ${loginUrl}`);

      // Open OAuth popup window
      const popupWindow = window.open(loginUrl, '_blank', 'width=600,height=700');

      // Check if popup was blocked
      if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
        setError("Popup window was blocked. Please allow popups for this website.");
      }
    } catch (error) {
      console.error('Failed to generate login URL:', error);
      setError(`Failed to generate login URL: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDisconnect = async (provider, providerId) => {
    try {
      setError('');
      setSuccess('');

      if (!window.confirm(`Are you sure you want to disconnect this ${provider} account?`)) {
        return;
      }

      await disconnectProvider(provider, providerId);
      setSuccess(`Successfully disconnected from ${provider}`);
    } catch (error) {
      setError(`Failed to disconnect: ${error.response?.data?.message || error.message}`);
    }
  };

  const getProviderIcon = (provider) => {
    if (provider.includes('youtube')) return faYoutube;
    if (provider.includes('facebook')) return faFacebook;
    if (provider.includes('instagram')) return faInstagram;
    return faPlug;
  };

  const getProviderColor = (provider) => {
    if (provider.includes('youtube')) return '#c4302b';
    if (provider.includes('facebook')) return '#3b5998';
    if (provider.includes('instagram')) return '#e1306c';
    return '#6c757d';
  };

  // Group providers by parent
  const mainProviders = providers.filter(p => p.is_main);

  return (
    <Container>
      <h2 className="mb-4">Social Media Connections</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {processing && (
        <Alert variant="info">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <div>Processing authentication... Please wait.</div>
          </div>
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Available Platforms</h5>
            </Card.Header>
            <Card.Body>
              {loadingProviders ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading available platforms...</p>
                </div>
              ) : (
                <Row>
                  {mainProviders.map((provider) => {
                    // Find if user has any connection for this provider family
                    const hasConnection = connections.some(c =>
                      c.provider === provider.provider ||
                      (provider.provider === 'facebook' && c.provider.startsWith('facebook_')) ||
                      (provider.provider === 'instagram' && c.provider.startsWith('instagram_'))
                    );

                    return (
                      <Col key={provider.provider} md={4} className="mb-3">
                        <div className={`social-connection-btn ${provider.provider}`}>
                          <FontAwesomeIcon icon={getProviderIcon(provider.provider)} size="lg" />
                          {provider.name}
                          {hasConnection && (
                            <span className="ms-2">
                              <FontAwesomeIcon icon={faCheck} />
                            </span>
                          )}
                        </div>
                        <Button
                          variant={hasConnection ? "outline-secondary" : "primary"}
                          className="w-100"
                          onClick={() => handleConnect(provider.provider)}
                          disabled={processing}
                        >
                          {hasConnection ? 'Reconnect' : 'Connect'} {provider.name}
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Connected Accounts</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => refreshConnections()}
                disabled={processing || loadingConnections}
              >
                <FontAwesomeIcon icon={faPlug} className="me-1" />
                Refresh Connections
              </Button>
            </Card.Header>
            <Card.Body>
              {loadingConnections ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your connections...</p>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted mb-4">You don't have any connected accounts yet.</p>
                  <p>Connect your accounts using the options above to start tracking your social media analytics.</p>
                </div>
              ) : (
                <Table responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Account</th>
                      <th>Connected On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((connection) => (
                      <tr key={connection.id}>
                        <td>
                          <FontAwesomeIcon
                            icon={getProviderIcon(connection.provider)}
                            style={{ color: getProviderColor(connection.provider) }}
                            size="lg"
                            className="me-2"
                          />
                          {connection.provider_name}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {connection.picture && (
                              <img
                                src={connection.picture}
                                alt={connection.username}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                              />
                            )}
                            <div>{connection.username}</div>
                          </div>
                        </td>
                        <td>{new Date(connection.connected_at).toLocaleDateString()}</td>
                        <td>
                          {connection.is_token_expired ? (
                            <span className="text-danger">
                              <FontAwesomeIcon icon={faTimes} /> Token Expired
                            </span>
                          ) : (
                            <span className="text-success">
                              <FontAwesomeIcon icon={faCheck} /> Active
                            </span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDisconnect(
                              connection.provider,
                              connection.provider_user_id
                            )}
                            disabled={processing}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className="me-1" />
                            Disconnect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ConnectionManager;