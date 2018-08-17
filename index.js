// LZR 模块加载
require("lzr");

// LZR 子模块加载
LZR.load([
	"LZR.HTML",
	"LZR.Node.Srv"
]);

// 域名
var dmsrv = {ds: {main: LZR.HTML.domain}};

// 服务的实例化
var srv = new LZR.Node.Srv ({
	ip: process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
	port: process.env.OPENSHIFT_NODEJS_PORT || 80
});

// LZR库文件访问服务
srv.ro.setStaticDir("/myLib/", LZR.curPath);

// LOGO图片
srv.ro.get("/favicon.ico", function (req, res) {
	res.redirect(dmsrv.ds.main + "favicon.ico");
});

// 公共样式
srv.ro.get("/base.css", function (req, res) {
	res.redirect(dmsrv.ds.main + "css/common/base.css");
});

// 通用工具
srv.ro.get("/tools.js", function (req, res) {
	res.redirect(dmsrv.ds.main + "js/tools.js");
});

// 返回服务名
srv.ro.get("/myNam/", function (req, res) {
	res.send("Pa");
});

// 爬虫
srv.use("/Pa/", require("./Pa"));

// 收尾处理
srv.use("*", function (req, res) {
	res.redirect(dmsrv.ds.main + "Err");
});

// 服务启动
srv.start();
console.log("LZRpa start " + srv.ip + ":" + srv.port);
