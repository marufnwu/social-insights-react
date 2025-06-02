import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="content-wrapper flex-grow-1">
        <TopNav />
        <Container fluid className="px-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;