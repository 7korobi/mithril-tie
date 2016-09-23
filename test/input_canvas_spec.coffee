{ InputTie, Tie } = require "../mithril-tie.js"
Mem = require "memory-record"

Tie.browser =
  ios:    false
  ff:     false
  old:    false
  chrome: false



class test extends InputTie.type.canvas
  present: ({size: [width, height], foo})->
    expect(  width ).to.eq 800
    expect( height ).to.eq 600
    expect( foo[0] ).to.eq -10
    expect( foo[1] ).to.eq  10

    c.canvas_attr.config
      getContext: (type)->
        expect( type ).to.eq "2d"
        getImageData: ->
          "TEST_IMAGE"
    , false,
      test: true

  config: (canvas, is_continue, context)->
    expect( context.test ).to.eq true
    # not to do
  data: ->
    data_cache
  background: ({ctx})->
    # not to do
  draw: ({state, ctx, offsets, is_touch, event: {clientX, clientY, screenX, screenY, touches}})->
    expect( state ).to.eq "boot"
    # not to do
  onmove: ({state, ctx, offsets, is_touch, event: {clientX, clientY, screenX, screenY, touches}})->
    expect( state ).to.eq "boot"
    # not to do


