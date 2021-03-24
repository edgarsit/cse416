import React from 'react';
import ReactDOM from 'react-dom';

import { Routes } from '../common/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.hydrate((
  <BrowserRouter>
    <Routes />
  </BrowserRouter>
), document.getElementById('app'));
