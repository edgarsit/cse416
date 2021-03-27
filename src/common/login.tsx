import React from 'react';
import { Container } from 'react-bootstrap';

interface InputProps { type: string, autoComplete: string, name: string }
class Input extends React.Component<InputProps, { value: string }> {
  constructor(props: InputProps) {
    super(props);
    this.state = { value: '' };
  }

  render() {
    return (
      <input
        {...this.props}
        value={this.state.value}
        onChange={(e) => this.setState({ value: e.target.value })}
      />
    );
  }
}

export default class Login extends React.Component<{}, { error: string, loading: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { error: '', loading: false };
  }

  render() {
    const { error, loading } = this.state;
    // TODO
    return (
      <Container>
        <div className="login">
          <div>
            <a href="/auth/google" className="button">Sign in with Google</a>
          </div>
          Login
          <br />
          <form action="login" method="post">
            <div>
              Username
              <br />
              <Input type="text" autoComplete="new-password" name="username" />
            </div>
            <div style={{ marginTop: 10 }}>
              Password
              <br />
              <Input type="password" autoComplete="new-password" name="password" />
            </div>
            {error ?? (
              <>
                <small style={{ color: 'red' }}>{error}</small>
                <br />
              </>
            )}
            <br />
            <input type="submit" value={loading ? 'Loading...' : 'Login'} />
          </form>
        </div>
      </Container>
    );
  }
}
