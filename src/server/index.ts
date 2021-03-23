import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';

import { getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import Counter from './Counter';
import { User } from './models/users';

const html = ({ body }: { body: string }) => `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body style='margin:0'>
      <div id='app'>${body}</div>
    </body>
    <script src='js/client.js' defer></script>
  </html>
`;

const port = 3000;
const server = express();

server.use(express.static('dist'));

server.get('/', (req, res) => {
  const body = renderToString(React.createElement(Counter));
  res.send(
    html({
      body,
    }),
  );
});

// UserModel is a regular Mongoose Model with correct types
const UserModel = getModelForClass(User);

(async () => {
  await mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'test',
  });
  mongoose.connection.db.dropDatabase();

  const { _id: id } = await UserModel.create({ userName: 'asd', password: 'asd' })
  const r = await UserModel.findOne({ userName: 'asd' });
  console.log(r)
  if (r?.password === 'asd'){
    // Do login
  } else {
    // fail
  }

  server.listen(3000, () => console.log(`http://localhost:${port}/ !`));
})();
