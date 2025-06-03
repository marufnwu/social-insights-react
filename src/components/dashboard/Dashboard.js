import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSyncAlt,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faMinus,
  faPlug,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import {
  faYoutube,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import api from '../../services/api';
import AutoRefreshSocialWidget from '../widgets/AutoRefreshSocialWidget';
import { useAuth } from '../../contexts/AuthContext';
import { useSocialMedia } from '../../contexts/SocialMediaContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import DashboardHeader from '../layout/DashboardHeader';
import { getAppCurrentDateTime } from '../../utils/dateUtils';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { connections, loadingConnections, widgetPreferences, loadingPreferences } = useSocialMedia();
  
  const [socialStats, setSocialStats] = useState(null);
  const [visibleConnections, setVisibleConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [growthData, setGrowthData] = useState(null);
  const [loadingGrowthData, setLoadingGrowthData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(getAppCurrentDateTime());

  useEffect(() => {
    if (!loadingConnections) {
      fetchSocialStats();
      
      // If there are connections, fetch growth data
      if (connections.length > 0) {
        fetchGrowthData(connections[0].id);
      } else {
        setLoadingGrowthData(false);
      }
    }
  }, [loadingConnections, connections]);

  const fetchSocialStats = async (forceRefresh = 0) => {
    try {
      setLoading(true);
      if (forceRefresh) {
        setRefreshing(true);
      }
      
      const response = await api.get('/api/widget/social-stats', {
        params: { force_refresh: forceRefresh }
      });
      
      setSocialStats(response.data.data);
      
      // Set the visible connections based on what the API returns
      if (response.data.data && response.data.data.connections) {
        setVisibleConnections(response.data.data.connections);
      }
      
      setLastUpdated(getAppCurrentDateTime());
    } catch (error) {
      console.error('Failed to fetch social stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGrowthData = async (connectionId) => {
    try {
      setLoadingGrowthData(true);
      const response = await api.get('/api/analytics/historical', {
        params: {
          connection_id: connectionId,
          metric: connections.find(c => c.id === connectionId)?.provider.includes('facebook') ? 
            'fan_count' : 'subscriber_count',
          days: 30
        }
      });
      
      // Format data for the chart
      const formattedData = response.data.data.data.map(item => ({
        date: item.date,
        value: item.value
      }));
      
      setGrowthData({
        connectionId,
        data: formattedData
      });
    } catch (error) {
      console.error('Failed to fetch growth data:', error);
    } finally {
      setLoadingGrowthData(false);
    }
  };

  const handleRefresh = () => {
    fetchSocialStats(1);
  };

  // Get widget preference for a connection
  const getWidgetPreference = (connectionId) => {
    return widgetPreferences.find(pref => pref.connection_id === connectionId) || null;
  };

  // Find full connection details from connection ID
  const getConnectionById = (connectionId) => {
    return connections.find(conn => conn.id === connectionId) || null;
  };

  return (
    <>
      <DashboardHeader title="Dashboard" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted">
          Last updated: {lastUpdated}
        </p>
        <div>
          <Link to="/widgets" className="btn btn-outline-secondary me-2">
            <FontAwesomeIcon icon={faCog} className="me-1" />
            Configure Widgets
          </Link>
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

      {!loadingConnections && connections.length === 0 ? (
        <Card className="shadow-sm mb-4">
          <Card.Body className="text-center p-5">
            <div className="mb-3">
              <FontAwesomeIcon icon={faPlug} size="3x" className="text-muted" />
            </div>
            <h3>Connect Your Social Media Accounts</h3>
            <p className="text-muted">
              Connect your social media accounts to start tracking your analytics.
            </p>
            <Link to="/connections">
              <Button variant="primary">
                Connect Accounts
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Social Media Widgets</h5>
              {!loading && socialStats && (
                <span className="badge bg-secondary">
                  Showing {socialStats.connections?.length || 0} of {connections.length} connections
                </span>
              )}
            </Card.Header>
            <Card.Body>
              {loading && !socialStats ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading widgets...</p>
                </div>
              ) : visibleConnections.length === 0 ? (
                <Alert variant="info">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      No visible social media widgets. Go to Widget Manager to configure your widgets.
                    </div>
                    <Link to="/widgets" className="btn btn-sm btn-primary">
                      Widget Manager
                    </Link>
                  </div>
                </Alert>
              ) : (
                <Row>
                  {visibleConnections.map(connectionData => {
                    const connection = getConnectionById(connectionData.connection_id);
                    if (!connection) return null;
                    
                    return (
                      <AutoRefreshSocialWidget
                        key={connectionData.connection_id}
                        connection={connection}
                        widgetData={connectionData}
                        widgetPreference={getWidgetPreference(connectionData.connection_id)}
                        isVisible={true}
                      />
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>

          <Row className="mt-4">
            <Col lg={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Growth Trend
                  </h5>
                  <div>
                    {connections.length > 0 && (
                      <select 
                        className="form-select form-select-sm" 
                        style={{ width: 'auto' }}
                        onChange={(e) => fetchGrowthData(parseInt(e.target.value))}
                        defaultValue={connections[0]?.id}
                      >
                        {connections.map(conn => (
                          <option key={conn.id} value={conn.id}>
                            {conn.username} ({conn.provider_name})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  {loadingGrowthData ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : growthData?.data ? (
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthData.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#4e73df" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-muted">No growth data available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Quick Stats</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <ul className="list-group list-group-flush">
                    {connections.slice(0, 5).map((connection) => (
                      <li key={connection.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <FontAwesomeIcon 
                            icon={
                              connection.provider.includes('youtube') ? faYoutube :
                              connection.provider.includes('facebook') ? faFacebook :
                              connection.provider.includes('instagram') ? faInstagram : faPlug
                            }
                            className="me-2"
                            style={{ 
                              color: connection.provider.includes('youtube') ? '#c4302b' :
                                     connection.provider.includes('facebook') ? '#3b5998' :
                                     connection.provider.includes('instagram') ? '#e1306c' : '#6c757d'
                            }}
                          />
                          {connection.username}
                        </div>
                        <div>
                          {connection.recent_trend && (
                            <span className={`badge bg-${connection.recent_trend === 'up' ? 'success' : 
                                                        connection.recent_trend === 'down' ? 'danger' : 
                                                        'warning'} rounded-pill me-2`}>
                              <FontAwesomeIcon icon={
                                connection.recent_trend === 'up' ? faArrowUp :
                                connection.recent_trend === 'down' ? faArrowDown : faMinus
                              } />
                              {' '}
                              {connection.recent_change_percent || 0}%
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  <Link to="/analytics" className="btn btn-sm btn-light">
                    View All Analytics
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Dashboard;