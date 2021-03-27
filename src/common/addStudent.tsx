import React from 'react';
import {
  Form, Row, Col, Container, Button,
} from 'react-bootstrap';
import { Bar, Field } from './util';

export default function AddStudent() {
  // TODO
  const s = [
    'userName',
    'firstName',
    'lastName',
    'email',
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
    <Field key={f} type="string" name={f} long={f} required />
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
