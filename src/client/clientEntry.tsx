import React from 'react';
import ReactDOM from 'react-dom';

import App from '../common/app';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.hydrate(<App />, document.getElementById('app'));
