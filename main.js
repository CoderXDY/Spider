console.log("start spider.......");
var express = require("express"),
	
	url = require("url"),

	cheerio = require("cheerio"),

	Eventproxy = require("eventproxy"),

	mysql = require("mysql"),

	url = "http://search.dangdang.com/?key=%D1%C5%CB%BC%BF%DA%D3%EF&act=input",

	connection = mysql.createConnection({

		host : 'localhost',

		user : 'root',
 
		password : 'scholat2077',

		port : '3306',

		database : 'spider'

	}),

	ep = new Eventproxy(); 

	const superagent = require("superagent");

	const charset = require("superagent-charset");

	charset(superagent);

	ep.all("load_success",function(htmlStr){

		//网页抓取完毕，进行解析
		connection.end(function(err){
			if(err){
				console.log("end err:"+err.message);
				return;
			}
			console.log("end success");
		});
		console.log("load_success");

	});

	connection.connect(function(err){

		if(err){
			console.log("err:"+err.message);
			return;
		}
		console.log("connect success");
	});

	//开始抓取网页

	superagent.get(url)
		.charset("gbk")
		.end(function(err , res){
			
			if(err){
				
				console.error(" it is error when superagent.get");
			
				return;
			}

			var $ = cheerio.load(res.text);

			var productAddSql = 'insert into product(id,productName,href,productPrice,imgUrl,detail) values(?,?,?,?,?,?)';

			$("div[class='con shoplist'] ul li").each(function(i,elem){
				
				var url = $("p[name='title'] a",this).attr("href");

				var name = $("p[name='title'] a",this).attr("title");

				var price = $("p[class='price'] span[class='search_now_price']",this).text();

				var imgUrl = $("a img",this).attr("src");

				var detail = $("p[class='detail']",this).text();
				//name = iconv.encode(name,"UTF-8");

				console.log(url);

				var id = i+"";
				connection.query(productAddSql,[id,name,url,price,imgUrl,detail],function(err,result){
					if(err){
						console.log("insert product error:"+err.message);
						return;
					}
					console.log("insert product success and id:"+result);
				});

			});
			
			ep.emit("load_success");
		});




