import React from 'react';
import ReactDOM from 'react-dom';
import Login from '../common/login';

ReactDOM.hydrate((
  <Login />
), document.getElementById('app'));
