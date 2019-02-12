const express = require('express');
const mongoose = require('mongoose');

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

if (process.env.NODE_ENV === 'production') { 
  app.use(express.static('client/build'));
}

app.use(routes);


app.listen(PORT);
