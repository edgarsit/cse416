import React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";

export default function Bar() {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/login">MAST System</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <NavDropdown title="Quick Links" id="basic-nav-dropdown">
                        <NavDropdown.Item href='/home'>Home</NavDropdown.Item>
                        <NavDropdown.Item href='/imports'>Imports</NavDropdown.Item>
                        <NavDropdown.Item href='/addStudent'>Add Student</NavDropdown.Item>
                        <NavDropdown.Item href='/deleteAll'>Delete All data</NavDropdown.Item>
                        <NavDropdown.Item href='/searchForStudent'>Browse/search for students</NavDropdown.Item>
                        <NavDropdown.Item href='/viewEnrollmentTrends'>View Enrollment Trends</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}