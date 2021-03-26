import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { Routes } from '../common/app';

declare global {
  interface Window {
    _v?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

const v = window._v;
ReactDOM.hydrate((
  <BrowserRouter>
    <Routes {...v} />
  </BrowserRouter>
), document.getElementById('app'));
