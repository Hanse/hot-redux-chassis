const express = require('express');
const { v4: uuid } = require('uuid');

const router = new express.Router();

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin'
  }
];

const tokens = {};

router.get('/me', (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: 'Missing authorization header' });
  }

  const token = authorization.split(' ')[1];

  if (!tokens[token]) {
    return res.status(401).send({ error: 'Invalid token' });
  }

  const userId = tokens[token];
  const user = users.find(user => user.id === userId);

  return res.send({
    id: user.id,
    username: user.username
  });
});

router.post('/login', (req, res) => {
  const body = req.body;

  const user = users.find(
    user => user.username === body.username && user.password === body.password
  );

  if (!user) {
    return res.status(401).send({
      error: 'Invalid credentials'
    });
  }

  const token = uuid();
  tokens[token] = user.id;

  return res.send({
    token
  });
});

module.exports = router;
