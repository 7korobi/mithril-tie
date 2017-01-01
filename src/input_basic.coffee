Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie, Tie } = module.exports


input_pick = ( attrs, last )->
  _.assignIn {}, attrs..., last

option_pick = (attrs...)->
  attrs = attrs.map (ma)->
    target = ["id", "className", "selected", "disabled", "value", "label"]
    target.push "badge" if ma.badge
    _.pick ma, target
  _.assignIn attrs...


_attr_label = (attrs...)->
  _.assignIn attrs...


change_attr = (attrs...)->
  { _value, tie } = b = @
  ma = input_pick attrs,
    config: @__config
    disabled: tie.disabled
    onblur:     (e)-> tie.do_blur   b, e
    onfocus:    (e)-> tie.do_focus  b, e
    onselect:   (e)-> tie.do_select b, e
    onchange:   (e)-> tie.do_change b, _value(e), ma
    oninvalid:  (e)-> tie.do_fail   b, _value(e), ma

input_attr = (attrs...)->
  { _value, tie } = b = @
  ma = input_pick attrs,
    config: @__config
    disabled: tie.disabled
    onblur:    (e)-> tie.do_blur   b, e
    onfocus:   (e)-> tie.do_focus  b, e
    onselect:  (e)-> tie.do_select b, e
    oninput:   (e)-> tie.do_change b, _value(e), ma
    oninvalid: (e)-> tie.do_fail   b, _value(e), ma


e_checked   = (e)-> (e.currentTarget || @).checked
e_value     = (e)-> (e.currentTarget || @).value
e_selected  = (e)->
  list = (e.currentTarget || @).selectedOptions
  news = {}
  for option in list
    news[option.value] = true
  news


validity_by =
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


class basic_input
  _attr_label: _attr_label
  _value: e_value
  _attr:  input_attr
  _debounce: InputTie.prototype._debounce
  _config: (@dom, isStay, context)->
    unless isStay
      @dom.validity ?=
        valid: true
      @dom.checkValidity ?= ->
        @validity.valid
      @dom.setCustomValidity ?= (@validationMessage)->
        if @validationMessage
          @validity.customError = true
          @validity.valid = false
        else
          @validity.customError = false
          @validity.valid = true

  timeout: 100
  type: "String"

  option_default:
    className: "icon-cancel-alt"
    label:     ""

  constructor: (@tie, @format)->
    { @_id, @options, @attr, @name, @current, info, option_default } = @format
    @__info = info
    @__uri = Mem.pack[@type]
    @__val = Mem.unpack[@type]
    @__config = @_config.bind @
    @tie.bind @
    @option_default = _.assign {}, @option_default, option_default

    Tie.build_input @tie.tie, @_id, @tie.params, @
    @default = @value()
    @do_draw()
    @tie.do_change @, @default
    return

  info: (msg = "")->
    @tie._infos[@_id] = msg
  error: (msg = "")->
    @dom?.setCustomValidity msg

  value: (new_val)->
    if arguments.length
      @tie.do_change @, @__val new_val
    @tie.params[@_id]

  isDirty: ->
    @default == @value()

  isValid: ->
    @dom?.checkValidity()

  do_fail: (value)->
  do_focus: ->
  do_blur: ->
  do_draw: ->
    { info, label } = @format
    @__name = @attr.name || @_id
    @__value = @value()
    @tie.errors[@_id] = @dom?.validationMessage || ""

  do_change: (value)->
    if @dom && ! @dom.validity.customError
      # @dom.validity.checkValidity()
      if @format.error
        for key, val of @dom.validity when val
          msg = @format.error[validity_by[key]]
          if msg
            @error msg
            return

  option: (value)->
    h = @options ? {}
    h[value] ? @option_default

  item: (value, m_attr = {})->
    option = @option value
    ma = option_pick @attr, m_attr, option,
      className: [option.className, m_attr.className].join(" ")
      value: @__uri value
      selected: value == @__value
      # label, disabled
    m 'option', ma, ma.label

  datalist: (m_attr = {})->
    throw "not implement"

  head: (m_attr = {})->
    ma = @_attr_label m_attr
    m "label", ma, @name

  label: (m_attr = {})->
    if @label_for
      if @options
        option = @options[@__value]
        if option
          return @label_for option
    if info = @__info
      text = info.label if info.label
      text = info.off   if info.off   && ! @__value
      text = info.on    if info.on    && @__value
      text = info.valid if info.valid && @__value
      ma = @_attr_label m_attr, @format.label.attr
      m "label", ma, text

  field: (m_attr = {})->
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      name:  @__name
      value: @__value
    # data-tooltip, disabled
    m "input", ma


class number_input extends basic_input
  type: "Number"


for key in ["hidden", "tel", "password", "datetime", "date", "month", "week", "time", "datetime-local", "color"]
  InputTie.type[key] = basic_input
for key in ["number", "range"]
  InputTie.type[key] = number_input


class InputTie.type.checkbox extends basic_input
  _value: e_checked
  _attr:  change_attr
  type: "Bool"

  option: (value)->
    sw = if value then "on" else "off"
    @options?[sw] || {}

  field: (m_attr = {})->
    option = @option @__value
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      type: "checkbox"
      name:  @__name
      value: @__uri @__value
      checked: @__value
    # data-tooltip, disabled
    m "input", ma


class InputTie.type.radio extends basic_input
  _value: e_value
  _attr:  change_attr
  field: (m_attr = {})->
    list =
      for value, option of @options when ! option.hidden
        @item value, m_attr

    unless @attr.required && @format.current
      list.unshift @item "", m_attr
    list

  item: (value, m_attr = {})->
    option = @option value
    ma = @_attr @attr, m_attr, option,
      className: [@attr.className, option.className, m_attr.className].join(" ")
      type: "radio"
      name:  @__name
      value: @__uri value
      checked: (value == @__value)
    # data-tooltip, disabled
    m "input", ma,
      option.label
      m ".emboss.pull-right", option.badge() if option.badge


class InputTie.type.select extends basic_input
  _value: e_value
  _attr:  change_attr
  option_default:
    className: ""
    label:　"―――"

  field: (m_attr = {})->
    list =
      for value, option of @options when ! option.hidden
        @item value, m_attr

    unless @attr.required && @format.current
      list.unshift @item "", m_attr
      # disabled

    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      name: @__name
    # data-tooltip, disabled
    m 'select', ma, list


class InputTie.type.select.multiple extends basic_input
  _value: e_selected
  _attr:  change_attr
  field: (m_attr = {})->
    ma = @_attr @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      name: @__name
    # data-tooltip, disabled
    m 'select', ma,
      for value, option of @options when ! option.hidden
        @item value

  item: (value, m_attr = {})->
    option = @option value
    ma = option_pick @attr, m_attr, option,
      className: [option.className, m_attr.className].join(" ")
      value: @__uri value
      selected: @__value[value]
      # label, disabled
    m 'option', ma, ma.label
