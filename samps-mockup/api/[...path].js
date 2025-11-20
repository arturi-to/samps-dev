const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../backend/db.json'));
const middlewares = jsonServer.defaults();

// CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

server.use(middlewares);
server.use(router);

module.exports = (req, res) => {
  server(req, res);
};