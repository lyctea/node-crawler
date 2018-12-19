var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;

var index = 1;
var count = 1;
const url = 'http://www.ygdy8.net/html/gndy/dyzz/list_23_';
var titles = [];
var btLink = [];

function getTitle (url, i) {
  console.log('正在获取底' + i + '页内容');
  http.get(`${url}${i}.html`, function (res) {
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
        getTitle(url, ++index);
      } else {
        console.log(titles);
        console.log('Title获取完毕！');
        getBtLink(titles, count);
      }
    });
  });
}

function getBtLink (urls, n) {
  console.log(`正在获取底${n}个url内容`);
  console.log('http://www.ygdy8.net' + urls[n].title);
  http.get('http://www.ygdy8.net' + urls[n].title, function (res) {
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
        getBtLink(urls, ++count);
      } else {
        console.log('btlink获取完毕');
        console.log(btLink);
        save(btLink);
      }
      
    });
    
  });
}

const mongo_url = 'mongodb://localhost:27017';

function save (btLink) {
  MongoClient.connect(mongo_url, function (err, db) {
    if (err) throw err;
    console.log('数据库连接成功');
    const myDb = db.db('dytt8-url');
    const collection = myDb.collection('dytt8-url');
    collection.insertMany(btLink, function (err, result) {
      if (err) throw err;
      console.log('数据保存成功');
    });
    db.close();
  });
}

function main () {
  console.log('开始爬取数据');
  getTitle(url, index);
}

main();
