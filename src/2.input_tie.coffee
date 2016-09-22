Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ Tie } = module.exports

submit_pick = (attrs...)->
  _.assignIn attrs...

_attr_form = (tie, { attr })->
  ma = _.assignIn attr,
    config: tie._config()
    disabled: tie.disabled
    onsubmit: (e)->
      tie.do_submit()
      false


validity_attr =
  valid: "valid"
  valueMissing: "required"
  typeMismatch: "type"
  patternMismatch: "pattern"
  rangeUnderflow: "min"
  rangeOverflow: "max"
  stepMismatch: "step"
  tooLines: "max_line"
  tooLong: "maxlength"
  tooShort: "minlength"
  hasSecret: "not_secret"
  hasPlayer: "not_player"


class InputTie
  timeout: 1000
  _debounce: ->
    @timer = true
    new Promise (_, ng)=>
      @timer = setTimeout =>
        ng "reset #{ @timeout }ms "
      , @timeout

  _config: (_id)->
    (elem, isNew, context)=>
      if isNew
        @do_view _id, elem
        context.onunload = =>
          @do_view _id

  do_view: (id, elem)->
    if id
      if elem
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

      @input[id].do_view elem
    else
      @dom = elem

  do_change: (id, value)->
    input = @input[id]
    value = input.__val value
    old = @params[id]
    if old == value
      @stay id, value
    else
      @params[id] = value
      @change id, value, old

    input.do_change value

    @disabled = !! @timer

  do_fail: (id, value)->
    input = @input[id]
    value = input.__val value

    input.do_fail value

  do_blur: (id, e)->
    @focus id, false

  do_focus: (id, e)->
    @focus id, true, @focus_id
    @focus_id = id
    @focused = @input[id]

  do_select: (id, e)->
    s = getSelection()
    { anchorOffset, focusOffset } = s
    offsets = [anchorOffset, focusOffset].sort()
    @select id, s.toString(), offsets

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
    for id, { dom } of @input when dom
      if dom.validationMessage
        cb dom.validationMessage

  infos: (cb)->
    for id, { info_msg } of @input when info_msg
      if info_msg
        cb info_msg

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
    @do_change _id, @params[_id]
    @input[_id]

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
          @do_view null, {}
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

  @type = {}

module.exports.InputTie = InputTie
