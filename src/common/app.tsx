import React from 'react';
import {
  Button, Container, Form, FormControl, Nav, Navbar, NavDropdown, Row,
} from 'react-bootstrap';
import {
  StaticRouter,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from 'react-router-dom';

import AddStudent from './addstudent';
import Imports from './imports';
import Login from './login';
import Bar from './bar';
import SearchForStudent from './searchforstudent';
import ViewEnrollmentTrends from './viewenrollmenttrends';

export function ServerApp(url: string) {
  return (
    <StaticRouter location={url}>
      <Routes />
    </StaticRouter>
  );
}

export class Routes extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/topics">
          <Topics />
        </Route>
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
          <SearchForStudent />
        </Route>
        <Route path="/viewEnrollmentTrends">
          <ViewEnrollmentTrends />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    );
  }
}

function Home() {
  return (
    <div>
      <Bar />
      <Container fluid='sm'>
        <Button className='my-3' href='/imports' block>Imports</Button>
        <Button className='my-3' href='/addStudent' block>Add Student</Button>
        <Button className='my-3' href='/deleteAll' block>Delete All data</Button>
        <Button className='my-3' href='/searchForStudent' block>Browse/search for students</Button>
        <Button className='my-3' href='/viewEnrollmentTrends' block>View Enrollment Trends</Button>
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
