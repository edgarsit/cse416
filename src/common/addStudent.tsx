import React from 'react';
import {
  Form, Container, Button,
} from 'react-bootstrap';
import { Student } from '../model/user';
import { Bar, Field } from './util';

const capitalize = (s: string) => {
  if (s.length > 0) {
    return s[0]?.toUpperCase() + s.slice(1);
  }
  return s;
};
const toView = (s: string) => {
  if (s === 'sbuId') {
    return 'SBU ID';
  }
  return s.split(/([A-Z][^A-Z]*)/).map(capitalize).join(' ');
};

export default function AddStudent(): JSX.Element {
  const s = Object.keys(Student.fields);
  return (
    <>
      <Bar />
      <Container>
        <Form action="/addStudent" method="post">
          {
            s.map((f) => (
              <Field key={f} type="string" name={f} long={toView(f)} required />
            ))
          }
          <Button type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}
