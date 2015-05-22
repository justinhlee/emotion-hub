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
    callback();
  }); 
}

function convertFormat(callback) {
  exec('python formatter.py input.txt', function(error, stdout, stderr) {
    console.log('Query: ' + stdout);
    if (error !== null) {
      return callback(error);
      console.log('exec error: ' + error);
    }
    callback();
  });
}

function predict(callback) {
  var svmPredict = 'libsvm-3.20/svm-predict';
  var output = 'output/output';
  var input = 'input.t';
  var trainingModel = 'libsvm-3.20/training'; // prefix
  console.log('hi trying to predict');
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
        callback();
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
  for (var i = 0; i < 10; i++) {
    var fileName = 'output/output' + i;
    var contents = fs.readFileSync(fileName,'utf8');
    var lines = contents.split('\n');
    var percentages = lines[1].split(' ');
    console.log(emotions[i] + ': ' + percentages[1]);
    count += 1;
    if (count == 10) {
      callback();
    }
  }
}

app.get('/', function (req, res) {
  var query = req.query.query;
  
  if (query !== undefined) {
    async.series([
      function(callback) {
        console.log('FIRST TASK: Saving query to file');
        writeInput(query, callback);
      },
      function(callback) {
        console.log('SECOND TASK: Converting to LIBSVM');
        convertFormat(callback);
      },
      function(callback) {
        console.log('THIRD TASK: Running LIBSVM Predictions');
        predict(callback);
      }, 
      function(callback) {
        console.log('FOURTH TASK: Ready to start reading prediction percentages');
        readOutput(callback);
      }
    ]);
  }

  res.send(query);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});