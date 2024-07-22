function fe(t) {
  return t.trim().split(/\r?\n/).slice(4).map(
    (e) => [...e].map((n) => n === "@" || n === "T")
  );
}
class bt extends Error {
}
var ct = typeof global == "object" && global && global.Object === Object && global, gt = typeof self == "object" && self && self.Object === Object && self, s = ct || gt || Function("return this")(), c = s.Symbol, ut = Object.prototype, wt = ut.hasOwnProperty, jt = ut.toString, b = c ? c.toStringTag : void 0;
function xt(t) {
  var r = wt.call(t, b), e = t[b];
  try {
    t[b] = void 0;
    var n = !0;
  } catch {
  }
  var o = jt.call(t);
  return n && (r ? t[b] = e : delete t[b]), o;
}
var mt = Object.prototype, Ot = mt.toString;
function At(t) {
  return Ot.call(t);
}
var zt = "[object Null]", Pt = "[object Undefined]", U = c ? c.toStringTag : void 0;
function P(t) {
  return t == null ? t === void 0 ? Pt : zt : U && U in Object(t) ? xt(t) : At(t);
}
function S(t) {
  return t != null && typeof t == "object";
}
function St(t, r) {
  for (var e = -1, n = t == null ? 0 : t.length, o = Array(n); ++e < n; )
    o[e] = r(t[e], e, t);
  return o;
}
var Ct = Array.isArray, V = c ? c.prototype : void 0;
V && V.toString;
function G(t) {
  var r = typeof t;
  return t != null && (r == "object" || r == "function");
}
function pt(t) {
  return t;
}
var Tt = "[object AsyncFunction]", Et = "[object Function]", $t = "[object GeneratorFunction]", kt = "[object Proxy]";
function _t(t) {
  if (!G(t))
    return !1;
  var r = P(t);
  return r == Et || r == $t || r == Tt || r == kt;
}
var M = s["__core-js_shared__"], Y = function() {
  var t = /[^.]+$/.exec(M && M.keys && M.keys.IE_PROTO || "");
  return t ? "Symbol(src)_1." + t : "";
}();
function Mt(t) {
  return !!Y && Y in t;
}
var Ft = Function.prototype, It = Ft.toString;
function _(t) {
  if (t != null) {
    try {
      return It.call(t);
    } catch {
    }
    try {
      return t + "";
    } catch {
    }
  }
  return "";
}
var Lt = /[\\^$.*+?()[\]{}|]/g, Rt = /^\[object .+?Constructor\]$/, Wt = Function.prototype, Dt = Object.prototype, Gt = Wt.toString, Nt = Dt.hasOwnProperty, qt = RegExp(
  "^" + Gt.call(Nt).replace(Lt, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Bt(t) {
  if (!G(t) || Mt(t))
    return !1;
  var r = _t(t) ? qt : Rt;
  return r.test(_(t));
}
function Ut(t, r) {
  return t == null ? void 0 : t[r];
}
function h(t, r) {
  var e = Ut(t, r);
  return Bt(e) ? e : void 0;
}
var I = h(s, "WeakMap"), H = Object.create, ht = /* @__PURE__ */ function() {
  function t() {
  }
  return function(r) {
    if (!G(r))
      return {};
    if (H)
      return H(r);
    t.prototype = r;
    var e = new t();
    return t.prototype = void 0, e;
  };
}();
function Vt(t, r, e) {
  switch (e.length) {
    case 0:
      return t.call(r);
    case 1:
      return t.call(r, e[0]);
    case 2:
      return t.call(r, e[0], e[1]);
    case 3:
      return t.call(r, e[0], e[1], e[2]);
  }
  return t.apply(r, e);
}
function N() {
}
var Yt = 4294967295;
function w(t) {
  this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = Yt, this.__views__ = [];
}
w.prototype = ht(N.prototype);
w.prototype.constructor = w;
function v(t, r) {
  this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!r, this.__index__ = 0, this.__values__ = void 0;
}
v.prototype = ht(N.prototype);
v.prototype.constructor = v;
function Ht(t, r) {
  var e = -1, n = t.length;
  for (r || (r = Array(n)); ++e < n; )
    r[e] = t[e];
  return r;
}
function Jt(t) {
  if (t instanceof w)
    return t.clone();
  var r = new v(t.__wrapped__, t.__chain__);
  return r.__actions__ = Ht(t.__actions__), r.__index__ = t.__index__, r.__values__ = t.__values__, r;
}
var Qt = Object.prototype, Xt = Qt.hasOwnProperty;
function L(t) {
  if (S(t) && !Ct(t) && !(t instanceof w)) {
    if (t instanceof v)
      return t;
    if (Xt.call(t, "__wrapped__"))
      return Jt(t);
  }
  return new v(t);
}
L.prototype = N.prototype;
L.prototype.constructor = L;
var Zt = 800, Kt = 16, tr = Date.now;
function rr(t) {
  var r = 0, e = 0;
  return function() {
    var n = tr(), o = Kt - (n - e);
    if (e = n, o > 0) {
      if (++r >= Zt)
        return arguments[0];
    } else
      r = 0;
    return t.apply(void 0, arguments);
  };
}
function er(t) {
  return function() {
    return t;
  };
}
var J = function() {
  try {
    var t = h(Object, "defineProperty");
    return t({}, "", {}), t;
  } catch {
  }
}(), nr = J ? function(t, r) {
  return J(t, "toString", {
    configurable: !0,
    enumerable: !1,
    value: er(r),
    writable: !0
  });
} : pt, or = rr(nr);
function ir(t, r) {
  return t === r || t !== t && r !== r;
}
var Q = Math.max;
function ar(t, r, e) {
  return r = Q(r === void 0 ? t.length - 1 : r, 0), function() {
    for (var n = arguments, o = -1, i = Q(n.length - r, 0), a = Array(i); ++o < i; )
      a[o] = n[r + o];
    o = -1;
    for (var u = Array(r + 1); ++o < r; )
      u[o] = n[o];
    return u[r] = e(a), Vt(t, this, u);
  };
}
function sr(t, r) {
  return or(ar(t, r, pt), t + "");
}
var cr = 9007199254740991;
function ur(t) {
  return typeof t == "number" && t > -1 && t % 1 == 0 && t <= cr;
}
function pr(t) {
  return t != null && ur(t.length) && !_t(t);
}
function _r(t, r) {
  for (var e = -1, n = Array(t); ++e < t; )
    n[e] = r(e);
  return n;
}
var hr = "[object Arguments]";
function X(t) {
  return S(t) && P(t) == hr;
}
var lt = Object.prototype, lr = lt.hasOwnProperty, fr = lt.propertyIsEnumerable;
X(/* @__PURE__ */ function() {
  return arguments;
}());
var ft = typeof exports == "object" && exports && !exports.nodeType && exports, Z = ft && typeof module == "object" && module && !module.nodeType && module, vr = Z && Z.exports === ft, K = vr ? s.Buffer : void 0;
K && K.isBuffer;
var vt = typeof exports == "object" && exports && !exports.nodeType && exports, g = vt && typeof module == "object" && module && !module.nodeType && module, dr = g && g.exports === vt, F = dr && ct.process, tt = function() {
  try {
    var t = g && g.require && g.require("util").types;
    return t || F && F.binding && F.binding("util");
  } catch {
  }
}();
tt && tt.isTypedArray;
var j = h(Object, "create");
function yr() {
  this.__data__ = j ? j(null) : {}, this.size = 0;
}
function br(t) {
  var r = this.has(t) && delete this.__data__[t];
  return this.size -= r ? 1 : 0, r;
}
var gr = "__lodash_hash_undefined__", wr = Object.prototype, jr = wr.hasOwnProperty;
function xr(t) {
  var r = this.__data__;
  if (j) {
    var e = r[t];
    return e === gr ? void 0 : e;
  }
  return jr.call(r, t) ? r[t] : void 0;
}
var mr = Object.prototype, Or = mr.hasOwnProperty;
function Ar(t) {
  var r = this.__data__;
  return j ? r[t] !== void 0 : Or.call(r, t);
}
var zr = "__lodash_hash_undefined__";
function Pr(t, r) {
  var e = this.__data__;
  return this.size += this.has(t) ? 0 : 1, e[t] = j && r === void 0 ? zr : r, this;
}
function p(t) {
  var r = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++r < e; ) {
    var n = t[r];
    this.set(n[0], n[1]);
  }
}
p.prototype.clear = yr;
p.prototype.delete = br;
p.prototype.get = xr;
p.prototype.has = Ar;
p.prototype.set = Pr;
function Sr() {
  this.__data__ = [], this.size = 0;
}
function C(t, r) {
  for (var e = t.length; e--; )
    if (ir(t[e][0], r))
      return e;
  return -1;
}
var Cr = Array.prototype, Tr = Cr.splice;
function Er(t) {
  var r = this.__data__, e = C(r, t);
  if (e < 0)
    return !1;
  var n = r.length - 1;
  return e == n ? r.pop() : Tr.call(r, e, 1), --this.size, !0;
}
function $r(t) {
  var r = this.__data__, e = C(r, t);
  return e < 0 ? void 0 : r[e][1];
}
function kr(t) {
  return C(this.__data__, t) > -1;
}
function Mr(t, r) {
  var e = this.__data__, n = C(e, t);
  return n < 0 ? (++this.size, e.push([t, r])) : e[n][1] = r, this;
}
function y(t) {
  var r = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++r < e; ) {
    var n = t[r];
    this.set(n[0], n[1]);
  }
}
y.prototype.clear = Sr;
y.prototype.delete = Er;
y.prototype.get = $r;
y.prototype.has = kr;
y.prototype.set = Mr;
var A = h(s, "Map");
function Fr() {
  this.size = 0, this.__data__ = {
    hash: new p(),
    map: new (A || y)(),
    string: new p()
  };
}
function Ir(t) {
  var r = typeof t;
  return r == "string" || r == "number" || r == "symbol" || r == "boolean" ? t !== "__proto__" : t === null;
}
function T(t, r) {
  var e = t.__data__;
  return Ir(r) ? e[typeof r == "string" ? "string" : "hash"] : e.map;
}
function Lr(t) {
  var r = T(this, t).delete(t);
  return this.size -= r ? 1 : 0, r;
}
function Rr(t) {
  return T(this, t).get(t);
}
function Wr(t) {
  return T(this, t).has(t);
}
function Dr(t, r) {
  var e = T(this, t), n = e.size;
  return e.set(t, r), this.size += e.size == n ? 0 : 1, this;
}
function l(t) {
  var r = -1, e = t == null ? 0 : t.length;
  for (this.clear(); ++r < e; ) {
    var n = t[r];
    this.set(n[0], n[1]);
  }
}
l.prototype.clear = Fr;
l.prototype.delete = Lr;
l.prototype.get = Rr;
l.prototype.has = Wr;
l.prototype.set = Dr;
var Gr = "Expected a function";
function q(t, r) {
  if (typeof t != "function" || r != null && typeof r != "function")
    throw new TypeError(Gr);
  var e = function() {
    var n = arguments, o = r ? r.apply(this, n) : n[0], i = e.cache;
    if (i.has(o))
      return i.get(o);
    var a = t.apply(this, n);
    return e.cache = i.set(o, a) || i, a;
  };
  return e.cache = new (q.Cache || l)(), e;
}
q.Cache = l;
var Nr = 500;
function qr(t) {
  var r = q(t, function(n) {
    return e.size === Nr && e.clear(), n;
  }), e = r.cache;
  return r;
}
var Br = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Ur = /\\(\\)?/g;
qr(function(t) {
  var r = [];
  return t.charCodeAt(0) === 46 && r.push(""), t.replace(Br, function(e, n, o, i) {
    r.push(o ? i.replace(Ur, "$1") : n || e);
  }), r;
});
function Vr(t, r) {
  for (var e = -1, n = t == null ? 0 : t.length, o = 0, i = []; ++e < n; ) {
    var a = t[e];
    r(a, e, t) && (i[o++] = a);
  }
  return i;
}
var R = h(s, "DataView"), W = h(s, "Promise"), D = h(s, "Set"), rt = "[object Map]", Yr = "[object Object]", et = "[object Promise]", nt = "[object Set]", ot = "[object WeakMap]", it = "[object DataView]", Hr = _(R), Jr = _(A), Qr = _(W), Xr = _(D), Zr = _(I), f = P;
(R && f(new R(new ArrayBuffer(1))) != it || A && f(new A()) != rt || W && f(W.resolve()) != et || D && f(new D()) != nt || I && f(new I()) != ot) && (f = function(t) {
  var r = P(t), e = r == Yr ? t.constructor : void 0, n = e ? _(e) : "";
  if (n)
    switch (n) {
      case Hr:
        return it;
      case Jr:
        return rt;
      case Qr:
        return et;
      case Xr:
        return nt;
      case Zr:
        return ot;
    }
  return r;
});
s.Uint8Array;
var at = c ? c.prototype : void 0;
at && at.valueOf;
function Kr(t) {
  return function(r) {
    return r == null ? void 0 : r[t];
  };
}
function te(t) {
  return S(t) && pr(t);
}
var re = Math.max;
function ee(t) {
  if (!(t && t.length))
    return [];
  var r = 0;
  return t = Vr(t, function(e) {
    if (te(e))
      return r = re(e.length, r), !0;
  }), _r(r, function(e) {
    return St(t, Kr(e));
  });
}
sr(ee);
class E {
  /**
   * Create a new linked list item.
   */
  constructor() {
    this.next, this.prev, this.list;
  }
  /**
   * Add the given item **after** the operated on item in a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or
   * `prepend` methods.
   * Returns `false` when the operated on item is not attached to a list,
   * otherwise the given item.
   *
   * @param {this} item
   * @returns {this|false}
   */
  append(r) {
    const e = this.list;
    if (!r || !r.append || !r.prepend || !r.detach)
      throw new Error(
        "An argument without append, prepend, or detach methods was given to `Item#append`."
      );
    return !e || this === r ? !1 : (r.detach(), this.next && (r.next = this.next, this.next.prev = r), r.prev = this, r.list = e, this.next = r, (this === e.tail || !e.tail) && (e.tail = r), e.size++, r);
  }
  /**
   * Add the given item **before** the operated on item in a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or `prepend`
   * methods.
   * Returns `false` when the operated on item is not attached to a list,
   * otherwise the given item.
   *
   * @param {this} item
   * @returns {this|false}
   */
  prepend(r) {
    const e = this.list;
    if (!r || !r.append || !r.prepend || !r.detach)
      throw new Error(
        "An argument without append, prepend, or detach methods was given to `Item#prepend`."
      );
    return !e || this === r ? !1 : (r.detach(), this.prev && (r.prev = this.prev, this.prev.next = r), r.next = this, r.list = e, this.prev = r, this === e.head && (e.head = r), e.tail || (e.tail = this), e.size++, r);
  }
  /**
   * Remove the operated on item from its parent list.
   *
   * Removes references to it on its parent `list`, and `prev` and `next`
   * items.
   * Relinks all references.
   * Returns the operated on item.
   * Even when it was already detached.
   *
   * @returns {this}
   */
  detach() {
    const r = this.list;
    return r ? (r.tail === this && (r.tail = this.prev), r.head === this && (r.head = this.next), r.tail === r.head && (r.tail = null), this.prev && (this.prev.next = this.next), this.next && (this.next.prev = this.prev), this.prev = null, this.next = null, this.list = null, r.size--, this) : this;
  }
}
E.prototype.next = null;
E.prototype.prev = null;
E.prototype.list = null;
class ne extends E {
  constructor(r, e, n) {
    super(), this.count = r, this.symbol = e, this.offset = n;
  }
}
class oe {
  constructor(r) {
    this.offset = 0, this.chunks = r.matchAll(/(\d*)([a-z])/g);
  }
  read() {
    const { value: r, done: e } = this.chunks.next();
    if (e)
      throw new bt();
    {
      const [, n, o] = r, i = n ? +n : 1, a = new ne(i, o, this.offset);
      return this.offset += i, a;
    }
  }
}
function ie(t) {
  return t != null && typeof t == "object";
}
var ae = Array.isArray;
function se(t) {
  var r = typeof t;
  return t != null && (r == "object" || r == "function");
}
var st = Object.create, dt = /* @__PURE__ */ function() {
  function t() {
  }
  return function(r) {
    if (!se(r))
      return {};
    if (st)
      return st(r);
    t.prototype = r;
    var e = new t();
    return t.prototype = void 0, e;
  };
}();
function B() {
}
var ce = 4294967295;
function x(t) {
  this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = ce, this.__views__ = [];
}
x.prototype = dt(B.prototype);
x.prototype.constructor = x;
function d(t, r) {
  this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!r, this.__index__ = 0, this.__values__ = void 0;
}
d.prototype = dt(B.prototype);
d.prototype.constructor = d;
function ue(t, r) {
  var e = -1, n = t.length;
  for (r || (r = Array(n)); ++e < n; )
    r[e] = t[e];
  return r;
}
function pe(t) {
  if (t instanceof x)
    return t.clone();
  var r = new d(t.__wrapped__, t.__chain__);
  return r.__actions__ = ue(t.__actions__), r.__index__ = t.__index__, r.__values__ = t.__values__, r;
}
var _e = Object.prototype, he = _e.hasOwnProperty;
function z(t) {
  if (ie(t) && !ae(t) && !(t instanceof x)) {
    if (t instanceof d)
      return t;
    if (he.call(t, "__wrapped__"))
      return pe(t);
  }
  return new d(t);
}
z.prototype = B.prototype;
z.prototype.constructor = z;
function le(t) {
  var r = z(t);
  return r.__chain__ = !0, r;
}
function ve(t, r, e) {
  const n = t.trim().split(/\r?\n/);
  n.shift();
  const [, , o, i] = n[0].split("	"), a = n.map(($) => {
    const [, , , , m, k] = $.split("	");
    return { x: +m, y: +k };
  }).slice(0, r), u = e.trim().split(`
`), yt = le(u).map(($) => {
    let m = 0;
    const k = new oe($);
    for (; ; )
      try {
        const O = k.read();
        m += (O == null ? void 0 : O.count) ?? 1;
      } catch {
        break;
      }
    return m;
  }).max().value();
  return {
    paths: u,
    sources: a,
    x: +o,
    y: +i,
    timespan: yt,
    agents: u
  };
}
export {
  fe as parseMap,
  ve as parseScenario
};
