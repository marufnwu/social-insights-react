import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faPlug,
  faChartLine,
  faThLarge,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h4>Social Analytics</h4>
      </div>
      <hr className="sidebar-divider" />
      <div className="nav flex-column">
        <NavLink to="/" className="nav-link">
          <FontAwesomeIcon icon={faTachometerAlt} className="icon" />
          Dashboard
        </NavLink>

        <NavLink to="/connections" className="nav-link">
          <FontAwesomeIcon icon={faPlug} className="icon" />
          Connections
        </NavLink>

        <NavLink to="/analytics" className="nav-link">
          <FontAwesomeIcon icon={faChartLine} className="icon" />
          Analytics
        </NavLink>

        <NavLink to="/widgets" className="nav-link">
          <FontAwesomeIcon icon={faThLarge} className="icon" />
          Widget Manager
        </NavLink>

        <hr className="sidebar-divider" />

        <NavLink to="/profile" className="nav-link">
          <FontAwesomeIcon icon={faUserCircle} className="icon" />
          Profile
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;