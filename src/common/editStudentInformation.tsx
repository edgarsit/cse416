import React from 'react';
import { Form, Container, Button, Row, Col } from 'react-bootstrap';
import Bar from './bar';
import { cols } from './searchForStudent';

export default function EditStudentInformation({ user, location }: { user?: any, location?: string }) {
  const data = user ?? '';
  return (
    <>
      <Bar />
      <Container>
        <Form action={location} method="post">
          {
            Object.entries(data).map(([k,v]) => <MakeRow key={k} x={[k,v]} />)
          }
          <Button type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}

function MakeRow({ x: [k, v] }: { x: [string, any] }) {
  return (
    <>
      <Form.Group as={Row} controlId={k} key={k} className="p-2">
        <Form.Label column>
          {
            (k in cols) ?
              cols[k][0]
              :
              // https://stackoverflow.com/a/4149393
              k.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
          }
        </Form.Label>
        <Col>
          <Form.Control type="text" name={k} defaultValue={v} />
        </Col>
      </Form.Group>
    </>
  )
}