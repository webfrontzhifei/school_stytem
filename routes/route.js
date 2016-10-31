var express = require('express');
var router = express.Router();

var userRoute = require('../app/routes/user.common.route.js');
var newsRoute = require('../app/routes/news.common.route.js');
var busRoute = require('../app/routes/bus.common.route.js');

router.use(userRoute);
router.use(newsRoute);
router.use(busRoute);

module.exports = router;
