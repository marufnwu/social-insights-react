import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faSyncAlt, faChartLine, faUsers, faThumbsUp, faComment } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const FacebookAnalytics = ({ connections }) => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [pageDetails, setPageDetails] = useState(null);
  const [pageInsights, setPageInsights] = useState(null);
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
      fetchFacebookData();
      fetchHistoricalData();
    }
  }, [selectedConnection, dateRange]);

  const fetchFacebookData = async () => {
    if (!selectedConnection) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch page details
      const detailsResponse = await api.get('/api/social-media/facebook/data', {
        params: {
          connection_id: selectedConnection.id,
          data_type: 'page_details'
        }
      });
      
      setPageDetails(detailsResponse.data.data.data);
      
      // Fetch insights data
      const insightsResponse = await api.get('/api/social-media/facebook/data', {
        params: {
          connection_id: selectedConnection.id,
          data_type: 'insights',
          metric_category: 'overview',
          period: 'day',
          date_preset: 'last_30d'
        }
      });
      
      setPageInsights(insightsResponse.data.data.data);
      
    } catch (error) {
      setError(`Error fetching Facebook data: ${error.response?.data?.message || error.message}`);
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
          metric: 'fan_count',
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
      await fetchFacebookData();
      await fetchHistoricalData();
    } finally {
      setRefreshing(false);
    }
  };
  
  const renderDetailsCard = () => {
    if (!pageDetails) return null;
    
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Page Details</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-3 mb-md-0">
              {pageDetails.picture && pageDetails.picture.data && (
                <img 
                  src={pageDetails.picture.data.url} 
                  alt={pageDetails.name}
                  className="img-fluid rounded-circle mb-2"
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              )}
              <h5>{pageDetails.name}</h5>
              <p className="text-muted">{pageDetails.category || 'Business'}</p>
            </Col>
            <Col md={9}>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{pageDetails.fan_count.toLocaleString()}</h2>
                    <span className="text-muted">Page Likes</span>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{pageDetails.followers_count.toLocaleString()}</h2>
                    <span className="text-muted">Followers</span>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">
                      {pageDetails.verification_status === 'verified' ? 'Yes' : 'No'}
                    </h2>
                    <span className="text-muted">Verified</span>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <p className="mb-1"><strong>About:</strong></p>
                <p className="text-muted">{pageDetails.about || 'No description available'}</p>
              </div>
              {pageDetails.website && (
                <p><strong>Website:</strong> <a href={pageDetails.website} target="_blank" rel="noopener noreferrer">{pageDetails.website}</a></p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderFanChart = () => {
    if (!historicalData) return null;
    
    // Format data for chart
    const chartData = historicalData.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      fans: item.value
    }));
    
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Page Likes Growth</h5>
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
              <LineChart data={chartData}>
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
                <Line type="monotone" dataKey="fans" stroke="#3b5998" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (connections.length === 0) {
    return (
      <Alert variant="info">
        <FontAwesomeIcon icon={faFacebook} className="me-2" />
        No Facebook accounts connected. Please connect a Facebook account to view analytics.
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faFacebookSquare} size="2x" className="me-2" style={{ color: '#3b5998' }} />
          <h3 className="mb-0">Facebook Analytics</h3>
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
      
      {loading && !pageDetails ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" style={{ color: '#3b5998' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Facebook data...</p>
        </div>
      ) : (
        <>
          {renderDetailsCard()}
          
          {renderFanChart()}
          
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
                    <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
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
                <FontAwesomeIcon icon={faComment} className="me-2" />
                Recent Posts
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Recent posts will appear here...</p>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default FacebookAnalytics;