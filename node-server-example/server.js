const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const config = require('./config')
const VoiceIt3WebSDK = require('../voiceit-node-websdk')
// const  = require('../voiceit-node-websdk/tokenGenerator')
const app = express();
const port = 3000
let test = '';

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'supersecretsessionkey',
  resave: false,
  saveUninitialized: true,
}));

app.use('/favicon.ico', express.static('public/images/favicon.ico'));


// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing multipart/form-data
const multer = require('multer')()

app.post('/example_endpoint', multer.any(), function (req, res) {
  console.log('/example_endpoint');
  //the token comes in from the fron end in the request body
    const myVoiceIt = new VoiceIt3WebSDK.Voiceit3(config.VOICEIT_API_KEY, config.VOICEIT_API_TOKEN, {sessionExpirationTimeHours:config.SESSION_EXPIRATION_TIME_HOURS});
    myVoiceIt.makeCall(req, res, function(jsonObj){
      if (
          (jsonObj.callType.includes('Liveness') && jsonObj.jsonResponse.success) || // Liveness Server returns success true/false instead of responseCode
          (!jsonObj.callType.includes('Liveness') && jsonObj.jsonResponse.responseCode === 'SUCC')
      ) {
        // Activate Session with userId
        req.session.userId = jsonObj.userId;
      }
    });
});

app.use(multer.array());
// serve all static files in public directory
app.use(express.static('public'));

app.post('/login', function (req, res) {
  if(req.body.email === config.DEMO_EMAIL && req.body.password === config.DEMO_PASSWORD){
    let generatedToken = '';
    const userId = config.VOICEIT_TEST_USER_ID;
    if (userId.substring(0,4) === 'usr_'){
      //use the token generator to generate a token passed to the client
      generatedToken = VoiceIt3WebSDK.generateTokenForUser({
          userId: config.VOICEIT_TEST_USER_ID,
          token: config.VOICEIT_API_TOKEN,
          sessionExpirationTimeHours: config.SESSION_EXPIRATION_TIME_HOURS
        });
    }
    res.json({
      'responseCode': 'SUCC',
      'message' : 'Successfully authenticated user',
      'token' : generatedToken
    });
  } else if (req.body.password !== config.DEMO_PASSWORD){
    res.json({
      'responseCode': 'INPW',
      'message' : 'Incorrect Password'
    });
  } else {
    res.json({
      'responseCode': 'UNFD',
      'message' : 'User not found. Please make sure you entered the right userId and API credentials in config.js'
    });
  }
});

app.get('/logout', function (req, res) {
  req.session.destroy(function(err) {
  if(err) {
    console.log(err);
  } else {
    res.redirect('/');
  }
  });
});

app.get('/console', function (req, res) {
  if(req.session.userId){
    res.render('console.html');
  } else {
    res.redirect('/');
  }
})


app.get('/content_language', function (req, res) {
  res.json({contentLanguage: config.CONTENT_LANGUAGE});
});

app.listen(port, () => console.log(`Node Example Server running on port ${port}`))
