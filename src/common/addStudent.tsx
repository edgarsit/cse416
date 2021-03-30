import React from 'react';
import {
  Form, Container, Button,
} from 'react-bootstrap';
import { Bar, Field } from './util';

export default function AddStudent(): JSX.Element {
  // TODO
  const s = [
    'username',
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
  return (
    <div>
      <Bar />
      <Container>
        <Form action="addStudent" method="post">
          {
            s.map((f) => (
              <Field key={f} type="string" name={f} long={f} required />
            ))
          }
          <Button type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
}
