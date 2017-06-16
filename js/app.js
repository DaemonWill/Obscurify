/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = process.argv[2];
var client_secret = process.argv[3];
var redirect_uri = 'http://obscurifymusic.com/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname ))
   .use(cookieParser())
   .use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read user-read-birthdate playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/logout', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read user-read-birthdate playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog : true
    }));
});

app.get('/help', function(req, res) {
  res.redirect('/#/help');
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        res.redirect('/#/home/' + access_token);
        // we can also pass the token to the browser to make requests from there
        // res.redirect('/#' +
        //   querystring.stringify({
        //     access_token: access_token
        //     refresh_token: refresh_token
        //   }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.post('/postData',function(req,res){
    var obscurify_score = req.query.obscurify_score;
    var top_artist = req.query.top_artist;
    var user_country = req.query.user_country;
    var user_id = req.query.user_id;
    var happiness = req.query.happiness;
    var acousticness = req.query.acousticness;
    var energy = req.query.energy;
    var danceability = req.query.danceability;

    var options = {
      url: 'http://obscurifymusic.com/php/postData.php',
      method: 'POST',
      form: {'user_id': user_id,
            'user_country' : user_country,
            'top_artist' : top_artist,
            'obscurify_score': obscurify_score,
           'happiness' : happiness,
           'energy' : energy,
           'acousticness' : acousticness,
           'danceability' : danceability
      }
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(response);
        } else{
          res.send(response);
        }
    });

});

app.post('/getData',function(req,res){

    var options = {
      url: 'http://obscurifymusic.com/php/getData.php',
      method: 'POST'
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(response);
        } else{
          res.send(response);
        }
    });

});

app.get('/getScores',function(req,res){
    var options = {
      url: 'http://obscurifymusic.com/php/getScores.php',
      method: 'GET'
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            res.send(response);
        } else{
          res.send(response);
        }
    });

});

app.get('/getTopArtists',function(req,res){
    var options = {
      url: 'http://obscurifymusic.com/php/getTopArtists.php',
      method: 'GET'
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            res.send(response);
        } else{
          res.send(response);
        }
    });

});

app.get('/getCountryUserCounts',function(req,res){
    var options = {
      url: 'http://obscurifymusic.com/php/getCountryUserCounts.php',
      method: 'GET'
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            res.send(response);
        } else{
          res.send(response);
        }
    });

});

app.post('/getHistory',function(req,res){
    var user_id = req.query.user_id;
    var options = {
      url: 'http://obscurifymusic.com/php/getHistory.php',
      method: 'POST',
      form: {
        'user_id': user_id
      }
    }
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            res.send(response);
        } else{
          res.send(response);
        }
    });
});

app.post('/postHistory',function(req,res){
    var user_id = req.query.user_id;
    var start_month = req.query.start_month;
    var end_month = req.query.end_month;
    var artist_ids = req.query.artist_ids;
    var track_ids = req.query.track_ids;
    var year = req.query.year;
    var options = {
      url: 'http://obscurifymusic.com/php/postHistory.php',
      method: 'POST',
      form: {'user_id': user_id,
            'artist_ids' : artist_ids,
            'track_ids' : track_ids,
            'start_month': start_month,
            'end_month' : end_month,
            'year' : year
      }
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(response);
        } else{
          res.send(response);
        }
    });
});

console.log('Listening on 3000');
app.listen(3000, '0.0.0.0');
