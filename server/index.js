const config = require('./config.json');
const cors = require('cors');
const { username, password } = config;

const { Pool, Client } = require('pg');

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cheerio = require('cheerio');

// allow cookies
const request = require('request').defaults({ jar: true });

const PORT = process.env.PORT || 8080;

const app = express();
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// initial authentication process
request.get('https://www.tu-chemnitz.de/informatik/DVS/blocklist', function (error, response, body) {
const wtc_login_url =  response.request._redirect.redirects[0].redirectUri;
const login_samlds_auth = decodeURIComponent(wtc_login_url).split("Login?")[1];
let href_url = "";

request.get("https://www.tu-chemnitz.de/Shibboleth.sso/Login?" + login_samlds_auth + decodeURIComponent("&entityID=https%3A%2F%2Fwtc.tu-chemnitz.de%2Fshibboleth"), function(error, response, body) {
const get_href_step_one = body.split("href=")[1];
  href_url = get_href_step_one.split(">here")[0].substring(1).slice(0, -1);
  request.get(href_url, function(error, response, body) {
    const login_url = response.request.uri.href;
    const authState = href_url.split("AuthState=")[1];
    request.post(login_url, {
      form: {
        username: username,
        AuthState: decodeURIComponent(authState)
      }}, 
      function (error, response, body) {
        request.post(login_url.replace("TUC/username.php", "core/loginuserpass.php"), {
          form: {
            username: username,
            password: password,
            AuthState: decodeURIComponent(authState)
          }
        }, 
        function (error, response, body) {
          const $ = cheerio.load(body);
          $.html();
          const saml_value = $('input')[1].attribs.value;
          const relay_state = $('input')[2].attribs.value;
          request.post("https://www.tu-chemnitz.de/Shibboleth.sso/SAML2/POST", {
            form: {
              SAMLResponse: saml_value,
              RelayState: relay_state
            }
          }, function (error, response, body) {
            console.log('Successfully authenticated!');
          })
        })
      })
    })
  })
})

app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}));

const connString = "postgres://dbw_project_db_rw:Ieh2ishe4@pgsql.hrz.tu-chemnitz.de/dbw_project_db";

const client = new Client(connString);
console.log(client);
client.connect();
client.query('SELECT * FROM files', (err, res) => {
  console.log(res);
  client.end();
})

app.post('/uploadFile', (req, res) => {
  file = req.files.file;
  console.log(file);
  res.json({message : "hello from express!"});
});

app.post('/uploadFiles', (req, res) => {

});

app.get('/downloadFile', (req, res) => {

});

app.get('/getFileInformation', (req, res) => {

});

app.post('/makeRequest', (req, res) => {

});

app.post('/processRequest', (req, res) => {

});