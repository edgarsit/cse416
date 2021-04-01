import React from 'react';
import {
  Alert, Button, Container, Form, Modal, OverlayTrigger, Table, Tooltip,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bar, Field } from './util';

export const cols = {
  username: ['Username', 'Username', 'string'],
  sat: ['Sat Reqs', 'Satisfied Requirements'],
  pend: ['Pend Reqs', 'Pending Requirements'],
  unsat: ['Unsat Reqs', 'Unatisfied Requirements'],
  gradSemester: ['Grad Sem', 'Graduation Semester'],
  nsem: ['# Sem', 'Number of Semesters in the Program'],
  valid: ['P Valid', 'Course Plan Validity', ['Ignore', 'Valid', 'Invalid']],
  compl: ['P Compl', 'Course Plan Completeness', ['Ignore', 'Complete', 'Incomplete']],
  department: ['Dept', 'Department', 'string'],
} as const;

export default function SearchForStudent({ values }: { values?: any[] }): JSX.Element {
  const [modalShow, setModalShow] = React.useState(false);
  const [alertShow, setAlertShow] = React.useState(false);
  const data = values ?? [];

  const onHide = (e: Event) => {
    setModalShow(false);
    setAlertShow(true);
    setTimeout(() => setAlertShow(false), 1000);
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
                const url = `/editStudentInformation/${x.username}`;
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
      <Filter
        show={modalShow}
        onHide={onHide}
        c={cols}
      />
    </>
  );
}

interface FilterProps {
  show: boolean,
  onHide: (e?: any) => void,
  c: typeof cols
}
function Filter({ show, onHide, c }: FilterProps) {
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
          {
            Object.entries(c).map(([k, [_, l, t]]) => (<Field key={k} long={l} name={k} type={t ?? 'number'} cmp />))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Apply</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
