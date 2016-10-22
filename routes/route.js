var express = require('express');
var router = express.Router();

var userRoute = require('../app/routes/user.common.route.js');


router.use(userRoute);

module.exports = router;
