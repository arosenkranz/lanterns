// set up server shiz
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('./utils/middleware/passport-auth');

const routes = require('./routes');

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

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

app.use(routes);

// Connect to the Mongo DB
mongoose.connect('mongodb://localhost/lanterns', { useNewUrlParser: true });

http.listen(PORT, () => console.log(`connected on http://localhost:${PORT}`));
