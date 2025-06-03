import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSync, 
  faArrowUp, 
  faArrowDown, 
  faMinus,
  faExclamationTriangle,
  faThumbsUp,
  faUserFriends,
  faEye,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';
import {
  faYoutube,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import api from '../../services/api';

const AutoRefreshSocialWidget = ({ 
  connection, 
  widgetPreference,
  widgetData: initialWidgetData = null,
  isVisible = true 
}) => {
  const [widgetData, setWidgetData] = useState(initialWidgetData);
  const [loading, setLoading] = useState(!initialWidgetData);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(initialWidgetData ? new Date() : null);
  
  // Store timer reference so we can clear it when unmounting
  const refreshTimerRef = useRef(null);

  // Calculate the refresh interval in milliseconds
  // Default to 15 minutes if no preference is set
  const refreshIntervalMs = ((widgetPreference?.refresh_interval || 15) * 60 * 1000);
  
  // Display name based on custom label or username
  const displayName = widgetPreference?.custom_label || connection?.username;

  // Get provider icon based on provider type
  const getProviderIcon = () => {
    if (connection?.provider?.includes('youtube')) return faYoutube;
    if (connection?.provider?.includes('facebook')) return faFacebook;
    if (connection?.provider?.includes('instagram')) return faInstagram;
    return faSync;
  };

  const getProviderColor = () => {
    if (connection?.provider?.includes('youtube')) return '#c4302b';
    if (connection?.provider?.includes('facebook')) return '#3b5998';
    if (connection?.provider?.includes('instagram')) return '#e1306c';
    return '#6c757d';
  };

  // Get icon for specific metrics
  const getMetricIcon = (iconName) => {
    if (!iconName) return null;
    
    const iconMap = {
      'fas fa-thumbs-up': faThumbsUp,
      'fas fa-user-friends': faUserFriends,
      'fas fa-eye': faEye,
      'fas fa-play-circle': faPlayCircle
    };
    
    return iconMap[iconName] || faSync;
  };

  // Setup data fetching function
  const fetchData = async (forceRefresh = 0) => {
    if (!isVisible || !connection) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use force_refresh parameter according to API docs
      const response = await api.get('/api/widget/social-stats', {
        params: { 
          force_refresh: forceRefresh,
          connection_id: connection.id // Try to get data for just this connection
        }
      });
      
      // Find the matching connection in the response
      const connectionData = response.data.data.connections.find(
        conn => conn.connection_id === connection.id
      );
      
      if (connectionData) {
        setWidgetData(connectionData);
      } else {
        // Check if connection is in the failed_connections list if available
        const failedConnection = response.data.data.failed_connections?.find(
          conn => conn.connection_id === connection.id
        );
        
        if (failedConnection) {
          setError(`Connection failed: ${failedConnection.reason}`);
        } else {
          setError(`No data found for ${connection.provider_name}`);
        }
      }
      
      setLastRefreshed(new Date());
    } catch (error) {
      console.error(`Failed to fetch data for ${connection?.provider} widget:`, error);
      setError(`Failed to load ${connection?.provider_name} data`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format time ago string
  const getTimeAgo = () => {
    if (!lastRefreshed) return 'Never refreshed';
    
    const seconds = Math.floor((new Date() - lastRefreshed) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Setup auto-refresh and initial fetch
  useEffect(() => {
    // Only fetch initially if we don't already have data
    if (!initialWidgetData && connection) {
      fetchData();
    }
    
    // Setup refresh interval
    refreshTimerRef.current = setInterval(() => {
      console.log(`Auto-refreshing ${connection?.provider_name} widget (interval: ${widgetPreference?.refresh_interval || 15} minutes)`);
      fetchData();
    }, refreshIntervalMs);
    
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [connection?.id, refreshIntervalMs, isVisible, initialWidgetData]);

  // If widget is not visible based on preferences or we have no connection, don't render
  if (!isVisible || !connection) return null;

  return (
    <Col md={6} lg={4} className="mb-4">
      <Card className="shadow-sm h-100" style={{ borderLeft: `4px solid ${getProviderColor()}` }}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon 
              icon={getProviderIcon()} 
              style={{ color: getProviderColor() }}
              className="me-2"
            />
            <h5 className="mb-0">
              {widgetData?.label || displayName}
            </h5>
          </div>
          <div>
            {loading && (
              <Spinner animation="border" size="sm" role="status" className="me-2">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
            <Badge bg="light" text="dark" title={`Refreshes every ${widgetPreference?.refresh_interval || 15} minutes`}>
              {getTimeAgo()}
            </Badge>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error ? (
            <div className="text-center text-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2" />
              <p>{error}</p>
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={() => fetchData(1)}
              >
                <FontAwesomeIcon icon={faSync} className="me-1" /> Retry
              </button>
            </div>
          ) : loading && !widgetData ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading data...</p>
            </div>
          ) : !widgetData ? (
            <div className="text-center text-muted">
              <p>No data available</p>
            </div>
          ) : (
            <div className="social-stats">
              {widgetData.metrics?.map((metric, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold fs-4">{metric.formatted_value}</span>
                    {metric.trend && metric.trend !== 'stable' && (
                      <span className={`badge ${
                        metric.trend === 'up' ? 'bg-success' : 
                        metric.trend === 'down' ? 'bg-danger' : 'bg-warning'
                      }`}>
                        <FontAwesomeIcon icon={
                          metric.trend === 'up' ? faArrowUp :
                          metric.trend === 'down' ? faArrowDown : faMinus
                        } className="me-1" />
                        {metric.change_percent}%
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    {metric.icon && (
                      <FontAwesomeIcon 
                        icon={getMetricIcon(metric.icon)} 
                        className="me-2" 
                        size="sm"
                      />
                    )}
                    {metric.name}
                  </div>
                </div>
              ))}
              
              {widgetData.last_updated && (
                <div className="mt-3 pt-2 border-top">
                  <small className="text-muted">
                    Last data update: {new Date(widgetData.last_updated).toLocaleTimeString()}
                  </small>
                </div>
              )}
            </div>
          )}
        </Card.Body>
        
        <Card.Footer className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {connection.provider_name}
            </small>
            <small className="text-muted">
              Auto-refresh: {widgetPreference?.refresh_interval || 15}min
            </small>
          </div>
        </Card.Footer>
      </Card>
    </Col>
  );
};

export default AutoRefreshSocialWidget;