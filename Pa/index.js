// 爬虫服务

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Node.Srv.Result",
	"LZR.Node.Srv.ComDbSrv",
	"LZR.Node.Router.ComTmp",
	"LZR.Node.Db.NodeAjax"
]);

// 常用数据库
var cmdb = new LZR.Node.Srv.ComDbSrv ({
	logAble: 7
});
cmdb.initDb(
	(process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test"),
	"pa"
);

// 数据库添加状态保存功能
cmdb.mdb.crtEvt({
	sav: {
		tnam: "pa",
		funs: {
			update: [{id: "<0>"}, {$set: "<1>"}]
		}
	}
});

// 创建路由
var r = new LZR.Node.Router ({
	hd_web: "web",
	path: curPath
});

// 需要用到的工具
var tools = {
	bodyParser: require("body-parser"),	// post 参数解析工具
	clsR: LZR.Node.Srv.Result,		// 标准返回格式
	utTim: LZR.getSingleton(LZR.Base.Time),	// 时间工具
	tmpRo: new LZR.Node.Router.ComTmp({		// 常用模板
		ro: r,
		dmIds: "io_home"
	}),

	// 爬虫类
	flush: {
		lock: false,	// 锁
		id: 0,			// 序号
		timid: 0,		// 时间ID
		urls: [],		// 域名集合
		next: null,		// 继续
		ajx: new LZR.Node.Db.NodeAjax ({	// Ajax
			hd_sqls: {
				pa: "https://<0>/myNam/"
			}
		}),

		init: function () {
			tools.flush.ajx.evt.pa.add(tools.flush.hdrun);
			tools.flush.ajx.err.pa.add(tools.flush.hdrun);

			// 绑定数据库状态保存事件
			cmdb.mdb.evt.sav.add(tools.flush.end);
		},
		getTim: function () {	// 获取时间间隔。一个 6小时 + 17小时 * 随机数 的动态时间间隔
			return Math.round((6 * 3600 * 1000 + 17 * Math.random() * 3600 * 1000));
		},
		run: function () {
			clearTimeout(tools.flush.timid);
			tools.flush.lock = true;

			// 访问域名
			// console.log (tools.flush.id + " >> ");
			tools.flush.ajx.qry("pa", null, null, null, [tools.flush.urls[tools.flush.id].url]);
		},
		hdrun: function (r) {
			var o = tools.flush.urls[tools.flush.id];
			// console.log (tools.flush.id + " << " + o.id + " , " + o.nam + " , " + (r === o.nam));

			// 保存域名访问结果
			var t = new Date();
			o.stu = (r === o.nam ? "OK" : "Err");
			o.tim = tools.utTim.format(t, "datetim");
			cmdb.mdb.qry("sav", null, null, null, [o.id, {"stu": o.stu, "tim": t.getTime()}]);
		},
		end: function () {
			// 结束
			tools.flush.id ++;
			if (tools.flush.id < tools.flush.urls.length) {
				tools.flush.timid = setTimeout(tools.flush.run, 10);
			} else {
				tools.flush.id = 0;
				tools.flush.timid = setTimeout(tools.flush.run, tools.flush.getTim());
				tools.flush.lock = false;
				if (tools.flush.next) {
					var fn = tools.flush.next;
					tools.flush.next = null;
					fn();
				}
			}
		},
		autoStart: function () {	// 自动运行
			var req = {};
			cmdb.get(
				req,
				null,
				function () {
					if (req.qpobj.comDbSrvReturn.length > 0) {
						tools.flush.urls = req.qpobj.comDbSrvReturn;
						tools.flush.id = 0;
						tools.flush.run();
					}
				},
				{},
				{"_id": 0},
				true
			);
		}
	}
};
tools.flush.init();

/************************* 服务 *****************************/

// 解析 post 参数
r.use("*", tools.bodyParser.urlencoded({ extended: false }));

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
		res.json(tools.clsR.get(0, "缺少 id", false));
	} else if (!u) {
		res.json(tools.clsR.get(0, "缺少 url", false));
	} else if (!n) {
		res.json(tools.clsR.get(0, "缺少 nam", false));
	} else {
		cmdb.meg(req, res, next, {"id":d}, {"url":u, "nam":n});
	}
});

// 删除域名
r.post("/srvDel/", function (req, res, next) {
	cmdb.del(req, res, next, {"id":req.body.id});
});

/************************* 模板 *****************************/

// 模板预处理
r.get(/^\/v\/(allsrv|flush)\/$/i, function (req, res, next) {
	cmdb.get(req, res, next, {}, {"_id": 0}, true);
});

// 启动爬虫
r.get("/v/flush/", function (req, res, next) {
	if (req.qpobj && req.qpobj.comDbSrvReturn && req.qpobj.comDbSrvReturn.length > 0) {
		if (tools.flush.lock) {
			res.send("等一下 ...");
		} else {
			tools.flush.lock = true;
			clearTimeout(tools.flush.timid);
			tools.flush.timid = 0;
			tools.flush.urls = req.qpobj.comDbSrvReturn;
			tools.flush.id = 0;
			tools.flush.next = next;
			tools.flush.run();
		}
	} else {
		res.send("无数据！");
	}
});

// 初始化模板
tools.tmpRo.initTmp("/v/");

tools.tmpRo.initDms();

tools.flush.autoStart();

module.exports = r;
