Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ Tie } = module.exports

submit_pick = (attrs...)->
  _.assignIn attrs...

_attr_form = (tie, attr)->
  config = (elem, isStay, context)->
    tie.dom = elem
    unless isStay
      elem.checkValidity ?= ->
        for input in tie._inputs when input.dom
          return false unless input.dom.checkValidity()
        return true
  ma = _.assignIn attr,
    config: config
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

  _cancel: ->
    @disabled = false
    @disable false
    @timer = null


  action: ->
  disable: (id, b)->
  focus:   (id, b, old_id)->
  stay:    (id, value)->
  change:  (id, value, old_value)->
  select:  (id, str, offsets)->


  do_change: (input, value)->
    value = input.__val value
    input.do_change value
    @disabled = !! @timer

    id = input._id
    old = @params[id]
    if old == value
      @stay id, value
    else
      @params[id] = value
      @change id, value, old


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

    @disabled = true
    @disable true

    m.redraw()
    Promise.race [p_timer, p_action]
    .then ()=>
      clearTimeout @timer
    .catch (@message)=>
      console.log @message
    .then ()=>
      @_cancel()
      m.redraw()

  cancel: ->
    clearTimeout @timer
    @_cancel()

  submit: (children...)->
    tag =  "button.btn"
    tag += ".edge" unless @disabled
    tag += ".active" if @disabled

    ma = @_submit_attr null, {}
    m tag, ma, children...

  draw: ->
    @_errors = null
    for draw in @_draws
      draw()

  draws: (cb)->
    @_draws.push cb

  errors: ->
    return @_errors if @_errors
    @_errors = {}
    for { _id, dom } in @_inputs when dom?.validationMessage
       @_errors[_id] = dom.validationMessage
    @_errors


  infos: ->
    @_infos

  bind: (input)->
    @_inputs.push input

  bundle: (format)->
    { _id, attr } = format
    InputTie.format format
    type = InputTie.type[attr.type]
    type = type.multiple if attr.multiple
    @input[_id] = input = new type @, format

  _submit: ({@form})->
    attr = {}
    if @form
      @_submit_attr =
        (__, attr)=>
          submit_pick attr,
            type: "submit"
            disabled: @disabled
    else
      @_submit_attr =
        (__, attr)=>
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

  isDirty: ->
    for input in @_inputs when input.dom
      return false unless input.isDirty()
    return true


  isValid: ->
    @dom?.checkValidity()

  constructor: ({ @params, ids })->
    @_cancel()
    @_draws = [
      =>
        for input in @_inputs
          input.do_draw()
    ]
    @_inputs = []
    @_infos = {}
    @input = {}
    @tie = new Tie
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
