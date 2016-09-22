Mem = require "memory-record"
{ InputTie } = module.exports

new Mem.Rule("input").schema ->
  @scope (all)->
    checkbox: (sean)-> all.where (o)-> o.attr.type == 'checkbox' && o.sean == sean
  class @model extends @model
    constructor: ->
      InputTie.format @
