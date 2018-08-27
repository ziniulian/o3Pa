// 域名管理

LZR.load([
	"LZR.HTML.Srv.ComDbQry",
	"LZR.Base.Time"
]);

var dat = {
	// 数据库访问工具
	db: new LZR.HTML.Srv.ComDbQry ({
		pgs: 10,
		sort: 1,
		keyNam: "id",
		url: {
			meg: "srvMeg/",
			del: "srvDel/",
			qry: "srvQry/"
		}
	}),

	// 时间工具
	timTool: new LZR.Base.Time(),

	// 数据库初始化
	initDb: function () {
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.evt.qryb.add(function (o) {
			tbs.innerHTML = "";
			if (idQlDom.value) {
				o.idLike = idQlDom.value;
			}
			if (urlQlDom.value) {
				o.urlLike = urlQlDom.value;
			}
			if (namQlDom.value) {
				o.namLike = namQlDom.value;
			}
		});
		dat.db.evt.qryr.add(function (o) {
			for (var i = 0; i < o.length; i ++) {
				dat.show(o[i]);
			}
		});
	},

	show: function (o) {
		var r = document.createElement("tr");
		var d = document.createElement("td");
		var s = document.createElement("a");

		// 项目名
		s.href = "javascript: dat.set('" + o.id + "', '" + o.url + "', '" + o.nam + "');";
		s.innerHTML = o.id;
		d.appendChild(s);
		r.appendChild(d);

		// 域名
		d = document.createElement("td");
		d.className = "l";
		d.innerHTML = o.url;
		r.appendChild(d);

		// 校验字
		d = document.createElement("td");
		d.innerHTML = o.nam;
		r.appendChild(d);

		// 状态
		d = document.createElement("td");
		if (o.stu) {
			d.innerHTML = o.stu;
		}
		r.appendChild(d);

		// 时间
		d = document.createElement("td");
		d.className = "l";
		if (o.tim) {
			d.innerHTML = dat.timTool.format(new Date(o.tim), "datetim");
		}
		r.appendChild(d);

		// 删除
		d = document.createElement("td");
		s = document.createElement("a");
		s.href = "javascript: dat.db.del({id:\"" + o.id + "\"});";
		s.innerHTML = "删除";
		d.appendChild(s);
		r.appendChild(d);

		tbs.appendChild(r);
	},

	add: function () {
		var id = idDom.value;
		var url = urlDom.value;
		var nam = namDom.value;
		if (!id) {
			idDom.focus();
		} else if (!url) {
			urlDom.focus();
		} else if (!nam) {
			namDom.focus();
		} else {
			dat.db.meg ({
				"id": id,
				"url": url,
				"nam": nam
			}, id);
			idDom.value = "";
			urlDom.value = "";
			namDom.value = "";
			idDom.focus();
		}
	},

	set: function (id, url, nam) {
		idDom.value = id;
		urlDom.value = url;
		namDom.value = nam;
		urlDom.focus();
	},

	clear: function () {
		var b = 2;
		if (idQlDom.value || urlQlDom.value || namQlDom.value) {
			b = 1;
		} else if (idDom.value || urlDom.value || namDom.value) {
			b = 0;
		}
		idQlDom.value = "";
		urlQlDom.value = "";
		namQlDom.value = "";
		idDom.value = "";
		urlDom.value = "";
		namDom.value = "";
		if (b === 1) {
			dat.db.first();
		} else if (b === 2) {
			dat.db.qry();
		}
	}

};

function init() {
	lzr_tools.getDomains("io_home");
	dat.initDb();

	idQlDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			dat.db.first();
		}
	};

	urlQlDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			dat.db.first();
		}
	};

	namQlDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			dat.db.first();
		}
	};

	idDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			urlDom.focus();
		}
	};

	urlDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			namDom.focus();
		}
	};

	namDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			dat.add();
		}
	};

	dat.db.first();

	lzr_tools.trace();
}
