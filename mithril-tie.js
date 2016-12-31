/**
 mithril-tie - browser input helper for mithril
 @version v0.0.10
 @link https://github.com/7korobi/mithril-tie
 @license 
**/


(function() {
  module.exports = {};

}).call(this);

(function() {
  var Mem, Tie, memory_prop;

  Mem = require("memory-record");

  memory_prop = function(params, key, unpack) {
    return function(val) {
      if (arguments.length) {
        return params[key] = unpack(val);
      } else {
        return params[key];
      }
    };
  };

  Tie = (function() {
    Tie.browser = {};

    Tie.types = {
      url: ["protocol", "host", "pathname", "search", "hash", "href"],
      store: ["session", "local", "cookie"]
    };

    Tie.build_input = function(tie, id, params, input) {
      tie.deploy(memory_prop, params, input);
      return tie;
    };

    Tie.build_url = function(hh, params, Url) {
      var conf, format, h, i, j, len, len1, ref, ref1, store, tie, type;
      tie = new Tie;
      ref = Tie.types.url;
      for (i = 0, len = ref.length; i < len; i++) {
        type = ref[i];
        if (h = hh[type]) {
          for (conf in h) {
            format = h[conf];
            if (!Url.conf[conf]) {
              Url.type[type].push(Url.conf[conf] = new Url(conf, type, format));
            }
          }
        }
      }
      ref1 = Mem.Query.stores.list;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        store = ref1[j];
        tie.deploy(memory_prop, params, store);
      }
      return tie;
    };

    Tie.build_store = function(ids, define, params) {
      var i, len, ref, store, tie;
      if (ids == null) {
        ids = [];
      }
      tie = new Tie;
      ref = Mem.Query.stores.where({
        _id: ids
      }).list;
      for (i = 0, len = ref.length; i < len; i++) {
        store = ref[i];
        tie.deploy(define, params, store);
      }
      return tie;
    };

    function Tie() {
      this.prop = {};
    }

    Tie.prototype.deploy = function(define, params, arg) {
      var _id, current, pack, type, unpack, val;
      _id = arg._id, current = arg.current, type = arg.type;
      if (current == null) {
        current = null;
      }
      unpack = Mem.unpack[type];
      pack = Mem.pack[type];
      this.prop[_id] = define(params, _id, unpack, pack);
      val = this.prop[_id]();
      switch (val) {
        case void 0:
        case null:
        case "":
          return this.prop[_id](val = current);
      }
    };

    Tie.prototype.copyBy = function(source) {
      var _id, prop, ref, results;
      ref = this.prop;
      results = [];
      for (_id in ref) {
        prop = ref[_id];
        results.push(prop(source.prop[_id]()));
      }
      return results;
    };

    Tie.prototype.copyTo = function(target) {
      var _id, prop, ref, results;
      ref = this.prop;
      results = [];
      for (_id in ref) {
        prop = ref[_id];
        results.push(target.prop[_id](prop()));
      }
      return results;
    };

    return Tie;

  })();

  Tie.params = {};

  module.exports.Tie = Tie;

}).call(this);

(function() {
  var InputTie, Mem, Tie, _, _attr_form, m, submit_pick,
    slice = [].slice;

  Mem = require("memory-record");

  m = require("mithril");

  _ = require("lodash");

  Tie = module.exports.Tie;

  submit_pick = function() {
    var attrs;
    attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return _.assignIn.apply(_, attrs);
  };

  _attr_form = function(tie, attr) {
    var config, ma;
    config = function(elem, isStay, context) {
      tie.dom = elem;
      if (!isStay) {
        return elem.checkValidity != null ? elem.checkValidity : elem.checkValidity = function() {
          var i, input, len, ref;
          ref = tie._inputs;
          for (i = 0, len = ref.length; i < len; i++) {
            input = ref[i];
            if (input.dom) {
              if (!input.dom.checkValidity()) {
                return false;
              }
            }
          }
          return true;
        };
      }
    };
    return ma = _.assignIn(attr, {
      config: config,
      disabled: tie.disabled,
      onsubmit: function(e) {
        tie.do_submit();
        return false;
      }
    });
  };

  InputTie = (function() {
    InputTie.util = {};

    InputTie.type = {};

    InputTie.prototype.timeout = 1000;

    InputTie.prototype._debounce = function() {
      this.timer = true;
      return new Promise((function(_this) {
        return function(_, ng) {
          return _this.timer = setTimeout(function() {
            return ng("reset " + _this.timeout + "ms ");
          }, _this.timeout);
        };
      })(this));
    };

    InputTie.prototype._cancel = function() {
      this.disabled = false;
      this.disable(false);
      return this.timer = null;
    };

    InputTie.prototype.action = function() {};

    InputTie.prototype.disable = function(id, b) {};

    InputTie.prototype.focus = function(id, b, old_id) {};

    InputTie.prototype.stay = function(id, value) {};

    InputTie.prototype.change = function(id, value, old_value) {};

    InputTie.prototype.select = function(id, str, offsets) {};

    InputTie.prototype.do_change = function(input, value) {
      var id, old;
      value = input.__val(value);
      input.do_change(value);
      this.disabled = !!this.timer;
      id = input._id;
      old = this.params[id];
      if (old === value) {
        return this.stay(id, value);
      } else {
        this.params[id] = value;
        return this.change(id, value, old);
      }
    };

    InputTie.prototype.do_fail = function(input, value) {
      value = input.__val(value);
      return input.do_fail(value);
    };

    InputTie.prototype.do_blur = function(input, e) {
      var id;
      input.do_blur(e);
      id = input._id;
      return this.focus(id, false);
    };

    InputTie.prototype.do_focus = function(input, e) {
      var id;
      input.do_focus(e);
      id = input._id;
      this.focus(id, true, this.focus_id, this.focused);
      this.focus_id = id;
      return this.focused = input;
    };

    InputTie.prototype.do_move = function(input, e) {
      var id;
      input.do_move(e);
      return id = input._id;
    };

    InputTie.prototype.do_select = function(input, e) {
      var anchorOffset, focusOffset, offsets, s;
      s = getSelection();
      anchorOffset = s.anchorOffset, focusOffset = s.focusOffset;
      offsets = [anchorOffset, focusOffset].sort();
      return this.select(input, s.toString(), offsets);
    };

    InputTie.prototype.do_submit = function() {
      var p_action, p_timer, value;
      if (this.timer) {
        return;
      }
      if (!this.dom.checkValidity()) {
        return;
      }
      p_timer = this._debounce();
      p_action = value = this.action();
      if (this.action.then == null) {
        p_action = new Promise(function(ok) {
          return ok(value);
        });
      }
      this.disabled = true;
      this.disable(true);
      m.redraw();
      return Promise.race([p_timer, p_action]).then((function(_this) {
        return function() {
          return clearTimeout(_this.timer);
        };
      })(this))["catch"]((function(_this) {
        return function(message) {
          _this.message = message;
          return console.log(_this.message);
        };
      })(this)).then((function(_this) {
        return function() {
          _this._cancel();
          return m.redraw();
        };
      })(this));
    };

    InputTie.prototype.cancel = function() {
      clearTimeout(this.timer);
      return this._cancel();
    };

    InputTie.prototype.submit = function() {
      var children, ma, tag;
      children = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      tag = "button.btn";
      if (!this.disabled) {
        tag += ".edge";
      }
      if (this.disabled) {
        tag += ".active";
      }
      ma = this._submit_attr(null, {});
      return m.apply(null, [tag, ma].concat(slice.call(children)));
    };

    InputTie.prototype.draw = function() {
      var draw, i, len, ref, results;
      this._errors = null;
      ref = this._draws;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        draw = ref[i];
        results.push(draw());
      }
      return results;
    };

    InputTie.prototype.draws = function(cb) {
      return this._draws.push(cb);
    };

    InputTie.prototype.errors = function() {
      var _id, dom, i, len, ref, ref1;
      if (this._errors) {
        return this._errors;
      }
      this._errors = {};
      ref = this._inputs;
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], _id = ref1._id, dom = ref1.dom;
        if (dom != null ? dom.validationMessage : void 0) {
          this._errors[_id] = dom.validationMessage;
        }
      }
      return this._errors;
    };

    InputTie.prototype.infos = function() {
      return this._infos;
    };

    InputTie.prototype.bind = function(input) {
      return this._inputs.push(input);
    };

    InputTie.prototype.bundle = function(format) {
      var _id, attr, input, type;
      _id = format._id, attr = format.attr;
      InputTie.format(format);
      type = InputTie.type[attr.type];
      if (attr.multiple) {
        type = type.multiple;
      }
      return this.input[_id] = input = new type(this, format);
    };

    InputTie.prototype._submit = function(arg) {
      var attr;
      this.form = arg.form;
      attr = {};
      if (this.form) {
        this._submit_attr = (function(_this) {
          return function(__, attr) {
            return submit_pick(attr, {
              type: "submit",
              disabled: _this.disabled
            });
          };
        })(this);
      } else {
        this._submit_attr = (function(_this) {
          return function(__, attr) {
            var submit;
            submit = function(e) {
              _this.do_submit();
              return false;
            };
            return submit_pick(attr, {
              type: "button",
              disabled: _this.disabled,
              onclick: submit,
              onmouseup: submit,
              ontouchend: submit
            });
          };
        })(this);
      }
      return this;
    };

    InputTie.prototype.isDirty = function() {
      var i, input, len, ref;
      ref = this._inputs;
      for (i = 0, len = ref.length; i < len; i++) {
        input = ref[i];
        if (input.dom) {
          if (!input.isDirty()) {
            return false;
          }
        }
      }
      return true;
    };

    InputTie.prototype.isValid = function() {
      var ref;
      return (ref = this.dom) != null ? ref.checkValidity() : void 0;
    };

    function InputTie(arg) {
      var i, id, ids, len;
      this.params = arg.params, ids = arg.ids;
      this._cancel();
      this._draws = [
        (function(_this) {
          return function() {
            var i, input, len, ref, results;
            ref = _this._inputs;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              input = ref[i];
              results.push(input.do_draw());
            }
            return results;
          };
        })(this)
      ];
      this._inputs = [];
      this._infos = {};
      this.input = {};
      this.tie = new Tie;
      for (i = 0, len = ids.length; i < len; i++) {
        id = ids[i];
        this.bundle(Mem.Query.inputs.find(id));
      }
      return;
    }

    InputTie.form = function(params, ids) {
      return new InputTie({
        ids: ids,
        params: params
      })._submit({
        form: function() {
          var attr, vdom;
          attr = arguments[0], vdom = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          return m("form", _attr_form(this, attr), vdom);
        }
      });
    };

    InputTie.btns = function(params, ids) {
      return new InputTie({
        ids: ids,
        params: params
      })._submit({});
    };

    InputTie.format = function(o) {
      var _id, base, base1, label, ref, ref1, results;
      if (o.label == null) {
        o.label = {};
      }
      if ((base = o.label).attr == null) {
        base.attr = {};
      }
      if ((ref = o.attr) != null ? ref.name : void 0) {
        if ((base1 = o.attr).id == null) {
          base1.id = o.attr.name;
        }
        o.label.attr["for"] = o.attr.name;
      }
      ref1 = o.options;
      results = [];
      for (_id in ref1) {
        label = ref1[_id];
        if (!label._id) {
          results.push(o.options[_id] = "object" === typeof label ? (label._id = _id, label) : {
            _id: _id,
            label: label
          });
        }
      }
      return results;
    };

    return InputTie;

  })();

  module.exports.InputTie = InputTie;

}).call(this);

(function() {
  var LocationStore, Mem, Tie, Url, _, decode, encode, state;

  _ = require("lodash");

  Mem = require("memory-record");

  Tie = module.exports.Tie;

  decode = Mem.unpack.Url;

  encode = Mem.pack.Url;

  state = _.debounce(function() {
    var params;
    params = Url.location();
    if (decode(location.href) !== decode(params.href)) {
      if (typeof history !== "undefined" && history !== null) {
        history[Url.mode]("URL", null, params.href);
      }
      return Url.popstate();
    }
  }, 50);

  LocationStore = (function() {
    LocationStore.now = function() {
      return new this(location);
    };

    function LocationStore(arg) {
      this.protocol = arg.protocol, this.host = arg.host, this.pathname = arg.pathname, this.search = arg.search, this.hash = arg.hash, this.href = arg.href;
      return;
    }

    LocationStore.prototype.each = function(cb) {
      var j, k, len, len1, path, ref, ref1, type, url;
      ref = Tie.types.url;
      for (j = 0, len = ref.length; j < len; j++) {
        type = ref[j];
        ref1 = Url.type[type];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          url = ref1[k];
          path = this[type];
          cb(url, path, type);
        }
      }
      return this;
    };

    LocationStore.prototype.fetch = function() {
      this.each(function(url, path, target) {
        return url.fetch(path);
      });
      return this;
    };

    LocationStore.prototype.view = function() {
      this.each((function(_this) {
        return function(url, path, target) {
          return _this[target] = url.view(path);
        };
      })(this));
      this.href = this.protocol + "//" + this.host + this.pathname + this.search + this.hash;
      return this;
    };

    return LocationStore;

  })();

  Url = (function() {
    var j, len, ref, type;

    Url.conf = {};

    Url.type = {};

    ref = Tie.types.url;
    for (j = 0, len = ref.length; j < len; j++) {
      type = ref[j];
      Url.type[type] = [];
    }

    Url.define = function(key) {
      return Mem.Query.stores.hash[key];
    };

    Url.maps = function(hh) {
      this.tie = Tie.build_url(hh, Tie.params, this);
      this.prop = this.tie.prop;
      return this.params = Tie.params;
    };

    Url.popstate = function() {
      this._loc = LocationStore.now();
      this._loc.fetch();
      return this.mode = "replaceState";
    };

    Url.pushstate = function() {
      this.mode = "pushState";
      return state();
    };

    Url.replacestate = function() {
      return state();
    };

    Url.location = function() {
      if (this._loc == null) {
        this.popstate();
      }
      return this._loc.view();
    };

    function Url(_id, type1, format) {
      var regexp;
      this._id = _id;
      this.type = type1;
      this.format = format;
      this.keys = [];
      regexp = this.format.replace(/[.]/gi, function(key) {
        return "\\" + key;
      }).replace(/:([a-z_]+)/gi, (function(_this) {
        return function(_, key) {
          var o;
          if (!(o = Url.define(key))) {
            console.error("undefined key : " + key);
            return;
          }
          _this.keys.push(key);
          return Mem.Serial.url[o.type];
        };
      })(this), "i");
      this.scanner = new RegExp(regexp);
    }

    Url.prototype.serialize = function() {
      var k, key, len1, path, ref1, serial;
      path = this.format;
      ref1 = this.keys;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        key = ref1[k];
        serial = Mem.pack[Url.define(key).type];
        path = path.replace(RegExp(":" + key, "gi"), serial(Url.params[key]));
      }
      return encode(path);
    };

    Url.prototype.values = function(hash) {
      var k, key, len1, ref1, results;
      if (hash == null) {
        hash = {};
      }
      ref1 = this.keys;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        key = ref1[k];
        results.push(hash[key] || Url.params[key]);
      }
      return results;
    };

    Url.prototype.fetch = function(path) {
      var i, k, key, len1, ref1, results;
      this.match = this.scanner.exec(path);
      if (this.match) {
        this.match.shift();
        ref1 = this.keys;
        results = [];
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          key = ref1[i];
          results.push(Url.prop[key](decode(this.match[i])));
        }
        return results;
      }
    };

    Url.prototype.view = function(path) {
      this.match = this.scanner.exec(path);
      if (this.match) {
        return path.replace(this.scanner, this.serialize());
      }
      if (this.current) {
        this.match = true;
        path += (function() {
          if (path.length) {
            return "&";
          } else {
            switch (this.type) {
              case "hash":
                return "#";
              case "search":
                return "?";
            }
          }
        }).call(this);
        path += this.serialize();
      }
      return path;
    };

    return Url;

  })();

  module.exports.Url = Url;

}).call(this);

(function() {
  var Tie, WebStoreTie, cookie_prop, storage_prop;

  Tie = module.exports.Tie;

  storage_prop = function(store, key, unpack, pack) {
    return function(val) {
      if (arguments.length) {
        return store.setItem(key, pack(val));
      } else {
        return unpack(store.getItem(key));
      }
    };
  };

  cookie_prop = function(options, key, unpack, pack) {
    return function(val) {
      var ary, domain, expires, match, path, secure, time;
      if (arguments.length) {
        ary = [key + "=" + (pack(val))];
        time = options.time, domain = options.domain, path = options.path, secure = options.secure;
        if (time) {
          expires = new Date(Math.min(2147397247000, Date.now() + time * 3600000));
          ary.push("expires=" + (expires.toUTCString()));
        }
        if (domain) {
          ary.push("domain=" + domain);
        }
        if (path) {
          ary.push("path=" + path);
        }
        if (secure) {
          ary.push("secure");
        }
        return document.cookie = ary.join("; ");
      } else {
        match = RegExp(key + "=([^;]+)").exec(document.cookie);
        if ((match != null ? match[0] : void 0) != null) {
          return unpack(match[1]);
        }
      }
    };
  };

  WebStoreTie = (function() {
    function WebStoreTie() {}

    WebStoreTie.maps = function(ha) {
      this.session = Tie.build_store(ha.session, storage_prop, sessionStorage);
      this.local = Tie.build_store(ha.local, storage_prop, localStorage);
      this.cookie = Tie.build_store(ha.cookie, cookie_prop, this.cookie_options);
      return this.params = Tie.params;
    };

    WebStoreTie.copyBy = function(source) {
      var i, len, ref, results, store;
      ref = Tie.types.store;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        store = ref[i];
        results.push(this[store].copyBy(source));
      }
      return results;
    };

    WebStoreTie.copyTo = function(target) {
      var i, len, ref, results, store;
      ref = Tie.types.store;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        store = ref[i];
        results.push(this[store].copyTo(target));
      }
      return results;
    };

    WebStoreTie.format = function(o) {
      if (o.type == null) {
        o.type = "String";
      }
      return o.current != null ? o.current : o.current = (function() {
        switch (o.type) {
          case "Keys":
            return {};
          case "Date":
          case "Number":
            return 0;
          case "String":
            return null;
          case "Text":
            return "";
        }
      })();
    };

    return WebStoreTie;

  })();

  module.exports.WebStore = WebStoreTie;

}).call(this);

(function() {
  var InputTie, Mem, OBJ, Tie, View, Views, _, m, ref,
    slice = [].slice;

  Mem = require("memory-record");

  m = require("mithril");

  _ = require("lodash");

  ref = module.exports, InputTie = ref.InputTie, Tie = ref.Tie;

  OBJ = function() {
    return new Object(null);
  };

  Views = (function() {
    function Views() {
      this.data = OBJ();
    }

    Views.prototype.build = function() {
      var type, types;
      types = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.views = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = types.length; i < len; i++) {
          type = types[i];
          results.push(new type(this.dom));
        }
        return results;
      }).call(this);
    };

    Views.prototype.draw = function(arg) {
      var history, is_touch, offset, offsets;
      is_touch = arg.is_touch, offset = arg.offset, offsets = arg.offsets, history = arg.history;
    };

    Views.prototype.dom = function(dom1) {
      var ref1;
      this.dom = dom1;
      return ref1 = this.build(View), this._view = ref1[0], ref1;
    };

    Views.prototype.resize = function(size) {
      this._view.fit({
        offset: [0, 0],
        view: [1, 1],
        size: size
      });
      return this._view.clear();
    };

    Views.prototype.background = function(size) {
      var base, image;
      if ((base = this.data).canvas == null) {
        base.canvas = OBJ();
      }
      if (image = this.data.canvas[this._view.size]) {
        this._view.paste(image, [0, 0]);
        return;
      }
      this.resize(size);
      if (this.data) {
        return this.data.canvas[this._view.size] = this._view.copy([0, 0], [1, 1]);
      }
    };

    Views.prototype.hit = function(at) {
      return _.some(this.views, function(o) {
        return o.hit(at);
      });
    };

    Views.prototype.touch = function(at) {
      return this.hit(at, function(x, y) {});
    };

    Views.prototype.over = function(at) {
      return this.hit(at, function(x, y) {});
    };

    return Views;

  })();

  View = (function() {
    function View(dom) {
      this.draw = dom.getContext("2d");
    }

    View.prototype.fit = function(arg) {
      var offset, ref1, ref2, ref3, ref4, view;
      ref1 = arg != null ? arg : {}, offset = ref1.offset, this.size = ref1.size, view = ref1.view;
      ref2 = this.size, this.show_width = ref2[0], this.show_height = ref2[1];
      ref3 = view || this.size, this.view_width = ref3[0], this.view_height = ref3[1];
      ref4 = offset || [0, 0], this.left = ref4[0], this.top = ref4[1];
      this.right = this.left + this.show_width;
      this.bottom = this.top + this.show_height;
      this.x = this.show_width / this.view_width;
      return this.y = this.show_height / this.view_height;
    };

    View.prototype.by = function(x, y) {
      return [(x - this.left) / this.x, (y - this.top) / this.y];
    };

    View.prototype.at = function(x, y) {
      return [this.left + this.x * x, this.top + this.y * y];
    };

    View.prototype.to = function(x, y) {
      return [this.x * x, this.y * y];
    };

    View.prototype.pen = function(o) {
      return _.assignIn(this.draw, o);
    };

    View.prototype.clear = function() {
      return this.draw.clearRect(this.left, this.top, this.right, this.bottom);
    };

    View.prototype.fill = function() {
      return this.draw.fillRect(this.left, this.top, this.right, this.bottom);
    };

    View.prototype.paste = function(image, arg) {
      var x, y;
      x = arg[0], y = arg[1];
      return this.draw.putImageData(image, x, y);
    };

    View.prototype.copy = function(a, o) {
      var ref1, ref2, xa, xo, ya, yo;
      ref1 = this.at.apply(this, a), xa = ref1[0], ya = ref1[1];
      ref2 = this.to.apply(this, o), xo = ref2[0], yo = ref2[1];
      return this.draw.getImageData(xa, ya, xo, yo);
    };

    View.prototype.text = function(str, a, width) {
      var ref1, xa, ya;
      ref1 = this.at.apply(this, a), xa = ref1[0], ya = ref1[1];
      width = this.x * width - 4;
      if (4 < width) {
        return this.draw.fillText(str, xa, ya, width);
      }
    };

    View.prototype.rect = function(a, b) {
      var ref1, ref2, xa, xb, ya, yb;
      ref1 = this.at.apply(this, a), xa = ref1[0], ya = ref1[1];
      ref2 = this.at.apply(this, b), xb = ref2[0], yb = ref2[1];
      return this.draw.fillRect(xa, ya, xb, yb);
    };

    View.prototype.moveTo = function() {
      var ref1, x, y;
      ref1 = this.at.apply(this, arguments), x = ref1[0], y = ref1[1];
      return this.draw.moveTo(x, y);
    };

    View.prototype.lineTo = function() {
      var ref1, x, y;
      ref1 = this.at.apply(this, arguments), x = ref1[0], y = ref1[1];
      return this.draw.lineTo(x, y);
    };

    View.prototype.path = function(cb) {
      this.draw.beginPath();
      cb(d);
      return this.draw.stroke();
    };

    View.prototype.hit = function(a) {
      var ref1, ref2;
      return (this.left < (ref1 = a[0]) && ref1 < this.right) && (this.top < (ref2 = a[1]) && ref2 < this.bottom);
    };

    View.prototype.touch = function(a, cb) {
      var ref1, x, y;
      ref1 = this.by.apply(this, a), x = ref1[0], y = ref1[1];
      if (this.hit(a)) {
        return cb(x, y);
      }
    };

    View.prototype.over = function(a, cb) {
      var ref1, x, y;
      ref1 = this.by.apply(this, a), x = ref1[0], y = ref1[1];
      if (this.hit(a)) {
        return cb(x, y);
      }
    };

    return View;

  })();

  InputTie.util.canvas = {
    View: View,
    Views: Views
  };

}).call(this);

(function() {
  var InputTie, Mem,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Mem = require("memory-record");

  InputTie = module.exports.InputTie;

  new Mem.Rule("input").schema(function() {
    this.scope(function(all) {
      return {
        checkbox: function(sean) {
          return all.where(function(o) {
            return o.attr.type === 'checkbox' && o.sean === sean;
          });
        }
      };
    });
    return this.model = (function(superClass) {
      extend(model, superClass);

      function model() {
        InputTie.format(this);
      }

      return model;

    })(this.model);
  });

}).call(this);

(function() {
  var Mem, WebStore,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Mem = require("memory-record");

  WebStore = module.exports.WebStore;

  new Mem.Rule("store").schema(function() {
    this.scope(function(all) {});
    return this.model = (function(superClass) {
      extend(model, superClass);

      function model() {
        WebStore.format(this);
      }

      return model;

    })(this.model);
  });

}).call(this);

(function() {
  var InputTie, Mem, Tie, _, _attr_label, basic_input, change_attr, e_checked, e_selected, e_value, i, input_attr, input_pick, j, key, len, len1, m, number_input, option_pick, ref, ref1, ref2, validity_by,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Mem = require("memory-record");

  m = require("mithril");

  _ = require("lodash");

  ref = module.exports, InputTie = ref.InputTie, Tie = ref.Tie;

  input_pick = function(attrs, last) {
    return _.assignIn.apply(_, [{}].concat(slice.call(attrs), [last]));
  };

  option_pick = function() {
    var attrs;
    attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    attrs = attrs.map(function(ma) {
      var target;
      target = ["id", "className", "selected", "disabled", "value", "label"];
      if (ma.badge) {
        target.push("badge");
      }
      return _.pick(ma, target);
    });
    return _.assignIn.apply(_, attrs);
  };

  _attr_label = function() {
    var attrs;
    attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return _.assignIn.apply(_, attrs);
  };

  change_attr = function() {
    var _value, attrs, b, ma, ref1, tie;
    attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = b = this, _value = ref1._value, tie = ref1.tie;
    return ma = input_pick(attrs, {
      config: this.__config,
      disabled: tie.disabled,
      onblur: function(e) {
        return tie.do_blur(b, e);
      },
      onfocus: function(e) {
        return tie.do_focus(b, e);
      },
      onselect: function(e) {
        return tie.do_select(b, e);
      },
      onchange: function(e) {
        return tie.do_change(b, _value(e), ma);
      },
      oninvalid: function(e) {
        return tie.do_fail(b, _value(e), ma);
      }
    });
  };

  input_attr = function() {
    var _value, attrs, b, ma, ref1, tie;
    attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = b = this, _value = ref1._value, tie = ref1.tie;
    return ma = input_pick(attrs, {
      config: this.__config,
      disabled: tie.disabled,
      onblur: function(e) {
        return tie.do_blur(b, e);
      },
      onfocus: function(e) {
        return tie.do_focus(b, e);
      },
      onselect: function(e) {
        return tie.do_select(b, e);
      },
      oninput: function(e) {
        return tie.do_change(b, _value(e), ma);
      },
      oninvalid: function(e) {
        return tie.do_fail(b, _value(e), ma);
      }
    });
  };

  e_checked = function(e) {
    return (e.currentTarget || this).checked;
  };

  e_value = function(e) {
    return (e.currentTarget || this).value;
  };

  e_selected = function(e) {
    var i, len, list, news, option;
    list = (e.currentTarget || this).selectedOptions;
    news = {};
    for (i = 0, len = list.length; i < len; i++) {
      option = list[i];
      news[option.value] = true;
    }
    return news;
  };

  validity_by = {
    valid: "valid",
    valueMissing: "required",
    typeMismatch: "type",
    patternMismatch: "pattern",
    rangeUnderflow: "min",
    rangeOverflow: "max",
    stepMismatch: "step",
    tooLines: "max_line",
    tooLong: "maxlength",
    tooShort: "minlength",
    hasSecret: "not_secret",
    hasPlayer: "not_player"
  };

  basic_input = (function() {
    basic_input.prototype._attr_label = _attr_label;

    basic_input.prototype._value = e_value;

    basic_input.prototype._attr = input_attr;

    basic_input.prototype._debounce = InputTie.prototype._debounce;

    basic_input.prototype._config = function(dom, isStay, context) {
      var base, base1, base2;
      this.dom = dom;
      if (!isStay) {
        if ((base = this.dom).validity == null) {
          base.validity = {
            valid: true
          };
        }
        if ((base1 = this.dom).checkValidity == null) {
          base1.checkValidity = function() {
            return this.validity.valid;
          };
        }
        return (base2 = this.dom).setCustomValidity != null ? base2.setCustomValidity : base2.setCustomValidity = function(validationMessage) {
          this.validationMessage = validationMessage;
          if (this.validationMessage) {
            this.validity.customError = true;
            return this.validity.valid = false;
          } else {
            this.validity.customError = false;
            return this.validity.valid = true;
          }
        };
      }
    };

    basic_input.prototype.timeout = 100;

    basic_input.prototype.type = "String";

    basic_input.prototype.option_default = {
      className: "icon-cancel-alt",
      label: ""
    };

    function basic_input(tie1, format) {
      var info, option_default, ref1;
      this.tie = tie1;
      this.format = format;
      ref1 = this.format, this._id = ref1._id, this.options = ref1.options, this.attr = ref1.attr, this.name = ref1.name, this.current = ref1.current, info = ref1.info, option_default = ref1.option_default;
      this.__info = info;
      this.__uri = Mem.pack[this.type];
      this.__val = Mem.unpack[this.type];
      this.__config = this._config.bind(this);
      this.tie.bind(this);
      this.option_default = _.assign({}, this.option_default, option_default);
      Tie.build_input(this.tie.tie, this._id, this.tie.params, this);
      this["default"] = this.value();
      this.do_draw();
      this.tie.do_change(this, this["default"]);
      return;
    }

    basic_input.prototype.info = function(msg) {
      if (msg == null) {
        msg = "";
      }
      return this.tie._infos[this._id] = msg;
    };

    basic_input.prototype.error = function(msg) {
      var ref1;
      if (msg == null) {
        msg = "";
      }
      return (ref1 = this.dom) != null ? ref1.setCustomValidity(msg) : void 0;
    };

    basic_input.prototype.value = function(new_val) {
      if (arguments.length) {
        this.tie.do_change(this, this.__val(new_val));
      }
      return this.tie.params[this._id];
    };

    basic_input.prototype.isDirty = function() {
      return this["default"] === this.value();
    };

    basic_input.prototype.isValid = function() {
      var ref1;
      return (ref1 = this.dom) != null ? ref1.checkValidity() : void 0;
    };

    basic_input.prototype.do_fail = function(value) {};

    basic_input.prototype.do_focus = function() {};

    basic_input.prototype.do_blur = function() {};

    basic_input.prototype.do_draw = function() {
      var info, label, ref1, ref2;
      ref1 = this.format, info = ref1.info, label = ref1.label;
      this.__name = this.attr.name || this._id;
      this.__value = this.value();
      return this.tie.errors[this._id] = ((ref2 = this.dom) != null ? ref2.validationMessage : void 0) || "";
    };

    basic_input.prototype.do_change = function(value) {
      var key, msg, ref1, val;
      if (this.dom && !this.dom.validity.customError) {
        if (this.format.error) {
          ref1 = this.dom.validity;
          for (key in ref1) {
            val = ref1[key];
            if (!(val)) {
              continue;
            }
            msg = this.format.error[validity_by[key]];
            if (msg) {
              this.error(msg);
              return;
            }
          }
        }
      }
    };

    basic_input.prototype.option = function(value) {
      var ref1;
      if (value) {
        return ((ref1 = this.options) != null ? ref1[value] : void 0) || {};
      } else {
        return this.option_default;
      }
    };

    basic_input.prototype.item = function(value, m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(value);
      ma = option_pick(this.attr, m_attr, option, {
        className: [option.className, m_attr.className].join(" "),
        value: this.__uri(value),
        selected: value === this.__value
      });
      return m('option', ma, ma.label);
    };

    basic_input.prototype.datalist = function(m_attr) {
      if (m_attr == null) {
        m_attr = {};
      }
      throw "not implement";
    };

    basic_input.prototype.head = function(m_attr) {
      var ma;
      if (m_attr == null) {
        m_attr = {};
      }
      ma = this._attr_label(m_attr);
      return m("label", ma, this.name);
    };

    basic_input.prototype.label = function(m_attr) {
      var info, ma, option, text;
      if (m_attr == null) {
        m_attr = {};
      }
      if (this.label_for) {
        if (this.options) {
          option = this.options[this.__value];
          if (option) {
            return this.label_for(option);
          }
        }
      }
      if (info = this.__info) {
        if (info.label) {
          text = info.label;
        }
        if (info.off && !this.__value) {
          text = info.off;
        }
        if (info.on && this.__value) {
          text = info.on;
        }
        if (info.valid && this.__value) {
          text = info.valid;
        }
        ma = this._attr_label(m_attr, this.format.label.attr);
        return m("label", ma, text);
      }
    };

    basic_input.prototype.field = function(m_attr) {
      var ma;
      if (m_attr == null) {
        m_attr = {};
      }
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        name: this.__name,
        value: this.__value
      });
      return m("input", ma);
    };

    return basic_input;

  })();

  number_input = (function(superClass) {
    extend(number_input, superClass);

    function number_input() {
      return number_input.__super__.constructor.apply(this, arguments);
    }

    number_input.prototype.type = "Number";

    return number_input;

  })(basic_input);

  ref1 = ["hidden", "tel", "password", "datetime", "date", "month", "week", "time", "datetime-local", "color"];
  for (i = 0, len = ref1.length; i < len; i++) {
    key = ref1[i];
    InputTie.type[key] = basic_input;
  }

  ref2 = ["number", "range"];
  for (j = 0, len1 = ref2.length; j < len1; j++) {
    key = ref2[j];
    InputTie.type[key] = number_input;
  }

  InputTie.type.checkbox = (function(superClass) {
    extend(checkbox, superClass);

    function checkbox() {
      return checkbox.__super__.constructor.apply(this, arguments);
    }

    checkbox.prototype._value = e_checked;

    checkbox.prototype._attr = change_attr;

    checkbox.prototype.type = "Bool";

    checkbox.prototype.option = function(value) {
      var ref3, sw;
      sw = value ? "on" : "off";
      return ((ref3 = this.options) != null ? ref3[sw] : void 0) || {};
    };

    checkbox.prototype.field = function(m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(this.__value);
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        type: "checkbox",
        name: this.__name,
        value: this.__uri(this.__value),
        checked: this.__value
      });
      return m("input", ma);
    };

    return checkbox;

  })(basic_input);

  InputTie.type.radio = (function(superClass) {
    extend(radio, superClass);

    function radio() {
      return radio.__super__.constructor.apply(this, arguments);
    }

    radio.prototype._value = e_value;

    radio.prototype._attr = change_attr;

    radio.prototype.field = function(m_attr) {
      var list, option, value;
      if (m_attr == null) {
        m_attr = {};
      }
      list = (function() {
        var ref3, results;
        ref3 = this.options;
        results = [];
        for (value in ref3) {
          option = ref3[value];
          if (!option.hidden) {
            results.push(this.item(value, m_attr));
          }
        }
        return results;
      }).call(this);
      if (!(this.attr.required && this.format.current)) {
        list.unshift(this.item("", m_attr));
      }
      return list;
    };

    radio.prototype.item = function(value, m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(value);
      ma = this._attr(this.attr, m_attr, option, {
        className: [this.attr.className, option.className, m_attr.className].join(" "),
        type: "radio",
        name: this.__name,
        value: this.__uri(value),
        checked: value === this.__value
      });
      return m("input", ma, option.label, option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    return radio;

  })(basic_input);

  InputTie.type.select = (function(superClass) {
    extend(select, superClass);

    function select() {
      return select.__super__.constructor.apply(this, arguments);
    }

    select.prototype._value = e_value;

    select.prototype._attr = change_attr;

    select.prototype.option_default = {
      className: "",
      label: "―――"
    };

    select.prototype.field = function(m_attr) {
      var list, ma, option, value;
      if (m_attr == null) {
        m_attr = {};
      }
      list = (function() {
        var ref3, results;
        ref3 = this.options;
        results = [];
        for (value in ref3) {
          option = ref3[value];
          if (!option.hidden) {
            results.push(this.item(value, m_attr));
          }
        }
        return results;
      }).call(this);
      if (!(this.attr.required && this.format.current)) {
        list.unshift(this.item("", m_attr));
      }
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        name: this.__name
      });
      return m('select', ma, list);
    };

    return select;

  })(basic_input);

  InputTie.type.select.multiple = (function(superClass) {
    extend(multiple, superClass);

    function multiple() {
      return multiple.__super__.constructor.apply(this, arguments);
    }

    multiple.prototype._value = e_selected;

    multiple.prototype._attr = change_attr;

    multiple.prototype.field = function(m_attr) {
      var ma, option, value;
      if (m_attr == null) {
        m_attr = {};
      }
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        name: this.__name
      });
      return m('select', ma, (function() {
        var ref3, results;
        ref3 = this.options;
        results = [];
        for (value in ref3) {
          option = ref3[value];
          if (!option.hidden) {
            results.push(this.item(value));
          }
        }
        return results;
      }).call(this));
    };

    multiple.prototype.item = function(value, m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(value);
      ma = option_pick(this.attr, m_attr, option, {
        className: [option.className, m_attr.className].join(" "),
        value: this.__uri(value),
        selected: this.__value[value]
      });
      return m('option', ma, ma.label);
    };

    return multiple;

  })(basic_input);

}).call(this);

(function() {
  var InputTie, _, _pick, btn_input, c_icon, c_stack, c_tap, m,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  m = require("mithril");

  _ = require("lodash");

  InputTie = module.exports.InputTie;

  _pick = function(attrs, last) {
    attrs = attrs.map(function(ma) {
      var target;
      target = ["id", "className"];
      if (ma.title) {
        target.push("title");
      }
      if (ma["data-tooltip"] != null) {
        target.push("data-tooltip");
      }
      return _.pick(ma, target);
    });
    return _.assignIn.apply(_, slice.call(attrs).concat([last]));
  };

  c_stack = function(bool, new_val, target) {
    if (target) {
      new_val.push(target);
    } else {
      new_val.pop();
    }
    return new_val;
  };

  c_tap = function(bool, new_val) {
    return new_val;
  };

  c_icon = function(bool, new_val) {
    if (bool) {
      return null;
    } else {
      return new_val;
    }
  };

  btn_input = (function(superClass) {
    extend(btn_input, superClass);

    function btn_input() {
      return btn_input.__super__.constructor.apply(this, arguments);
    }

    btn_input.prototype._attr = function() {
      var _id, attrs, b, className, css, disabled, i, last, ma, onchange, ref, selected, target, tie, value;
      attrs = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), last = arguments[i++];
      ref = b = this, _id = ref._id, tie = ref.tie;
      className = last.className, disabled = last.disabled, selected = last.selected, value = last.value, target = last.target;
      onchange = function() {
        if (b.timer) {
          return;
        }
        b._debounce()["catch"](function() {
          return b.timer = null;
        });
        value = b._value(selected, value, target);
        tie.do_change(b, value, ma);
        if (!b.dom.validity.valid) {
          return tie.do_fail(b, value, ma);
        }
      };
      css = "btn";
      if (!(disabled || tie.disabled)) {
        css += " edge";
      }
      if (selected) {
        css += " active";
      }
      if (className) {
        css += " " + className;
      }
      return ma = _pick(attrs, {
        config: this.__config,
        className: css,
        onclick: onchange,
        onmouseup: onchange,
        ontouchend: onchange
      });
    };

    btn_input.prototype.do_change = function(value) {
      var error, pattern, ref, required;
      ref = this.attr, pattern = ref.pattern, required = ref.required;
      if (this.dom) {
        if (required && !value) {
          error = "このフィールドを入力してください。";
        }
        if (pattern && value.match(new Regexp(pattern))) {
          error = "指定されている形式で入力してください。";
        }
        this.error(error);
      }
      return btn_input.__super__.do_change.apply(this, arguments);
    };

    btn_input.prototype.head = function(m_attr) {
      var ma, name;
      if (m_attr == null) {
        m_attr = {};
      }
      name = this.format.name;
      ma = this._attr_label(m_attr);
      return m("h6", ma, name);
    };

    return btn_input;

  })(InputTie.type.hidden);

  InputTie.type.toggle = (function(superClass) {
    extend(toggle, superClass);

    function toggle() {
      return toggle.__super__.constructor.apply(this, arguments);
    }

    toggle.prototype._value = c_tap;

    toggle.prototype.field = function(m_attr) {
      var ma, next, option;
      if (m_attr == null) {
        m_attr = {};
      }
      next = this.__value;
      option = this.option(next);
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        value: next
      });
      return m("span", ma, option.label, option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    return toggle;

  })(btn_input);

  InputTie.type.checkbox_btn = (function(superClass) {
    extend(checkbox_btn, superClass);

    function checkbox_btn() {
      return checkbox_btn.__super__.constructor.apply(this, arguments);
    }

    checkbox_btn.prototype._value = c_tap;

    checkbox_btn.prototype.type = "Bool";

    checkbox_btn.prototype.option = function(value) {
      var ref, sw;
      sw = value ? "on" : "off";
      return ((ref = this.options) != null ? ref[sw] : void 0) || {};
    };

    checkbox_btn.prototype.field = function(m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(this.__value);
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        selected: this.__value,
        value: this.__value
      });
      return m("span", ma, this.__name, option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    return checkbox_btn;

  })(btn_input);

  InputTie.type.icon = (function(superClass) {
    var bigicon, menuicon, tags;

    extend(icon, superClass);

    function icon() {
      return icon.__super__.constructor.apply(this, arguments);
    }

    icon.prototype._value = c_icon;

    icon.prototype.option_default = {
      className: "",
      label: "",
      "data-tooltip": "選択しない"
    };

    icon.prototype.field = function(m_attr) {
      if (m_attr == null) {
        m_attr = {};
      }
      throw "not implement";
    };

    icon.prototype["with"] = function(value, mode) {
      var bool;
      bool = this.__value === value;
      switch (mode) {
        case bool:
          return this._with[value]();
        case !bool:
          return null;
        default:
          this._with = {};
          return this._with[value] = mode;
      }
    };

    icon.prototype.item = function(value, m_attr) {
      var ma, option, tag;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(value);
      tag = m_attr.tag || "menuicon";
      ma = this._attr(this.attr, m_attr, option, {
        className: [this.attr.className, m_attr.className, option.className].join(" "),
        selected: value === this.__value,
        value: value
      });
      return tags[tag](value, ma, option);
    };

    menuicon = function(icon, attr, option) {
      return m("a.menuicon", attr, m("span.icon-" + icon), option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    bigicon = function(icon, attr, option) {
      return m("section", attr, m(".bigicon", m("span.icon-" + icon)), option.badge ? m(".badge.pull-right", option.badge()) : void 0);
    };

    tags = {
      menuicon: menuicon,
      bigicon: bigicon
    };

    return icon;

  })(btn_input);

  InputTie.type.btns = (function(superClass) {
    extend(btns, superClass);

    function btns() {
      return btns.__super__.constructor.apply(this, arguments);
    }

    btns.prototype._value = c_tap;

    btns.prototype.item = function(value, m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(value);
      ma = this._attr(this.attr, m_attr, option, {
        className: [this.attr.className, option.className, m_attr.className].join(" "),
        selected: value === this.__value,
        value: value
      });
      return m("span", ma, option.label, option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    btns.prototype.field = function(m_attr) {
      var list, option, value;
      if (m_attr == null) {
        m_attr = {};
      }
      list = (function() {
        var ref, results;
        ref = this.options;
        results = [];
        for (value in ref) {
          option = ref[value];
          if (!option.hidden) {
            results.push(this.item(value, m_attr));
          }
        }
        return results;
      }).call(this);
      if (!(this.attr.required && this.format.current)) {
        list.unshift(this.item("", m_attr));
      }
      return list;
    };

    return btns;

  })(btn_input);

  InputTie.type.btns.multiple = (function(superClass) {
    extend(multiple, superClass);

    function multiple() {
      return multiple.__super__.constructor.apply(this, arguments);
    }

    multiple.prototype._value = c_tap;

    multiple.prototype.item = function(value, m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(value);
      ma = this._attr(this.attr, m_attr, option, {
        className: [this.attr.className, option.className, m_attr.className].join(" "),
        selected: this.__value[value],
        value: this.__value[value]
      });
      return m("span", ma, option.label, option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    multiple.prototype.field = function(m_attr) {
      var _id, attr, option, ref, ref1, results, value;
      if (m_attr == null) {
        m_attr = {};
      }
      ref = this.format, _id = ref._id, attr = ref.attr;
      this.__values = this.tie.params[_id];
      ref1 = this.options;
      results = [];
      for (value in ref1) {
        option = ref1[value];
        if (!option.hidden) {
          results.push(this.item(value, m_attr));
        }
      }
      return results;
    };

    return multiple;

  })(btn_input);

  InputTie.type.stack = (function(superClass) {
    extend(stack, superClass);

    function stack() {
      return stack.__super__.constructor.apply(this, arguments);
    }

    stack.prototype._value = c_stack;

    stack.prototype.type = "Array";

    stack.prototype.field = function(m_attr) {
      if (m_attr == null) {
        m_attr = {};
      }
      throw "not implement";
    };

    stack.prototype.item = function(target, m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(target);
      ma = this._attr(this.attr, m_attr, option, {
        className: [this.attr.className, option.className, m_attr.className].join(" "),
        target: target,
        value: this.__value
      });
      return m("span", ma, option.label, option.badge ? m(".emboss.pull-right", option.badge()) : void 0);
    };

    stack.prototype.back = function(m_attr) {
      if (m_attr == null) {
        m_attr = {};
      }
      return this.item("", m_attr);
    };

    return stack;

  })(btn_input);

}).call(this);

(function() {
  var InputTie, Mem, OBJ, Tie, _, _pick, browser, capture, m, mouse, ratio, ref, touch, touch_A, touch_B,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Mem = require("memory-record");

  m = require("mithril");

  _ = require("lodash");

  ref = module.exports, InputTie = ref.InputTie, Tie = ref.Tie;

  ratio = window.devicePixelRatio;

  OBJ = function() {
    return new Object(null);
  };

  capture = function(arg, e) {
    var ctx, dom, e_touch, rect;
    dom = arg.dom, ctx = arg.ctx;
    ctx.offset = null;
    ctx.offsets = [];
    if (!((e != null) && (ctx != null))) {
      return ctx.offsets;
    }
    if (e.touches != null) {
      rect = dom.getBoundingClientRect();
      ctx.offsets = (function() {
        var i, len, ref1, results;
        ref1 = e.touches;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          e_touch = ref1[i];
          results.push(touch(e_touch, rect));
        }
        return results;
      })();
      if (1 === e.touches.length) {
        ctx.offset = ctx.offsets[0];
      }
    } else {
      ctx.offset = mouse(e);
      if (ctx.offset != null) {
        ctx.offsets = [ctx.offset];
      }
    }
    return ctx.history.push(ctx.offsets);
  };

  mouse = function(event) {
    var x, y;
    x = event.offsetX || event.layerX;
    y = event.offsetY || event.layerY;
    if ((x != null) && (y != null)) {
      x *= ratio;
      y *= ratio;
      return [x, y];
    }
  };

  touch_A = function(arg, arg1) {
    var left, pageX, pageY, top, x, y;
    pageX = arg.pageX, pageY = arg.pageY;
    left = arg1.left, top = arg1.top;
    x = ratio * (pageX - left - window.scrollX);
    y = ratio * (pageY - top - window.scrollY);
    return [x, y];
  };

  touch_B = function(arg, arg1) {
    var left, pageX, pageY, top, x, y;
    pageX = arg.pageX, pageY = arg.pageY;
    left = arg1.left, top = arg1.top;
    x = ratio * (pageX - left);
    y = ratio * (pageY - top - window.scrollY);
    return [x, y];
  };

  touch = touch_B;

  _pick = function(attrs, last) {
    return _.assignIn.apply(_, [{}].concat(slice.call(attrs), [last]));
  };

  browser = function() {
    var chrome, ff, ios, old, ref1;
    ref1 = Tie.browser, ios = ref1.ios, ff = ref1.ff, old = ref1.old, chrome = ref1.chrome;
    return touch = ios || ff || old && chrome ? touch_A : touch_B;
  };

  InputTie.type.canvas = (function(superClass) {
    extend(canvas, superClass);

    canvas.prototype.type = "Array";

    canvas.prototype._views = InputTie.util.canvas.Views;

    canvas.prototype._config = function(dom, isStay, ctx1) {
      this.ctx = ctx1;
      canvas.__super__._config.apply(this, arguments);
      if (!isStay) {
        this.views.dom(this.dom);
        this.do_blur();
      }
      return this.views.background(this.size);
    };

    function canvas() {
      this.views = new this._views(this);
      canvas.__super__.constructor.apply(this, arguments);
    }

    canvas.prototype.do_draw = function() {};

    canvas.prototype.do_focus = function(e) {
      return this.ctx.is_touch = true;
    };

    canvas.prototype.do_blur = function(e) {
      this.ctx.is_touch = false;
      this.ctx.history = [];
      return this.views.draw(this.ctx);
    };

    canvas.prototype.do_move = function() {
      var history, is_touch, offset, offsets, ref1;
      ref1 = this.ctx, is_touch = ref1.is_touch, offset = ref1.offset, offsets = ref1.offsets, history = ref1.history;
      if (offset) {
        if (is_touch) {
          this.views.touch(offset);
        } else {
          this.views.over(offset);
        }
      }
      this.views.draw(this.ctx);
      return this.tie.do_change(this, this._value(this.ctx));
    };

    canvas.prototype.do_fail = function(offset) {};

    canvas.prototype.do_change = function(offset) {};

    canvas.prototype._value = function(e) {
      return e.offset;
    };

    canvas.prototype._attr = function() {
      var _value, attrs, b, blur, cancel, ctx, focus, ma, move, ref1, tie;
      attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ref1 = b = this, _value = ref1._value, tie = ref1.tie, ctx = ref1.ctx;
      focus = function(e) {
        tie.do_focus(b, e);
        return move(e);
      };
      blur = function(e) {
        move(e);
        return tie.do_blur(b, e);
      };
      move = function(e) {
        capture(b, e);
        return b.do_move();
      };
      cancel = function(e) {
        capture(b, e);
        tie.do_fail(b, _value(b.ctx));
        return tie.do_blur(b, e);
      };
      return ma = _pick(attrs, {
        config: this.__config,
        ontouchend: blur,
        ontouchmove: move,
        ontouchstart: focus,
        ontouchcancel: cancel,
        onmouseup: blur,
        onmousemove: move,
        onmousedown: focus,
        onmouseout: blur,
        onmouseover: move
      });
    };

    canvas.prototype.field = function(m_attr) {
      var h, ma, ref1, w;
      if (m_attr == null) {
        m_attr = {};
      }
      ref1 = this.size = m_attr.size || this.attr.size, w = ref1[0], h = ref1[1];
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        width: w,
        height: h,
        style: "width: " + (w / ratio) + "px; height: " + (h / ratio) + "px;"
      });
      return m("canvas", ma);
    };

    return canvas;

  })(InputTie.type.hidden);

}).call(this);

(function() {
  var Fabric, InputTie, Tie, _pick, chk_canvas, m, new_canvas, ratio, ref,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  m = require("mithril");

  ref = module.exports, InputTie = ref.InputTie, Tie = ref.Tie;

  ratio = window.devicePixelRatio;

  _pick = function(attrs, last) {
    return _.assignIn.apply(_, [{}].concat(slice.call(attrs), [last]));
  };

  new_canvas = function(dom) {
    return new fabric.Canvas(dom, {
      enableRetinaScaling: true
    });
  };

  chk_canvas = function() {
    if (!fabric) {
      throw "require fabric.js";
    }
  };

  Fabric = (function() {
    Fabric.prototype.type = "String";

    Fabric.prototype.do_draw = function() {};

    Fabric.prototype.do_focus = function(e) {};

    Fabric.prototype.do_blur = function(e) {};

    Fabric.prototype.do_fail = function(offset) {};

    Fabric.prototype.do_change = function(offset) {};

    function Fabric(tie1, input) {
      this.tie = tie1;
      this.input = input;
    }

    Fabric.prototype.deploy = function(canvas, size) {};

    Fabric.prototype.redraw = function(canvas, size) {};

    Fabric.prototype.resize = function(canvas, size) {};

    return Fabric;

  })();

  InputTie.type.fabric = (function(superClass) {
    extend(fabric, superClass);

    fabric.extend = function(name, view) {
      chk_canvas();
      return InputTie.type[name] = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.type = view.prototype.type;

        _Class.prototype._view = view;

        return _Class;

      })(this);
    };

    fabric.prototype.type = "Array";

    fabric.prototype._view = Fabric;

    fabric.prototype._config = function(dom, isStay, ctx) {
      var height, ref1, width;
      fabric.__super__._config.apply(this, arguments);
      ref1 = this.size, width = ref1[0], height = ref1[1];
      if (!isStay) {
        this.canvas = new_canvas(dom);
        this.view.deploy(this.canvas, this.size);
      }
      if (this.size[0] === this.size_old[0] && this.size[1] === this.size_old[1]) {
        this.canvas.renderAll();
        this.view.redraw(this.canvas, this.size);
      } else {
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
        console.log("resize " + [width, height]);
        this.view.resize(this.canvas, this.size);
      }
      return this.size_old = this.size;
    };

    function fabric() {
      fabric.__super__.constructor.apply(this, arguments);
      this.size_old = [0, 0];
      this.view = new this._view(this.tie, this);
      this.view.__val = this.__val;
    }

    fabric.prototype.do_draw = function() {};

    fabric.prototype.do_focus = function(e) {};

    fabric.prototype.do_blur = function(e) {};

    fabric.prototype.do_fail = function(offset) {};

    fabric.prototype.do_change = function(offset) {};

    fabric.prototype._value = function(e) {
      return e.offset;
    };

    fabric.prototype._attr = function() {
      var _value, attrs, b, ctx, ma, ref1, tie;
      attrs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ref1 = b = this, _value = ref1._value, tie = ref1.tie, ctx = ref1.ctx;
      return ma = _pick(attrs, {
        config: this.__config
      });
    };

    fabric.prototype.field = function(m_attr) {
      var h, ma, ref1, w;
      if (m_attr == null) {
        m_attr = {};
      }
      ref1 = this.size = m_attr.size || this.attr.size, w = ref1[0], h = ref1[1];
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        width: w,
        height: h
      });
      return m("canvas", ma);
    };

    return fabric;

  })(InputTie.type.hidden);

}).call(this);

(function() {
  var InputTie, _, i, key, len, m, ref, text_input, text_point,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  m = require("mithril");

  _ = require("lodash");

  InputTie = module.exports.InputTie;

  text_point = function(size) {
    var pt;
    pt = 20;
    if (50 < size) {
      pt += (size - 50) / 14;
    }
    return Math.floor(pt);
  };

  text_input = (function(superClass) {
    extend(text_input, superClass);

    function text_input() {
      return text_input.__super__.constructor.apply(this, arguments);
    }

    text_input.prototype.do_draw = function() {
      var line, point, size, sjis, unit;
      unit = this.attr.unit;
      this.__name = this.attr.name || this._id;
      this.__value = this.tie.params[this._id];
      size = this.__value.length;
      sjis = this.__value.sjis_length;
      line = this.__value.split("\n").length;
      if ("point" === unit) {
        point = text_point(sjis);
      }
      return this.calc = {
        point: point,
        line: line,
        sjis: sjis,
        size: size
      };
    };

    text_input.prototype.do_change = function(value) {
      var error, line, max_line, max_sjis, maxlength, minlength, not_player, not_secret, pattern, ref, ref1, ref2, required, sjis, unit;
      ref = this.attr, not_secret = ref.not_secret, not_player = ref.not_player, unit = ref.unit, max_sjis = ref.max_sjis, max_line = ref.max_line, minlength = ref.minlength, maxlength = ref.maxlength, pattern = ref.pattern, required = ref.required;
      ref1 = this.calc, line = ref1.line, sjis = ref1.sjis;
      if (this.dom) {
        if (not_secret && value.match(/>>[\=\*\!]\d+/g)) {
          error = "あぶない！秘密会話へのアンカーがあります！";
        }
        if (not_player && value.match(/\/\*|\*\//g)) {
          error = "/*中の人の発言があります。*/";
        }
        if (max_line && max_line < line) {
          error = "このテキストを " + max_line + " 行以下にしてください。";
        }
        if (max_sjis && max_sjis < sjis) {
          error = "このテキストを " + max_sjis + " 文字以下にしてください。";
        }
        if (minlength && (0 < (ref2 = value.length) && ref2 < minlength)) {
          if (!InputTie.skip_minlength) {
            error = "このテキストは " + minlength + " 文字以上で指定してください（現在は " + value.length + " 文字です）。";
          }
        }
        this.error(error);
      }
      return text_input.__super__.do_change.apply(this, arguments);
    };

    text_input.prototype.foot = function(m_attr) {
      var ma, mark, max_size, size;
      if (m_attr == null) {
        m_attr = {};
      }
      ma = this._attr_label(this.attr, m_attr);
      size = this.calc.size;
      if (ma.maxlength) {
        max_size = ma.maxlength;
      }
      if (ma.max_sjis) {
        size = this.calc.sjis;
        max_size = ma.max_sjis;
      }
      if (this.calc.point) {
        mark = m("span.emboss", this.calc.point + "pt ");
      } else {
        mark = "";
      }
      if (!this.dom || this.dom.validationMessage) {
        mark = m("span.WSAY.emboss", "⊘");
      }
      return [mark, " " + size, max_size != null ? m("sub", "/" + max_size) : void 0, m("sub", "字"), " " + this.calc.line, ma.max_line != null ? m("sub", "/" + ma.max_line) : void 0, m("sub", "行")];
    };

    return text_input;

  })(InputTie.type.hidden);

  InputTie.type.textarea = (function(superClass) {
    extend(textarea, superClass);

    function textarea() {
      return textarea.__super__.constructor.apply(this, arguments);
    }

    textarea.prototype.field = function(m_attr) {
      var ma;
      if (m_attr == null) {
        m_attr = {};
      }
      ma = this._attr(this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        name: this.__name
      });
      return m("textarea", ma, this.__value);
    };

    return textarea;

  })(text_input);

  ref = ["text", "search", "url", "email"];
  for (i = 0, len = ref.length; i < len; i++) {
    key = ref[i];
    InputTie.type[key] = text_input;
  }

}).call(this);

(function() {
  var InputTie, Mem, OBJ, Tie, Timeline, View, Views, _, m, mestype_orders, ref, ref1, timespan,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Mem = require("memory-record");

  m = require("mithril");

  _ = require("lodash");

  ref = module.exports, InputTie = ref.InputTie, Tie = ref.Tie;

  OBJ = function() {
    return new Object(null);
  };

  timespan = 1000 * 3600;

  mestype_orders = ["SAY", "MSAY", "VSAY", "VGSAY", "GSAY", "SPSAY", "WSAY", "XSAY", "BSAY", "AIM", "TSAY", "MAKER", "ADMIN"];

  ref1 = InputTie.util.canvas, View = ref1.View, Views = ref1.Views;

  Timeline = (function(superClass) {
    extend(Timeline, superClass);

    function Timeline() {
      return Timeline.__super__.constructor.apply(this, arguments);
    }

    Timeline.prototype.dom = function(dom) {
      var ref2;
      this.dom = dom;
      Timeline.__super__.dom.apply(this, arguments);
      return ref2 = this.build(View, View), this.field = ref2[0], this.foots = ref2[1], ref2;
    };

    Timeline.prototype.resize = function(size) {
      var height, heights, i, j, left, len, len1, mask, max_height, mestype, time_id, top, width;
      Timeline.__super__.resize.apply(this, arguments);
      this.base = Mem.Query.messages.talk(talk(), open(), potofs_hide());
      if (!base.reduce) {
        return;
      }
      this.masks = this.base.reduce.mask || {};
      heights = (function() {
        var ref2, results;
        ref2 = this.masks;
        results = [];
        for (time_id in ref2) {
          mask = ref2[time_id];
          results.push(mask.all.count);
        }
        return results;
      }).call(this);
      max_height = Math.max.apply(Math, heights);
      this.time_ids = _.sortBy(Object.keys(this.masks), Mem.unpack.Date);
      width = size[0], height = size[1];
      this.field.fit({
        size: [width, height - 50],
        view: [this.time_ids.length, max_height]
      });
      this.foots.fit({
        offset: [0, height - 50],
        size: [width, 50],
        view: [this.time_ids.length, 1]
      });
      this.field.pen({
        fillStyle: RAILS.log.colors.back,
        globalAlpha: 0.5
      });
      this.field.fill();
      for (left = i = 0, len = time_ids.length; i < len; left = ++i) {
        time_id = time_ids[left];
        mask = masks[time_id];
        top = max_height;
        for (j = 0, len1 = mestype_orders.length; j < len1; j++) {
          mestype = mestype_orders[j];
          if (!mask[mestype]) {
            continue;
          }
          height = mask[mestype].count;
          top -= height;
          this.field.pen({
            fillStyle: RAILS.log.colors[mestype],
            globalAlpha: 1
          });
          this.field.rect([left, top], [1, height]);
        }
      }
      return this.foots.path((function(_this) {
        return function() {
          var event, k, len2, ref2, results, right;
          ref2 = Mem.Query.events.list;
          results = [];
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            event = ref2[k];
            if (!event.created_at) {
              continue;
            }
            right = index_at(event.updated_at);
            left = index_at(event.created_at);
            _this.foots.pen({
              strokeStyle: RAILS.log.colors.line,
              globalAlpha: 1
            });
            _this.foots.moveTo(left, 1);
            _this.foots.lineTo(left, 0);
            _this.foots.moveTo(right, 1);
            _this.foots.lineTo(right, 0);
            _this.foots.pen({
              fillStyle: RAILS.log.colors.event
            });
            _this.foots.fill();
            _this.foots.pen({
              font: "30px serif",
              textAlign: "left",
              fillStyle: RAILS.log.colors.text
            });
            results.push(_this.foots.text(event.name, [left, 38], right - left));
          }
          return results;
        };
      })(this));
    };

    Timeline.prototype.draw = function(ctx) {
      var focus, x;
      this.ctx = ctx;
      focus = Mem.Query.messages.find(Url.params.talk_at);
      if (!focus) {
        return;
      }
      x = this.index(focus.updated_at);
      return this.field.path((function(_this) {
        return function() {
          _this.field.pen({
            strokeStyle: RAILS.log.colors.focus,
            globalAlpha: 1
          });
          _this.field.moveTo(x, _this.show_height);
          return _this.field.lineTo(x, 0);
        };
      })(this));
    };

    Timeline.prototype.index = function(updated_at) {
      return this.time_ids.indexOf(Mem.pack.Date(updated_at / timespan));
    };

    Timeline.prototype.choice = function(x, query) {
      var index, o;
      index = Math.floor(x);
      o = this.masks[this.time_ids[index]].all.min_is;
      Url.params.talk_at = o._id;
      Url.params.icon("search");
      Url.params.scope("talk");
      Url.params.scroll("");
      return win.scroll.rescroll(Url.prop.talk_at);
    };

    Timeline.prototype.touch = function(at) {
      Url.params.search = "";
      this.field.touch(at, (function(_this) {
        return function(x) {
          return _this.choice(x, base);
        };
      })(this));
      return this.foots.touch(at, (function(_this) {
        return function(x) {
          return _this.choice(x, Mem.Query.messages.talk("open", false, {}));
        };
      })(this));
    };

    return Timeline;

  })(Views);

  InputTie.type.timeline = (function(superClass) {
    extend(timeline, superClass);

    function timeline() {
      return timeline.__super__.constructor.apply(this, arguments);
    }

    timeline.prototype.type = "Array";

    timeline.prototype._graph = Timeline;

    return timeline;

  })(InputTie.type.canvas);

}).call(this);
