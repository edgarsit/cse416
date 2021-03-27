import React from 'react';
import {
  Dropdown, DropdownButton, Form, InputGroup, Nav,
  Navbar, NavDropdown, Row, Col,
} from 'react-bootstrap';

export function Bar({ title }: { title?: string }) {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/login">MAST System</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="Quick Links" id="basic-nav-dropdown">
            <NavDropdown.Item href="/home">Home</NavDropdown.Item>
            <NavDropdown.Item href="/imports">Imports</NavDropdown.Item>
            <NavDropdown.Item href="/addStudent">Add Student</NavDropdown.Item>
            <NavDropdown.Item href="/searchForStudent">Browse/search for students</NavDropdown.Item>
            <NavDropdown.Item href="/viewEnrollmentTrends">View Enrollment Trends</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
      <div style={{
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      >
        {title}
      </div>
      <a href="/logout">Logout</a>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
    </Navbar>
  );
}

interface FieldLeftProps {
  name: string,
  type: 'boolean' | 'string' | 'number' | readonly string[],
  cmp?: boolean,
  required?: boolean,
}

function FieldLeft({
  name, type, cmp, required,
}: FieldLeftProps) {
  const ty = type === 'boolean' ? ['True', 'False'] : type;
  if (ty === 'string') {
    return <Form.Control type="text" name={name} required={required} />;
  } if (ty === 'number') {
    if (cmp) {
      const [selected, setSelected] = React.useState('=');
      return (
        <InputGroup>
          <DropdownButton
            as={InputGroup.Prepend}
            variant="outline-secondary"
            title={selected}
            id={name}
          >
            {
              // TODO != fix width
              ['=', '>', '<', '!='].map((v) => (
                <Dropdown.Item onClick={() => setSelected(v)} key={v}>
                  {v}
                </Dropdown.Item>
              ))
            }
          </DropdownButton>
          <Form.Control type="hidden" value={selected} name={`${name}_cmp`} />
          <Form.Control type="number" name={name} />
        </InputGroup>
      );
    }
    return <Form.Control type="number" name={name} required={required} />;
  } if (Array.isArray(ty)) {
    return (
      <Form.Control as="select" name={name}>
        {
          ty.map((v) => <option key={v}>{v}</option>)
        }
      </Form.Control>
    );
  }
  throw new Error('Invalid type');
}

export function Field(props: FieldLeftProps & { long: string }) {
  const { long, name } = props;
  return (
    <Form.Group as={Row} controlId={name} key={name} className="p-2">
      <Form.Label column>{long}</Form.Label>
      <Col>
        <FieldLeft {...props} />
      </Col>
    </Form.Group>
  );
}
