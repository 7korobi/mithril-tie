Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie, Tie } = module.exports


class InputTie.type.timeline extends InputTie.type.canvas
  type: "Array"

  do_draw: ->
  do_dom: (@dom, ctx)->
  do_context: (@ctx)->
    @do_blur()

  do_focus: (e)->
    @ctx.is_tap = true
  do_blur:  (e)->
    @ctx.is_tap = false
    @ctx.history = []

  do_fail:   (offsets)->
  do_change: (offsets)->

  _value: (e)->
    e.offsets
