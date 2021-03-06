Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie, Tie } = module.exports

console.warn "deploy"
RATIO = -> 1
winX = winY = -> 0
module.exports.deploy = ({window})->
  RATIO = -> window.devicePixelRatio
  winX  = -> window.scrollX
  winY  = -> window.scrollY
  return

OBJ = ->
  new Object null

capture = ({dom, ctx}, e)->
  ctx.offset = null
  ctx.offsets = []
  return ctx.offsets unless e? && ctx?
  if e.touches?
    rect = dom.getBoundingClientRect()
    ctx.offsets = for e_touch in e.touches
      touch(e_touch, rect) # touch device
    ctx.offset = ctx.offsets[0] if 1 == e.touches.length
  else
    ctx.offset = mouse(e) # mouse interface.
    ctx.offsets = [ctx.offset] if ctx.offset?
  ctx.history.push ctx.offsets


mouse = (event)->
  x = event.offsetX || event.layerX # PC || firefox
  y = event.offsetY || event.layerY # PC || firefox
  if x? && y?
    x *= RATIO()
    y *= RATIO()
    [x, y]


touch_A = ({pageX, pageY}, {left, top})->
  x = RATIO() * (pageX - left - winX())
  y = RATIO() * (pageY - top  - winY())
  [x, y]

touch_B = ({pageX, pageY}, {left, top})->
  x = RATIO() * (pageX - left)
  y = RATIO() * (pageY - top  - winY())
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
  _views: InputTie.util.canvas.Views
  _config: (dom, isStay, @ctx)->
    super
    unless isStay
      @views.dom @dom
      @do_blur()
    @views.background @size

  constructor: ->
    @views = new @_views @
    super

  do_draw: ->

  do_focus: (e)->
    @ctx.is_touch = true

  do_blur:  (e)->
    @ctx.is_touch = false
    @ctx.history = []
    @views.draw @ctx

  do_move: ->
    { is_touch, offset, offsets, history } = @ctx
    if offset
      if is_touch
        @views.touch offset
      else
        @views.over  offset
    @views.draw @ctx
    @tie.do_change @, @_value @ctx

  do_fail:   (offset)->
  do_change: (offset)->

  _value: (e)->
    e.offset

  _attr: ( attrs... )->
    { _value, tie, ctx } = b = @

    focus = (e)->
      tie.do_focus b, e
      move e
    blur = (e)->
      move e
      tie.do_blur b, e
    move = (e)->
      capture b, e
      b.do_move()
    cancel = (e)->
      capture b, e
      tie.do_fail b, _value b.ctx
      tie.do_blur b, e

    ma = _pick attrs,
      config: @__config
      ontouchend: blur
      ontouchmove: move
      ontouchstart: focus
      ontouchcancel: cancel
      onmouseup:  blur
      onmousemove: move
      onmousedown: focus
      onmouseout: blur
      onmouseover: move

  field: (m_attr = {})->
    [ w, h ] = @size = m_attr.size || @attr.size
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      width:  w
      height: h
      style: "width: #{w / RATIO()}px; height: #{h / RATIO()}px;"
    # data-tooltip, disabled
    m "canvas", ma

