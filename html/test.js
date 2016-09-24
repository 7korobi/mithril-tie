(function() {
  var Demo, Fabric, OBJ,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  OBJ = function() {
    return new Object(null);
  };

  Fabric = (function() {
    function Fabric() {
      console.warn(["constructor"].concat(slice.call(arguments)));
      this.data = OBJ();
    }

    Fabric.prototype.draw = function(arg) {
      var history, is_touch, offset, offsets;
      is_touch = arg.is_touch, offset = arg.offset, offsets = arg.offsets, history = arg.history;
      return console.warn(["draw"].concat(slice.call(arguments)));
    };

    Fabric.prototype.dom = function(dom) {
      this.dom = dom;
      return console.warn(["dom"].concat(slice.call(arguments)));
    };

    Fabric.prototype.resize = function(size) {
      return console.warn(["resize"].concat(slice.call(arguments)));
    };

    Fabric.prototype.background = function(size) {
      return console.warn(["background"].concat(slice.call(arguments)));
    };

    Fabric.prototype.touch = function(at) {
      return console.warn(["touch"].concat(slice.call(arguments)));
    };

    Fabric.prototype.over = function(at) {
      return console.warn(["over"].concat(slice.call(arguments)));
    };

    return Fabric;

  })();

  InputTie.type.fabric = (function(superClass) {
    extend(fabric, superClass);

    function fabric() {
      return fabric.__super__.constructor.apply(this, arguments);
    }

    fabric.prototype.type = "Array";

    fabric.prototype._views = Fabric;

    return fabric;

  })(InputTie.type.canvas);

  Demo = {
    controller: function() {
      this.tie = new InputTie.btns({}, []);
      this.tie.stay = function(id, value) {};
      this.tie.change = function(id, value, old) {};
      this.tie.focus = function() {
        return console.warn(["focus"].concat(slice.call(arguments)));
      };
      this.tie.disable = function() {
        return console.warn(["disable"].concat(slice.call(arguments)));
      };
      this.tie.stay = function() {
        return console.warn(["stay"].concat(slice.call(arguments)));
      };
      this.tie.change = function() {
        return console.warn(["change"].concat(slice.call(arguments)));
      };
      this.tie.select = function() {
        return console.warn(["select"].concat(slice.call(arguments)));
      };
      this.bundles = [
        this.tie.bundle({
          _id: "fabric",
          attr: {
            type: "fabric",
            size: [800, 600]
          },
          name: "fabric 動作検証",
          current: null
        })
      ];
    },
    view: function(arg) {
      var fabric, ref, tie;
      tie = arg.tie, (ref = arg.bundles, fabric = ref[0]);
      tie.draw();
      return m("div", m("hr"), fabric.field(), m("hr"));
    }
  };

  m.mount(document.getElementById("win"), Demo);

}).call(this);
