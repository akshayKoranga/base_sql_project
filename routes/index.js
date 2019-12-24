let express = require("express");

module.exports = () => {
  let router = express();
  let users = require("./users.js");

  // let config = require('../config');  // database connection
  router.use("/user", users());

  // this is commented code in feture branch
  return router;
};
