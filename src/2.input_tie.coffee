Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ Tie } = module.exports

submit_pick = (attrs...)->
  _.assignIn attrs...

_attr_form = (tie, { attr })->
  ma = _.assignIn attr,
    disabled: tie.disabled
    onsubmit: (e)->
      tie.do_submit()
      false


class InputTie
  @util = {}
  @type = {}

  timeout: 1000
  _debounce: ->
    @timer = true
    new Promise (_, ng)=>
      @timer = setTimeout =>
        ng "reset #{ @timeout }ms "
      , @timeout

  _config: (input)->
    (elem, isStay, context)=>
      @config input, elem, isStay, context

  config: (input, elem, isStay, context)->
    unless isStay
      elem.validity ?=
        valid: true
      elem.checkValidity ?= ->
        @validity.valid
      elem.setCustomValidity ?= (@validationMessage)->
        if @validationMessage
          @validity.customError = true
          @validity.valid = false
        else
          @validity.customError = false
          @validity.valid = true

    input.config elem, isStay, context

  do_change: (input, value)->
    value = input.__val value
    input.do_change value
    id = input._id
    old = @params[id]
    if old == value
      @stay id, value
    else
      @params[id] = value
      @change id, value, old

    @disabled = !! @timer

  do_fail: (input, value)->
    value = input.__val value
    input.do_fail value

  do_blur: (input, e)->
    input.do_blur e
    id = input._id
    @focus id, false

  do_focus: (input, e)->
    input.do_focus e
    id = input._id
    @focus id, true, @focus_id, @focused
    @focus_id = id
    @focused = input

  do_move: (input, e)->
    input.do_move e
    id = input._id

  do_select: (input, e)->
    s = getSelection()
    { anchorOffset, focusOffset } = s
    offsets = [anchorOffset, focusOffset].sort()
    @select input, s.toString(), offsets

  do_submit: ->
    return if @timer
    return unless @dom.checkValidity()

    p_timer = @_debounce()

    p_action = value = @action()
    unless @action.then?
      p_action = new Promise (ok)-> ok value

    @on()
    m.redraw()
    Promise.race [p_timer, p_action]
    .then ()=>
      clearTimeout @timer
    .catch (@message)=>
      console.log @message
    .then ()=>
      @off()
      m.redraw()

  action: ->
  disable: (id, b)->
  focus:   (id, b, old_id)->
  stay:    (id, value)->
  change:  (id, value, old_value)->
  select:  (id, str, offsets)->

  off: ->
    @disabled = false
    @disable false
    @timer = null

  on: ->
    @disabled = true
    @disable true

  cancel: ->
    clearTimeout @timer
    @off()

  errors: (cb)->
    for id, { name, dom } of @input when dom?.validationMessage
      cb dom.validationMessage, name

  infos: (cb)->
    for id, { name, info_msg } of @input when info_msg
      if info_msg
        cb info_msg, name

  submit: (children...)->
    tag =  "button.btn"
    tag += ".edge" unless @disabled
    tag += ".active" if @disabled

    ma = @_submit_attr null, {}
    m tag, ma, children...

  draw: ->
    for draw in @_draw
      draw()

  do_draw: (cb)->
    @_draw.push cb

  bundle: (format)->
    { _id, attr } = format
    InputTie.format format
    type = InputTie.type[attr.type]
    type = type.multiple if attr.multiple
    @input[_id] = input = new type @, format
    Tie.build_input @tie, _id, @params, input
    input.do_draw()
    @do_change input, @params[_id]
    input

  _submit: ({@form})->
    attr = {}
    @_submit_attr =
      if @form
        (__, attr)->
          submit_pick attr,
            type: "submit"
            disabled: @disabled
      else
        (__, attr)->
          @do_dom null, {}
          submit = (e)=>
            @do_submit()
            false

          submit_pick attr,
            type: "button"
            disabled: @disabled
            onclick: submit
            onmouseup: submit
            ontouchend: submit
    @

  constructor: ({ @params, ids })->
    @off()
    @_draw = []
    @input = {}
    @tie = new Tie
    @prop = @tie.prop
    for id in ids
      @bundle Mem.Query.inputs.find id
    return

  @form: (params, ids)->
    new InputTie { ids, params }
    ._submit
      form: (attr, vdom...)->
        m "form", _attr_form(@, attr), vdom

  @btns: (params, ids)->
    new InputTie { ids, params }
    ._submit {}

  @format: (o)->
    o.label ?= {}
    o.label.attr ?= {}
    if o.attr?.name
      o.attr.id ?= o.attr.name
      o.label.attr.for = o.attr.name

    for _id, label of o.options when ! label._id
      o.options[_id] =
        if "object" == typeof label
          label._id = _id
          label
        else
          { _id, label }


module.exports.InputTie = InputTie
