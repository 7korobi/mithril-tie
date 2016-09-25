m = require "mithril"
{ InputTie, Tie } = module.exports

ratio = window.devicePixelRatio

OBJ = ->
  new Object null

_pick = (attrs, last)->
  _.assignIn {}, attrs..., last

new_canvas = (dom)->
  new fabric.Canvas dom,
    enableRetinaScaling: true


class Fabric
  constructor: (@tie, @input)->
    @data = OBJ()

  deploy: (canvas, size)->
  redraw: (canvas, size)->
  resize: (canvas, size)->


class InputTie.type.fabric extends InputTie.type.hidden
  @extend: (cb)->
    cb Fabric, @

  type: "Array"
  _views: Fabric

  constructor: ->
    @size_old = [0,0]
    @view = new @_views @tie, @
    super

  config: (dom, isStay, ctx)->
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
      config: @_config

  field: (m_attr = {})->
    [ w, h ] = @size = m_attr.size || @attr.size
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      width:  w
      height: h
    # data-tooltip, disabled
    m "canvas", ma
