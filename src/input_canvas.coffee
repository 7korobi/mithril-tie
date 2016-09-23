Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie, Tie } = module.exports

OBJ = ->
  new Object null

capture = (ctx, e)->
  ctx.offset = null
  ctx.offsets = []
  return ctx.offsets unless e? && ctx?
  if e.touches?
    rect = ctx.getBoundingClientRect()
    ctx.offsets = for e_touch in e.touches
      touch(touch, rect) # touch device
    ctx.offset = ctx.offsets[0] if 1 == e.touches.length
  else
    ctx.offset = mouse(e) # mouse interface.
    ctx.offsets = [ctx.offset] if ctx.offset?
  ctx.history.push ctx.offsets


mouse = (event)->
  x = event.offsetX || event.layerX # PC || firefox
  y = event.offsetY || event.layerY # PC || firefox
  if x? && y?
    x *= 2
    y *= 2
    [x, y]


touch_A = ({pageX, pageY}, {left, top})->
  x = 2 * (pageX - left - window.scrollX)
  y = 2 * (pageY - top  - window.scrollY)
  [x, y]

touch_B = ({pageX, pageY}, {left, top})->
  x = 2 * (pageX - left)
  y = 2 * (pageY - top  - window.scrollY)
  [x, y]

touch = touch_B


_pick = (attrs, last)->
  _.assignIn {}, attrs..., last


browser = ->
  { ios, ff, old, chrome } = Tie.browser
  touch =
    if ios || ff || old && chrome
      touch_A
    else
      touch_B


class InputTie.type.canvas extends InputTie.type.hidden
  type: "Array"

  config: (@dom, isNew, @ctx)->
    if isNew
      @data = {}
      @ctx.draw = @dom.getContext "2d"

    [ w, h ] = @ctx.size = [ @dom.width, @dom.height ]
    { draw, size } = @ctx
    if @data
      @data.canvas ?= OBJ()
      if image = @data.canvas[size]
        draw.putImageData image, 0, 0
        return
    @do_background()
    if @data
      @data.canvas[size] = draw.getImageData 0, 0, w * 2, h * 2
    @do_blur()

  do_background: ->

  do_draw: ->
  do_focus: (e)->
    @ctx.is_tap = true
  do_blur:  (e)->
    @ctx.is_tap = false
    @ctx.history = []

  do_fail:   (offsets)->
  do_change: (offsets)->

  _value: (e)->
    e.offsets

  _attr: ( attrs... )->
    { _value, tie, ctx } = b = @

    start = (e)->
      tie.do_focus b, e
      move e
    end = (e)->
      move e
      tie.do_blur b, e

    move = (e)->
      capture ctx, e
      tie.do_change b, _value(ctx), ma

    cancel = (e)->
      capture ctx, e
      tie.do_fail b, _value(ctx), ma
      tie.do_blur b, e

    ma = _pick attrs,
      config: @_config
      ontouchend: end
      ontouchmove: move
      ontouchstart: start
      ontouchcancel: cancel
      onmouseup:   end
      onmousemove: move
      onmousedown: start
      onmouseout:  end
      onmouseover: move

  field: (m_attr = {})->
    [ w, h ] = m_attr.size || @attr.size
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      width:  w
      height: h
      style: "width: #{w / 2}px; height: #{h / 2}px;"
    # data-tooltip, disabled
    m "canvas", ma
