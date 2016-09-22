/**
 mithril-tie - browser input helper for mithril
 @version v0.0.2
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
  var InputTie, Mem, Tie, _, _attr_form, m, submit_pick, validity_attr,
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

  _attr_form = function(tie, arg) {
    var attr, ma;
    attr = arg.attr;
    return ma = _.assignIn(attr, {
      config: tie._config(),
      disabled: tie.disabled,
      onsubmit: function(e) {
        tie.do_submit();
        return false;
      }
    });
  };

  validity_attr = {
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

  InputTie = (function() {
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

    InputTie.prototype._config = function(_id) {
      return (function(_this) {
        return function(elem, isNew, context) {
          if (isNew) {
            _this.do_view(_id, elem);
            return context.onunload = function() {
              return _this.do_view(_id);
            };
          }
        };
      })(this);
    };

    InputTie.prototype.do_view = function(id, elem) {
      if (id) {
        if (elem) {
          if (elem.validity == null) {
            elem.validity = {
              valid: true
            };
          }
          if (elem.checkValidity == null) {
            elem.checkValidity = function() {
              return this.validity.valid;
            };
          }
          if (elem.setCustomValidity == null) {
            elem.setCustomValidity = function(validationMessage) {
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
        }
        return this.input[id].do_view(elem);
      } else {
        return this.dom = elem;
      }
    };

    InputTie.prototype.do_change = function(id, value) {
      var input, old;
      input = this.input[id];
      value = input.__val(value);
      old = this.params[id];
      if (old === value) {
        this.stay(id, value);
      } else {
        this.params[id] = value;
        this.change(id, value, old);
      }
      input.do_change(value);
      return this.disabled = !!this.timer;
    };

    InputTie.prototype.do_fail = function(id, value) {
      var input;
      input = this.input[id];
      value = input.__val(value);
      return input.do_fail(value);
    };

    InputTie.prototype.do_blur = function(id, e) {
      return this.focus(id, false);
    };

    InputTie.prototype.do_focus = function(id, e) {
      this.focus(id, true, this.focus_id);
      this.focus_id = id;
      return this.focused = this.input[id];
    };

    InputTie.prototype.do_select = function(id, e) {
      var anchorOffset, focusOffset, offsets, s;
      s = getSelection();
      anchorOffset = s.anchorOffset, focusOffset = s.focusOffset;
      offsets = [anchorOffset, focusOffset].sort();
      return this.select(id, s.toString(), offsets);
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
      this.on();
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
          _this.off();
          return m.redraw();
        };
      })(this));
    };

    InputTie.prototype.action = function() {};

    InputTie.prototype.disable = function(id, b) {};

    InputTie.prototype.focus = function(id, b, old_id) {};

    InputTie.prototype.stay = function(id, value) {};

    InputTie.prototype.change = function(id, value, old_value) {};

    InputTie.prototype.select = function(id, str, offsets) {};

    InputTie.prototype.off = function() {
      this.disabled = false;
      this.disable(false);
      return this.timer = null;
    };

    InputTie.prototype.on = function() {
      this.disabled = true;
      return this.disable(true);
    };

    InputTie.prototype.cancel = function() {
      clearTimeout(this.timer);
      return this.off();
    };

    InputTie.prototype.errors = function(cb) {
      var dom, id, ref, results;
      ref = this.input;
      results = [];
      for (id in ref) {
        dom = ref[id].dom;
        if (dom) {
          if (dom.validationMessage) {
            results.push(cb(dom.validationMessage));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    InputTie.prototype.infos = function(cb) {
      var id, info_msg, ref, results;
      ref = this.input;
      results = [];
      for (id in ref) {
        info_msg = ref[id].info_msg;
        if (info_msg) {
          if (info_msg) {
            results.push(cb(info_msg));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
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
      ref = this._draw;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        draw = ref[i];
        results.push(draw());
      }
      return results;
    };

    InputTie.prototype.do_draw = function(cb) {
      return this._draw.push(cb);
    };

    InputTie.prototype.bundle = function(format) {
      var _id, attr, input, type;
      _id = format._id, attr = format.attr;
      InputTie.format(format);
      type = InputTie.type[attr.type];
      if (attr.multiple) {
        type = type.multiple;
      }
      this.input[_id] = input = new type(this, format);
      Tie.build_input(this.tie, _id, this.params, input);
      this.do_change(_id, this.params[_id]);
      return this.input[_id];
    };

    InputTie.prototype._submit = function(arg) {
      var attr;
      this.form = arg.form;
      attr = {};
      this._submit_attr = this.form ? function(__, attr) {
        return submit_pick(attr, {
          type: "submit",
          disabled: this.disabled
        });
      } : function(__, attr) {
        var submit;
        this.do_view(null, {});
        submit = (function(_this) {
          return function(e) {
            _this.do_submit();
            return false;
          };
        })(this);
        return submit_pick(attr, {
          type: "button",
          disabled: this.disabled,
          onclick: submit,
          onmouseup: submit,
          ontouchend: submit
        });
      };
      return this;
    };

    function InputTie(arg) {
      var i, id, ids, len;
      this.params = arg.params, ids = arg.ids;
      this.off();
      this._draw = [];
      this.input = {};
      this.tie = new Tie;
      this.prop = this.tie.prop;
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

    InputTie.type = {};

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
      console.warn("url changed.");
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
  var Tie, WebStore, cookie_prop, storage_prop;

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

  WebStore = (function() {
    function WebStore() {}

    WebStore.maps = function(ha) {
      this.session = Tie.build_store(ha.session, storage_prop, sessionStorage);
      this.local = Tie.build_store(ha.local, storage_prop, localStorage);
      this.cookie = Tie.build_store(ha.cookie, cookie_prop, this.cookie_options);
      return this.params = Tie.params;
    };

    WebStore.copyBy = function(source) {
      var i, len, ref, results, store;
      ref = Tie.types.store;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        store = ref[i];
        results.push(this[store].copyBy(source));
      }
      return results;
    };

    WebStore.copyTo = function(target) {
      var i, len, ref, results, store;
      ref = Tie.types.store;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        store = ref[i];
        results.push(this[store].copyTo(target));
      }
      return results;
    };

    WebStore.format = function(o) {
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

    return WebStore;

  })();

  module.exports.WebStore = WebStore;

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
  var InputTie, Mem, _, _attr_label, basic_input, change_attr, e_checked, e_selected, e_value, i, input_attr, input_pick, j, key, len, len1, m, number_input, option_pick, ref, ref1,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Mem = require("memory-record");

  m = require("mithril");

  _ = require("lodash");

  InputTie = module.exports.InputTie;

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
    var _id, attrs;
    _id = arguments[0], attrs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return _.assignIn.apply(_, attrs);
  };

  change_attr = function() {
    var _id, _value, attrs, b, ma, ref, tie;
    _id = arguments[0], attrs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    ref = b = this, _value = ref._value, tie = ref.tie;
    return ma = input_pick(attrs, {
      config: tie._config(_id),
      disabled: tie.disabled,
      onblur: function(e) {
        return tie.do_blur(_id, e);
      },
      onfocus: function(e) {
        return tie.do_focus(_id, e);
      },
      onselect: function(e) {
        return tie.do_select(_id, e);
      },
      onchange: function(e) {
        return tie.do_change(_id, _value(e), ma);
      },
      oninvalid: function(e) {
        return tie.do_fail(_id, _value(e), ma);
      }
    });
  };

  input_attr = function() {
    var _id, _value, attrs, b, ma, ref, tie;
    _id = arguments[0], attrs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    ref = b = this, _value = ref._value, tie = ref.tie;
    return ma = input_pick(attrs, {
      config: tie._config(_id),
      disabled: tie.disabled,
      onblur: function(e) {
        return tie.do_blur(_id, e);
      },
      onfocus: function(e) {
        return tie.do_focus(_id, e);
      },
      onselect: function(e) {
        return tie.do_select(_id, e);
      },
      oninput: function(e) {
        return tie.do_change(_id, _value(e), ma);
      },
      oninvalid: function(e) {
        return tie.do_fail(_id, _value(e), ma);
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

  basic_input = (function() {
    basic_input.prototype._attr_label = _attr_label;

    basic_input.prototype._value = e_value;

    basic_input.prototype._attr = input_attr;

    basic_input.prototype._debounce = InputTie.prototype._debounce;

    basic_input.prototype.timeout = 100;

    basic_input.prototype.type = "String";

    basic_input.prototype.default_option = {
      className: "icon-cancel-alt",
      label: ""
    };

    function basic_input(tie1, format) {
      var info, ref;
      this.tie = tie1;
      this.format = format;
      ref = this.format, this._id = ref._id, this.options = ref.options, this.attr = ref.attr, this.name = ref.name, this.current = ref.current, info = ref.info;
      this.__info = info;
      this.__uri = Mem.pack[this.type];
      this.__val = Mem.unpack[this.type];
      this.tie.do_draw(this.draw.bind(this));
    }

    basic_input.prototype.draw = function() {
      var info, label, ref;
      ref = this.format, info = ref.info, label = ref.label;
      this.__name = this.attr.name || this._id;
      return this.__value = this.tie.params[this._id];
    };

    basic_input.prototype.info = function(info_msg) {
      this.info_msg = info_msg != null ? info_msg : "";
    };

    basic_input.prototype.error = function(msg) {
      var ref;
      if (msg == null) {
        msg = "";
      }
      return (ref = this.dom) != null ? ref.setCustomValidity(msg) : void 0;
    };

    basic_input.prototype.do_view = function(dom) {
      this.dom = dom;
    };

    basic_input.prototype.do_fail = function(value) {};

    basic_input.prototype.do_change = function(value) {
      var key, max, max_line, max_sjis, maxlength, min, minlength, msg, not_player, not_secret, pattern, ref, ref1, required, step, type, unit, val;
      ref = this.attr, not_secret = ref.not_secret, not_player = ref.not_player, unit = ref.unit, max_sjis = ref.max_sjis, max_line = ref.max_line, minlength = ref.minlength, maxlength = ref.maxlength, min = ref.min, max = ref.max, step = ref.step, pattern = ref.pattern, type = ref.type, required = ref.required;
      if (this.dom && !this.dom.validity.customError) {
        if (this.format.error) {
          ref1 = this.dom.validity;
          for (key in ref1) {
            val = ref1[key];
            if (!(val)) {
              continue;
            }
            msg = this.format.error[validity_attr[key]];
            if (msg) {
              this.error(msg);
              return;
            }
          }
        }
      }
    };

    basic_input.prototype.option = function(value) {
      var ref;
      if (value) {
        return ((ref = this.options) != null ? ref[value] : void 0) || {};
      } else {
        return this.default_option;
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
        ma = this._attr_label(this._id, m_attr, this.format.label.attr);
        return m("label", ma, text);
      }
    };

    basic_input.prototype.field = function(m_attr) {
      var ma;
      if (m_attr == null) {
        m_attr = {};
      }
      ma = this._attr(this._id, this.attr, m_attr, {
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

  ref = ["hidden", "tel", "password", "datetime", "date", "month", "week", "time", "datetime-local", "color"];
  for (i = 0, len = ref.length; i < len; i++) {
    key = ref[i];
    InputTie.type[key] = basic_input;
  }

  ref1 = ["number", "range"];
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    key = ref1[j];
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
      var ref2, sw;
      sw = value ? "on" : "off";
      return ((ref2 = this.options) != null ? ref2[sw] : void 0) || {};
    };

    checkbox.prototype.field = function(m_attr) {
      var ma, option;
      if (m_attr == null) {
        m_attr = {};
      }
      option = this.option(this.__value);
      ma = this._attr(this._id, this.attr, m_attr, {
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
        var ref2, results;
        ref2 = this.options;
        results = [];
        for (value in ref2) {
          option = ref2[value];
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
      ma = this._attr(this._id, this.attr, m_attr, option, {
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

    select.prototype.default_option = {
      className: "",
      label: "ーーー"
    };

    select.prototype.field = function(m_attr) {
      var list, ma, option, value;
      if (m_attr == null) {
        m_attr = {};
      }
      list = (function() {
        var ref2, results;
        ref2 = this.options;
        results = [];
        for (value in ref2) {
          option = ref2[value];
          if (!option.hidden) {
            results.push(this.item(value, m_attr));
          }
        }
        return results;
      }).call(this);
      if (!(this.attr.required && this.format.current)) {
        list.unshift(this.item("", m_attr));
      }
      ma = this._attr(this._id, this.attr, m_attr, {
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
      ma = this._attr(this._id, this.attr, m_attr, {
        className: [this.attr.className, m_attr.className].join(" "),
        name: this.__name
      });
      return m('select', ma, (function() {
        var ref2, results;
        ref2 = this.options;
        results = [];
        for (value in ref2) {
          option = ref2[value];
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
      _id = arguments[0], attrs = 3 <= arguments.length ? slice.call(arguments, 1, i = arguments.length - 1) : (i = 1, []), last = arguments[i++];
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
        tie.do_change(_id, value, ma);
        if (!b.dom.validity.valid) {
          return tie.do_fail(_id, value, ma);
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
        config: tie._config(_id),
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
      ma = this._attr(this._id, this.attr, m_attr, {
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
      ma = this._attr(this._id, this.attr, m_attr, {
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

    icon.prototype.default_option = {
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
      ma = this._attr(this._id, this.attr, m_attr, option, {
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
      ma = this._attr(this._id, this.attr, m_attr, option, {
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
      ma = this._attr(this._id, this.attr, m_attr, option, {
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
      ma = this._attr(this._id, this.attr, m_attr, option, {
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

    text_input.prototype.draw = function() {
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
      var error, max_line, max_sjis, maxlength, minlength, not_player, not_secret, pattern, ref, ref1, required, unit;
      ref = this.attr, not_secret = ref.not_secret, not_player = ref.not_player, unit = ref.unit, max_sjis = ref.max_sjis, max_line = ref.max_line, minlength = ref.minlength, maxlength = ref.maxlength, pattern = ref.pattern, required = ref.required;
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
        if (minlength && (0 < (ref1 = value.length) && ref1 < minlength)) {
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
      ma = this._attr_label(this._id, this.attr, m_attr);
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
      ma = this._attr(this._id, this.attr, m_attr, {
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
