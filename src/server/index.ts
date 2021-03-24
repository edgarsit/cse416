import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';

import { getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import App from '../common/app';
// import { User } from './models';

const html = ({ body }: { body: string }) => `
  <!DOCTYPE html>
  <html>
    <head>
    <script src="https://apis.google.com/js/platform.js" async defer></script>
    <script>
    function onSignIn(googleUser) {
      console.log(googleUser)
      var profile = googleUser.getBasicProfile();
      console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
      console.log('Name: ' + profile.getName());
      console.log('Image URL: ' + profile.getImageUrl());
      console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    }
    </script>
    <meta name="google-signin-client_id" content="22365015952-9kp5umlqtu97p4q36cigscetnl7dn3be.apps.googleusercontent.com">
    </head>
    <body style='margin:0'>
      <div class="g-signin2" data-onsuccess="onSignIn"></div>
      <div id='app'>${body}</div>
    </body>
    <script src='public/client.js' defer></script>
  </html>
`;

const port = 3000;
const server = express();

server.use(express.static('build'));

server.get('*', (req, res) => {
  const body = renderToString(React.createElement(App));
  res.send(
    html({
      body,
    }),
  );
});

// UserModel is a regular Mongoose Model with correct types
// const UserModel = getModelForClass(User);

(async () => {
  await mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'cse416',
  });
  mongoose.connection.db.dropDatabase();

  // const { _id: id } = await UserModel.create({ userName: 'asd', password: 'asd' });
  // const userName = 'asd';
  // const password = 'asd'
  // const r = await UserModel.findOne({ userName });
  // console.log(r);
  // if (r?.password === password) {
  //   // Do login
  // } else {
  //   // fail
  // }

  server.listen(3000, () => console.log(`http://localhost:${port}/ !`));
})();
