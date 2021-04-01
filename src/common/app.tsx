import React from 'react';
import {
  Button, Container, Form,
} from 'react-bootstrap';
import { StaticRouter, Switch, Route } from 'react-router-dom';

import AddStudent from './addStudent';
import Imports from './imports';
import { Bar } from './util';
import ViewEnrollmentTrends from './viewEnrollmentTrends';
import SearchForStudent from './searchForStudent';
import EditStudentInformation from './editStudentInformation';
import Login from './login';

function Home() {
  return (
    <>
      <Bar />
      <Container fluid="sm">
        <Button className="my-3" href="/imports" block>Imports</Button>
        <Button className="my-3" href="/addStudent" block>Add Student</Button>
        <Form action="/deleteAll" method="post">
          <Button className="my-3" name="del" value="del" type="submit" block>Delete All data</Button>
        </Form>
        <Button className="my-3" href="/searchForStudent" block>Browse/search for students</Button>
        <Button className="my-3" href="/viewEnrollmentTrends" block>View Enrollment Trends</Button>
      </Container>
    </>
  );
}

export function Routes({ values, user }: { values?: any[], user?: any }) {
  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/imports">
        <Imports />
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
      <Route path="/">
        <Home />
      </Route>
      <Route>
        Missing
      </Route>
    </Switch>
  );
}

export function ServerApp(url: string, { values, user }: { values?: any[], user?: any }) {
  return (
    <StaticRouter location={url}>
      <Routes values={values} user={user} />
    </StaticRouter>
  );
}
