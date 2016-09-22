
global.window =
  requestAnimationFrame: ->
global.localStorage =
  getItem: ->
  setItem: ->
global.sessionStorage =
  getItem: ->
  setItem: ->
global.document =
  cookie = ""


deep_scan_factory = (cb)->
  deep_scan = (base, a, b)->
    unless a
      cb base, a, b
      return
    switch b?.constructor
      when Object
        for key, bb of b
          aa = a[key]
          deep_scan "#{base}.#{key}", aa, bb
      when Array
        for bb, idx in b
          aa = a[idx]
          deep_scan "#{base}[#{idx}]", aa, bb
      else
        cb base, a, b

global.its = (word, val, obj)->
  deep_equal = deep_scan_factory (key, a, b)->
    it key, ->
      expect(a).to.eq b
  deep_equal word, val, obj

