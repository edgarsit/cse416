import React from 'react';
import {
  Dropdown, DropdownButton, Form, InputGroup, Nav,
  Navbar, NavDropdown, Row, Col,
} from 'react-bootstrap';

export function Bar({ title }: { title?: string }): JSX.Element {
  return (
    <Navbar bg="light" expand="md">
      <div style={{ flex: '1' }}>
        <Navbar.Brand href="/login">MAST System</Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav" style={{ display: 'inline-block!important' }}>
          <Nav className="mr-auto">
            <NavDropdown title="Quick Links" id="basic-nav-dropdown">
              <NavDropdown.Item href="/GPD_Home">Home</NavDropdown.Item>
              <NavDropdown.Item href="/import">Import</NavDropdown.Item>
              <NavDropdown.Item href="/addStudent">Add Student</NavDropdown.Item>
              <NavDropdown.Item href="/searchForStudent">Browse/search for students</NavDropdown.Item>
              <NavDropdown.Item href="/viewEnrollmentTrends">View Enrollment Trends</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </div>
      <div style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        flex: '1',
        textAlign: 'center',
      }}
      >
        {title}
      </div>
      <a style={{ flex: '1', textAlign: 'right' }} href="/logout">Logout</a>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
    </Navbar>
  );
}

export default function StudentBar(): JSX.Element {
  return (
    <Navbar bg="light" expand="sm">
      <Navbar.Brand href="/login">MAST System</Navbar.Brand>
      <div style={{
        marginLeft: 'auto',
      }}
      >
        <a href="/logout">Logout</a>
      </div>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
    </Navbar>
  );
}

interface FieldLeftProps {
  name: string,
  type: typeof Boolean | typeof String | typeof Number | readonly string[],
  cmp?: boolean,
  required?: boolean,
}

function FieldLeft({
  name, type, cmp, required,
}: FieldLeftProps) {
  const ty = type === Boolean ? ['True', 'False'] : type;
  if (ty === String) {
    return <Form.Control type="text" name={name} required={required} />;
  } if (ty === Number) {
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
  throw new Error(`Invalid type ${ty}`);
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
