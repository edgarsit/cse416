import React from 'react';
import {
  Form, Row, Col, Container, Button,
} from 'react-bootstrap';
import { Bar, Field } from './util';

export default function AddStudent() {
  // const s = StudentModel.schema.paths;
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
    <Field key={f} type="string" name={f} long={f} required/>
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
