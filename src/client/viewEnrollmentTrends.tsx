import React from 'react';
import ReactDOM from 'react-dom';
import ViewEnrollmentTrends from '../common/viewEnrollmentTrends';

declare global {
  interface Window {
    _v?: any;
  }
}

// TODO barrier to fix backs?
const v = window._v;
ReactDOM.hydrate((
  <ViewEnrollmentTrends {...v} />
), document.getElementById('app'));
