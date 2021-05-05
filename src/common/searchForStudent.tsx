import React from 'react';
import {
  Alert, Button, Container, Form, Modal, OverlayTrigger, Table, Tooltip,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bar, Field } from './util';

// TODO this should just be User.fields, but we're still missing some fields on User
export const cols = {
  email: ['Email', 'Email', String],
  firstName: ['First Name', 'First Name', String],
  lastName: ['Last Name', 'Last Name', String],
  sat: ['Sat Reqs', 'Satisfied Requirements'],
  pend: ['Pend Reqs', 'Pending Requirements'],
  unsat: ['Unsat Reqs', 'Unatisfied Requirements'],
  graduationSemester: ['Grad Sem', 'Graduation Semester'],
  graduationYear: ['Grad Year', 'Graduation Year'],
  nsem: ['# Sem', 'Number of Semesters in the Program'],
  valid: ['P Valid', 'Course Plan Validity', ['Ignore', 'Valid', 'Invalid']],
  compl: ['P Compl', 'Course Plan Completeness', ['Ignore', 'Complete', 'Incomplete']],
  department: ['Dept', 'Department', String],
} as const;

interface FilterProps {
  show: boolean,
  onHide: () => void,
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
            Object.entries(c).map(([k, [_, l, t]]) => (
              <Field key={k} long={l} name={k} type={t ?? Number} cmp />
            ))
          }
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Apply</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default function SearchForStudent({ values }: { values?: any[] }): JSX.Element {
  const [modalShow, setModalShow] = React.useState(false);
  const [alertShow, setAlertShow] = React.useState(false);
  const data0 = values ?? [];
  const [data, setData] = React.useState(data0);
  const s: [string | null, -1 | 1] = [null, 1];
  const [currSort, setCurrSort] = React.useState(s);

  const onHide = () => {
    setModalShow(false);
    setAlertShow(true);
    setTimeout(() => setAlertShow(false), 1000);
  };

  const sortBy = (key: string) => () => {
    const data1 = JSON.parse(JSON.stringify(data0));
    const dir = key === currSort[0] ? currSort[1] : 1;
    setData(data1.sort((a, b) => dir * String(a[key]).localeCompare(b[key])));
    setCurrSort([key, (-dir as any)]);
  };

  const showSort = (k: string, s: string) => {
    const [key, dir] = currSort;
    if (key === k) {
      return s + (dir > 0 ? '\u2191' : '\u2193');
    }
    return s;
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
                    <th onClick={sortBy(k)}>{showSort(k, s)}</th>
                  </OverlayTrigger>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {
              // TODO css hover
              data.map((x, i) => {
                const url = `/editStudentInformation/${x.email}`;
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={i} onClick={() => window.location.assign(url)}>
                    {Object.keys(cols).map((k) => (
                      <td className="pointer" key={k}><Link to={url}>{x[k]}</Link></td>
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
