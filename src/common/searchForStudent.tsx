import React from 'react';
import {
  Alert, Button, Col, Container, Dropdown, DropdownButton, Form, InputGroup, Modal, OverlayTrigger, Row, Table, Tooltip,
} from 'react-bootstrap';
import Bar from './bar';

export const cols = {
  userName: ['Name', 'Name', 'text'],
  sat: ['Sat Reqs', 'Satisfied Requirements'],
  pend: ['Pend Reqs', 'Pending Requirements'],
  unsat: ['Unsat Reqs', 'Unatisfied Requirements'],
  gradSemester: ['Grad Sem', 'Graduation Semester'],
  nsem: ['# Sem', 'Number of Semesters in the Program'],
  valid: ['P Valid', 'Course Plan Validity', ['Valid', 'Invalid']],
  compl: ['P Compl', 'Course Plan Completeness', ['Complete', 'Incomplete']],
} as const;

type cols_t = typeof cols;

export default function SearchForStudent({ values }: { values?: any[][] }) {
  const [modalShow, setModalShow] = React.useState(false);
  const [alertShow, setAlertShow] = React.useState(false);
  const [data, setData] = React.useState(values ?? []);

  const onHide = (e) => {
    setModalShow(false);
    setAlertShow(true);
    setTimeout(() => setAlertShow(false), 1000);
    e.preventDefault();
  };

  return (
    <>
      <Bar title="Browse/Search For Student" />
      <Container className="my-2">
        <Button variant="primary" onClick={() => setModalShow(true)}>
          Filters
        </Button>
        <Alert show={alertShow} variant="info"> Loading... </Alert>
      </Container>
      <Container className="my-2">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {
              Object.entries(cols).map(([k, [s, l, _]]) => (
                <OverlayTrigger
                  key={k}
                  placement="bottom"
                  overlay={
                    <Tooltip id={k}>{l}</Tooltip>
                }
                >
                  <th>{s}</th>
                </OverlayTrigger>
              ))
            }
            </tr>
          </thead>
          <tbody>
            { // TODO Fix idx
              data.map((x, i) => (
                <tr key={i}>
                  {x.map((y, i) => (
                    <td key={i}>{y}</td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </Table>
      </Container>
      <VerticallyCenteredModal
        show={modalShow}
        onHide={onHide}
        cols={cols}
      />
    </>
  );
}

function NumberInput({ k, l }: { k: string, l:string}) {
  const [selected, setSelected] = React.useState('=');
  return (
    <InputGroup>
      <DropdownButton
        as={InputGroup.Prepend}
        variant="outline-secondary"
        title={selected}
        id={k}
      >
        {
          ['=', '>', '<', '!='].map((v) => (
            <Dropdown.Item onClick={() => setSelected(v)} key={v}>{v}</Dropdown.Item>
          ))
        }
      </DropdownButton>
      <Form.Control type="hidden" value={selected} name={`${k}c`} />
      <Form.Control type="number" placeholder={l} name={k} />
    </InputGroup>
  );
}

function MakeGroup({ cols }: { cols: cols_t }) {
  return (
    <>
      {Object.entries(cols).map(([k, [_, l, t]]) => (
        <Form.Group as={Row} controlId={l} key={l} className="p-2">
          <Form.Label column>
            {l}
          </Form.Label>
          <Col>
            {
          (t === 'text')
            ? <Form.Control type="text" placeholder={l} name={k} />
            : (Array.isArray(t))
              ? (
                <Form.Control as="select" name={k}>
                  <option>Ignore</option>
                  {
                  t.map((v) => <option>{v}</option>)
                }
                </Form.Control>
              )
              : <NumberInput k={k} l={l} />
        }
          </Col>
        </Form.Group>
      ))}
    </>
  );
}

function VerticallyCenteredModal({ show, onHide, cols }: { show: boolean, onHide: (e?: any) => void, cols: cols_t }) {
  return (
    <Modal
      {...{ show, onHide }}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Filters
        </Modal.Title>
      </Modal.Header>
      <Form action="/searchForStudent" method="get">
        <Modal.Body>
          <h4>Centered Modal</h4>
          <MakeGroup cols={cols} />
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Apply</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}