import React from "react";
import { Button, Form, FormControl, Nav, Navbar, NavDropdown } from "react-bootstrap";
import {
  StaticRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";

export default function App() {
  return <div></div>
  // return (
  //   <Router>
  //     {/* <Navbar bg="light" expand="lg">
  //       <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
  //       <Navbar.Toggle aria-controls="basic-navbar-nav" />
  //       <Navbar.Collapse id="basic-navbar-nav">
  //         <Nav className="mr-auto">
  //           <Nav.Link href="#home">Home</Nav.Link>
  //           <Nav.Link href="#link">Link</Nav.Link>
  //           <NavDropdown title="Dropdown" id="basic-nav-dropdown">
  //             <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
  //             <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
  //             <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
  //             <NavDropdown.Divider />
  //             <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
  //           </NavDropdown>
  //         </Nav>
  //         <Form inline>
  //           <FormControl type="text" placeholder="Search" className="mr-sm-2" />
  //           <Button variant="outline-success">Search</Button>
  //         </Form>
  //       </Navbar.Collapse>
  //     </Navbar> */}

  //     <Switch>
  //       <Route path="/about">
  //         <About />
  //       </Route>
  //       <Route path="/topics">
  //         <Topics />
  //       </Route>
  //       <Route path="/">
  //         <Home />
  //       </Route>
  //     </Switch>
  //   </Router >
  // );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Topics() {
  let match = useRouteMatch();

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
  let { topicId } = useParams<{ topicId: string }>();
  return <h3>Requested topic ID: {topicId}</h3>;
}
