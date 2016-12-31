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

{ View, Views } = InputTie.util.canvas

class Timeline extends Views
  dom: (@dom)->
    super
    [ @field, @foots ] = @build View, View

  resize: (size)->
    super
    @base = Mem.Query.messages.talk(talk(), open(), potofs_hide())
    return unless base.reduce

    @masks = @base.reduce.mask || {}
    heights =
      for time_id, mask of @masks
        mask.all.count
    max_height = Math.max heights...

    @time_ids = _.sortBy Object.keys(@masks), Mem.unpack.Date

    [ width, height ] = size
    @field.fit
      size:   [            width, height - 50 ]
      view:   [ @time_ids.length,  max_height ]
    @foots.fit
      offset: [                0, height - 50 ]
      size:   [            width,          50 ]
      view:   [ @time_ids.length,           1 ]

    @field.pen
      fillStyle: RAILS.log.colors.back
      globalAlpha: 0.5
    @field.fill()

    for time_id, left in time_ids
      mask = masks[time_id]
      top = max_height
      for mestype in mestype_orders when mask[mestype]
        height = mask[mestype].count
        top -= height
        @field.pen
          fillStyle: RAILS.log.colors[mestype]
          globalAlpha: 1
        @field.rect [left, top], [1, height]

    @foots.path =>
      for event in Mem.Query.events.list when event.created_at
        right = index_at event.updated_at
        left = index_at event.created_at

        @foots.pen
          strokeStyle: RAILS.log.colors.line
          globalAlpha: 1
        @foots.moveTo  left, 1
        @foots.lineTo  left, 0
        @foots.moveTo right, 1
        @foots.lineTo right, 0
        @foots.pen
          fillStyle: RAILS.log.colors.event
        @foots.fill()
        @foots.pen
          font: "30px serif"
          textAlign: "left"
          fillStyle: RAILS.log.colors.text
        @foots.text event.name, [left, 38], right - left

  draw: (@ctx)->
    focus = Mem.Query.messages.find Url.params.talk_at
    return unless focus

    x = @index focus.updated_at
    @field.path =>
      @field.pen
        strokeStyle: RAILS.log.colors.focus
        globalAlpha: 1
      @field.moveTo x, @show_height
      @field.lineTo x, 0

  index: (updated_at)->
    @time_ids.indexOf Mem.pack.Date updated_at / timespan

  choice: (x, query)->
    index = Math.floor x
    o = @masks[@time_ids[index]].all.min_is

    Url.params.talk_at = o._id
    Url.params.icon "search"
    Url.params.scope "talk"
    Url.params.scroll ""
    win.scroll.rescroll Url.prop.talk_at

  touch: (at)->
    Url.params.search = ""
    @field.touch at, (x)=>
      @choice x, base
    @foots.touch at, (x)=>
      @choice x, Mem.Query.messages.talk "open", false, {}


class InputTie.type.timeline extends InputTie.type.canvas
  type: "Array"
  _graph: Timeline

