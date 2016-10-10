{ InputTie } = require "../mithril-tie.js"
Mem = require "memory-record"

state = {}

component =
  controller: ->
    @params = {}
    @tie = InputTie.form @params, []
    @tie.stay = (id, value)->
      state.stay = value
    @tie.change = (id, value, old)->
      state.change = value
    @tie.action = ->
      state.action = true
    @tie.draws ->
      

    @bundles = [
      @tie.bundle
        _id: "icon"
        attr:
          type: "icon"
        name: "アイコン"
        current: null
        options:
          cog:   "画面表示を調整します。"
          home:  "村の設定、アナウンスを表示します。"
        option_default:
          label: "icon default"

      @tie.bundle
        _id: "t1"
        attr:
          type: "textarea"
          max_line:   2
        name: "テキスト1"
        current: "ab\ncd\nef"

      @tie.bundle
        _id: "t2"
        attr:
          type: "text"
          maxlength: 6
        name: "テキスト2"
        current: "abcdef"
        option_default:
          label: "t2 default"

      @tie.bundle
        _id: "canvas"
        attr:
          type: "canvas"
          size: [ 800, 600 ]
        name: "裸のキャンバス"
        current: null

    ]
    return

  view: ({tie})->
    tie.draw()


{ tie, bundles, params } = c = new component.controller()
component.view c

describe "InputTie", ()->
  it "input list", ->
    expect( Object.keys tie.input ).to.have.members ["icon", "t1", "t2", "canvas"]

  it "draw", ->
    tie.draw()

  it "bundle results", ->
    exists "bundles",
      bundles
      [
        _id: "icon"
        name: "アイコン"
        attr:
          type: "icon"
        option_default:
          label: "icon default"
      ,
        _id: "t1"
        name: "テキスト1"
        attr:
          type: "textarea"
          max_line: 2
        option_default:
          label: ""
      ,
        _id: "t2"
        name: "テキスト2"
        attr:
          type: "text"
          maxlength: 6
        option_default:
          label: "t2 default"
      ]


describe "InputTie.type.icon", ->
  it "option cog", ->
    exists "icon-cog",
      tie.input.icon.option "cog"
      _id: "cog"
      label: "画面表示を調整します。"

  it "option home", ->
    exists "icon-home",
      tie.input.icon.option "home"
      _id: "home"
      label: "村の設定、アナウンスを表示します。"

  it "option (null)", ->
    exists "icon-(null)",
      tie.input.icon.option null
      label: "icon default"
      "data-tooltip": "選択しない"

  it "option badge", ->
    tie.input.icon.options.cog.badge = -> 123
    expect( tie.input.icon.item("cog").children[1].children[0] ).to.eq 123

  it "item", ->
    expect( tie.input.icon.item("cog"                    ).tag ).to.eq "a"
    expect( tie.input.icon.item("cog", { tag:"menuicon" }).tag ).to.eq "a"
    expect( tie.input.icon.item("cog", { tag:"bigicon"  }).tag ).to.eq "section"


describe "InputTie.type.textarea", ()->
  it "foot", ->
    exists "foot",
      tie.input.t1.foot()
      [
        { children: ["⊘"] }
        " 8"
        undefined
        { children: ["字"] }
        " 3"
        { children: ["/2"] }
        { children: ["行"] }
      ]

  it "over max_line", ->
    tie.draw()
    elem = {}
    state = {}
    context = {}
    { attrs } = tie.input.t1.field()
    attrs.config elem, false, context
    attrs.onfocus {}
    attrs.oninput
      currentTarget:
        value: "ab\ncd\nef"
    attrs.config elem, true, context
    attrs.onblur {}

    tie.draw()
    expect( params.t1 ).to.eq "ab\ncd\nef"
    expect( state.stay ).to.eq "ab\ncd\nef"
    expect( state.change ).to.eq undefined
    expect( tie.input.t1.isValid() ).to.eq false
    console.warn tie.errors()
    console.warn tie.infos()

  it "in max_line", ->
    tie.draw()
    elem = {}
    state = {}
    context = {}
    { attrs } = tie.input.t1.field()
    attrs.config elem, false, context
    attrs.onfocus {}
    attrs.oninput
      currentTarget:
        value: "abcdef"
    attrs.config elem, true, context
    attrs.onblur {}

    tie.draw()
    expect( params.t1 ).to.eq "abcdef"
    expect( state.stay ).to.eq undefined
    expect( state.change ).to.eq "abcdef"
    expect( tie.input.t1.isValid() ).to.eq true
    console.warn tie.errors()
    console.warn tie.infos()


describe "InputTie.type.text", ->
  it "foot", ->
    exists "foot",
      tie.input.t2.foot()
      [
        { children: ["⊘"] }
        " 6"
        { children: ["/6"] }
        { children: ["字"] }
        " 1"
        undefined
        { children: ["行"] }
      ]

  it "over size", ->
    tie.draw()
    f = tie.form {},
      { attrs } = tie.input.t2.field()

    elem = {}
    state = {}
    context = {}
    f.attrs.config elem, false, context
    f.attrs.config elem, true, context

    elem = {}
    state = {}
    context = {}
    attrs.config elem, false, context
    attrs.onfocus {}
    attrs.oninput
      currentTarget:
        value: "abcdefg"
    attrs.config elem, true, context
    attrs.onblur {}

    expect( params.t2 ).to.eq "abcdefg"
    expect( state.stay ).to.eq undefined
    expect( state.change ).to.eq "abcdefg"
    expect( tie.isValid() ).to.eq false
    console.warn tie.errors()
    console.warn tie.infos()


describe "InputTie.type.canvas", ->
  it "field", ->
    exists "field",
      tie.form {},
        tie.input.canvas.field()
      children: [
        attrs:
          width:  800
          height: 600
          style: "width: 400px; height: 300px;"
      ]

  it "field custom", ->
    exists "field custom",
      tie.form {},
        tie.input.canvas.field(size: [100, 100])
      children: [
        attrs:
          width:  100
          height: 100
          style: "width: 50px; height: 50px;"
      ]

  it "show and do", ->
    input = tie.input.canvas
    state = {}
    context = {}
    elem =
      width:  800
      height: 600
      getBoundingClientRect: ->
        left: 0
        top:  0
      getContext: (args...)->
        expect(args).to.deep.eq ["2d"]
        image = null
        clearRect: (args...)->
          expect(args).to.deep.eq [0,0,800,600]
        putImageData: (args...)->
          expect(args).to.deep.eq [image,0,0]
        getImageData: (args...)->
          expect(args).to.deep.eq [0,0,800,600]
          image = args

    tie.draw()
    { attrs } = input.field()
    attrs.config elem, false, context
    attrs.ontouchstart
      touches: [
        pageX: 55
        pageY: 19
      ]
    attrs.ontouchmove
      touches: [
        pageX: 35
        pageY: 12
      ]
    attrs.config elem, true, context
    attrs.ontouchend
      touches: [
        pageX:  5
        pageY: 10
      ]

    expect( params.canvas ).to.deep.eq [10,20]
    expect( state.stay ).to.eq undefined
    expect( state.change ).to.deep.eq [10,20]
    console.warn tie.errors()
    console.warn tie.infos()


describe "InputTie.type.submit", ->
  it "button", ->
    exists "button",
      tie.submit "btn text"
      attrs:
        className: "btn edge"
      children: [
        "btn text"
      ]

  it "do submit", ->
    elem = {}
    state = {}
    context = {}
    tie.draw()
    { attrs } = tie.form {},
      t1 = tie.input.t1.field()
      tie.input.t1.foot()
      t2 = tie.input.t2.field()
      tie.input.t2.foot()

    attrs.config elem, false, context
    t1.attrs.config {}, false, context
    t2.attrs.config {}, false, context
    attrs.config elem, true, context
    t1.attrs.oninput
      currentTarget:
        value: "abcde"
    t2.attrs.oninput
      currentTarget:
        value: "abcdef"

    console.warn params
    expect( tie.isValid() ).to.eq true

    tie.do_submit()
    expect( state.action ).to.eq true



