class at extends Error {
}
class ge extends Error {
}
const C = ({ x: t, y: e }) => `(${t}, ${e})`;
var Yt = typeof global == "object" && global && global.Object === Object && global, ye = typeof self == "object" && self && self.Object === Object && self, b = Yt || ye || Function("return this")(), O = b.Symbol, Wt = Object.prototype, ve = Wt.hasOwnProperty, be = Wt.toString, L = O ? O.toStringTag : void 0;
function we(t) {
  var e = ve.call(t, L), r = t[L];
  try {
    t[L] = void 0;
    var n = !0;
  } catch {
  }
  var i = be.call(t);
  return n && (e ? t[L] = r : delete t[L]), i;
}
var Ae = Object.prototype, Te = Ae.toString;
function xe(t) {
  return Te.call(t);
}
var Oe = "[object Null]", $e = "[object Undefined]", wt = O ? O.toStringTag : void 0;
function j(t) {
  return t == null ? t === void 0 ? $e : Oe : wt && wt in Object(t) ? we(t) : xe(t);
}
function $(t) {
  return t != null && typeof t == "object";
}
var Pe = "[object Symbol]";
function X(t) {
  return typeof t == "symbol" || $(t) && j(t) == Pe;
}
function qt(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length, i = Array(n); ++r < n; )
    i[r] = e(t[r], r, t);
  return i;
}
var y = Array.isArray, me = 1 / 0, At = O ? O.prototype : void 0, Tt = At ? At.toString : void 0;
function Zt(t) {
  if (typeof t == "string")
    return t;
  if (y(t))
    return qt(t, Zt) + "";
  if (X(t))
    return Tt ? Tt.call(t) : "";
  var e = t + "";
  return e == "0" && 1 / t == -me ? "-0" : e;
}
var Ee = /\s/;
function Se(t) {
  for (var e = t.length; e-- && Ee.test(t.charAt(e)); )
    ;
  return e;
}
var Ie = /^\s+/;
function Ce(t) {
  return t && t.slice(0, Se(t) + 1).replace(Ie, "");
}
function R(t) {
  var e = typeof t;
  return t != null && (e == "object" || e == "function");
}
var xt = NaN, Re = /^[-+]0x[0-9a-f]+$/i, Me = /^0b[01]+$/i, je = /^0o[0-7]+$/i, Le = parseInt;
function Ne(t) {
  if (typeof t == "number")
    return t;
  if (X(t))
    return xt;
  if (R(t)) {
    var e = typeof t.valueOf == "function" ? t.valueOf() : t;
    t = R(e) ? e + "" : e;
  }
  if (typeof t != "string")
    return t === 0 ? t : +t;
  t = Ce(t);
  var r = Me.test(t);
  return r || je.test(t) ? Le(t.slice(2), r ? 2 : 8) : Re.test(t) ? xt : +t;
}
var Ot = 1 / 0, Fe = 17976931348623157e292;
function De(t) {
  if (!t)
    return t === 0 ? t : 0;
  if (t = Ne(t), t === Ot || t === -Ot) {
    var e = t < 0 ? -1 : 1;
    return e * Fe;
  }
  return t === t ? t : 0;
}
function Jt(t) {
  var e = De(t), r = e % 1;
  return e === e ? r ? e - r : e : 0;
}
function Y(t) {
  return t;
}
var ze = "[object AsyncFunction]", Ge = "[object Function]", Be = "[object GeneratorFunction]", He = "[object Proxy]";
function Qt(t) {
  if (!R(t))
    return !1;
  var e = j(t);
  return e == Ge || e == Be || e == ze || e == He;
}
var tt = b["__core-js_shared__"], $t = function() {
  var t = /[^.]+$/.exec(tt && tt.keys && tt.keys.IE_PROTO || "");
  return t ? "Symbol(src)_1." + t : "";
}();
function Ue(t) {
  return !!$t && $t in t;
}
var Ke = Function.prototype, Xe = Ke.toString;
function S(t) {
  if (t != null) {
    try {
      return Xe.call(t);
    } catch {
    }
    try {
      return t + "";
    } catch {
    }
  }
  return "";
}
var Ye = /[\\^$.*+?()[\]{}|]/g, We = /^\[object .+?Constructor\]$/, qe = Function.prototype, Ze = Object.prototype, Je = qe.toString, Qe = Ze.hasOwnProperty, Ve = RegExp(
  "^" + Je.call(Qe).replace(Ye, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function ke(t) {
  if (!R(t) || Ue(t))
    return !1;
  var e = Qt(t) ? Ve : We;
  return e.test(S(t));
}
function tr(t, e) {
  return t == null ? void 0 : t[e];
}
function I(t, e) {
  var r = tr(t, e);
  return ke(r) ? r : void 0;
}
var st = I(b, "WeakMap"), Pt = Object.create, Vt = /* @__PURE__ */ function() {
  function t() {
  }
  return function(e) {
    if (!R(e))
      return {};
    if (Pt)
      return Pt(e);
    t.prototype = e;
    var r = new t();
    return t.prototype = void 0, r;
  };
}();
function er(t, e, r) {
  switch (r.length) {
    case 0:
      return t.call(e);
    case 1:
      return t.call(e, r[0]);
    case 2:
      return t.call(e, r[0], r[1]);
    case 3:
      return t.call(e, r[0], r[1], r[2]);
  }
  return t.apply(e, r);
}
function lt() {
}
var rr = 4294967295;
function F(t) {
  this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = rr, this.__views__ = [];
}
F.prototype = Vt(lt.prototype);
F.prototype.constructor = F;
function M(t, e) {
  this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!e, this.__index__ = 0, this.__values__ = void 0;
}
M.prototype = Vt(lt.prototype);
M.prototype.constructor = M;
function nr(t, e) {
  var r = -1, n = t.length;
  for (e || (e = Array(n)); ++r < n; )
    e[r] = t[r];
  return e;
}
function ir(t) {
  if (t instanceof F)
    return t.clone();
  var e = new M(t.__wrapped__, t.__chain__);
  return e.__actions__ = nr(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
}
var ar = Object.prototype, sr = ar.hasOwnProperty;
function U(t) {
  if ($(t) && !y(t) && !(t instanceof F)) {
    if (t instanceof M)
      return t;
    if (sr.call(t, "__wrapped__"))
      return ir(t);
  }
  return new M(t);
}
U.prototype = lt.prototype;
U.prototype.constructor = U;
var or = 800, ur = 16, fr = Date.now;
function cr(t) {
  var e = 0, r = 0;
  return function() {
    var n = fr(), i = ur - (n - r);
    if (r = n, i > 0) {
      if (++e >= or)
        return arguments[0];
    } else
      e = 0;
    return t.apply(void 0, arguments);
  };
}
function lr(t) {
  return function() {
    return t;
  };
}
var mt = function() {
  try {
    var t = I(Object, "defineProperty");
    return t({}, "", {}), t;
  } catch {
  }
}(), hr = mt ? function(t, e) {
  return mt(t, "toString", {
    configurable: !0,
    enumerable: !1,
    value: lr(e),
    writable: !0
  });
} : Y, pr = cr(hr);
function dr(t, e, r, n) {
  for (var i = t.length, a = r + -1; ++a < i; )
    if (e(t[a], a, t))
      return a;
  return -1;
}
var _r = 9007199254740991, gr = /^(?:0|[1-9]\d*)$/;
function kt(t, e) {
  var r = typeof t;
  return e = e ?? _r, !!e && (r == "number" || r != "symbol" && gr.test(t)) && t > -1 && t % 1 == 0 && t < e;
}
function te(t, e) {
  return t === e || t !== t && e !== e;
}
var Et = Math.max;
function yr(t, e, r) {
  return e = Et(e === void 0 ? t.length - 1 : e, 0), function() {
    for (var n = arguments, i = -1, a = Et(n.length - e, 0), s = Array(a); ++i < a; )
      s[i] = n[e + i];
    i = -1;
    for (var o = Array(e + 1); ++i < e; )
      o[i] = n[i];
    return o[e] = r(s), er(t, this, o);
  };
}
function vr(t, e) {
  return pr(yr(t, e, Y), t + "");
}
var br = 9007199254740991;
function ht(t) {
  return typeof t == "number" && t > -1 && t % 1 == 0 && t <= br;
}
function W(t) {
  return t != null && ht(t.length) && !Qt(t);
}
var wr = Object.prototype;
function Ar(t) {
  var e = t && t.constructor, r = typeof e == "function" && e.prototype || wr;
  return t === r;
}
function pt(t, e) {
  for (var r = -1, n = Array(t); ++r < t; )
    n[r] = e(r);
  return n;
}
var Tr = "[object Arguments]";
function St(t) {
  return $(t) && j(t) == Tr;
}
var ee = Object.prototype, xr = ee.hasOwnProperty, Or = ee.propertyIsEnumerable, re = St(/* @__PURE__ */ function() {
  return arguments;
}()) ? St : function(t) {
  return $(t) && xr.call(t, "callee") && !Or.call(t, "callee");
};
function $r() {
  return !1;
}
var ne = typeof exports == "object" && exports && !exports.nodeType && exports, It = ne && typeof module == "object" && module && !module.nodeType && module, Pr = It && It.exports === ne, Ct = Pr ? b.Buffer : void 0, mr = Ct ? Ct.isBuffer : void 0, ot = mr || $r, Er = "[object Arguments]", Sr = "[object Array]", Ir = "[object Boolean]", Cr = "[object Date]", Rr = "[object Error]", Mr = "[object Function]", jr = "[object Map]", Lr = "[object Number]", Nr = "[object Object]", Fr = "[object RegExp]", Dr = "[object Set]", zr = "[object String]", Gr = "[object WeakMap]", Br = "[object ArrayBuffer]", Hr = "[object DataView]", Ur = "[object Float32Array]", Kr = "[object Float64Array]", Xr = "[object Int8Array]", Yr = "[object Int16Array]", Wr = "[object Int32Array]", qr = "[object Uint8Array]", Zr = "[object Uint8ClampedArray]", Jr = "[object Uint16Array]", Qr = "[object Uint32Array]", c = {};
c[Ur] = c[Kr] = c[Xr] = c[Yr] = c[Wr] = c[qr] = c[Zr] = c[Jr] = c[Qr] = !0;
c[Er] = c[Sr] = c[Br] = c[Ir] = c[Hr] = c[Cr] = c[Rr] = c[Mr] = c[jr] = c[Lr] = c[Nr] = c[Fr] = c[Dr] = c[zr] = c[Gr] = !1;
function Vr(t) {
  return $(t) && ht(t.length) && !!c[j(t)];
}
function kr(t) {
  return function(e) {
    return t(e);
  };
}
var ie = typeof exports == "object" && exports && !exports.nodeType && exports, N = ie && typeof module == "object" && module && !module.nodeType && module, tn = N && N.exports === ie, et = tn && Yt.process, Rt = function() {
  try {
    var t = N && N.require && N.require("util").types;
    return t || et && et.binding && et.binding("util");
  } catch {
  }
}(), Mt = Rt && Rt.isTypedArray, ae = Mt ? kr(Mt) : Vr, en = Object.prototype, rn = en.hasOwnProperty;
function nn(t, e) {
  var r = y(t), n = !r && re(t), i = !r && !n && ot(t), a = !r && !n && !i && ae(t), s = r || n || i || a, o = s ? pt(t.length, String) : [], f = o.length;
  for (var u in t)
    rn.call(t, u) && !(s && // Safari 9 has enumerable `arguments.length` in strict mode.
    (u == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    i && (u == "offset" || u == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    a && (u == "buffer" || u == "byteLength" || u == "byteOffset") || // Skip index properties.
    kt(u, f))) && o.push(u);
  return o;
}
function an(t, e) {
  return function(r) {
    return t(e(r));
  };
}
var sn = an(Object.keys, Object), on = Object.prototype, un = on.hasOwnProperty;
function fn(t) {
  if (!Ar(t))
    return sn(t);
  var e = [];
  for (var r in Object(t))
    un.call(t, r) && r != "constructor" && e.push(r);
  return e;
}
function q(t) {
  return W(t) ? nn(t) : fn(t);
}
var cn = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ln = /^\w*$/;
function dt(t, e) {
  if (y(t))
    return !1;
  var r = typeof t;
  return r == "number" || r == "symbol" || r == "boolean" || t == null || X(t) ? !0 : ln.test(t) || !cn.test(t) || e != null && t in Object(e);
}
var D = I(Object, "create");
function hn() {
  this.__data__ = D ? D(null) : {}, this.size = 0;
}
function pn(t) {
  var e = this.has(t) && delete this.__data__[t];
  return this.size -= e ? 1 : 0, e;
}
var dn = "__lodash_hash_undefined__", _n = Object.prototype, gn = _n.hasOwnProperty;
function yn(t) {
  var e = this.__data__;
  if (D) {
    var r = e[t];
    return r === dn ? void 0 : r;
  }
  return gn.call(e, t) ? e[t] : void 0;
}
var vn = Object.prototype, bn = vn.hasOwnProperty;
function wn(t) {
  var e = this.__data__;
  return D ? e[t] !== void 0 : bn.call(e, t);
}
var An = "__lodash_hash_undefined__";
function Tn(t, e) {
  var r = this.__data__;
  return this.size += this.has(t) ? 0 : 1, r[t] = D && e === void 0 ? An : e, this;
}
function E(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.clear(); ++e < r; ) {
    var n = t[e];
    this.set(n[0], n[1]);
  }
}
E.prototype.clear = hn;
E.prototype.delete = pn;
E.prototype.get = yn;
E.prototype.has = wn;
E.prototype.set = Tn;
function xn() {
  this.__data__ = [], this.size = 0;
}
function Z(t, e) {
  for (var r = t.length; r--; )
    if (te(t[r][0], e))
      return r;
  return -1;
}
var On = Array.prototype, $n = On.splice;
function Pn(t) {
  var e = this.__data__, r = Z(e, t);
  if (r < 0)
    return !1;
  var n = e.length - 1;
  return r == n ? e.pop() : $n.call(e, r, 1), --this.size, !0;
}
function mn(t) {
  var e = this.__data__, r = Z(e, t);
  return r < 0 ? void 0 : e[r][1];
}
function En(t) {
  return Z(this.__data__, t) > -1;
}
function Sn(t, e) {
  var r = this.__data__, n = Z(r, t);
  return n < 0 ? (++this.size, r.push([t, e])) : r[n][1] = e, this;
}
function w(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.clear(); ++e < r; ) {
    var n = t[e];
    this.set(n[0], n[1]);
  }
}
w.prototype.clear = xn;
w.prototype.delete = Pn;
w.prototype.get = mn;
w.prototype.has = En;
w.prototype.set = Sn;
var z = I(b, "Map");
function In() {
  this.size = 0, this.__data__ = {
    hash: new E(),
    map: new (z || w)(),
    string: new E()
  };
}
function Cn(t) {
  var e = typeof t;
  return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
}
function J(t, e) {
  var r = t.__data__;
  return Cn(e) ? r[typeof e == "string" ? "string" : "hash"] : r.map;
}
function Rn(t) {
  var e = J(this, t).delete(t);
  return this.size -= e ? 1 : 0, e;
}
function Mn(t) {
  return J(this, t).get(t);
}
function jn(t) {
  return J(this, t).has(t);
}
function Ln(t, e) {
  var r = J(this, t), n = r.size;
  return r.set(t, e), this.size += r.size == n ? 0 : 1, this;
}
function A(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.clear(); ++e < r; ) {
    var n = t[e];
    this.set(n[0], n[1]);
  }
}
A.prototype.clear = In;
A.prototype.delete = Rn;
A.prototype.get = Mn;
A.prototype.has = jn;
A.prototype.set = Ln;
var Nn = "Expected a function";
function _t(t, e) {
  if (typeof t != "function" || e != null && typeof e != "function")
    throw new TypeError(Nn);
  var r = function() {
    var n = arguments, i = e ? e.apply(this, n) : n[0], a = r.cache;
    if (a.has(i))
      return a.get(i);
    var s = t.apply(this, n);
    return r.cache = a.set(i, s) || a, s;
  };
  return r.cache = new (_t.Cache || A)(), r;
}
_t.Cache = A;
var Fn = 500;
function Dn(t) {
  var e = _t(t, function(n) {
    return r.size === Fn && r.clear(), n;
  }), r = e.cache;
  return e;
}
var zn = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Gn = /\\(\\)?/g, Bn = Dn(function(t) {
  var e = [];
  return t.charCodeAt(0) === 46 && e.push(""), t.replace(zn, function(r, n, i, a) {
    e.push(i ? a.replace(Gn, "$1") : n || r);
  }), e;
});
function Hn(t) {
  return t == null ? "" : Zt(t);
}
function se(t, e) {
  return y(t) ? t : dt(t, e) ? [t] : Bn(Hn(t));
}
var Un = 1 / 0;
function Q(t) {
  if (typeof t == "string" || X(t))
    return t;
  var e = t + "";
  return e == "0" && 1 / t == -Un ? "-0" : e;
}
function oe(t, e) {
  e = se(e, t);
  for (var r = 0, n = e.length; t != null && r < n; )
    t = t[Q(e[r++])];
  return r && r == n ? t : void 0;
}
function Kn(t, e, r) {
  var n = t == null ? void 0 : oe(t, e);
  return n === void 0 ? r : n;
}
function Xn(t, e) {
  for (var r = -1, n = e.length, i = t.length; ++r < n; )
    t[i + r] = e[r];
  return t;
}
function ue(t) {
  var e = U(t);
  return e.__chain__ = !0, e;
}
function Yn() {
  this.__data__ = new w(), this.size = 0;
}
function Wn(t) {
  var e = this.__data__, r = e.delete(t);
  return this.size = e.size, r;
}
function qn(t) {
  return this.__data__.get(t);
}
function Zn(t) {
  return this.__data__.has(t);
}
var Jn = 200;
function Qn(t, e) {
  var r = this.__data__;
  if (r instanceof w) {
    var n = r.__data__;
    if (!z || n.length < Jn - 1)
      return n.push([t, e]), this.size = ++r.size, this;
    r = this.__data__ = new A(n);
  }
  return r.set(t, e), this.size = r.size, this;
}
function v(t) {
  var e = this.__data__ = new w(t);
  this.size = e.size;
}
v.prototype.clear = Yn;
v.prototype.delete = Wn;
v.prototype.get = qn;
v.prototype.has = Zn;
v.prototype.set = Qn;
function fe(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length, i = 0, a = []; ++r < n; ) {
    var s = t[r];
    e(s, r, t) && (a[i++] = s);
  }
  return a;
}
function Vn() {
  return [];
}
var kn = Object.prototype, ti = kn.propertyIsEnumerable, jt = Object.getOwnPropertySymbols, ei = jt ? function(t) {
  return t == null ? [] : (t = Object(t), fe(jt(t), function(e) {
    return ti.call(t, e);
  }));
} : Vn;
function ri(t, e, r) {
  var n = e(t);
  return y(t) ? n : Xn(n, r(t));
}
function Lt(t) {
  return ri(t, q, ei);
}
var ut = I(b, "DataView"), ft = I(b, "Promise"), ct = I(b, "Set"), Nt = "[object Map]", ni = "[object Object]", Ft = "[object Promise]", Dt = "[object Set]", zt = "[object WeakMap]", Gt = "[object DataView]", ii = S(ut), ai = S(z), si = S(ft), oi = S(ct), ui = S(st), x = j;
(ut && x(new ut(new ArrayBuffer(1))) != Gt || z && x(new z()) != Nt || ft && x(ft.resolve()) != Ft || ct && x(new ct()) != Dt || st && x(new st()) != zt) && (x = function(t) {
  var e = j(t), r = e == ni ? t.constructor : void 0, n = r ? S(r) : "";
  if (n)
    switch (n) {
      case ii:
        return Gt;
      case ai:
        return Nt;
      case si:
        return Ft;
      case oi:
        return Dt;
      case ui:
        return zt;
    }
  return e;
});
var Bt = b.Uint8Array, fi = "__lodash_hash_undefined__";
function ci(t) {
  return this.__data__.set(t, fi), this;
}
function li(t) {
  return this.__data__.has(t);
}
function K(t) {
  var e = -1, r = t == null ? 0 : t.length;
  for (this.__data__ = new A(); ++e < r; )
    this.add(t[e]);
}
K.prototype.add = K.prototype.push = ci;
K.prototype.has = li;
function ce(t, e) {
  for (var r = -1, n = t == null ? 0 : t.length; ++r < n; )
    if (e(t[r], r, t))
      return !0;
  return !1;
}
function hi(t, e) {
  return t.has(e);
}
var pi = 1, di = 2;
function le(t, e, r, n, i, a) {
  var s = r & pi, o = t.length, f = e.length;
  if (o != f && !(s && f > o))
    return !1;
  var u = a.get(t), p = a.get(e);
  if (u && p)
    return u == e && p == t;
  var h = -1, l = !0, d = r & di ? new K() : void 0;
  for (a.set(t, e), a.set(e, t); ++h < o; ) {
    var _ = t[h], g = e[h];
    if (n)
      var T = s ? n(g, _, h, e, t, a) : n(_, g, h, t, e, a);
    if (T !== void 0) {
      if (T)
        continue;
      l = !1;
      break;
    }
    if (d) {
      if (!ce(e, function(P, m) {
        if (!hi(d, m) && (_ === P || i(_, P, r, n, a)))
          return d.push(m);
      })) {
        l = !1;
        break;
      }
    } else if (!(_ === g || i(_, g, r, n, a))) {
      l = !1;
      break;
    }
  }
  return a.delete(t), a.delete(e), l;
}
function _i(t) {
  var e = -1, r = Array(t.size);
  return t.forEach(function(n, i) {
    r[++e] = [i, n];
  }), r;
}
function gi(t) {
  var e = -1, r = Array(t.size);
  return t.forEach(function(n) {
    r[++e] = n;
  }), r;
}
var yi = 1, vi = 2, bi = "[object Boolean]", wi = "[object Date]", Ai = "[object Error]", Ti = "[object Map]", xi = "[object Number]", Oi = "[object RegExp]", $i = "[object Set]", Pi = "[object String]", mi = "[object Symbol]", Ei = "[object ArrayBuffer]", Si = "[object DataView]", Ht = O ? O.prototype : void 0, rt = Ht ? Ht.valueOf : void 0;
function Ii(t, e, r, n, i, a, s) {
  switch (r) {
    case Si:
      if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset)
        return !1;
      t = t.buffer, e = e.buffer;
    case Ei:
      return !(t.byteLength != e.byteLength || !a(new Bt(t), new Bt(e)));
    case bi:
    case wi:
    case xi:
      return te(+t, +e);
    case Ai:
      return t.name == e.name && t.message == e.message;
    case Oi:
    case Pi:
      return t == e + "";
    case Ti:
      var o = _i;
    case $i:
      var f = n & yi;
      if (o || (o = gi), t.size != e.size && !f)
        return !1;
      var u = s.get(t);
      if (u)
        return u == e;
      n |= vi, s.set(t, e);
      var p = le(o(t), o(e), n, i, a, s);
      return s.delete(t), p;
    case mi:
      if (rt)
        return rt.call(t) == rt.call(e);
  }
  return !1;
}
var Ci = 1, Ri = Object.prototype, Mi = Ri.hasOwnProperty;
function ji(t, e, r, n, i, a) {
  var s = r & Ci, o = Lt(t), f = o.length, u = Lt(e), p = u.length;
  if (f != p && !s)
    return !1;
  for (var h = f; h--; ) {
    var l = o[h];
    if (!(s ? l in e : Mi.call(e, l)))
      return !1;
  }
  var d = a.get(t), _ = a.get(e);
  if (d && _)
    return d == e && _ == t;
  var g = !0;
  a.set(t, e), a.set(e, t);
  for (var T = s; ++h < f; ) {
    l = o[h];
    var P = t[l], m = e[l];
    if (n)
      var bt = s ? n(m, P, l, e, t, a) : n(P, m, l, t, e, a);
    if (!(bt === void 0 ? P === m || i(P, m, r, n, a) : bt)) {
      g = !1;
      break;
    }
    T || (T = l == "constructor");
  }
  if (g && !T) {
    var G = t.constructor, B = e.constructor;
    G != B && "constructor" in t && "constructor" in e && !(typeof G == "function" && G instanceof G && typeof B == "function" && B instanceof B) && (g = !1);
  }
  return a.delete(t), a.delete(e), g;
}
var Li = 1, Ut = "[object Arguments]", Kt = "[object Array]", H = "[object Object]", Ni = Object.prototype, Xt = Ni.hasOwnProperty;
function Fi(t, e, r, n, i, a) {
  var s = y(t), o = y(e), f = s ? Kt : x(t), u = o ? Kt : x(e);
  f = f == Ut ? H : f, u = u == Ut ? H : u;
  var p = f == H, h = u == H, l = f == u;
  if (l && ot(t)) {
    if (!ot(e))
      return !1;
    s = !0, p = !1;
  }
  if (l && !p)
    return a || (a = new v()), s || ae(t) ? le(t, e, r, n, i, a) : Ii(t, e, f, r, n, i, a);
  if (!(r & Li)) {
    var d = p && Xt.call(t, "__wrapped__"), _ = h && Xt.call(e, "__wrapped__");
    if (d || _) {
      var g = d ? t.value() : t, T = _ ? e.value() : e;
      return a || (a = new v()), i(g, T, r, n, a);
    }
  }
  return l ? (a || (a = new v()), ji(t, e, r, n, i, a)) : !1;
}
function gt(t, e, r, n, i) {
  return t === e ? !0 : t == null || e == null || !$(t) && !$(e) ? t !== t && e !== e : Fi(t, e, r, n, gt, i);
}
var Di = 1, zi = 2;
function Gi(t, e, r, n) {
  var i = r.length, a = i;
  if (t == null)
    return !a;
  for (t = Object(t); i--; ) {
    var s = r[i];
    if (s[2] ? s[1] !== t[s[0]] : !(s[0] in t))
      return !1;
  }
  for (; ++i < a; ) {
    s = r[i];
    var o = s[0], f = t[o], u = s[1];
    if (s[2]) {
      if (f === void 0 && !(o in t))
        return !1;
    } else {
      var p = new v(), h;
      if (!(h === void 0 ? gt(u, f, Di | zi, n, p) : h))
        return !1;
    }
  }
  return !0;
}
function he(t) {
  return t === t && !R(t);
}
function Bi(t) {
  for (var e = q(t), r = e.length; r--; ) {
    var n = e[r], i = t[n];
    e[r] = [n, i, he(i)];
  }
  return e;
}
function pe(t, e) {
  return function(r) {
    return r == null ? !1 : r[t] === e && (e !== void 0 || t in Object(r));
  };
}
function Hi(t) {
  var e = Bi(t);
  return e.length == 1 && e[0][2] ? pe(e[0][0], e[0][1]) : function(r) {
    return r === t || Gi(r, t, e);
  };
}
function Ui(t, e) {
  return t != null && e in Object(t);
}
function Ki(t, e, r) {
  e = se(e, t);
  for (var n = -1, i = e.length, a = !1; ++n < i; ) {
    var s = Q(e[n]);
    if (!(a = t != null && r(t, s)))
      break;
    t = t[s];
  }
  return a || ++n != i ? a : (i = t == null ? 0 : t.length, !!i && ht(i) && kt(s, i) && (y(t) || re(t)));
}
function Xi(t, e) {
  return t != null && Ki(t, e, Ui);
}
var Yi = 1, Wi = 2;
function qi(t, e) {
  return dt(t) && he(e) ? pe(Q(t), e) : function(r) {
    var n = Kn(r, t);
    return n === void 0 && n === e ? Xi(r, t) : gt(e, n, Yi | Wi);
  };
}
function de(t) {
  return function(e) {
    return e == null ? void 0 : e[t];
  };
}
function Zi(t) {
  return function(e) {
    return oe(e, t);
  };
}
function Ji(t) {
  return dt(t) ? de(Q(t)) : Zi(t);
}
function yt(t) {
  return typeof t == "function" ? t : t == null ? Y : typeof t == "object" ? y(t) ? qi(t[0], t[1]) : Hi(t) : Ji(t);
}
function Qi(t) {
  return function(e, r, n) {
    for (var i = -1, a = Object(e), s = n(e), o = s.length; o--; ) {
      var f = s[++i];
      if (r(a[f], f, a) === !1)
        break;
    }
    return e;
  };
}
var Vi = Qi();
function ki(t, e) {
  return t && Vi(t, e, q);
}
function ta(t, e) {
  return function(r, n) {
    if (r == null)
      return r;
    if (!W(r))
      return t(r, n);
    for (var i = r.length, a = -1, s = Object(r); ++a < i && n(s[a], a, s) !== !1; )
      ;
    return r;
  };
}
var ea = ta(ki);
function ra(t) {
  return $(t) && W(t);
}
function na(t) {
  return typeof t == "function" ? t : Y;
}
function ia(t) {
  return function(e, r, n) {
    var i = Object(e);
    if (!W(e)) {
      var a = yt(r);
      e = q(e), r = function(o) {
        return a(i[o], o, i);
      };
    }
    var s = t(e, r, n);
    return s > -1 ? i[a ? e[s] : s] : void 0;
  };
}
var aa = Math.max;
function sa(t, e, r) {
  var n = t == null ? 0 : t.length;
  if (!n)
    return -1;
  var i = r == null ? 0 : Jt(r);
  return i < 0 && (i = aa(n + i, 0)), dr(t, yt(e), i);
}
var vt = ia(sa);
function oa(t, e) {
  var r;
  return ea(t, function(n, i, a) {
    return r = e(n, i, a), !r;
  }), !!r;
}
function ua(t, e, r) {
  var n = y(t) ? ce : oa;
  return n(t, yt(e));
}
var fa = 9007199254740991, nt = 4294967295, ca = Math.min;
function la(t, e) {
  if (t = Jt(t), t < 1 || t > fa)
    return [];
  var r = nt, n = ca(t, nt);
  e = na(e), t -= nt;
  for (var i = pt(n, e); ++r < t; )
    e(r);
  return i;
}
var ha = Math.max;
function pa(t) {
  if (!(t && t.length))
    return [];
  var e = 0;
  return t = fe(t, function(r) {
    if (ra(r))
      return e = ha(r.length, e), !0;
  }), pt(e, function(r) {
    return qt(t, de(r));
  });
}
var _e = vr(pa);
function da({
  next: t
}) {
  return ue(t).countBy(C).values().find((r) => r > 1).value() ? {
    errors: ["agent-to-agent direct collision"]
  } : {};
}
function Pa({
  next: t,
  domain: e
}) {
  return vt(t, ({ x: n, y: i }) => e.cells[i][n]) ? { errors: ["agent collision with environment"] } : {};
}
function _a({
  actions: t,
  next: e,
  prev: r
}) {
  const n = ue(r).map((a, s) => ({ agent: s, point: a, action: t[s] })).keyBy(({ point: a }) => C(a)).value();
  return vt(e, (a, s) => C(a) in n ? t[s] !== n[C(a)].action : !1) ? {
    errors: ["agent-to-agent edge collision"]
  } : {};
}
function ma({
  current: t,
  goals: e
}) {
  return vt(_e(t, e), ([n, i]) => C(n) !== C(i)) ? { errors: ["agent did not reach goal"] } : {};
}
class ga {
  /**
   * Create a new iterator.
   *
   * @param {T|null} item
   */
  constructor(e) {
    this.item = e;
  }
  /**
   * Move to the next item.
   *
   * @returns {IteratorResult<T, null>}
   */
  next() {
    const e = this.item;
    return e ? (this.item = e.next, { value: e, done: !1 }) : { value: null, done: !0 };
  }
}
class V {
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
  append(e) {
    const r = this.list;
    if (!e || !e.append || !e.prepend || !e.detach)
      throw new Error(
        "An argument without append, prepend, or detach methods was given to `Item#append`."
      );
    return !r || this === e ? !1 : (e.detach(), this.next && (e.next = this.next, this.next.prev = e), e.prev = this, e.list = r, this.next = e, (this === r.tail || !r.tail) && (r.tail = e), r.size++, e);
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
  prepend(e) {
    const r = this.list;
    if (!e || !e.append || !e.prepend || !e.detach)
      throw new Error(
        "An argument without append, prepend, or detach methods was given to `Item#prepend`."
      );
    return !r || this === e ? !1 : (e.detach(), this.prev && (e.prev = this.prev, this.prev.next = e), e.next = this, e.list = r, this.prev = e, this === r.head && (r.head = e), r.tail || (r.tail = this), r.size++, e);
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
    const e = this.list;
    return e ? (e.tail === this && (e.tail = this.prev), e.head === this && (e.head = this.next), e.tail === e.head && (e.tail = null), this.prev && (this.prev.next = this.next), this.next && (this.next.prev = this.prev), this.prev = null, this.next = null, this.list = null, e.size--, this) : this;
  }
}
V.prototype.next = null;
V.prototype.prev = null;
V.prototype.list = null;
class k {
  /**
   * Create a new `this` from the given array of items.
   *
   * Ignores `null` or `undefined` values.
   * Throws an error when a given item has no `detach`, `append`, or `prepend`
   * methods.
   *
   * @template {Item} [T=Item]
   * @param {Array<T|null|undefined>} [items]
   */
  static from(e) {
    const r = new this();
    return it(r, e);
  }
  /**
   * Create a new `this` from the given arguments.
   *
   * Ignores `null` or `undefined` values.
   * Throws an error when a given item has no `detach`, `append`, or `prepend`
   * methods.
   *
   * @template {Item} [T=Item]
   * @param {Array<T|null|undefined>} items
   * @returns {List<T>}
   */
  static of(...e) {
    const r = new this();
    return it(r, e);
  }
  /**
   * Create a new list from the given items.
   *
   * Ignores `null` or `undefined` values.
   * Throws an error when a given item has no `detach`, `append`, or `prepend`
   * methods.
   *
   * @param {Array<T|null|undefined>} items
   */
  constructor(...e) {
    this.size, this.head, this.tail, it(this, e);
  }
  /**
   * Append an item to a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or `prepend`
   * methods.
   * Returns the given item.
   *
   * @param {T|null|undefined} [item]
   * @returns {T|false}
   */
  append(e) {
    if (!e)
      return !1;
    if (!e.append || !e.prepend || !e.detach)
      throw new Error(
        "An argument without append, prepend, or detach methods was given to `List#append`."
      );
    return this.tail ? this.tail.append(e) : this.head ? this.head.append(e) : (e.detach(), e.list = this, this.head = e, this.size++, e);
  }
  /**
   * Prepend an item to a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or `prepend`
   * methods.
   * Returns the given item.
   *
   * @param {T|null|undefined} [item]
   * @returns {T|false}
   */
  prepend(e) {
    if (!e)
      return !1;
    if (!e.append || !e.prepend || !e.detach)
      throw new Error(
        "An argument without append, prepend, or detach methods was given to `List#prepend`."
      );
    return this.head ? this.head.prepend(e) : (e.detach(), e.list = this, this.head = e, this.size++, e);
  }
  /**
   * Returns the items of the list as an array.
   *
   * This does *not* detach the items.
   *
   * > **Note**: `List` also implements an iterator.
   * > That means you can also do `[...list]` to get an array.
   */
  toArray() {
    let e = this.head;
    const r = [];
    for (; e; )
      r.push(e), e = e.next;
    return r;
  }
  /**
   * Creates an iterator from the list.
   *
   * @returns {ItemIterator<T>}
   */
  [Symbol.iterator]() {
    return new ga(this.head);
  }
}
k.prototype.size = 0;
k.prototype.tail = null;
k.prototype.head = null;
function it(t, e) {
  if (!e)
    return t;
  if (e[Symbol.iterator]) {
    const r = e[Symbol.iterator]();
    let n;
    for (; (n = r.next()) && !n.done; )
      t.append(n.value);
  } else {
    let r = -1;
    for (; ++r < e.length; ) {
      const n = e[r];
      t.append(n);
    }
  }
  return t;
}
class ya extends V {
  constructor(e, r, n) {
    super(), this.count = e, this.symbol = r, this.offset = n;
  }
}
class va {
  constructor(e) {
    this.offset = 0, this.chunks = e.matchAll(/(\d*)([a-z])/g);
  }
  read() {
    const { value: e, done: r } = this.chunks.next();
    if (r)
      throw new at();
    {
      const [n, i, a] = e, s = i ? +i : 1, o = new ya(s, a, this.offset);
      return this.offset += s, o;
    }
  }
}
class ba {
  /**
   * @param reader
   * @param history How many previous chunks to store. Set to -1 to disable.
   */
  constructor(e, r = 2) {
    this.reader = e, this.history = r, this.cache = new k(), this.current = e.read(), this.cache.append(this.current);
  }
  prune() {
    let e = this.current;
    la(
      this.history,
      () => this.current.prev && (e = this.current.prev)
    ), e.prev && (e.prev = null);
  }
  seek(e) {
    switch (wa(e, this.current)) {
      case "in-range":
        return this.current.symbol;
      case "low": {
        if (this.current.prev)
          return this.current = this.current.prev, this.seek(e);
        throw new ge();
      }
      case "high":
        return this.current.next ? (this.history !== -1 && this.prune(), this.current = this.current.next, this.seek(e)) : (this.cache.append(this.reader.read()), this.seek(e));
    }
  }
}
function wa(t, e) {
  const r = e.offset, n = e.offset + e.count;
  return t < r ? "low" : r <= t && t < n ? "in-range" : "high";
}
function Aa(t) {
  const e = new va(t), r = new ba(e);
  return {
    seek: (n) => {
      try {
        return r.seek(n);
      } catch (i) {
        if (i instanceof at)
          return;
        throw i;
      }
    },
    done: (n) => {
      try {
        return r.seek(n), !1;
      } catch (i) {
        if (i instanceof at)
          return !0;
        throw i;
      }
    }
  };
}
const Ta = {
  u: { x: 0, y: -1 },
  d: { x: 0, y: 1 },
  l: { x: -1, y: 0 },
  r: { x: 1, y: 0 }
}, xa = (t, e) => e.map(({ seek: r }) => r(t)), Oa = (t, e = Ta) => t.map((r) => e[r] ?? { x: 0, y: 0 }), $a = (t, e) => _e(t, e).map(([r, n]) => ({
  x: r.x + n.x,
  y: r.y + n.y
}));
function Ea({
  paths: t,
  domain: e,
  sources: r,
  goals: n = [],
  checks: i = [da, _a],
  finalChecks: a = [],
  onError: s = () => !1
}) {
  var p, h;
  const o = t.map(Aa);
  let f = 0, u = r;
  for (; ua(o, (l) => !l.done(f)); ) {
    const l = xa(f, o), d = $a(u, Oa(l));
    for (const _ of i) {
      const g = _({
        timestep: f,
        prev: u,
        next: d,
        actions: l,
        domain: e,
        sources: r,
        goals: n
      });
      if ((p = g.errors) != null && p.length && s(g)) return !1;
    }
    u = d, f++;
  }
  for (const l of a) {
    const d = l({
      timestep: f,
      current: u,
      domain: e,
      sources: r,
      goals: n
    });
    if ((h = d.errors) != null && h.length && s(d)) return !1;
  }
}
export {
  ya as Chunk,
  at as DoneException,
  ge as LowerOutOfRangeException,
  va as Reader,
  ba as Seeker,
  Pa as checkDomainCollision,
  _a as checkEdgeCollision,
  ma as checkGoalReached,
  da as checkImmediateCollision,
  wa as checkRange,
  xa as createActionMap,
  Oa as createOffsetMap,
  Ta as defaultOffsetMap,
  Aa as processAgent,
  C as serialisePoint,
  $a as sumPositions,
  Ea as validate
};
