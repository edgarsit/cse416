import React from 'react';
import ReactDOM from 'react-dom';
import EditCoursePlan from '../common/editCoursePlan';

declare global {
  interface Window {
    _v?: any;
  }
}

// TODO barrier to fix backs?
const v = window._v;
ReactDOM.hydrate((
  <EditCoursePlan {...v} />
), document.getElementById('app'));
