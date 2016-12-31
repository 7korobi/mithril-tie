(function() {
  var Demo, OBJ, view,
    slice = [].slice;

  OBJ = function() {
    return new Object(null);
  };

  InputTie.type.fabric.extend("my_fabric", view = (function() {
    view.prototype.type = "String";

    view.prototype.do_draw = function() {};

    view.prototype.do_focus = function(e) {};

    view.prototype.do_blur = function(e) {};

    view.prototype.do_fail = function(offset) {};

    view.prototype.do_change = function(args) {
      return console.warn(args);
    };

    function view(tie1, input) {
      this.tie = tie1;
      this.input = input;
    }

    view.prototype.deploy = function(canvas, size) {
      var height, logger, width;
      width = size[0], height = size[1];
      this.rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: "blue",
        width: 200,
        height: 200,
        angle: 45,
        rx: 10,
        strokeWidth: 5,
        stroke: 'rgba(100,200,200,0.5)'
      });
      this.rect.on({
        mouseup: (function(_this) {
          return function() {
            _this.input.attr.size = [600, 600];
            return _this.tie.do_change(_this, "rect");
          };
        })(this)
      });
      this.circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        angle: 30,
        strokeWidth: 5,
        stroke: 'rgba(100,200,200,0.5)'
      });
      this.circle.setGradient("fill", {
        type: "linear",
        x1: 0,
        y1: 0,
        x2: 0,
        y2: this.circle.height,
        colorStops: {
          0.0: '#000',
          0.5: '#fff',
          1.0: '#000'
        }
      });
      this.circle.on({
        mouseup: (function(_this) {
          return function() {
            _this.input.attr.size = [800, 600];
            return _this.tie.do_change(_this, "circle");
          };
        })(this)
      });
      this.haiku = new fabric.Text("古池や\n蛙飛び込む\n水の音", {
        fontFamily: '花園明朝A',
        fontSize: 50,
        strokeWidth: 2,
        strokeStyle: '#008811',
        fill: "#00aa22",
        left: 200,
        top: 100,
        angle: 10
      });
      fabric.Image.fromURL('http://giji-assets.s3-website-ap-northeast-1.amazonaws.com/images/portrate/g04.jpg', (function(_this) {
        return function(face) {
          _this.face = face;
          requestAnimationFrame(function() {
            _this.face.animate("left", width - 100, {
              duration: 2000,
              easing: fabric.util.ease.easeOutBounce
            });
            _this.face.animate("top", height - 30, {
              duration: 2000,
              easing: fabric.util.ease.easeInBounce
            });
            _this.face.animate("angle", -300, {
              duration: 1000,
              easing: fabric.util.ease.easeInElastic
            });
            return _this.face.animate("angle", 100, {
              duration: 3000,
              easing: fabric.util.ease.easeOutElastic,
              onChange: function() {
                return canvas.renderAll();
              }
            });
          });
          return canvas.add(_this.face);
        };
      })(this));
      logger = function(title, list) {
        var call, e, h;
        h = {};
        e = [];
        call = _.debounce(function() {
          m.redraw();
          return console.warn(e);
        }, 200);
        list.map(function(key) {
          return h[key] = function() {
            e = [title, key].concat(slice.call(arguments));
            return call();
          };
        });
        return h;
      };
      this.circle.on(logger("circle", ["touch:gesture", "touch:drag", "touch:orientation", "touch:shake", "touch:longpress", "added", "removed", "selected", "deselected", "modified", "rotating", "scaling", "moving", "skewing", "mousedown", "mouseup", "mouseover", "mouseout"]));
      canvas.on(logger("canvas", ["object:added", "object:modified", "object:rotating", "object:scaling", "object:moving", "object:selected", "before:selection:cleared", "selection:cleared", "selection:created", "path:created"]));
      canvas.add(this.rect);
      canvas.add(this.circle);
      return canvas.add(this.haiku);
    };

    view.prototype.redraw = function(canvas, size) {
      var height, width;
      return width = size[0], height = size[1], size;
    };

    view.prototype.resize = function(canvas, size) {
      var height, width;
      width = size[0], height = size[1];
      return;
      return fabric.loadSVGFromURL('file://japanHigh.svg', (function(_this) {
        return function(objs, options) {
          _this.japan = fabric.util.groupSVGElements(objs, options);
          return canvas.add(_this.japan);
        };
      })(this));
    };

    return view;

  })());

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
      this.tie.change = function() {};
      this.tie.select = function() {
        return console.warn(["select"].concat(slice.call(arguments)));
      };
      this.bundles = [
        this.tie.bundle({
          _id: "fabric",
          attr: {
            type: "my_fabric",
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
      return m("div", m("hr"), fabric.field(), m("hr"), m("span", JSON.stringify(fabric.canvas)));
    }
  };

  m.mount(document.getElementById("win"), Demo);

  requestAnimationFrame(function() {
    return m.redraw();
  });

}).call(this);
