const express = require("express");
const router = express.Router();

require("./heartbeat")(router);

module.exports = router;
