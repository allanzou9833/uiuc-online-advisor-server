module.exports = function (app, router) {
  app.use(require('./class')(router));
  app.use(require('./schedule')(router));
  app.use(require('./auth')(router));
  app.use(require('./user')(router));
  app.use(require('./recommend')(router));
};