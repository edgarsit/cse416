import React from 'react';
import ReactDOM from 'react-dom';
import Login from '../common/login';

ReactDOM.hydrate((
  <Login flash={window._v.flash} />
), document.getElementById('app'));
