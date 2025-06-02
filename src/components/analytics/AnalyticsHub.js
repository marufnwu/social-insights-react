import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faYoutube,
  faFacebook,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import { useSocialMedia } from '../../contexts/SocialMediaContext';
import YouTubeAnalytics from '../platforms/YouTubeAnalytics';
import FacebookAnalytics from '../platforms/FacebookAnalytics';
import InstagramAnalytics from '../platforms/InstagramAnalytics';

const AnalyticsHub = () => {
  const { connections, loadingConnections } = useSocialMedia();
  const [activeTab, setActiveTab] = useState('overview');

  // Group connections by provider type
  const youtubeConnections = connections.filter(c => c.provider === 'youtube');
  const facebookConnections = connections.filter(c => 
    c.provider === 'facebook' || c.provider === 'facebook_page'
  );
  const instagramConnections = connections.filter(c => 
    c.provider === 'instagram' || c.provider === 'instagram_business'
  );

  return (
    <Container>
      <h2 className="mb-4">Analytics Dashboard</h2>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Platforms</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="rounded-0">
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  
                  {youtubeConnections.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="youtube" className="rounded-0">
                        <FontAwesomeIcon icon={faYoutube} style={{ color: '#c4302b' }} className="me-2" />
                        YouTube
                      </Nav.Link>
                    </Nav.Item>
                  )}
                  
                  {facebookConnections.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="facebook" className="rounded-0">
                        <FontAwesomeIcon icon={faFacebook} style={{ color: '#3b5998' }} className="me-2" />
                        Facebook
                      </Nav.Link>
                    </Nav.Item>
                  )}
                  
                  {instagramConnections.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="instagram" className="rounded-0">
                        <FontAwesomeIcon icon={faInstagram} style={{ color: '#e1306c' }} className="me-2" />
                        Instagram
                      </Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mt-4">
              <Card.Header>
                <h5 className="mb-0">Quick Stats</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Platforms:</span>
                  <span className="fw-bold">
                    {(youtubeConnections.length > 0 ? 1 : 0) + 
                     (facebookConnections.length > 0 ? 1 : 0) + 
                     (instagramConnections.length > 0 ? 1 : 0)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Connected Accounts:</span>
                  <span className="fw-bold">
                    {connections.length}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <Row>
                  <Col>
                    <Card className="shadow-sm mb-4">
                      <Card.Header>
                        <h5 className="mb-0">Analytics Overview</h5>
                      </Card.Header>
                      <Card.Body>
                        {loadingConnections ? (
                          <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading analytics data...</p>
                          </div>
                        ) : connections.length === 0 ? (
                          <div className="text-center p-5">
                            <p>No social media accounts connected.</p>
                            <p>Connect your accounts in the Connections page to view analytics.</p>
                          </div>
                        ) : (
                          <div className="overview-summary">
                            <p>Select a platform from the sidebar to view detailed analytics.</p>
                            <hr />
                            <h6>Connected Platforms:</h6>
                            <ul className="list-unstyled">
                              {youtubeConnections.length > 0 && (
                                <li className="mb-2">
                                  <FontAwesomeIcon icon={faYoutube} style={{ color: '#c4302b' }} className="me-2" />
                                  YouTube: {youtubeConnections.length} account(s)
                                </li>
                              )}
                              
                              {facebookConnections.length > 0 && (
                                <li className="mb-2">
                                  <FontAwesomeIcon icon={faFacebook} style={{ color: '#3b5998' }} className="me-2" />
                                  Facebook: {facebookConnections.length} account(s)
                                </li>
                              )}
                              
                              {instagramConnections.length > 0 && (
                                <li className="mb-2">
                                  <FontAwesomeIcon icon={faInstagram} style={{ color: '#e1306c' }} className="me-2" />
                                  Instagram: {instagramConnections.length} account(s)
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
              
              <Tab.Pane eventKey="youtube">
                <YouTubeAnalytics connections={youtubeConnections} />
              </Tab.Pane>
              
              <Tab.Pane eventKey="facebook">
                <FacebookAnalytics connections={facebookConnections} />
              </Tab.Pane>
              
              <Tab.Pane eventKey="instagram">
                <InstagramAnalytics connections={instagramConnections} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AnalyticsHub;