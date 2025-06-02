import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faSyncAlt, faChartArea, faUsers, faHeart, faImage } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const InstagramAnalytics = ({ connections }) => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [accountInsights, setAccountInsights] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // Default to 30 days
  
  useEffect(() => {
    if (connections && connections.length > 0) {
      setSelectedConnection(connections[0]);
    }
  }, [connections]);

  useEffect(() => {
    if (selectedConnection) {
      fetchInstagramData();
      fetchHistoricalData();
    }
  }, [selectedConnection, dateRange]);

  const fetchInstagramData = async () => {
    if (!selectedConnection) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch account details
      const detailsResponse = await api.get('/api/social-media/instagram/data', {
        params: {
          connection_id: selectedConnection.id,
          data_type: 'account_details'
        }
      });
      
      setAccountDetails(detailsResponse.data.data.data);
      
      // Fetch insights data
      const insightsResponse = await api.get('/api/social-media/instagram/data', {
        params: {
          connection_id: selectedConnection.id,
          data_type: 'insights',
          period: 'day'
        }
      });
      
      setAccountInsights(insightsResponse.data.data.data);
      
    } catch (error) {
      setError(`Error fetching Instagram data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHistoricalData = async () => {
    if (!selectedConnection) return;
    
    try {
      const response = await api.get('/api/analytics/historical', {
        params: {
          connection_id: selectedConnection.id,
          metric: 'followers_count',
          days: parseInt(dateRange),
          interval: 'day'
        }
      });
      
      setHistoricalData(response.data.data.data);
    } catch (error) {
      console.error('Failed to fetch historical data', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchInstagramData();
      await fetchHistoricalData();
    } finally {
      setRefreshing(false);
    }
  };
  
  const renderDetailsCard = () => {
    if (!accountDetails) return null;
    
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Account Details</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-3 mb-md-0">
              {accountDetails.profile_picture_url && (
                <img 
                  src={accountDetails.profile_picture_url} 
                  alt={accountDetails.name}
                  className="img-fluid rounded-circle mb-2"
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              )}
              <h5>{accountDetails.name}</h5>
              <p className="text-muted">@{accountDetails.username}</p>
            </Col>
            <Col md={9}>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{accountDetails.followers_count.toLocaleString()}</h2>
                    <span className="text-muted">Followers</span>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{accountDetails.follows_count.toLocaleString()}</h2>
                    <span className="text-muted">Following</span>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{accountDetails.media_count.toLocaleString()}</h2>
                    <span className="text-muted">Posts</span>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <p className="mb-1"><strong>Bio:</strong></p>
                <p className="text-muted">{accountDetails.biography || 'No bio available'}</p>
              </div>
              {accountDetails.website && (
                <p><strong>Website:</strong> <a href={accountDetails.website} target="_blank" rel="noopener noreferrer">{accountDetails.website}</a></p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderFollowersChart = () => {
    if (!historicalData) return null;
    
    // Format data for chart
    const chartData = historicalData.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      followers: item.value
    }));
    
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Followers Growth</h5>
          <Form.Select 
            size="sm" 
            style={{ width: 'auto' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </Form.Select>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e1306c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e1306c" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={chartData.length > 30 ? Math.floor(chartData.length / 10) : 0}
                />
                <YAxis 
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip />
                <Area type="monotone" dataKey="followers" stroke="#e1306c" fillOpacity={1} fill="url(#colorFollowers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (connections.length === 0) {
    return (
      <Alert variant="info">
        <FontAwesomeIcon icon={faInstagram} className="me-2" />
        No Instagram accounts connected. Please connect an Instagram account to view analytics.
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faInstagram} size="2x" className="me-2" style={{ color: '#e1306c' }} />
          <h3 className="mb-0">Instagram Analytics</h3>
        </div>
        
        <div className="d-flex align-items-center">
          {connections.length > 1 && (
            <Form.Select 
              className="me-2"
              value={selectedConnection?.id || ''}
              onChange={(e) => {
                const selected = connections.find(c => c.id === parseInt(e.target.value));
                setSelectedConnection(selected);
              }}
            >
              {connections.map(connection => (
                <option key={connection.id} value={connection.id}>
                  {connection.username}
                </option>
              ))}
            </Form.Select>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} className="me-2" />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading && !accountDetails ? (
        <div className="text-center p-5">
          <div className="spinner-border" style={{ color: '#e1306c' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Instagram data...</p>
        </div>
      ) : (
        <>
          {renderDetailsCard()}
          
          {renderFollowersChart()}
          
          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Audience Demographics
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted">Demographics data will appear here...</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faHeart} className="me-2" />
                    Engagement
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted">Engagement data will appear here...</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Popular Media
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Popular posts will appear here...</p>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default InstagramAnalytics;