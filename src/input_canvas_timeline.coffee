Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie, Tie } = module.exports

OBJ = ->
  new Object null

timespan = 1000 * 3600

mestype_orders = [
  "SAY"
  "MSAY"
  "VSAY"
  "VGSAY"
  "GSAY"
  "SPSAY"
  "WSAY"
  "XSAY"
  "BSAY"
  "AIM"
  "TSAY"
  "MAKER"
  "ADMIN"
]



class InputTie.type.timeline extends InputTie.type.canvas
  type: "Array"

  do_draw: ->

  do_focus: (e)->
    @ctx.is_tap = true
  do_blur:  (e)->
    @ctx.is_tap = false
    @ctx.history = []

  do_move: (ctx)->

  do_fail:   (offsets)->
  do_change: (offsets)->

  _value: (e)->
    e.offsets



  data: ->
    view_port_x()
    base.reduce

  onmove: ({state, is_touch, offset})->
    return unless is_touch && offset? && view_port_x()
    search ""

    index = Math.floor(offset.x / x)
    time = masks[time_ids[index]].all.min
    query =
      if graph_height < offset.y
        Mem.Query.messages.talk("open", false, {})
      else
        base

    choice_last query, time

  draw: ({ctx})->
    focus = Mem.Query.messages.find talk_at()
    return unless focus && view_port_x()

    offset = index_at(focus.updated_at)
    ctx.beginPath()
    ctx.strokeStyle = RAILS.log.colors.focus
    ctx.globalAlpha = 1
    ctx.moveTo x * offset, height
    ctx.lineTo x * offset,  0
    ctx.stroke()

  background: ({ctx})->
    return unless view_port_x() && view_port_y()

    ctx.clearRect 0, 0, width, height
    ctx.fillStyle = RAILS.log.colors.back
    ctx.globalAlpha = 0.5
    ctx.fillRect 0, 0, x * time_width, y * max_height

    count_width = 1
    for time_id, left in time_ids
      mask = masks[time_id]
      top = max_height
      for mestype in mestype_orders
        color = RAILS.log.colors[mestype]
        if mask[mestype]
          count_height = mask[mestype].count
          top -= count_height
          ctx.fillStyle = color
          ctx.globalAlpha = 1
          ctx.fillRect x * left, y * top, 1 + x * count_width, y * count_height

    ctx.beginPath()
    for event in Mem.Query.events.list when event.created_at
      right = index_at event.updated_at
      left = index_at event.created_at
      ctx.strokeStyle = RAILS.log.colors.line
      ctx.globalAlpha = 1
      ctx.moveTo x * left, height
      ctx.lineTo x * left,  0

      ctx.fillStyle = RAILS.log.colors.event
      ctx.fillRect x * left, graph_height, x * time_width, height

      ctx.textAlign = "left"
      ctx.fillStyle = RAILS.log.colors.text
      ctx.font = "30px serif"

      max_width = x * (right - left) - 4
      if 0 < max_width
        ctx.fillText event.name, x * left, height - 12, max_width

    ctx.stroke()
