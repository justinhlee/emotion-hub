var express = require('express');
var app = express();
var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');

var emotions = ['anger', 'anticipation', 'disgust', 'fear'
              , 'joy', 'negative', 'positive', 'sadness'
              , 'surprise', 'trust']

function writeInput(query, callback) {
  fs.writeFile('input.txt', query, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log('The file was saved!');
    callback(null);
  }); 
}

function convertFormat(callback) {
  exec('python formatter.py input.txt', function(error, stdout, stderr) {
    console.log('Query: ' + stdout);
    if (error !== null) {
      return callback(error);
      console.log('exec error: ' + error);
    }
    callback(null);
  });
}

function predict(callback) {
  var svmPredict = 'libsvm/svm-predict';
  var output = 'output/output';
  var input = 'input.t';
  var trainingModel = 'libsvm/training/training'; // prefix
  var count = 0;
  for (var i = 0; i < 10; i++) {
    exec('./' + svmPredict + ' -b 1 ' + input + ' ' + trainingModel + i + '.model'
      + ' ' + output + i, function(error, stdout, stderr) 
    {
      console.log('stdout: ' + stdout);
      // Keeping track of which models finished
      count += 1;
      console.log('Count: ' + count)

      if (count == 10) {
        callback(null);
      }
      if (error !== null) {
        return callback(error);
        console.log('exec error: ' + error);
      }
    });
  }
}

function readOutput(callback) {
  var count = 0;
  var response = '';
  for (var i = 0; i < 10; i++) {
    var fileName = 'output/output' + i;
    var contents = fs.readFileSync(fileName,'utf8');
    var lines = contents.split('\n');
    var percentages = lines[1].split(' ');
    count += 1;
    if (count == 10) {
      response += emotions[i] + '=' + percentages[1];
      console.log(response);
      callback(null, response);
    } else {
      response += emotions[i] + '=' + percentages[1] + '&';
    }
  }
}

app.get('/', function (req, res) {
  var query = req.query.query;
  if (query !== undefined) {
    async.series([
      function(callback) {
        writeInput(query, callback);
      },
      function(callback) {
        convertFormat(callback);
      },
      function(callback) {
        predict(callback);
      }, 
      function(callback) {
        console.log('reading output now');
        readOutput(callback);
      }
    ],
    function(err, results) {
      var output = '';
      /*
      percentages = results[3].split('&');
      for (var i = 0; i < percentages.length; i++) {
        var line = percentages[i].split('=');
        output += line[0] + ': ' + line[1] + '<br>';
      }
      */
      res.send(query + '<br><br>' + output);
    }
    );
  }


  
});

var server = app.listen(3000, function () {
  //var host = server.address().address;
  var host = '45.55.241.129';
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});