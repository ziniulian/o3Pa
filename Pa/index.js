// 爬虫服务

// post 参数解析工具
var bodyParser = require("body-parser");

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Node.Srv.Result",
	"LZR.Node.Srv.ComDbSrv",
	"LZR.Node.Srv.DomainSrv"
]);
var clsR = LZR.Node.Srv.Result;

// 常用数据库
var cmdb = new LZR.Node.Srv.ComDbSrv ({
	logAble: 7
});
cmdb.initDb(
	(process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test"),
	"pa"
);

// 域名
var dms = new LZR.Node.Srv.DomainSrv();
dms.initAjx();

// 需要用到的工具
var tools = {
	// 刷新域名信息
	flushDms: function () {
		dms.get("vs,io_home");	// 注：逗号分隔不能有空格
	}
};

// 创建路由
var r = new LZR.Node.Router ({
	hd_web: "web",
	path: curPath
});

/************************* 服务 *****************************/

// 解析 post 参数
r.use("*", bodyParser.urlencoded({ extended: false }));

// 获取域名
r.post("/srvGet/", function (req, res, next) {
	cmdb.get(req, res, next, {}, {"_id": 0});
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
	if (req.body.namLike) {
		q.nam = {"$regex": new RegExp(req.body.namLike)};
	}
	cmdb.qry( req, res, next, "id", req.body.id, q, {"_id": 0} );
});

// 添加或修改域名
r.post("/srvMeg/", function (req, res, next) {
	var d = req.body.id;	// 项目名
	var u = req.body.url;	// 域名
	var n = req.body.nam;	// 校验字
	if (!d) {
		res.json(clsR.get(0, "缺少 id", false));
	} else if (!u) {
		res.json(clsR.get(0, "缺少 url", false));
	} else if (!n) {
		res.json(clsR.get(0, "缺少 nam", false));
	} else {
		cmdb.meg(req, res, next, {"id":d}, {"url":u, "nam":n});
	}
});

// 删除域名
r.post("/srvDel/", function (req, res, next) {
	cmdb.del(req, res, next, {"id":req.body.id});
});

// 刷新域名信息
r.get("/srvFlushDms/", function (req, res, next) {
	tools.flushDms();
	res.json(clsR.get(dms.ds));
});

/************************* 模板 *****************************/

// 模板预处理
r.get("/v/allsrv/", function (req, res, next) {
	req.qpobj = { dms: dms.ds };
	cmdb.get(req, res, next, {}, {"_id": 0}, true);
});
r.get("/v/flush/", function (req, res, next) {
	req.qpobj = { dms: dms.ds };
	cmdb.get(req, res, next, {}, {"_id": 0}, true);
});

// 初始化模板
r.initTmp("/v/");

// 刷新域名信息
tools.flushDms();

module.exports = r;
