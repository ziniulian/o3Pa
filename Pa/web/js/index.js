// 域名管理

LZR.load([
	"LZR.HTML.Srv.ComDbQry"
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

	// 数据库初始化
	initDb: function () {
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.evt.qryb.add(function (o) {
			tbs.innerHTML = "";
			if (keyDom.value) {
				o.idLike = keyDom.value;
			}
			if (vDom.value) {
				o.urlLike = vDom.value;
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

		// 键
		s.href = "javascript: dat.set('" + o.id + "', '" + o.url + "');";
		s.innerHTML = o.id;
		d.appendChild(s);
		r.appendChild(d);

		// 值
		d = document.createElement("td");
		d.innerHTML = o.url;
		r.appendChild(d);

		// 删除
		d = document.createElement("td");
		s = document.createElement("a");
		s.href = "javascript: dat.db.del({id:\"" + o.id + "\"});";
		s.innerHTML = "删除";
		d.className = "c";
		d.appendChild(s);
		r.appendChild(d);

		tbs.appendChild(r);
	},

	add: function () {
		var id = idDom.value;
		var url = urlDom.value;
		if (!id) {
			idDom.focus();
		} else if (!url) {
			urlDom.focus();
		} else {
			dat.db.meg ({
				"id": id, "url": url
			}, id);
			idDom.value = "";
			urlDom.value = "";
			idDom.focus();
		}
	},

	set: function (id, url) {
		idDom.value = id;
		urlDom.value = url;
		urlDom.focus();
	},

	clear: function () {
		var b = 2;
		if (keyDom.value || vDom.value) {
			b = 1;
		} else if (idDom.value || urlDom.value) {
			b = 0;
		}
		keyDom.value = "";
		vDom.value = "";
		idDom.value = "";
		urlDom.value = "";
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

	keyDom.onkeyup = function (e) {
		if (e.keyCode === 13) {		// 回车键
			dat.db.first();
		}
	};

	vDom.onkeyup = function (e) {
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
			dat.add();
		}
	};

	dat.db.first();

	lzr_tools.trace();
}
