import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useSocialMedia } from '../../contexts/SocialMediaContext';
import {
  faYoutube,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../services/api';

const WidgetManager = () => {
  const { connections, widgetPreferences, loadingConnections, loadingPreferences, refreshWidgetPreferences } = useSocialMedia();
  const [widgetSettings, setWidgetSettings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize widget settings when preferences are loaded
  useEffect(() => {
    if (!loadingPreferences && !loadingConnections) {
      // Combine connections and preferences
      const settings = connections.map(connection => {
        // Find preference for this connection, if exists
        const preference = widgetPreferences.find(p => p.connection_id === connection.id);
        
        // Return combined data
        return {
          connection_id: connection.id,
          provider: connection.provider,
          provider_name: connection.provider_name,
          username: connection.username,
          picture: connection.picture,
          is_enabled: preference ? preference.is_enabled : true, // Default to enabled if no preference
          display_order: preference ? preference.display_order : 999,
          custom_label: preference ? preference.custom_label : connection.username,
          refresh_interval: preference ? preference.refresh_interval : 15
        };
      });

      // Sort by display order
      setWidgetSettings(settings.sort((a, b) => a.display_order - b.display_order));
    }
  }, [connections, widgetPreferences, loadingConnections, loadingPreferences]);

  // Save all widget preferences
  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Format data according to the API docs
      const formattedData = {
        connections: widgetSettings.map(setting => ({
          connection_id: setting.connection_id,
          is_enabled: setting.is_enabled,
          display_order: setting.display_order,
          custom_label: setting.custom_label,
          refresh_interval: setting.refresh_interval
        }))
      };

      // Call API directly to ensure proper formatting
      const response = await api.post('/api/widget/preferences', formattedData);
      
      if (response.data.success) {
        setSuccess('Widget preferences saved successfully!');
        // Refresh widget preferences in context
        await refreshWidgetPreferences();
      } else {
        setError(response.data.message || 'Failed to save preferences');
      }
    } catch (error) {
      setError(`Failed to save preferences: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle visibility for a single widget
  const handleToggleVisibility = async (connectionId) => {
    try {
      const updatedSettings = widgetSettings.map(setting => {
        if (setting.connection_id === connectionId) {
          return { ...setting, is_enabled: !setting.is_enabled };
        }
        return setting;
      });
      setWidgetSettings(updatedSettings);
      
      // Note: We don't save on each toggle, only when the save button is pressed
    } catch (error) {
      setError(`Failed to toggle visibility: ${error.message}`);
    }
  };

  const handleInputChange = (connectionId, field, value) => {
    const updatedSettings = widgetSettings.map(setting => {
      if (setting.connection_id === connectionId) {
        return { ...setting, [field]: value };
      }
      return setting;
    });
    setWidgetSettings(updatedSettings);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgetSettings);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update display_order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index
    }));
    
    setWidgetSettings(updatedItems);
  };

  const getProviderIcon = (provider) => {
    if (provider.includes('youtube')) return faYoutube;
    if (provider.includes('facebook')) return faFacebook;
    if (provider.includes('instagram')) return faInstagram;
    return null;
  };

  const getProviderColor = (provider) => {
    if (provider.includes('youtube')) return '#c4302b';
    if (provider.includes('facebook')) return '#3b5998';
    if (provider.includes('instagram')) return '#e1306c';
    return '#6c757d';
  };

  if (loadingConnections || loadingPreferences) {
    return (
      <Container>
        <h2 className="mb-4">Widget Manager</h2>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading widget settings...</p>
        </div>
      </Container>
    );
  }

  if (connections.length === 0) {
    return (
      <Container>
        <h2 className="mb-4">Widget Manager</h2>
        <Card className="shadow-sm">
          <Card.Body className="text-center p-5">
            <p className="mb-4">You don't have any social media accounts connected yet.</p>
            <Button variant="primary" href="/connections">
              Connect Accounts
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Count enabled widgets
  const enabledWidgets = widgetSettings.filter(setting => setting.is_enabled).length;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Widget Manager</h2>
        <Button 
          variant="primary" 
          onClick={handleSavePreferences}
          disabled={saving}
        >
          <FontAwesomeIcon icon={faSave} className="me-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Configure Your Widgets</h5>
          <span className="badge bg-primary">
            {enabledWidgets} of {widgetSettings.length} widgets enabled
          </span>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-4">
            Drag and drop to reorder widgets, customize labels, and set refresh intervals.
            Disabled widgets will not appear on your dashboard.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {widgetSettings.map((setting, index) => (
                    <Draggable 
                      key={setting.connection_id.toString()} 
                      draggableId={setting.connection_id.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-3 border rounded p-3 ${!setting.is_enabled ? 'bg-light' : ''}`}
                        >
                          <Row className="align-items-center">
                            <Col xs="auto" {...provided.dragHandleProps}>
                              <div className="drag-handle">
                                <i className="fas fa-grip-vertical text-muted"></i>
                              </div>
                            </Col>
                            
                            <Col xs="auto">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  backgroundColor: getProviderColor(setting.provider),
                                  color: 'white',
                                  opacity: setting.is_enabled ? 1 : 0.5
                                }}
                              >
                                <FontAwesomeIcon icon={getProviderIcon(setting.provider)} />
                              </div>
                            </Col>
                            
                            <Col>
                              <div className="mb-2">
                                <strong>{setting.provider_name}</strong> - {setting.username}
                                {!setting.is_enabled && <span className="badge bg-secondary ms-2">Hidden</span>}
                              </div>
                              <Row>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Display Label</Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={setting.custom_label || ''}
                                      onChange={(e) => handleInputChange(
                                        setting.connection_id, 
                                        'custom_label', 
                                        e.target.value
                                      )}
                                      placeholder="Display Name"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Refresh Interval (minutes)</Form.Label>
                                    <Form.Select
                                      value={setting.refresh_interval}
                                      onChange={(e) => handleInputChange(
                                        setting.connection_id, 
                                        'refresh_interval', 
                                        parseInt(e.target.value)
                                      )}
                                    >
                                      <option value={5}>5 minutes</option>
                                      <option value={15}>15 minutes</option>
                                      <option value={30}>30 minutes</option>
                                      <option value={60}>1 hour</option>
                                      <option value={120}>2 hours</option>
                                      <option value={360}>6 hours</option>
                                      <option value={720}>12 hours</option>
                                      <option value={1440}>24 hours</option>
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Col>
                            
                            <Col xs="auto">
                              <Button
                                variant={setting.is_enabled ? 'outline-secondary' : 'outline-danger'}
                                onClick={() => handleToggleVisibility(setting.connection_id)}
                              >
                                <FontAwesomeIcon 
                                  icon={setting.is_enabled ? faEye : faEyeSlash} 
                                  className="me-2" 
                                />
                                {setting.is_enabled ? 'Visible' : 'Hidden'}
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div>
            {enabledWidgets} of {widgetSettings.length} widgets will be shown on dashboard
          </div>
          <Button 
            variant="primary" 
            onClick={handleSavePreferences}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faSave} className="me-2" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default WidgetManager;