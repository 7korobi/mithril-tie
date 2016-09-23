{ InputTie } = require "../mithril-tie.js"
Mem = require "memory-record"

icon =
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

t1 =
  _id: "t1"
  attr:
    type: "textarea"
    max_line:   2
  name: "テキスト1"
  current: "ab\ncd\nef"

t2 =
  _id: "t2"
  attr:
    type: "text"
    maxlength: 6
  name: "テキスト2"
  current: "abcdef"
  option_default:
    label: "t2 default"

canvas =
  _id: "canvas"
  attr:
    type: "canvas"
    size: [ 800, 600 ]
  name: "裸のキャンバス"
  current: null


state = {}
params = {}
tie = new InputTie.form params, []
tie.stay = (id, value)->
  state.stay = value
tie.change = (id, value, old)->
  state.change = value
bundles = [
  tie.bundle icon
  tie.bundle t1
  tie.bundle t2
  tie.bundle canvas
]
tie.draw()


describe "InputTie", ()->
  it "input list", ->
    expect( Object.keys tie.input ).to.have.members ["icon", "t1", "t2", "canvas"]

  it "draw", ->
    state = {}
    tie.do_draw -> state.do_draw = true
    tie.draw()
    expect( state.do_draw ).to.eq true

  its "bundle results",
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
  its "option cog",
    tie.input.icon.option "cog"
    _id: "cog"
    label: "画面表示を調整します。"

  its "option home",
    tie.input.icon.option "home"
    _id: "home"
    label: "村の設定、アナウンスを表示します。"

  its "option (null)",
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
  its "foot",
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
    vdom = tie.input.t1.field()
    elem = {}
    state = {}
    context = {}
    vdom.attrs.config elem, true, context
    tie.do_focus  "t1", {}
    tie.do_change "t1", "ab\ncd\nef"
    vdom.attrs.config elem, false, context
    tie.do_blur   "t1", {}

    expect( params.t1 ).to.eq "ab\ncd\nef"
    expect( state.stay ).to.eq "ab\ncd\nef"
    expect( state.change ).to.eq undefined

    tie.errors (msg)->
      console.warn msg

  it "in max_line", ->
    vdom = tie.input.t1.field()
    elem = {}
    state = {}
    context = {}
    vdom.attrs.config elem, true, context
    tie.do_focus  "t1", {}
    tie.do_change "t1", "abcdef"
    vdom.attrs.config elem, false, context
    tie.do_blur   "t1", {}

    expect( params.t1 ).to.eq "abcdef"
    expect( state.stay ).to.eq undefined
    expect( state.change ).to.eq "abcdef"
    tie.errors (msg, name)->
      console.warn [name, msg]


describe "InputTie.type.text", ->
  its "foot",
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
    vdom = tie.input.t2.field()
    elem = {}
    state = {}
    context = {}
    vdom.attrs.config elem, true, context
    tie.do_focus  "t2", {}
    tie.do_change "t2", "abcdefg"
    vdom.attrs.config elem, false, context
    tie.do_blur   "t2", {}

    expect( params.t2 ).to.eq "abcdefg"
    expect( state.stay ).to.eq undefined
    expect( state.change ).to.eq "abcdefg"
    tie.errors (msg, name)->
      console.warn [name, msg]


describe "InputTie.type.canvas", ->
  its "field",
    tie.input.canvas.field()
    attrs:
      width:  800
      height: 600
      style: "width: 400px; height: 300px;"

  its "field custom",
    tie.input.canvas.field(size: [100, 100])
    attrs:
      width:  100
      height: 100
      style: "width: 50px; height: 50px;"

  it "show and do", ->
    vdom = tie.input.canvas.field()
    elem = {}
    state = {}
    context = {}
    vdom.attrs.config elem, true, context
    tie.do_focus  "canvas", {}
    tie.do_change "canvas", [[10,20]]
    vdom.attrs.config elem, false, context
    tie.do_blur   "canvas", {}

    expect( params.canvas ).to.deep.eq [[10,20]]
    expect( state.stay ).to.eq undefined
    expect( state.change ).to.deep.eq [[10,20]]
    tie.errors (msg, name)->
      console.warn [name, msg]
