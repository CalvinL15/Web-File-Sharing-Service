const config = require('./config.json');
const { username, password } = config;

const express = require('express');
const cheerio = require('cheerio');
let request = require('request');
request = request.defaults({jar: true});

const PORT = process.env.PORT || 3001;

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
          const redirect_url = response.body.split("href=")[1].split("\">")[0].substring(1);
          request.get(redirect_url, function (error, response, body){
            request.post(response.request._redirect.redirects[0].redirectUri, {
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
          }
        )
      }
    );
  });
  });
});

