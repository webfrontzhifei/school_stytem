var express = require('express');
var router = express.Router();

var userRoute = require('../app/routes/user.common.route.js');
var newsRoute = require('../app/routes/news.common.route.js');
var busRoute = require('../app/routes/bus.common.route.js');
var expressRoute = require('../app/routes/express.common.route.js');
var carpoolRoute = require('../app/routes/carpool.common.route.js');
var booksRoute = require('../app/routes/books.common.route.js');

router.use(userRoute);
router.use(newsRoute);
router.use(busRoute);
router.use(expressRoute);
router.use(carpoolRoute);
router.use(booksRoute);

module.exports = router;
