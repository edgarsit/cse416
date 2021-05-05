import React from 'react';
import {
  Container, Table, Form, Button,
} from 'react-bootstrap';
import { CoursePlan } from '../model/course';
import { Bar, Field } from './util';

export default function EditCoursePlan(
  { sbuId, courses }: { sbuId: string, courses: CoursePlan[] },
): JSX.Element {
  const f = Object.entries(CoursePlan.fields).filter(([k, _]) => k !== 'sbuId');
  return (
    <>
      <Bar />
      <Container>
        <h1>Add</h1>
        <Form method="post" action={`/editCoursePlan/set/${sbuId}`}>
          {
            f.map(([k, v]) => <Field key={k} long={v.long} name={k} type={v.ty} />)
          }
          <Button type="submit" block>Submit</Button>
        </Form>
        <Form method="post">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {
                  f.map(([k, _]) => <td key={k}>{k}</td>)
                }
                <td>Delete/Edit</td>
              </tr>
            </thead>
            <tbody>
              {
                courses.map((c) => (
                  <tr key={String(c._id)}>
                    {
                    f.map(([k, _]) => (
                      <td key={k}>{c[k]}</td>
                    ))
                    }
                    <td>
                      {
                      c.grade === undefined
                        ? <Button formAction={`/editCoursePlan/delete/${c.sbuId}/${c._id}`} type="submit">X</Button>
                        : (
                          <>
                            <Form.Control type="text" name={String(c._id)} id={String(c._id)} />
                            <Button formAction={`/editCoursePlan/set/${c.sbuId}/${c._id}`} type="submit">Save</Button>
                          </>
                        )
                      }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </Form>
      </Container>
    </>
  );
}
