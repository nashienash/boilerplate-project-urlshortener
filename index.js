require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');                          
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));    
app.use(express.json());                             

app.use('/public', express.static(`${process.cwd()}/public`));


const urlDatabase = {};
let counter = 1;


function parseHttpUrl(str) {
  try {
    const url = new URL(str);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl', function(req, res) {
  const original = req.body.url;
  const parsed = parseHttpUrl(original);

  if (!parsed) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsed.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    const id = counter++;
    urlDatabase[id] = original;
    res.json({ original_url: original, short_url: id });
  });
});

app.get('/api/shorturl/:id', function(req, res) {
  const original = urlDatabase[req.params.id];
  if (!original) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  res.redirect(original);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});