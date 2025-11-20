const jsonServer = require('json-server');
const middleware = require('./middleware');

const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults({
  static: './public'
});

// Usar middleware personalizado
server.use(middleware);
server.use(middlewares);
server.use('/api', router);

module.exports = server;