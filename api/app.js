require('dotenv').config();

const express 		= require('express'),
      router      = express.Router(),
      app					= express(),
      bodyParser 	= require('body-parser'),
      // Passport 		= require('passport'),
      passport 		= require('./passport');

const port = process.env.PORT || 5000;

const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
}
app.use(allowCrossDomain);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(passport.initialize());

require('./routes')(app, router);

app.listen(port, _ => console.log(`Server running on port ${port}`));