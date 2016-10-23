var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var template = require('./app/lib/template');
var config = require('./config');
var setting = require('./setting');

// var $ = require('jquery');

template.config('base', '');
template.config('extname', '.html');

var index = require('./routes/index');
var routes = require('./routes/route');

// var login = require('./app/routes/user.common.route');

var app = express();
app.locals = config;
app.engine('.html',template.__express);
app.set('view engine', 'html');
// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
// app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'dist', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: setting.cookieSecret,
  name: setting.key,
  resave: false,
  saveUninitialized: true
}));

app.use('/static_proxy', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'dist')));
app.use('/', index);
app.use(routes);
// app.use('/login', login);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
