import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import { getAppCurrentDateTimeFormatted } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHeader = ({ title }) => {
  const { currentUser } = useAuth();
  
  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Row>
          <Col>
            <h1 className="mb-0">{title || 'Dashboard'}</h1>
            <p className="text-muted mb-0">
              Welcome back, {currentUser?.first_name || 'marufnwucontinue'}!
            </p>
          </Col>
          <Col className="text-end">
            <div className="d-flex flex-column align-items-end">
              <div>
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <span>{getAppCurrentDateTimeFormatted()}</span>
              </div>
              <div className="mt-2">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                <span>{currentUser?.email || 'marufnwucontinue@example.com'}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DashboardHeader;