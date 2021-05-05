import React from 'react';
import {
  Form, Container, Button,
} from 'react-bootstrap';
import { Student } from '../model/user';
import { toView } from './utils';
import { Bar, Field } from './util';

export default function AddStudent(): JSX.Element {
  const s = Object.keys(Student.fields);
  return (
    <>
      <Bar />
      <Container>
        <Form action="/addStudent" method="post">
          {
            s.map((f) => (
              <Field key={f} type={String} name={f} long={toView(f)} required />
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
