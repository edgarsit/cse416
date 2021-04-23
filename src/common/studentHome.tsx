import React from 'react';
import {
  Container, Button,
} from 'react-bootstrap';
import StudentBar from './util';

export default function studentHome(
  { user }: { user?: any },
): JSX.Element {
  return (
    <>
      <StudentBar />
      <Container fluid="sm">
        <Button className="my-3" href={`/editStudentInfo/${user.email}`} block>Edit Your Information</Button>
        <Button className="my-3" href={`/suggestCoursePlan/${user.email}`} block>Suggest Course Plan</Button>
      </Container>
    </>
  );
}
