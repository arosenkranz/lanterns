// set up server shiz
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('./utils/middleware/passport-auth');
require('dotenv').config();

const routes = require('./routes');

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

// set socket to be available with every request
app.set('socketio', io);

// config express-session
const sess = {
  secret: 'CHANGE THIS SECRET',
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

if (app.get('env') === 'production') {
  sess.cookie.secure = true; // serve secure cookies, requires https
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

// turn on routes and sockets
app.use(routes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build'));
});
require('./utils/sockets')(io);

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// turn on server
http.listen(PORT, () => console.log(`connected on http://localhost:${PORT}`));
