import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes } from '../common/app';

declare global {
  interface Window {
    _v?: any;
  }
}

const { values = undefined } = window._v ?? {};
ReactDOM.hydrate((
  <BrowserRouter>
    <Routes values={values} />
  </BrowserRouter>
), document.getElementById('app'));
