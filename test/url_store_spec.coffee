Mem = require "memory-record"
{ Url, WebStore } = require "../mithril-tie.js"


global.location =
  protocol: "a:"
  host: "b"
  pathname: "/c/d/e"
  search: "?f=g"
  hash: "#hijk"
  href: "a://b/c/d/e&f=g#hijk"


Mem.Collection.store.set
  a: { current: "z" }
  b: { current: "z" }
  c: { current: "z" }
  d: { current: "z" }
  e: { current: "z" }
  g: { current: "z" }
  h: { current: "z" }



WebStore.cookie_options =
  time: 7 * 24 * 60 * 60 * 1000
  path: "/sow.cgi"
  secure: false

Url.define = (key)->
    Mem.Query.stores.hash[key]

Url.maps
  protocol:
    a: ":a:"
  host:
    b: ":b"
  pathname:
    cde: "/:c/:d/:e"
  search:
    g: "f=:g"
  hash:
    h: "#:h"

WebStore.maps
  session: ["c"]
  cookie:  ["e"]


describe "Url", ->
  it "match now", ->
    assert_only Url.params,
      a: "z"
      b: "z"
      c: "z"
      d: "z"
      e: "z"
      g: "z"
      h: "z"

  it "match change", ->
    Url.popstate()
    match = []
    assert_only Url.conf,
      a:   { match }
      b:   { match }
      cde: { match }
      g:   { match }
      h:   { match }
    assert_only Url.params,
      a: "a"
      b: "b"
      c: "c"
      d: "d"
      e: "e"
      g: "g"
      h: "hijk"

  it "push state", ->
    Url.prop.g "zyx"
    assert Url.prop.g() == "zyx"
    assert Url.location().href == "a://b/c/d/e?f=zyx#hijk"
