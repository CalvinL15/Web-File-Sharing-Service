const config = require('./config.json');
const cors = require('cors');
const { username, password, PORT } = config;
const { Blob } = require("buffer");

const { Pool, Client } = require('pg');

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cheerio = require('cheerio');

// allow cookies
const request = require('request').defaults({ jar: true });

const app = express();
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const blocklistURL = 'https://www.tu-chemnitz.de/informatik/DVS/blocklist';

// initial authentication process
request.get(blocklistURL, function (error, response, body) {
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
            request.get(blocklistURL + "/" + "8f0737d5395aef2796637c95f1a195057b020841a0cbe9848d87f2d3b6897e22", function (error, response, body) {
              console.log(response.statusCode);
            });
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
const crypto = require("crypto");

const client = new Client(connString);
client.connect();



app.post('/uploadFile', (req, res) => {
  const file = req.files.file;
  const hash = crypto.createHash('sha256');
  const fileHash = hash.update(file.data).digest('hex');
  let bool = false;
  request.get(blocklistURL + "/" + fileHash, function (error, response, body){
    if (response.statusCode == 210){
      bool = true;
    }
    client.query(`DELETE FROM files WHERE "file_id" = '${fileHash}'`);
    client.query(`INSERT INTO files ("file_id", "file_name", "file_size", "file_data", "file_type", "is_file_blocked")
    VALUES ('${fileHash}', '${file.name}', ${file.size}, '${['\\x' + file.data.toString('hex')]}', '${file.mimetype}', ${bool})`, (err, r) => {
      if (err !== null) {
        res.status(500).json({ errMsg: 'Internal server error!' });
        return;
      }
      res.status(201).json({ hashValue : fileHash, fileName: file.name });
    });
  });
});

app.post('/uploadFiles', (req, res) => {
  const files = req.files;
  const numOfFiles = Object.keys(files).length;
  let cnt = 0;
  const retVal = [];
  for (const [k, v] of Object.entries(files)) {
    const hash = crypto.createHash('sha256');
    const fileHash = hash.update(v.data).digest('hex');
    let bool = false;
    request.get(blocklistURL + "/" + fileHash, function (error, response, body) {
      cnt++;
      if (response.statusCode == 210) {
        bool = true;
      }
      client.query(`DELETE FROM files WHERE "file_id" = '${fileHash}'`, (err, r) => {
        if(err !== null) {
          res.status(500).json({ errMsg: 'Internal server error!' });
          return;
        }
      });
      client.query(`INSERT INTO files ("file_id", "file_name", "file_size", "file_data", "file_type", "is_file_blocked")
      VALUES ('${fileHash}', '${v.name}', ${v.size}, '${['\\x' + v.data.toString('hex')]}', '${v.mimetype}', ${bool})`, (err, r) => {
        if(err !== null) {
          res.status(500).json({ errMsg: 'Internal server error!' });
          return;
        }
      });
      retVal.push({ hashValue: fileHash, fileName: v.name });
      if(cnt === numOfFiles){
        res.status(201).json(retVal);
      }
    });
  }
});

app.put('/updateLastDownloadDate/:id', (req, res) => {
  client.query(`UPDATE files SET "last_download_time" = '${ req.body.downloadTime }' WHERE "file_id" = '${req.params.id}'`,
  (err, r) => {
    if (err === null ){
      res.status(200).json({});
    } else {
      res.status(500).json({ errMsg: 'Internal server error!' });
      return;
    }
  });
});

app.get('/getFileInfo/:id', (req, res) => {
  let data;
  request.get(blocklistURL + "/" + req.params.id, function(error, response, body){
    const statusCode = response.statusCode;
    client.query(`SELECT * FROM files WHERE "file_id" = '${req.params.id}'`, (err, r) => {
      data = r.rows[0];
      if (!data) {
        res.json({ invalidId: true });
        return;  
      }
      if (!data.is_file_blocked && (statusCode === 210 || statusCode === 201)) {
        data.is_file_blocked = true;
        client.query(`UPDATE files SET "is_file_blocked" = ${true} WHERE "file_id" = '${req.params.id}'`, (err, r) => {
          if(err !== null){
            res.status(500).json({ errMsg: 'Internal server error!' });
            return;
          }
        });
      } else if (data.is_file_blocked && (statusCode === 200 || statusCode === 204)) {
        data.is_file_blocked = false;
        client.query(`UPDATE files SET "is_file_blocked" = ${false} WHERE "file_id" = '${req.params.id}'`, (err, r) => {
          if(err !== null){
            res.status(500).json({ errMsg: 'Internal server error!' });
            return;
          }
        });
      }
      res.status(200).json(data);
    });
  });
});

app.post('/createRequest', (req, res) => {
  const { fileId, fileName, requestType, reason } = req.body;
  client.query(`INSERT INTO requests ("request_id", "file_id", "file_name", "request_reason", "request_type") VALUES
  ('${crypto.randomUUID()}', '${fileId}', '${fileName}', '${reason}', '${parseInt(requestType)}')`, (err, r) => {
    if (err !== null){
      res.status(500).json({ errMsg: 'Internal server error!' });
      return;
    }
    res.status(201).json({ successMsg: 'Request created successfully!' });
  })
});

app.get('/getAllRequests', (req, res) => {
 client.query(`SELECT * FROM requests WHERE "request_status" = 'Pending'`, (err, r) => {
   if (err !== null){
    res.status(500).json({ errMsg: 'Internal server error!' });
    return;
   }
   data = r.rows;
   res.status(200).json(data);
 })
})

app.post('/processRequest/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  const { requestType, decision, fileId } = req.body;
  if (decision === 'acc' && parseInt(requestType) === 0) {
    console.log(fileId);
    request.put(blocklistURL + "/" + fileId,  function (error, response, body) {
      console.log(response.statusCode);
      if(response.statusCode === 201) {
        client.query(`UPDATE files SET "is_file_blocked" = ${true} WHERE "file_id" = '${fileId}'`, (err, r) => {
          if (err !== null) {
            res.status(500).json({ errMsg: 'Internal server error!' });
            return;
          }
        });
      }
      client.query(`UPDATE requests SET "request_status" = 'Accepted' WHERE "request_id" = '${req.params.id}'`, (err, r) => {
        if (err !== null) {
          res.status(500).json({ errMsg: 'Internal server error!' });
          return;
        }
        res.status(200).json({});
      });
    });
  } else if (decision === 'acc' && parseInt(requestType) === 1) {
    request.delete(blocklistURL + "/" + fileId,  function (error, response, body) {
      console.log(response.statusCode);
      if(response.statusCode === 204) {
        client.query(`UPDATE files SET "is_file_blocked" = ${false} WHERE "file_id" = '${fileId}'`, (err, r) => {
          if (err !== null) {
            res.status(500).json({ errMsg: 'Internal server error!' });
            return;
          }
        });
      }
      client.query(`UPDATE requests SET "request_status" = 'Accepted' WHERE "request_id" = '${req.params.id}'`, (err, r) => {
        if (err !== null) {
          res.status(500).json({ errMsg: 'Internal server error!' });
          return;
        }
        res.status(200).json({});
      });
    });
  } else if (decision === 'dec' ) {
    client.query(`UPDATE requests SET "request_status" = 'Declined' WHERE "request_id" = '${req.params.id}'`, (err, r) => {
      if (err !== null) {
        res.status(500).json({ errMsg: 'Internal server error!' });
        return;
      }
      res.status(200).json({});
    });
  } else {
    res.status(500).json({ errMsg: 'Internal server error!' });
  }
});