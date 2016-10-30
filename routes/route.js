var express = require('express');
var router = express.Router();

var userRoute = require('../app/routes/user.common.route.js');
var newsRoute = require('../app/routes/news.common.route.js');


router.use(userRoute);
router.use(newsRoute);

module.exports = router;
