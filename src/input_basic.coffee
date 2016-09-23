Mem = require "memory-record"
m = require "mithril"
_ = require "lodash"
{ InputTie } = module.exports


input_pick = (attrs, last)->
  _.assignIn {}, attrs..., last

option_pick = (attrs...)->
  attrs = attrs.map (ma)->
    target = ["id", "className", "selected", "disabled", "value", "label"]
    target.push "badge" if ma.badge
    _.pick ma, target
  _.assignIn attrs...


_attr_label = ( _id, attrs...)->
  _.assignIn attrs...


change_attr = ( _id, attrs... )->
  { _value, tie } = b = @
  ma = input_pick attrs,
    config: @_config
    disabled: tie.disabled
    onblur:     (e)-> tie.do_blur   _id, e
    onfocus:    (e)-> tie.do_focus  _id, e
    onselect:   (e)-> tie.do_select _id, e
    onchange:   (e)-> tie.do_change _id, _value(e), ma
    oninvalid:  (e)-> tie.do_fail   _id, _value(e), ma

input_attr = ( _id, attrs... )->
  { _value, tie } = b = @
  ma = input_pick attrs,
    config: @_config
    disabled: tie.disabled
    onblur:    (e)-> tie.do_blur   _id, e
    onfocus:   (e)-> tie.do_focus  _id, e
    onselect:  (e)-> tie.do_select _id, e
    oninput:   (e)-> tie.do_change _id, _value(e), ma
    oninvalid: (e)-> tie.do_fail   _id, _value(e), ma


e_checked   = (e)-> (e.currentTarget || @).checked
e_value     = (e)-> (e.currentTarget || @).value
e_selected  = (e)->
  list = (e.currentTarget || @).selectedOptions
  news = {}
  for option in list
    news[option.value] = true
  news


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


class basic_input
  _config: ->
  _attr_label: _attr_label
  _value: e_value
  _attr:  input_attr
  _debounce: InputTie.prototype._debounce
  timeout: 100
  type: "String"

  option_default:
    className: "icon-cancel-alt"
    label:     ""

  constructor: (@tie, @format)->
    { @_id, @options, @attr, @name, @current, info, option_default } = @format
    @_config = @tie._config @_id
    @__info = info
    @__uri = Mem.pack[@type]
    @__val = Mem.unpack[@type]

    @tie.do_draw @do_draw.bind @
    @option_default = _.assign {}, @option_default, option_default

  info: (@info_msg = "")->
  error: (msg = "")->
    @dom?.setCustomValidity msg

  do_context: (context)->
  do_dom: (@dom)->
  do_fail: (value)->
  do_focus: ->
  do_blur: ->
  do_draw: ->
    { info, label } = @format
    @__name = @attr.name || @_id
    @__value = @tie.params[@_id]
  do_change: (value)->
    if @dom && ! @dom.validity.customError
      # @dom.validity.checkValidity()
      if @format.error
        for key, val of @dom.validity when val
          msg = @format.error[validity_attr[key]]
          if msg
            @error msg
            return

  option: (value)->
    if value
      @options?[value] || {}
    else
      @option_default

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
      ma = @_attr_label @_id, m_attr, @format.label.attr
      m "label", ma, text

  field: (m_attr = {})->
    ma = @_attr @_id, @attr, m_attr,
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
    ma = @_attr @_id, @attr, m_attr,
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
    ma = @_attr @_id, @attr, m_attr, option,
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

    ma = @_attr @_id, @attr, m_attr,
      className: [@attr.className, m_attr.className].join(" ")
      name: @__name
    # data-tooltip, disabled
    m 'select', ma, list


class InputTie.type.select.multiple extends basic_input
  _value: e_selected
  _attr:  change_attr
  field: (m_attr = {})->
    ma = @_attr @_id, @attr, m_attr,
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
