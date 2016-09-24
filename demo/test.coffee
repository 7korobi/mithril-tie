OBJ = ->
  new Object null

class Fabric
  constructor: ->
    console.warn ["constructor", arguments...]
    @data = OBJ()

  draw: ({ is_touch, offset, offsets, history })->
    console.warn ["draw", arguments...]

  dom: (@dom)->
    console.warn ["dom", arguments...]

  resize: (size)->
    console.warn ["resize", arguments...]

  background: (size)->
    console.warn ["background", arguments...]

  touch: (at)->
    console.warn ["touch", arguments...]

  over: (at)->
    console.warn ["over", arguments...]


class InputTie.type.fabric extends InputTie.type.canvas
  type: "Array"
  _views: Fabric


Demo =
  controller: ->
    @tie = new InputTie.btns {}, []
    @tie.stay = (id, value)->
    @tie.change = (id, value, old)->
    @tie.focus = ->
      console.warn ["focus", arguments...]
    @tie.disable = ->
      console.warn ["disable", arguments...]
    @tie.stay = ->
      console.warn ["stay", arguments...]
    @tie.change = ->
      console.warn ["change", arguments...]
    @tie.select = ->
      console.warn ["select", arguments...]

    @bundles = [
      @tie.bundle
        _id: "fabric"
        attr:
          type: "fabric"
          size: [ 800, 600 ]
        name: "fabric 動作検証"
        current: null
    ]
    return

  view: ({ tie, bundles: [fabric] })->
    tie.draw()

    m "div",
      m "hr"
      fabric.field()
      m "hr"

m.mount document.getElementById("win"), Demo
