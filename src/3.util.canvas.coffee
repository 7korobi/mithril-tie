Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie, Tie } = module.exports

OBJ = ->
  new Object null

class Views
  constructor: ->
    @data = OBJ()

  build: (types...)->
    @views = for type in types
      new type @dom

  draw: ({ is_touch, offset, offsets, history })->

  dom: (@dom)->
    [ @_view ] = @build View

  resize: (size)->
    @_view.fit
      offset: [0,0]
      view:   [1,1]
      size:   size
    @_view.clear()

  background: (size)->
    @data.canvas ?= OBJ()
    if image = @data.canvas[@_view.size]
      @_view.paste image, [0, 0]
      return
    @resize size
    if @data
      @data.canvas[@_view.size] = @_view.copy [0, 0], [1,1]

  hit: (at)->
    _.some @views, (o)-> o.hit at

  touch: (at)->
    @hit at, (x, y)->

  over: (at)->
    @hit at, (x, y)->


class View
  constructor: (dom)->
    @draw = dom.getContext "2d"

  fit: ({offset, @size, view} = {})->
    [ @show_width, @show_height ] = @size
    [ @view_width, @view_height ] = view   || @size
    [       @left,         @top ] = offset || [0,0]

    @right  = @left + @show_width
    @bottom = @top  + @show_height
    @x = @show_width  / @view_width
    @y = @show_height / @view_height

  by: (x, y)-> [ (x - @left) / @x, (y - @top ) / @y ]
  at: (x, y)-> [   @left + @x * x,    @top + @y * y ]
  to: (x, y)-> [           @x * x,           @y * y ]

  pen: (o)->
    _.assignIn @draw, o

  clear: ->
    @draw.clearRect @left, @top, @right, @bottom

  fill: ->
    @draw.fillRect @left, @top, @right, @bottom

  paste: (image, [x, y])->
    @draw.putImageData image, x, y

  copy: (a, o)->
    [xa, ya] = @at a...
    [xo, yo] = @to o...
    @draw.getImageData xa, ya, xo, yo

  text: (str, a, width)->
    [xa, ya] = @at a...
    width = @x * width - 4
    if 4 < width
      @draw.fillText str, xa, ya, width

  rect: (a, b)->
    [xa, ya] = @at a...
    [xb, yb] = @at b...
    @draw.fillRect xa, ya, xb, yb

  moveTo: ->
    [x, y] = @at arguments...
    @draw.moveTo x, y

  lineTo: ->
    [x, y] = @at arguments...
    @draw.lineTo x, y

  path: (cb)->
    @draw.beginPath()
    cb d
    @draw.stroke()

  hit: (a)->
    @left < a[0] < @right && @top < a[1] < @bottom

  touch: (a, cb)->
    [x, y] = @by a...
    if @hit a
      cb  x, y

  over: (a, cb)->
    [x, y] = @by a...
    if @hit a
      cb  x, y



InputTie.util.canvas = { View, Views }
