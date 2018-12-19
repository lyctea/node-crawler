const http = require('http');
const https = require('https');
var fs = require('fs');
var cheerio = require('cheerio');

function saveImage (imageUrl) {
  https.get(imageUrl, function (res) {
    res.setEncoding('binary');
    var imageData = '';
    res.on('data', function (data) {
      imageData += data;
      
    }).on('end', function () {
      if (!fs.existsSync('./images')) {
        fs.mkdirSync('./images');
      }
      fs.writeFile('images/' + Math.random() + '.png', imageData, 'binary', function (err) {
        if (err) throw err;
        console.log('保存成功');
      });
    });
  });
  
}

var strHtml = '';
https.get('https://aotu.io/index.html', function (res) {
  res.on('data', function (chunk) {
    strHtml += chunk;
  }).on('end', function () {
    var $ = cheerio.load(strHtml);
    $('#posts .mod-post-cover img').each((item, i) => {
      var imgSrc = $(i).attr('src');
      if (/^(https)/.test(imgSrc)) {
        saveImage(imgSrc);
      }
    });
  });
});
