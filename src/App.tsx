import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import "./App.css"

export default function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/import">Import</Link>
          </li>
          <li>
            <Link to="/addStudent">Add Student</Link>
          </li>
        </ul>

        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/import">
            <Import />
          </Route>
          <Route path="/addStudent">
            <AddStudent />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

class Login extends React.Component<{}, { username?: string, password?: string }>  {
  constructor(props: any) {
    super(props);
    this.state = { username: '', password: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    const target = event.target;
    const value: string = target.value;
    const name: 'username' | 'password' = target.name;
    this.setState({
      [name]: value
    });
  }
  handleSubmit(event: any) {
    // TODO
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Username:
          <input name="username" type="text" value={this.state.username} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
        <br />
        <label>
          Password:
          <input name="password" type="password" value={this.state.password} onChange={this.handleChange} />
        </label>
      </form>
    );
  }
}

class Import extends React.Component<{}, { value?: string }>  {
  constructor(props: {}) {
    super(props);
    this.state = { value: '' };
    this.handleFile = this.handleFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFile(event: any) {
    // TODO
  }
  handleChange(event: any) {
    // TODO
    this.setState({ value: event.target.value });
  }
  handleSubmit(event: any) {
    // TODO
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="file" multiple onChange={this.handleFile} />
        <select onChange={this.handleChange}>
          <option value="51">5.1 scrape course information</option>
          <option value="52">5.2 import degree requirements</option>
          <option value="53">5.3 import course offerings</option>
          <option value="55">5.5 import student data</option>
          <option value="56">5.6 import grades</option>
        </select>
      </form>
    );
  }
}

class Student {
  sbuId: string = ''
  firstName: string = ''
  lastName: string = ''
  email: string = ''
  department: string = ''
  entryYear: string = ''
  requirementVersion: string = ''
  requirementVersionSemester: string = ''
  requirementVersionYear: string = ''
  graduationSemester: string = ''
  graduationYear: string = ''
  password: string = ''
}

class AddStudent extends React.Component<{}, Student> {
  constructor(props: {}) {
    super(props)
    this.handleChange = this.handleChange.bind(this);
    this.state = new Student();
  }

  handleChange() {

  }

  render() {
    const p = (s: string) => {
      console.log(s.match(/((?:^|[A-Z])[a-z]*)/g))
      return s.match(/((?:^|[A-Z])[a-z]*)/g)?.join(' ') + ": "
    };
    const k = Object.entries(this.state).map(([k, v]) => (
      <li>
        <label>
          {p(k)}
          <input name={k} type="text" value={v} onChange={this.handleChange} />
        </label>
      </li>)
    );
    return (
      <form>
        {k}
      </form>
    )
  }
}
