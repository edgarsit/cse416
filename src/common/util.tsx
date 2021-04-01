import React from 'react';
import {
  Dropdown, DropdownButton, Form, InputGroup, Nav,
  Navbar, NavDropdown, Row, Col,
} from 'react-bootstrap';

export function Bar({ title }: { title?: string }): JSX.Element {
  return (
    <Navbar bg="light" expand="sm">
      <Navbar.Brand href="/login">MAST System</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="Quick Links" id="basic-nav-dropdown">
            <NavDropdown.Item href="/home">Home</NavDropdown.Item>
            <NavDropdown.Item href="/import">Import</NavDropdown.Item>
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
          <Form.Control type="number" name={name} id={name} />
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

export function Field(props: FieldLeftProps & { long: string }): JSX.Element {
  const { long, name } = props;
  return (
    <Form.Group as={Row} key={name} className="p-2">
      <Form.Label column htmlFor={name}>{long}</Form.Label>
      <Col>
        <FieldLeft {...props} />
      </Col>
    </Form.Group>
  );
}
