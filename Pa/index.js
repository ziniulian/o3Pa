// 爬虫服务

// post 参数解析工具
var bodyParser = require("body-parser");

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Node.Srv.Result",
	"LZR.Node.Srv.ComDbSrv"
]);
var clsR = LZR.Node.Srv.Result;

// 常用数据库
var cmdb = new LZR.Node.Srv.ComDbSrv ();
cmdb.initDb(
	(process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test"),
	"domain"
);

// 添加特殊的数据库查询
cmdb.mdb.crtEvt({
	getIds: {
		tnam: "domain",
		funs: {
			find: ["<0>", {"_id":0}],
			toArray: []
		}
	}
});
cmdb.mdb.evt.getIds.add(function (r, req, res, next) {
	if (r.length) {
		var i, o = {};
		for (i = 0; i < r.length; i ++) {
			o[r[i].id] = r[i].url;
		}
		res.json(clsR.get(o));
	} else {
		res.json(clsR.get(null, "暂无数据"));
	}
});

// 创建路由
var r = new LZR.Node.Router ({
	hd_web: "web",
	path: curPath
});

// 开启日志
r.get("/openLog/", function (req, res, next) {
	if (cmdb.logAble === 0) {
		cmdb.logAble = 7;
		cmdb.initAjx();
		res.send("正在开启日志 ...");
	} else {
		res.send("日志已开启!");
	}
});

// 解析 post 参数
r.use("*", bodyParser.urlencoded({ extended: false }));

// 获取域名
r.post("/srvGet/", function (req, res, next) {
	res.set({"Access-Control-Allow-Origin": "*"});	// 跨域
	cmdb.mdb.qry("getIds", req, res, next, [{"id": {"$in": req.body.ids.split(",")}}]);
});

// 分页查询域名
r.post("/srvQry/", function (req, res, next) {
	var q = {};
	if (req.body.idLike) {
		q.id = {"$regex": new RegExp(req.body.idLike)};
	}
	if (req.body.urlLike) {
		q.url = {"$regex": new RegExp(req.body.urlLike)};
	}
	cmdb.qry( req, res, next, "id", req.body.id, q, {"_id": 0} );
});

// 添加或修改域名
r.post("/srvMeg/", function (req, res, next) {
	var d = req.body.id;
	var u = req.body.url;
	if (!d) {
		res.json(clsR.get(0, "缺少 id", false));
	} else if (!u) {
		res.json(clsR.get(0, "缺少 url", false));
	} else {
		cmdb.meg(req, res, next, {"id":d}, {"url":u});
	}
});

// 删除域名
r.post("/srvDel/", function (req, res, next) {
	cmdb.del(req, res, next, {"id":req.body.id});
});

module.exports = r;
