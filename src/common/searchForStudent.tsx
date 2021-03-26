import React from 'react';
import {
  Alert, Button, Col, Container, Dropdown, DropdownButton,
  Form, InputGroup, Modal, OverlayTrigger, Row, Table, Tooltip,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Bar from './util';

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

export default function SearchForStudent({ values }: { values?: any[] }) {
  const [modalShow, setModalShow] = React.useState(false);
  const [alertShow, setAlertShow] = React.useState(false);
  const data = values ?? [];

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
            {
              // TODO css hover
              data.map((x, i) => {
                const url = `editStudentInformation/?userName=${x.userName}`;
                return (
                  <tr key={i} onClick={() => window.location.assign(url)}>
                    {Object.keys(cols).map((k, j) => (
                      <td key={j}><Link to={url}>{x[k]}</Link></td>
                    ))}
                  </tr>
                );
              })
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

function NumberInput({ k }: { k: string }) {
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
          // TODO != fix width
          ['=', '>', '<', '!='].map((v) => (
            <Dropdown.Item onClick={() => setSelected(v)} key={v}>
              {v}
            </Dropdown.Item>
          ))
        }
      </DropdownButton>
      <Form.Control type="hidden" value={selected} name={`${k}c`} />
      <Form.Control type="number" name={k} />
    </InputGroup>
  );
}

// TODO loop before call
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
            ? <Form.Control type="text" name={k} />
            : (Array.isArray(t))
              ? (
                <Form.Control as="select" name={k}>
                  <option>Ignore</option>
                  {
                  t.map((v) => <option>{v}</option>)
                }
                </Form.Control>
              )
              : <NumberInput k={k} />
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
          {/* TODO clear all */}
        </Modal.Title>
      </Modal.Header>
      <Form action="/searchForStudent" method="get">
        <Modal.Body>
          <MakeGroup cols={cols} />
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Apply</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
