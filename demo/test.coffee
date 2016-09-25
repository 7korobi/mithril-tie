OBJ = ->
  new Object null

ratio = window.devicePixelRatio

InputTie.type.fabric.extend "my_fabric", class view
  type: "String"

  do_draw: ->
  do_focus: (e)->
  do_blur:  (e)->
  do_fail:   (offset)->
  do_change: (args)->
    console.warn args

  constructor: (@tie, @input)->

  deploy: (canvas, size)->
    [ width, height ] = size
    @rect = new fabric.Rect
      left: 100
      top:  100
      fill: "blue"
      width:  200
      height: 200
      angle: 45
      rx: 10
      strokeWidth: 5
      stroke: 'rgba(100,200,200,0.5)'
    @rect.on
      mouseup: =>
        @input.attr.size = [600,600]
        @tie.do_change @, "rect"

    @circle = new fabric.Circle
      left:  100
      top:   100
      radius: 50
      angle:  30
      strokeWidth: 5
      stroke: 'rgba(100,200,200,0.5)'
    @circle.setGradient "fill",
      type: "linear"
      x1: 0
      y1: 0
      x2: 0
      y2: @circle.height
      colorStops:
        0.0: '#000'
        0.5: '#fff'
        1.0: '#000'
    @circle.on
      mouseup: =>
        @input.attr.size = [800,600]
        @tie.do_change @, "circle"

    @haiku = new fabric.Text """
        古池や
        蛙飛び込む
        水の音
      """,
      fontFamily: '花園明朝A'
      fontSize:   50
      strokeWidth: 2
      strokeStyle: '#008811'
      fill:        "#00aa22"
      left:  200
      top:  100
      angle: 10

    fabric.Image.fromURL 'http://giji-assets.s3-website-ap-northeast-1.amazonaws.com/images/portrate/g04.jpg', (@face)=>
      requestAnimationFrame =>
        @face.animate "left",  width - 100,
          duration: 2000
          easing: fabric.util.ease.easeOutBounce
        @face.animate "top",   height -  30,
          duration: 2000
          easing: fabric.util.ease.easeInBounce
        @face.animate "angle",    -300,
          duration: 1000
          easing: fabric.util.ease.easeInElastic
        @face.animate "angle",     100,
          duration: 3000
          easing: fabric.util.ease.easeOutElastic
          onChange: ->
            canvas.renderAll()
      canvas.add @face

    logger = (title, list)->
      h = {}
      e = []
      call = _.debounce ->
        m.redraw()
        console.warn e
      , 200

      list.map (key)->
        h[key] = ->
          e = [title, key, arguments...]
          call()
      h

    @circle.on logger "circle", [
      "touch:gesture"
      "touch:drag"
      "touch:orientation"
      "touch:shake"
      "touch:longpress"
      "added"
      "removed"
      "selected"
      "deselected"
      "modified"
      "rotating"
      "scaling"
      "moving"
      "skewing"
      "mousedown"
      "mouseup"
      "mouseover"
      "mouseout"
    ]
    canvas.on logger "canvas", [
      "object:added"
      "object:modified"
      "object:rotating"
      "object:scaling"
      "object:moving"
      "object:selected"
      "before:selection:cleared"
      "selection:cleared"
      "selection:created"
      "path:created"
      # "mouse:down"
      # "mouse:move"
      # "mouse:up"
      # "mouse:over"
      # "mouse:out"
    ]
    canvas.add @rect
    canvas.add @circle
    canvas.add @haiku

  redraw: (canvas, size)->
    [ width, height ] = size

  resize: (canvas, size)->
    [ width, height ] = size

    return
    fabric.loadSVGFromURL 'file://japanHigh.svg', (objs, options)=>
      @japan = fabric.util.groupSVGElements objs, options
      canvas.add @japan



Demo =
  controller: ->
    @tie = new InputTie.btns {}, []
    @tie.stay = (id, value)->
    @tie.change = (id, value, old)->
    @tie.focus = ->
      console.warn ["focus",   arguments...]
    @tie.disable = ->
      console.warn ["disable", arguments...]
    @tie.stay = ->
      console.warn ["stay",    arguments...]
    @tie.change = ->
    @tie.select = ->
      console.warn ["select",  arguments...]

    @bundles = [
      @tie.bundle
        _id: "fabric"
        attr:
          type: "my_fabric"
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
      m "span", JSON.stringify fabric.canvas

m.mount document.getElementById("win"), Demo

requestAnimationFrame ->
  m.redraw()
