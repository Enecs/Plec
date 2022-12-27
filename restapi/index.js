const express = require('express');

module.exports = class RestAPI {
  constructor(client) {
    this.client = client;

    // Web Server
    this.express = express();
    this.express.use(async (req,res,next) => { 
      req.client = client; 
      req.config = client.config; 
      next(); 
    })
    this.express.disable('x-powered-by');

    this.loadRoutes().loadErrorHandler();
  }

  listen(port) {
    var server = this.express.listen(port);
    return server;
  }

  loadRoutes() {
    this.express.use("/auth", require(`./auth/index.js`));
    return this;
  }

  loadErrorHandler() {
    this.express.use((error, _req, res, _next) => {
      const { message, statusCode = 500 } = error;
      if (statusCode >= 500) console.error(error);
      
      if(_req.accepts("json")) res.status(statusCode).send({ message, status: statusCode });
      res.type("txt").send(`${statusCode} - ${message}`);
    });

    this.express.use((_req, res, _next) => {
      if(_req.accepts("json")) return res.send({ status: 404, error: "Not found" });
      res.type("txt").send("404 - Not found");
    });

    return this;
  }
}