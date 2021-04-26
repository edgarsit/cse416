import React from 'react';
import {
  Button, Container, Form,
} from 'react-bootstrap';
import { StaticRouter, Switch, Route } from 'react-router-dom';

import AddStudent from './addStudent';
import Import from './import';
import { Bar } from './util';
import ViewEnrollmentTrends from './viewEnrollmentTrends';
import SearchForStudent from './searchForStudent';
import EditStudentInformation from './editStudentInformation';
import EditStudentInfo from './editStudentInfo';
import StudentHome from './studentHome';

function Home() {
  return (
    <>
      <Bar />
      <Container fluid="sm">
        <Button href="/import" block>Imports</Button>
        <Button href="/addStudent" block>Add Student</Button>
        <Form action="/deleteAll" method="post">
          <Button name="del" value="del" type="submit" block>Delete All data</Button>
        </Form>
        <Button href="/searchForStudent" block>Browse/search for students</Button>
        <Button href="/viewEnrollmentTrends" block>View Enrollment Trends</Button>
      </Container>
    </>
  );
}

// TODO remove values, user
export function Routes({ values, user }: { values?: any[], user?: any }): JSX.Element {
  return (
    <Switch>
      <Route path="/import">
        <Import />
      </Route>
      <Route path="/addStudent">
        <AddStudent />
      </Route>
      <Route path="/searchForStudent">
        <SearchForStudent values={values} />
      </Route>
      <Route path="/editStudentInformation">
        <EditStudentInformation user={user} />
      </Route>
      <Route path="/viewEnrollmentTrends">
        <ViewEnrollmentTrends />
      </Route>
      <Route path="/GPD_Home">
        <Home />
      </Route>
      <Route path="/Student_Home">
        <StudentHome user={user} />
      </Route>
      <Route path="/editStudentInfo">
        <EditStudentInfo user={user} />
      </Route>
      <Route>
        Missing
      </Route>
    </Switch>
  );
}

export function ServerApp(
  url: string, { values, user }: { values?: any[], user?: any },
): JSX.Element {
  return (
    <StaticRouter location={url}>
      <Routes values={values} user={user} />
    </StaticRouter>
  );
}
