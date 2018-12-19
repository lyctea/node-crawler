const cheerio = require('cheerio');
const http = require('http');
const iconv = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;

function getMoveHomePage (url, i) {
  console.log('正在获取: ' + url);
  return new Promise((resolve, reject) => {
    http.get(`${url}${i}.html`, function (res, err) {
      if (err) reject(err);
      
      var chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function () {
        var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
        var $ = cheerio.load(html, {decodeEntities: false});
        
        $('.co_content8 .ulink').each(function (idx, element) {
          titles.push({
            title: $(element).attr('href')
          });
        });
        if (i < 1) {
          resolve(getMoveHomePage(url, ++index));
        } else {
          resolve(titles);
        }
      });
    });
  });
  
}

function getBtLink (urls, n) {
  console.log('正在获取' + urls[n].title);
  return new Promise((resolve, reject) => {
    http.get('http://www.ygdy8.net' + urls[n].title, function (res, err) {
      if (err) reject(err);
      
      var chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function () {
        var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
        var $ = cheerio.load(html, {decodeEntities: false});
        
        $('#Zoom td').children('a').each(function (idx, element) {
          btLink.push({bt: $(element).attr('href')});
        });
        
        if (n < urls.length - 1) {
          resolve(getBtLink(urls, ++count));
        } else {
          resolve(btLink);
        }
      });
    });
  });
}

const mongo_url = 'mongodb://localhost:27017';

function save (btLink) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongo_url, {useNewUrlParser: true}, function (err, db) {
      if (err) reject(err);
      console.log('数据库连接成功');
      const myDb = db.db('dytt8-url');
      const collection = myDb.collection('dytt8-url');
      
      collection.insertMany(btLink, function (err, result) {
        if (err) reject(err);
        resolve('数据保存成功');
      });
      db.close();
    });
  });
}

var index = 1;
var count = 0;
var titles = [];
var btLink = [];
const url = 'http://www.ygdy8.net/html/gndy/dyzz/list_23_';

async function crawler () {
  const titles = await getMoveHomePage(url, index);
  const btLink = await getBtLink(titles, count);
  return save(btLink);
}

crawler().then(result => {
  console.log(result);
});

