import React from 'react';
import {
  Form, Row, Col, Container, Button,
} from 'react-bootstrap';
import Bar from './util';

export default function AddStudent() {
  // const s = StudentModel.schema.paths;
  // TODO types
  const s = [
    'userName',
    'password',
    'department',
    'track',
    'requirementVersion',
    'gradSemester',
    'coursePlan',
    'graduated',
    'comments',
    'sbuId',
  ];
  const a = s.map((f) => (
    <Form.Group as={Row} controlId={f} key={f} className="py-2">
      <Form.Label column>
        {f}
      </Form.Label>
      <Col>
        {/* TODO here */}
        <Form.Control type="text" placeholder={f} name={f} required />
      </Col>
    </Form.Group>
  ));

  return (
    <div>
      <Bar />
      <Container>
        <Form action="addStudent" method="post">
          {a}
          <Button type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
}
