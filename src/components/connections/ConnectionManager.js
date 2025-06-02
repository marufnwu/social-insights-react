import React, { useState } from 'react';
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
    disconnectProvider 
  } = useSocialMedia();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async (provider) => {
    try {
      setError('');
      const loginUrl = await getLoginUrl(provider);
      window.open(loginUrl, '_blank', 'width=600,height=700');
    } catch (error) {
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
              <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
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