Mem = require "memory-record"
{ WebStore } = module.exports

new Mem.Rule("store").schema ->
  @scope (all)->

  class @model extends @model
    constructor: ->
      WebStore.format @


