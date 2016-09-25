(function() {
  var Demo, OBJ, ratio,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  OBJ = function() {
    return new Object(null);
  };

  ratio = window.devicePixelRatio;

  InputTie.type.fabric.extend(function(view, input) {
    view = (function() {
      function view(tie1, input1) {
        this.tie = tie1;
        this.input = input1;
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
        this.circle = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          angle: 30,
          strokeWidth: 5,
          stroke: 'rgba(100,200,200,0.5)'
        });
        (function() {
          return this.circle.setGradientFill({
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
        this.rect.on({
          mouseup: (function(_this) {
            return function() {
              return _this.input.attr.size = [600, 600];
            };
          })(this)
        });
        this.circle.on(logger("circle", ["touch:gesture", "touch:drag", "touch:orientation", "touch:shake", "touch:longpress", "added", "removed", "selected", "deselected", "modified", "rotating", "scaling", "moving", "skewing", "mousedown", "mouseup", "mouseover", "mouseout"]));
        return canvas.on(logger("canvas", ["object:added", "object:modified", "object:rotating", "object:scaling", "object:moving", "object:selected", "before:selection:cleared", "selection:cleared", "selection:created", "path:created"]));
      };

      view.prototype.redraw = function(canvas, size) {
        var height, width;
        return width = size[0], height = size[1], size;
      };

      view.prototype.resize = function(canvas, size) {
        var height, width;
        width = size[0], height = size[1];
        canvas.add(this.rect);
        canvas.add(this.circle);
        canvas.add(this.haiku);
        if (this.face) {
          canvas.add(this.face);
        }
        return;
        return fabric.loadSVGFromURL('file://japanHigh.svg', (function(_this) {
          return function(objs, options) {
            _this.japan = fabric.util.groupSVGElements(objs, options);
            return canvas.add(_this.japan);
          };
        })(this));
      };

      return view;

    })();
    return InputTie.type.my_fabric = (function(superClass) {
      extend(my_fabric, superClass);

      function my_fabric() {
        return my_fabric.__super__.constructor.apply(this, arguments);
      }

      my_fabric.prototype.type = "Array";

      my_fabric.prototype._views = view;

      my_fabric.prototype._value = function(e) {
        return e.offset;
      };

      my_fabric.prototype.do_draw = function() {};

      my_fabric.prototype.do_focus = function(e) {};

      my_fabric.prototype.do_blur = function(e) {};

      my_fabric.prototype.do_fail = function(offset) {};

      my_fabric.prototype.do_change = function(offset) {};

      return my_fabric;

    })(input);
  });

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
