// set up server shiz
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const mongoose = require('mongoose');

const routes = require('./routes');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

if (process.env.NODE_ENV === 'production') { 
  app.use(express.static('client/build'));
}

app.use(routes);


http.listen(PORT, () => console.log(`connected on http://localhost:${PORT}`));
