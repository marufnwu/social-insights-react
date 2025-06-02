import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faYoutubeSquare } from '@fortawesome/free-brands-svg-icons';
import { faSyncAlt, faChartBar, faUsers, faEye, faVideo } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const YouTubeAnalytics = ({ connections }) => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
      fetchYouTubeData();
      fetchHistoricalData();
    }
  }, [selectedConnection, dateRange]);

  const fetchYouTubeData = async () => {
    if (!selectedConnection) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch channel details
      const detailsResponse = await api.get('/api/social-media/youtube/data', {
        params: {
          connection_id: selectedConnection.id,
          data_type: 'channel_details'
        }
      });
      
      setChannelDetails(detailsResponse.data.data.data);
      
      // Fetch analytics data
      const analyticsResponse = await api.get('/api/social-media/youtube/data', {
        params: {
          connection_id: selectedConnection.id,
          data_type: 'analytics',
          period: 'month'
        }
      });
      
      setAnalytics(analyticsResponse.data.data.data);
      
    } catch (error) {
      setError(`Error fetching YouTube data: ${error.response?.data?.message || error.message}`);
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
          metric: 'subscriber_count',
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
      await fetchYouTubeData();
      await fetchHistoricalData();
    } finally {
      setRefreshing(false);
    }
  };
  
  const renderDetailsCard = () => {
    if (!channelDetails) return null;
    
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Channel Details</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-3 mb-md-0">
              {channelDetails.thumbnail && (
                <img 
                  src={channelDetails.thumbnail.url} 
                  alt={channelDetails.title}
                  className="img-fluid rounded-circle mb-2"
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              )}
              <h5>{channelDetails.title}</h5>
              {channelDetails.customUrl && <p className="text-muted">{channelDetails.customUrl}</p>}
            </Col>
            <Col md={9}>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{parseInt(channelDetails.statistics.subscriberCount).toLocaleString()}</h2>
                    <span className="text-muted">Subscribers</span>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{parseInt(channelDetails.statistics.viewCount).toLocaleString()}</h2>
                    <span className="text-muted">Total Views</span>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="d-flex flex-column">
                    <h2 className="mb-1">{parseInt(channelDetails.statistics.videoCount).toLocaleString()}</h2>
                    <span className="text-muted">Videos</span>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <p className="mb-1"><strong>Description:</strong></p>
                <p className="text-muted">{channelDetails.description || 'No description available'}</p>
              </div>
              {channelDetails.country && (
                <p><strong>Country:</strong> {channelDetails.country}</p>
              )}
              <p><strong>Created:</strong> {new Date(channelDetails.publishedAt).toLocaleDateString()}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderSubscriberChart = () => {
    if (!historicalData) return null;
    
    // Format data for chart
    const chartData = historicalData.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      subscribers: item.value
    }));
    
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Subscriber Growth</h5>
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
              <BarChart data={chartData}>
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
                <Bar dataKey="subscribers" fill="#c4302b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (connections.length === 0) {
    return (
      <Alert variant="info">
        <FontAwesomeIcon icon={faYoutube} className="me-2" />
        No YouTube accounts connected. Please connect a YouTube account to view analytics.
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faYoutubeSquare} size="2x" className="me-2" style={{ color: '#c4302b' }} />
          <h3 className="mb-0">YouTube Analytics</h3>
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
      
      {loading && !channelDetails ? (
        <div className="text-center p-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading YouTube data...</p>
        </div>
      ) : (
        <>
          {renderDetailsCard()}
          
          {renderSubscriberChart()}
          
          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Audience
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
                    <FontAwesomeIcon icon={faEye} className="me-2" />
                    Views
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted">Views data will appear here...</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faVideo} className="me-2" />
                Recent Videos
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Recent videos will appear here...</p>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default YouTubeAnalytics;