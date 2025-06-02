import React from 'react';
import { Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faSignOutAlt, faUserCircle, faCog, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { getAppCurrentDateFormatted } from '../../utils/dateUtils';

const TopNav = () => {
  const { currentUser, logout } = useAuth();
  const username = currentUser?.first_name || 'marufnwucontinue';
  
  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <Navbar bg="white" expand="lg" className="mb-4 shadow-sm">
      <div className="container-fluid">
        <div className="d-none d-md-block">
          <span className="text-muted">{getAppCurrentDateFormatted()}</span>
        </div>
        <Navbar.Toggle aria-controls="top-navbar-nav" />
        <Navbar.Collapse id="top-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Item className="me-3">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                <span className="text-success">Analytics Status: <span className="fw-bold">Good</span></span>
              </div>
            </Nav.Item>
            <Nav.Link href="#" className="mx-1 position-relative">
              <FontAwesomeIcon icon={faBell} />
              <Badge 
                bg="danger" 
                pill 
                className="position-absolute" 
                style={{ top: '-5px', right: '-5px', fontSize: '0.5rem' }}
              >
                3
              </Badge>
            </Nav.Link>
            <Nav.Link href="#" className="mx-1 position-relative">
              <FontAwesomeIcon icon={faEnvelope} />
              <Badge 
                bg="danger" 
                pill 
                className="position-absolute" 
                style={{ top: '-5px', right: '-5px', fontSize: '0.5rem' }}
              >
                7
              </Badge>
            </Nav.Link>
            <div className="mx-1 border-start ms-2 ps-2">
              <NavDropdown 
                title={
                  <span>
                    <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                    {username}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item href="/profile">
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item href="/settings">
                  <FontAwesomeIcon icon={faCog} className="me-2" />
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default TopNav;