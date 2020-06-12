var express = require('express');
var fs = require('fs');
const cors = require('cors');

var app = express();
var port = 3300;

app.set("views", "./views");
app.set("view engine", "pug")
app.locals.pretty = true;

app.use(cors());
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`${port} connected`);
});

//app.get('/', (req, res) => {
//  res.sendfile('public/style/tegola_test2_customstyle.html');
//});

//app.get('/test/:number', (req, res) => {
app.get('/', (req, res) => {  
//  var _number = req.params.number;
  //res.sendfile('public/style/tegola_test2_customstyle.html');
  fs.readdir('./public/style/wemap', (err, _stylelist) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }


    
//    if (_number == 17)
      res.render('view_select_style', { stylelist: _stylelist });
//    else
//      res.sendfile("public/mapbox_test" + _number + ".html");
  });
});

app.get('/readdir', (req, res) => {
  fs.readdir('./public/style/wemap', (err, _stylelist) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }

    res.send({ stylelist: _stylelist });
  });
})
