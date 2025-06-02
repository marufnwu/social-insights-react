import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';

const SocialStatsWidget = ({ connection }) => {
  const { provider, provider_name, provider_icon, label, name, image_url, primary_count, metrics } = connection;

  const getProviderClass = () => {
    if (provider.includes('youtube')) return 'youtube';
    if (provider.includes('facebook')) return 'facebook';
    if (provider.includes('instagram')) return 'instagram';
    return '';
  };

  const getIconClass = (icon) => {
    if (icon.startsWith('fab ')) {
      return icon.replace('fab ', '');
    }
    return icon;
  };

  return (
    <Col xl={3} md={6} className="mb-4">
      <Card className={`shadow-sm widget-card ${getProviderClass()}`}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              {image_url && (
                <img 
                  src={image_url} 
                  alt={name} 
                  className="rounded-circle me-2"
                  style={{ width: '30px', height: '30px' }}
                />
              )}
              <div>
                <h6 className="mb-0">{label || name}</h6>
                <small className="text-muted">{provider_name}</small>
              </div>
            </div>
            <div className="widget-icon">
              <i className={getIconClass(provider_icon)}></i>
            </div>
          </div>
          
          {metrics && metrics.map((metric, index) => (
            <div key={index} className="mb-2">
              <div className="widget-value">
                {metric.formatted_value}
              </div>
              <div className="d-flex justify-content-between">
                <div className="widget-label">
                  {metric.name}
                </div>
                {metric.trend && (
                  <div className={`widget-trend ${metric.trend}`}>
                    <FontAwesomeIcon icon={
                      metric.trend === 'up' ? faArrowUp :
                      metric.trend === 'down' ? faArrowDown : faMinus
                    } className="me-1" />
                    {metric.change_percent}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default SocialStatsWidget;