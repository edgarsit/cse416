import React from 'react';
import {
  Button, Container, Form,
} from 'react-bootstrap';
import {
  StaticRouter,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from 'react-router-dom';

import AddStudent from './addStudent';
import Imports from './imports';
import Bar from './bar';
import ViewEnrollmentTrends from './viewEnrollmentTrends';
import SearchForStudent from './searchForStudent';

export function ServerApp(url: string) {
  return (
    <StaticRouter location={url}>
      <Routes />
    </StaticRouter>
  );
}
export function ServerSearchForStudent(url: string, { values }: { values: any[][] }) {
  return (
    <StaticRouter location={url}>
      <Routes values={values} />
    </StaticRouter>
  );
}

export function Routes({ values }: { values?: any[][] }) {
  return (
    <Switch>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/topics">
        <Topics />
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
      <Route path="/viewEnrollmentTrends">
        <ViewEnrollmentTrends />
      </Route>
      <Route path="/GPD_Home">
        <GPD_Home />
      </Route>
    </Switch>
  );
}

function GPD_Home() {
  return (
    <div>
      <Bar />
      <Container fluid="sm">
        <Button className="my-3" href="/imports" block>Imports</Button>
        <Button className="my-3" href="/addStudent" block>Add Student</Button>
        <Form action="deleteAll" method="post">
          <Button className="my-3" name="del" value="del" type="submit" block>Delete All data</Button>
        </Form>
        <Button className="my-3" href="/searchForStudent" block>Browse/search for students</Button>
        <Button className="my-3" href="/viewEnrollmentTrends" block>View Enrollment Trends</Button>
      </Container>
    </div>
  );
}

function About() {
  return <h2>About</h2>;
}

function Topics() {
  const match = useRouteMatch();

  return (
    <div>
      <h2>Topics</h2>

      <ul>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>
            Props v. State
          </Link>
        </li>
      </ul>

      {/* The Topics page has its own <Switch> with more routes
          that build on the /topics URL path. You can think of the
          2nd <Route> here as an "index" page for all topics, or
          the page that is shown when no topic is selected */}
      <Switch>
        <Route path={`${match.path}/:topicId`}>
          <Topic />
        </Route>
        <Route path={match.path}>
          <h3>Please select a topic.</h3>
        </Route>
      </Switch>
    </div>
  );
}

function Topic() {
  const { topicId } = useParams<{ topicId: string }>();
  return (
    <h3>
      Requested topic ID:
      {topicId}
    </h3>
  );
}