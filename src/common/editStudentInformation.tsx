import React from 'react';
import {
  Form, Container, Button, Row, Col,
} from 'react-bootstrap';
import Bar from './util';
import { cols } from './searchForStudent';

export default function EditStudentInformation(
  { user, location }: { user?: any, location?: string },
) {
  const data = user ?? '';
  return (
    <>
      <Bar />
      <Container>
        <Form action={location} method="post">
          {
            Object.entries(data).map(([k, v]) => <MakeRow key={k} x={[k, v as any]} />)
          }
          <Button type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}

function MakeRow({ x: [k, v] }: { x: [string, string] }) {
  return (
    <>
      <Form.Group as={Row} controlId={k} key={k} className="p-2">
        <Form.Label column>
          {
            // https://stackoverflow.com/a/4149393
            (k in cols)
              ? cols[k][0]
              : k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
          }
        </Form.Label>
        <Col>
          <Form.Control type="text" name={k} defaultValue={v} />
        </Col>
      </Form.Group>
    </>
  );
}
