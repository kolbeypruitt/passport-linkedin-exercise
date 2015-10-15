var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var routes = require('./routes/index');
var users = require('./routes/users');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session')
var passport = require('passport');
// var authRoutes = require('./routes/auth');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

require('dotenv').load();
var app = express();




// above app.use('/', routes);...


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
  name: 'session',
  keys: [
  process.env.SESSION_KEY1,
  process.env.SESSION_KEY2,
  process.env.SESSION_KEY3,
  ]
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_KEY,
  clientSecret: process.env.LINKEDIN_SECRET,
  callbackURL: process.env.HOST + "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
},
  function(accessToken, refreshToken, profile, done) {
    done(null, {id: profile.id, displayName: profile.displayName})
    console.log(profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});

// right above app.use('/', routes);
app.use(function (req, res, next) {
  // console.log(res.locals);
  res.locals.user = req.user
  next()
})

app.use('/', routes);
app.use('/users', users);

app.get('/auth/linkedin', passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


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
