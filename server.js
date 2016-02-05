var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var data_file = path.join(__dirname, 'data.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


app.get('/api/apartments', function(req, res) {
	fs.readFile(data_file, function(err, data) {
		if (err) {
		  console.error(err);
		  process.exit(1);
		}
		res.json(JSON.parse(data).apartments);
	});
});

app.get('/api/payments', function(req, res) {
  fs.readFile(data_file, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data).payments);
  });
});

app.post('/api/make_payment', function(req, res) {
  fs.readFile(data_file, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
//	console.log('Make payment req:', req);
//	console.log('Loaded data:', data);
    dataObj = JSON.parse(data);
    var newPayment = {
      time: Date.now(),
      amount: req.body.amount,
      number: req.body.number,
    };
	if(!dataObj.apartments[req.body.number]) {
		return res.json({result: 'fail', reason: 'Ap ' + req.body.number + ' not found'});
	}
    dataObj.payments.push(newPayment);
	var bal = Number(dataObj.apartments[req.body.number].balance);
	dataObj.apartments[req.body.number].balance = bal + Number(req.body.amount);
    fs.writeFile(data_file, JSON.stringify(dataObj, null, '\t'), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json({result: 'ok'});
    });
  });
});

app.post('/api/modify_apartment', function(req, res) {
  fs.readFile(data_file, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
	console.log('Make payment req body:', req.body);
//	console.log('Loaded data:', data);
    dataObj = JSON.parse(data);
    var newApartment = {
		name: req.body.name,
		number: req.body.number,
		balanse: Number(req.body.initial_balanse),
		debt: 0
		// TODO add block
    };
	dataObj.apartments[newApartment.number] = newApartment;
    fs.writeFile(data_file, JSON.stringify(dataObj, null, '\t'), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json({result: 'ok'});
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
