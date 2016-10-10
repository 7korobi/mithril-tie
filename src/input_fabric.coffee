m = require "mithril"
{ InputTie, Tie } = module.exports

ratio = window.devicePixelRatio

_pick = (attrs, last)->
  _.assignIn {}, attrs..., last

new_canvas = (dom)->
  new fabric.Canvas dom,
    enableRetinaScaling: true

chk_canvas = ->
  unless fabric
    throw "require fabric.js"


class Fabric
  type: "String"

  do_draw: ->
  do_focus: (e)->
  do_blur:  (e)->
  do_fail:   (offset)->
  do_change: (offset)->

  constructor: (@tie, @input)->
  deploy: (canvas, size)->
  redraw: (canvas, size)->
  resize: (canvas, size)->


class InputTie.type.fabric extends InputTie.type.hidden
  @extend: (name, view)->
    chk_canvas()
    class InputTie.type[name] extends @
      type: view.prototype.type
      _view: view

  type: "Array"
  _view: Fabric
  _config: (dom, isStay, ctx)->
    super
    [ width, height ] = @size
    unless isStay
      @canvas = new_canvas dom
      @view.deploy @canvas, @size

    if @size[0] == @size_old[0] && @size[1] == @size_old[1]
      @canvas.renderAll()
      @view.redraw @canvas, @size

    else
      @canvas.setWidth   width
      @canvas.setHeight height
      console.log "resize #{[width, height]}"
      @view.resize @canvas, @size

    @size_old = @size

  constructor: ->
    super
    @size_old = [0,0]
    @view = new @_view @tie, @
    @view.__val = @__val

  do_draw: ->
  do_focus: (e)->
  do_blur:  (e)->
  do_fail:   (offset)->
  do_change: (offset)->

  _value: (e)->
    e.offset

  _attr: ( attrs... )->
    { _value, tie, ctx } = b = @

    ma = _pick attrs,
      config: @__config

  field: (m_attr = {})->
    [ w, h ] = @size = m_attr.size || @attr.size
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      width:  w
      height: h
    # data-tooltip, disabled
    m "canvas", ma
