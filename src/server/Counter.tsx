import React from 'react';

interface CounterProps {}

interface CounterState {
  counter: number;
}

class Counter extends React.Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = { counter: 0 };
  }

  incrementCounter() {
    this.setState(prevState => ({counter: prevState.counter + 1}));
  }

  render() {
    return (
      <div>
        <h1>
          counter at:
          {this.state.counter}
        </h1>
        <button type='button' onClick={() => this.incrementCounter()} />
      </div>
    );
  }
}

export default Counter;
