import Qr, { parse as _r, join as Vr } from "path";
import Yr from "child_process";
import Kr, { readdirSync as Jr, statSync as Zr, readFileSync as et, writeFile as rt } from "fs";
var W = /* @__PURE__ */ ((f) => (f.png = "png", f.jpg = "jpg", f.jpeg = "jpeg", f.webp = "webp", f.avif = "avif", f.gif = "gif", f))(W || {});
const Br = [], Dr = 80;
for (const f in W)
  Object.prototype.hasOwnProperty.call(W, f) && Br.push("." + W[f]);
const Y = Br;
function Xe(f) {
  return f < 1024 ? `${f} B` : f < 1024 * 1024 ? `${(f / 1024).toFixed(2)} KB` : `${(f / (1024 * 1024)).toFixed(2)} MB`;
}
function tt(f) {
  const e = f.quality || Dr;
  [...Y, "sharp"].forEach((v) => {
    const n = `${v.replace(".", "")}Option`;
    f[n] = f[n] || f.sharpOptions || { quality: e }, f[n].quality || (f[n].quality = e);
  });
}
function it(f) {
  return f && f.__esModule && Object.prototype.hasOwnProperty.call(f, "default") ? f.default : f;
}
function nt(f) {
  if (f.__esModule) return f;
  var e = f.default;
  if (typeof e == "function") {
    var b = function v() {
      return this instanceof v ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    b.prototype = e.prototype;
  } else b = {};
  return Object.defineProperty(b, "__esModule", { value: !0 }), Object.keys(f).forEach(function(v) {
    var n = Object.getOwnPropertyDescriptor(f, v);
    Object.defineProperty(b, v, n.get ? n : {
      enumerable: !0,
      get: function() {
        return f[v];
      }
    });
  }), b;
}
const at = {}, st = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: at
}, Symbol.toStringTag, { value: "Module" })), U = /* @__PURE__ */ nt(st);
var ee, Qe;
function D() {
  if (Qe) return ee;
  Qe = 1;
  const f = function(d) {
    return typeof d < "u" && d !== null;
  };
  return ee = {
    defined: f,
    object: function(d) {
      return typeof d == "object";
    },
    plainObject: function(d) {
      return Object.prototype.toString.call(d) === "[object Object]";
    },
    fn: function(d) {
      return typeof d == "function";
    },
    bool: function(d) {
      return typeof d == "boolean";
    },
    buffer: function(d) {
      return d instanceof Buffer;
    },
    typedArray: function(d) {
      if (f(d))
        switch (d.constructor) {
          case Uint8Array:
          case Uint8ClampedArray:
          case Int8Array:
          case Uint16Array:
          case Int16Array:
          case Uint32Array:
          case Int32Array:
          case Float32Array:
          case Float64Array:
            return !0;
        }
      return !1;
    },
    arrayBuffer: function(d) {
      return d instanceof ArrayBuffer;
    },
    string: function(d) {
      return typeof d == "string" && d.length > 0;
    },
    number: function(d) {
      return typeof d == "number" && !Number.isNaN(d);
    },
    integer: function(d) {
      return Number.isInteger(d);
    },
    inRange: function(d, p, y) {
      return d >= p && d <= y;
    },
    inArray: function(d, p) {
      return p.includes(d);
    },
    invalidParameterError: function(d, p, y) {
      return new Error(
        `Expected ${p} for ${d} but received ${y} of type ${typeof y}`
      );
    },
    nativeError: function(d, p) {
      return p.message = d.message, p;
    }
  }, ee;
}
function G(f) {
  throw new Error('Could not dynamically require "' + f + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var re = { exports: {} }, te, Ve;
function ot() {
  if (Ve) return te;
  Ve = 1;
  const f = () => process.platform === "linux";
  let e = null;
  return te = { isLinux: f, getReport: () => {
    if (!e)
      if (f() && process.report) {
        const v = process.report.excludeNetwork;
        process.report.excludeNetwork = !0, e = process.report.getReport(), process.report.excludeNetwork = v;
      } else
        e = {};
    return e;
  } }, te;
}
var ie, Ye;
function lt() {
  if (Ye) return ie;
  Ye = 1;
  const f = Kr;
  return ie = {
    LDD_PATH: "/usr/bin/ldd",
    readFileSync: (n) => f.readFileSync(n, "utf-8"),
    readFile: (n) => new Promise((c, s) => {
      f.readFile(n, "utf-8", (o, i) => {
        o ? s(o) : c(i);
      });
    })
  }, ie;
}
var ne, Ke;
function Ge() {
  if (Ke) return ne;
  Ke = 1;
  const f = Yr, { isLinux: e, getReport: b } = ot(), { LDD_PATH: v, readFile: n, readFileSync: c } = lt();
  let s, o;
  const i = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
  let h = "";
  const a = () => h || new Promise((w) => {
    f.exec(i, (I, r) => {
      h = I ? " " : r, w(h);
    });
  }), u = () => {
    if (!h)
      try {
        h = f.execSync(i, { encoding: "utf8" });
      } catch {
        h = " ";
      }
    return h;
  }, t = "glibc", g = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i, l = "musl", d = (w) => w.includes("libc.musl-") || w.includes("ld-musl-"), p = () => {
    const w = b();
    return w.header && w.header.glibcVersionRuntime ? t : Array.isArray(w.sharedObjects) && w.sharedObjects.some(d) ? l : null;
  }, y = (w) => {
    const [I, r] = w.split(/[\r\n]+/);
    return I && I.includes(t) ? t : r && r.includes(l) ? l : null;
  }, j = (w) => w.includes("musl") ? l : w.includes("GNU C Library") ? t : null, S = async () => {
    if (s !== void 0)
      return s;
    s = null;
    try {
      const w = await n(v);
      s = j(w);
    } catch {
    }
    return s;
  }, C = () => {
    if (s !== void 0)
      return s;
    s = null;
    try {
      const w = c(v);
      s = j(w);
    } catch {
    }
    return s;
  }, F = async () => {
    let w = null;
    if (e() && (w = await S(), w || (w = p()), !w)) {
      const I = await a();
      w = y(I);
    }
    return w;
  }, T = () => {
    let w = null;
    if (e() && (w = C(), w || (w = p()), !w)) {
      const I = u();
      w = y(I);
    }
    return w;
  }, m = async () => e() && await F() !== t, x = () => e() && T() !== t, q = async () => {
    if (o !== void 0)
      return o;
    o = null;
    try {
      const I = (await n(v)).match(g);
      I && (o = I[1]);
    } catch {
    }
    return o;
  }, M = () => {
    if (o !== void 0)
      return o;
    o = null;
    try {
      const I = c(v).match(g);
      I && (o = I[1]);
    } catch {
    }
    return o;
  }, B = () => {
    const w = b();
    return w.header && w.header.glibcVersionRuntime ? w.header.glibcVersionRuntime : null;
  }, _ = (w) => w.trim().split(/\s+/)[1], z = (w) => {
    const [I, r, E] = w.split(/[\r\n]+/);
    return I && I.includes(t) ? _(I) : r && E && r.includes(l) ? _(E) : null;
  };
  return ne = {
    GLIBC: t,
    MUSL: l,
    family: F,
    familySync: T,
    isNonGlibcLinux: m,
    isNonGlibcLinuxSync: x,
    version: async () => {
      let w = null;
      if (e() && (w = await q(), w || (w = B()), !w)) {
        const I = await a();
        w = z(I);
      }
      return w;
    },
    versionSync: () => {
      let w = null;
      if (e() && (w = M(), w || (w = B()), !w)) {
        const I = u();
        w = z(I);
      }
      return w;
    }
  }, ne;
}
var ae, Je;
function K() {
  return Je || (Je = 1, ae = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
  }), ae;
}
var se, Ze;
function Ue() {
  if (Ze) return se;
  Ze = 1;
  const f = "2.0.0", e = 256, b = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, v = 16, n = e - 6;
  return se = {
    MAX_LENGTH: e,
    MAX_SAFE_COMPONENT_LENGTH: v,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_SAFE_INTEGER: b,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: f,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, se;
}
var V = { exports: {} }, er;
function J() {
  return er || (er = 1, function(f, e) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: b,
      MAX_SAFE_BUILD_LENGTH: v,
      MAX_LENGTH: n
    } = Ue(), c = K();
    e = f.exports = {};
    const s = e.re = [], o = e.safeRe = [], i = e.src = [], h = e.safeSrc = [], a = e.t = {};
    let u = 0;
    const t = "[a-zA-Z0-9-]", g = [
      ["\\s", 1],
      ["\\d", n],
      [t, v]
    ], l = (p) => {
      for (const [y, j] of g)
        p = p.split(`${y}*`).join(`${y}{0,${j}}`).split(`${y}+`).join(`${y}{1,${j}}`);
      return p;
    }, d = (p, y, j) => {
      const S = l(y), C = u++;
      c(p, C, y), a[p] = C, i[C] = y, h[C] = S, s[C] = new RegExp(y, j ? "g" : void 0), o[C] = new RegExp(S, j ? "g" : void 0);
    };
    d("NUMERICIDENTIFIER", "0|[1-9]\\d*"), d("NUMERICIDENTIFIERLOOSE", "\\d+"), d("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${t}*`), d("MAINVERSION", `(${i[a.NUMERICIDENTIFIER]})\\.(${i[a.NUMERICIDENTIFIER]})\\.(${i[a.NUMERICIDENTIFIER]})`), d("MAINVERSIONLOOSE", `(${i[a.NUMERICIDENTIFIERLOOSE]})\\.(${i[a.NUMERICIDENTIFIERLOOSE]})\\.(${i[a.NUMERICIDENTIFIERLOOSE]})`), d("PRERELEASEIDENTIFIER", `(?:${i[a.NUMERICIDENTIFIER]}|${i[a.NONNUMERICIDENTIFIER]})`), d("PRERELEASEIDENTIFIERLOOSE", `(?:${i[a.NUMERICIDENTIFIERLOOSE]}|${i[a.NONNUMERICIDENTIFIER]})`), d("PRERELEASE", `(?:-(${i[a.PRERELEASEIDENTIFIER]}(?:\\.${i[a.PRERELEASEIDENTIFIER]})*))`), d("PRERELEASELOOSE", `(?:-?(${i[a.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${i[a.PRERELEASEIDENTIFIERLOOSE]})*))`), d("BUILDIDENTIFIER", `${t}+`), d("BUILD", `(?:\\+(${i[a.BUILDIDENTIFIER]}(?:\\.${i[a.BUILDIDENTIFIER]})*))`), d("FULLPLAIN", `v?${i[a.MAINVERSION]}${i[a.PRERELEASE]}?${i[a.BUILD]}?`), d("FULL", `^${i[a.FULLPLAIN]}$`), d("LOOSEPLAIN", `[v=\\s]*${i[a.MAINVERSIONLOOSE]}${i[a.PRERELEASELOOSE]}?${i[a.BUILD]}?`), d("LOOSE", `^${i[a.LOOSEPLAIN]}$`), d("GTLT", "((?:<|>)?=?)"), d("XRANGEIDENTIFIERLOOSE", `${i[a.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), d("XRANGEIDENTIFIER", `${i[a.NUMERICIDENTIFIER]}|x|X|\\*`), d("XRANGEPLAIN", `[v=\\s]*(${i[a.XRANGEIDENTIFIER]})(?:\\.(${i[a.XRANGEIDENTIFIER]})(?:\\.(${i[a.XRANGEIDENTIFIER]})(?:${i[a.PRERELEASE]})?${i[a.BUILD]}?)?)?`), d("XRANGEPLAINLOOSE", `[v=\\s]*(${i[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[a.XRANGEIDENTIFIERLOOSE]})(?:${i[a.PRERELEASELOOSE]})?${i[a.BUILD]}?)?)?`), d("XRANGE", `^${i[a.GTLT]}\\s*${i[a.XRANGEPLAIN]}$`), d("XRANGELOOSE", `^${i[a.GTLT]}\\s*${i[a.XRANGEPLAINLOOSE]}$`), d("COERCEPLAIN", `(^|[^\\d])(\\d{1,${b}})(?:\\.(\\d{1,${b}}))?(?:\\.(\\d{1,${b}}))?`), d("COERCE", `${i[a.COERCEPLAIN]}(?:$|[^\\d])`), d("COERCEFULL", i[a.COERCEPLAIN] + `(?:${i[a.PRERELEASE]})?(?:${i[a.BUILD]})?(?:$|[^\\d])`), d("COERCERTL", i[a.COERCE], !0), d("COERCERTLFULL", i[a.COERCEFULL], !0), d("LONETILDE", "(?:~>?)"), d("TILDETRIM", `(\\s*)${i[a.LONETILDE]}\\s+`, !0), e.tildeTrimReplace = "$1~", d("TILDE", `^${i[a.LONETILDE]}${i[a.XRANGEPLAIN]}$`), d("TILDELOOSE", `^${i[a.LONETILDE]}${i[a.XRANGEPLAINLOOSE]}$`), d("LONECARET", "(?:\\^)"), d("CARETTRIM", `(\\s*)${i[a.LONECARET]}\\s+`, !0), e.caretTrimReplace = "$1^", d("CARET", `^${i[a.LONECARET]}${i[a.XRANGEPLAIN]}$`), d("CARETLOOSE", `^${i[a.LONECARET]}${i[a.XRANGEPLAINLOOSE]}$`), d("COMPARATORLOOSE", `^${i[a.GTLT]}\\s*(${i[a.LOOSEPLAIN]})$|^$`), d("COMPARATOR", `^${i[a.GTLT]}\\s*(${i[a.FULLPLAIN]})$|^$`), d("COMPARATORTRIM", `(\\s*)${i[a.GTLT]}\\s*(${i[a.LOOSEPLAIN]}|${i[a.XRANGEPLAIN]})`, !0), e.comparatorTrimReplace = "$1$2$3", d("HYPHENRANGE", `^\\s*(${i[a.XRANGEPLAIN]})\\s+-\\s+(${i[a.XRANGEPLAIN]})\\s*$`), d("HYPHENRANGELOOSE", `^\\s*(${i[a.XRANGEPLAINLOOSE]})\\s+-\\s+(${i[a.XRANGEPLAINLOOSE]})\\s*$`), d("STAR", "(<|>)?=?\\s*\\*"), d("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), d("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(V, V.exports)), V.exports;
}
var oe, rr;
function We() {
  if (rr) return oe;
  rr = 1;
  const f = Object.freeze({ loose: !0 }), e = Object.freeze({});
  return oe = (v) => v ? typeof v != "object" ? f : v : e, oe;
}
var le, tr;
function ft() {
  if (tr) return le;
  tr = 1;
  const f = /^[0-9]+$/, e = (v, n) => {
    const c = f.test(v), s = f.test(n);
    return c && s && (v = +v, n = +n), v === n ? 0 : c && !s ? -1 : s && !c ? 1 : v < n ? -1 : 1;
  };
  return le = {
    compareIdentifiers: e,
    rcompareIdentifiers: (v, n) => e(n, v)
  }, le;
}
var fe, ir;
function Q() {
  if (ir) return fe;
  ir = 1;
  const f = K(), { MAX_LENGTH: e, MAX_SAFE_INTEGER: b } = Ue(), { safeRe: v, safeSrc: n, t: c } = J(), s = We(), { compareIdentifiers: o } = ft();
  class i {
    constructor(a, u) {
      if (u = s(u), a instanceof i) {
        if (a.loose === !!u.loose && a.includePrerelease === !!u.includePrerelease)
          return a;
        a = a.version;
      } else if (typeof a != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof a}".`);
      if (a.length > e)
        throw new TypeError(
          `version is longer than ${e} characters`
        );
      f("SemVer", a, u), this.options = u, this.loose = !!u.loose, this.includePrerelease = !!u.includePrerelease;
      const t = a.trim().match(u.loose ? v[c.LOOSE] : v[c.FULL]);
      if (!t)
        throw new TypeError(`Invalid Version: ${a}`);
      if (this.raw = a, this.major = +t[1], this.minor = +t[2], this.patch = +t[3], this.major > b || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > b || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > b || this.patch < 0)
        throw new TypeError("Invalid patch version");
      t[4] ? this.prerelease = t[4].split(".").map((g) => {
        if (/^[0-9]+$/.test(g)) {
          const l = +g;
          if (l >= 0 && l < b)
            return l;
        }
        return g;
      }) : this.prerelease = [], this.build = t[5] ? t[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(a) {
      if (f("SemVer.compare", this.version, this.options, a), !(a instanceof i)) {
        if (typeof a == "string" && a === this.version)
          return 0;
        a = new i(a, this.options);
      }
      return a.version === this.version ? 0 : this.compareMain(a) || this.comparePre(a);
    }
    compareMain(a) {
      return a instanceof i || (a = new i(a, this.options)), o(this.major, a.major) || o(this.minor, a.minor) || o(this.patch, a.patch);
    }
    comparePre(a) {
      if (a instanceof i || (a = new i(a, this.options)), this.prerelease.length && !a.prerelease.length)
        return -1;
      if (!this.prerelease.length && a.prerelease.length)
        return 1;
      if (!this.prerelease.length && !a.prerelease.length)
        return 0;
      let u = 0;
      do {
        const t = this.prerelease[u], g = a.prerelease[u];
        if (f("prerelease compare", u, t, g), t === void 0 && g === void 0)
          return 0;
        if (g === void 0)
          return 1;
        if (t === void 0)
          return -1;
        if (t === g)
          continue;
        return o(t, g);
      } while (++u);
    }
    compareBuild(a) {
      a instanceof i || (a = new i(a, this.options));
      let u = 0;
      do {
        const t = this.build[u], g = a.build[u];
        if (f("build compare", u, t, g), t === void 0 && g === void 0)
          return 0;
        if (g === void 0)
          return 1;
        if (t === void 0)
          return -1;
        if (t === g)
          continue;
        return o(t, g);
      } while (++u);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(a, u, t) {
      if (a.startsWith("pre")) {
        if (!u && t === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (u) {
          const g = new RegExp(`^${this.options.loose ? n[c.PRERELEASELOOSE] : n[c.PRERELEASE]}$`), l = `-${u}`.match(g);
          if (!l || l[1] !== u)
            throw new Error(`invalid identifier: ${u}`);
        }
      }
      switch (a) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", u, t);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", u, t);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", u, t), this.inc("pre", u, t);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", u, t), this.inc("pre", u, t);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const g = Number(t) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [g];
          else {
            let l = this.prerelease.length;
            for (; --l >= 0; )
              typeof this.prerelease[l] == "number" && (this.prerelease[l]++, l = -2);
            if (l === -1) {
              if (u === this.prerelease.join(".") && t === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(g);
            }
          }
          if (u) {
            let l = [u, g];
            t === !1 && (l = [u]), o(this.prerelease[0], u) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = l) : this.prerelease = l;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${a}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return fe = i, fe;
}
var ce, nr;
function ct() {
  if (nr) return ce;
  nr = 1;
  const f = Q();
  return ce = (b, v, n = !1) => {
    if (b instanceof f)
      return b;
    try {
      return new f(b, v);
    } catch (c) {
      if (!n)
        return null;
      throw c;
    }
  }, ce;
}
var he, ar;
function ht() {
  if (ar) return he;
  ar = 1;
  const f = Q(), e = ct(), { safeRe: b, t: v } = J();
  return he = (c, s) => {
    if (c instanceof f)
      return c;
    if (typeof c == "number" && (c = String(c)), typeof c != "string")
      return null;
    s = s || {};
    let o = null;
    if (!s.rtl)
      o = c.match(s.includePrerelease ? b[v.COERCEFULL] : b[v.COERCE]);
    else {
      const g = s.includePrerelease ? b[v.COERCERTLFULL] : b[v.COERCERTL];
      let l;
      for (; (l = g.exec(c)) && (!o || o.index + o[0].length !== c.length); )
        (!o || l.index + l[0].length !== o.index + o[0].length) && (o = l), g.lastIndex = l.index + l[1].length + l[2].length;
      g.lastIndex = -1;
    }
    if (o === null)
      return null;
    const i = o[2], h = o[3] || "0", a = o[4] || "0", u = s.includePrerelease && o[5] ? `-${o[5]}` : "", t = s.includePrerelease && o[6] ? `+${o[6]}` : "";
    return e(`${i}.${h}.${a}${u}${t}`, s);
  }, he;
}
var ue, sr;
function H() {
  if (sr) return ue;
  sr = 1;
  const f = Q();
  return ue = (b, v, n) => new f(b, n).compare(new f(v, n)), ue;
}
var de, or;
function Mr() {
  if (or) return de;
  or = 1;
  const f = H();
  return de = (b, v, n) => f(b, v, n) >= 0, de;
}
var ge, lr;
function ut() {
  if (lr) return ge;
  lr = 1;
  class f {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(b) {
      const v = this.map.get(b);
      if (v !== void 0)
        return this.map.delete(b), this.map.set(b, v), v;
    }
    delete(b) {
      return this.map.delete(b);
    }
    set(b, v) {
      if (!this.delete(b) && v !== void 0) {
        if (this.map.size >= this.max) {
          const c = this.map.keys().next().value;
          this.delete(c);
        }
        this.map.set(b, v);
      }
      return this;
    }
  }
  return ge = f, ge;
}
var me, fr;
function dt() {
  if (fr) return me;
  fr = 1;
  const f = H();
  return me = (b, v, n) => f(b, v, n) === 0, me;
}
var be, cr;
function gt() {
  if (cr) return be;
  cr = 1;
  const f = H();
  return be = (b, v, n) => f(b, v, n) !== 0, be;
}
var pe, hr;
function mt() {
  if (hr) return pe;
  hr = 1;
  const f = H();
  return pe = (b, v, n) => f(b, v, n) > 0, pe;
}
var ve, ur;
function bt() {
  if (ur) return ve;
  ur = 1;
  const f = H();
  return ve = (b, v, n) => f(b, v, n) < 0, ve;
}
var we, dr;
function pt() {
  if (dr) return we;
  dr = 1;
  const f = H();
  return we = (b, v, n) => f(b, v, n) <= 0, we;
}
var Ee, gr;
function vt() {
  if (gr) return Ee;
  gr = 1;
  const f = dt(), e = gt(), b = mt(), v = Mr(), n = bt(), c = pt();
  return Ee = (o, i, h, a) => {
    switch (i) {
      case "===":
        return typeof o == "object" && (o = o.version), typeof h == "object" && (h = h.version), o === h;
      case "!==":
        return typeof o == "object" && (o = o.version), typeof h == "object" && (h = h.version), o !== h;
      case "":
      case "=":
      case "==":
        return f(o, h, a);
      case "!=":
        return e(o, h, a);
      case ">":
        return b(o, h, a);
      case ">=":
        return v(o, h, a);
      case "<":
        return n(o, h, a);
      case "<=":
        return c(o, h, a);
      default:
        throw new TypeError(`Invalid operator: ${i}`);
    }
  }, Ee;
}
var ye, mr;
function wt() {
  if (mr) return ye;
  mr = 1;
  const f = Symbol("SemVer ANY");
  class e {
    static get ANY() {
      return f;
    }
    constructor(a, u) {
      if (u = b(u), a instanceof e) {
        if (a.loose === !!u.loose)
          return a;
        a = a.value;
      }
      a = a.trim().split(/\s+/).join(" "), s("comparator", a, u), this.options = u, this.loose = !!u.loose, this.parse(a), this.semver === f ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(a) {
      const u = this.options.loose ? v[n.COMPARATORLOOSE] : v[n.COMPARATOR], t = a.match(u);
      if (!t)
        throw new TypeError(`Invalid comparator: ${a}`);
      this.operator = t[1] !== void 0 ? t[1] : "", this.operator === "=" && (this.operator = ""), t[2] ? this.semver = new o(t[2], this.options.loose) : this.semver = f;
    }
    toString() {
      return this.value;
    }
    test(a) {
      if (s("Comparator.test", a, this.options.loose), this.semver === f || a === f)
        return !0;
      if (typeof a == "string")
        try {
          a = new o(a, this.options);
        } catch {
          return !1;
        }
      return c(a, this.operator, this.semver, this.options);
    }
    intersects(a, u) {
      if (!(a instanceof e))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new i(a.value, u).test(this.value) : a.operator === "" ? a.value === "" ? !0 : new i(this.value, u).test(a.semver) : (u = b(u), u.includePrerelease && (this.value === "<0.0.0-0" || a.value === "<0.0.0-0") || !u.includePrerelease && (this.value.startsWith("<0.0.0") || a.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && a.operator.startsWith(">") || this.operator.startsWith("<") && a.operator.startsWith("<") || this.semver.version === a.semver.version && this.operator.includes("=") && a.operator.includes("=") || c(this.semver, "<", a.semver, u) && this.operator.startsWith(">") && a.operator.startsWith("<") || c(this.semver, ">", a.semver, u) && this.operator.startsWith("<") && a.operator.startsWith(">")));
    }
  }
  ye = e;
  const b = We(), { safeRe: v, t: n } = J(), c = vt(), s = K(), o = Q(), i = zr();
  return ye;
}
var Pe, br;
function zr() {
  if (br) return Pe;
  br = 1;
  const f = /\s+/g;
  class e {
    constructor(R, w) {
      if (w = n(w), R instanceof e)
        return R.loose === !!w.loose && R.includePrerelease === !!w.includePrerelease ? R : new e(R.raw, w);
      if (R instanceof c)
        return this.raw = R.value, this.set = [[R]], this.formatted = void 0, this;
      if (this.options = w, this.loose = !!w.loose, this.includePrerelease = !!w.includePrerelease, this.raw = R.trim().replace(f, " "), this.set = this.raw.split("||").map((I) => this.parseRange(I.trim())).filter((I) => I.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const I = this.set[0];
        if (this.set = this.set.filter((r) => !d(r[0])), this.set.length === 0)
          this.set = [I];
        else if (this.set.length > 1) {
          for (const r of this.set)
            if (r.length === 1 && p(r[0])) {
              this.set = [r];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let R = 0; R < this.set.length; R++) {
          R > 0 && (this.formatted += "||");
          const w = this.set[R];
          for (let I = 0; I < w.length; I++)
            I > 0 && (this.formatted += " "), this.formatted += w[I].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(R) {
      const I = ((this.options.includePrerelease && g) | (this.options.loose && l)) + ":" + R, r = v.get(I);
      if (r)
        return r;
      const E = this.options.loose, $ = E ? i[h.HYPHENRANGELOOSE] : i[h.HYPHENRANGE];
      R = R.replace($, _(this.options.includePrerelease)), s("hyphen replace", R), R = R.replace(i[h.COMPARATORTRIM], a), s("comparator trim", R), R = R.replace(i[h.TILDETRIM], u), s("tilde trim", R), R = R.replace(i[h.CARETTRIM], t), s("caret trim", R);
      let L = R.split(" ").map((N) => j(N, this.options)).join(" ").split(/\s+/).map((N) => B(N, this.options));
      E && (L = L.filter((N) => (s("loose invalid filter", N, this.options), !!N.match(i[h.COMPARATORLOOSE])))), s("range list", L);
      const A = /* @__PURE__ */ new Map(), k = L.map((N) => new c(N, this.options));
      for (const N of k) {
        if (d(N))
          return [N];
        A.set(N.value, N);
      }
      A.size > 1 && A.has("") && A.delete("");
      const O = [...A.values()];
      return v.set(I, O), O;
    }
    intersects(R, w) {
      if (!(R instanceof e))
        throw new TypeError("a Range is required");
      return this.set.some((I) => y(I, w) && R.set.some((r) => y(r, w) && I.every((E) => r.every(($) => E.intersects($, w)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(R) {
      if (!R)
        return !1;
      if (typeof R == "string")
        try {
          R = new o(R, this.options);
        } catch {
          return !1;
        }
      for (let w = 0; w < this.set.length; w++)
        if (z(this.set[w], R, this.options))
          return !0;
      return !1;
    }
  }
  Pe = e;
  const b = ut(), v = new b(), n = We(), c = wt(), s = K(), o = Q(), {
    safeRe: i,
    t: h,
    comparatorTrimReplace: a,
    tildeTrimReplace: u,
    caretTrimReplace: t
  } = J(), { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: l } = Ue(), d = (P) => P.value === "<0.0.0-0", p = (P) => P.value === "", y = (P, R) => {
    let w = !0;
    const I = P.slice();
    let r = I.pop();
    for (; w && I.length; )
      w = I.every((E) => r.intersects(E, R)), r = I.pop();
    return w;
  }, j = (P, R) => (s("comp", P, R), P = T(P, R), s("caret", P), P = C(P, R), s("tildes", P), P = x(P, R), s("xrange", P), P = M(P, R), s("stars", P), P), S = (P) => !P || P.toLowerCase() === "x" || P === "*", C = (P, R) => P.trim().split(/\s+/).map((w) => F(w, R)).join(" "), F = (P, R) => {
    const w = R.loose ? i[h.TILDELOOSE] : i[h.TILDE];
    return P.replace(w, (I, r, E, $, L) => {
      s("tilde", P, I, r, E, $, L);
      let A;
      return S(r) ? A = "" : S(E) ? A = `>=${r}.0.0 <${+r + 1}.0.0-0` : S($) ? A = `>=${r}.${E}.0 <${r}.${+E + 1}.0-0` : L ? (s("replaceTilde pr", L), A = `>=${r}.${E}.${$}-${L} <${r}.${+E + 1}.0-0`) : A = `>=${r}.${E}.${$} <${r}.${+E + 1}.0-0`, s("tilde return", A), A;
    });
  }, T = (P, R) => P.trim().split(/\s+/).map((w) => m(w, R)).join(" "), m = (P, R) => {
    s("caret", P, R);
    const w = R.loose ? i[h.CARETLOOSE] : i[h.CARET], I = R.includePrerelease ? "-0" : "";
    return P.replace(w, (r, E, $, L, A) => {
      s("caret", P, r, E, $, L, A);
      let k;
      return S(E) ? k = "" : S($) ? k = `>=${E}.0.0${I} <${+E + 1}.0.0-0` : S(L) ? E === "0" ? k = `>=${E}.${$}.0${I} <${E}.${+$ + 1}.0-0` : k = `>=${E}.${$}.0${I} <${+E + 1}.0.0-0` : A ? (s("replaceCaret pr", A), E === "0" ? $ === "0" ? k = `>=${E}.${$}.${L}-${A} <${E}.${$}.${+L + 1}-0` : k = `>=${E}.${$}.${L}-${A} <${E}.${+$ + 1}.0-0` : k = `>=${E}.${$}.${L}-${A} <${+E + 1}.0.0-0`) : (s("no pr"), E === "0" ? $ === "0" ? k = `>=${E}.${$}.${L}${I} <${E}.${$}.${+L + 1}-0` : k = `>=${E}.${$}.${L}${I} <${E}.${+$ + 1}.0-0` : k = `>=${E}.${$}.${L} <${+E + 1}.0.0-0`), s("caret return", k), k;
    });
  }, x = (P, R) => (s("replaceXRanges", P, R), P.split(/\s+/).map((w) => q(w, R)).join(" ")), q = (P, R) => {
    P = P.trim();
    const w = R.loose ? i[h.XRANGELOOSE] : i[h.XRANGE];
    return P.replace(w, (I, r, E, $, L, A) => {
      s("xRange", P, I, r, E, $, L, A);
      const k = S(E), O = k || S($), N = O || S(L), X = N;
      return r === "=" && X && (r = ""), A = R.includePrerelease ? "-0" : "", k ? r === ">" || r === "<" ? I = "<0.0.0-0" : I = "*" : r && X ? (O && ($ = 0), L = 0, r === ">" ? (r = ">=", O ? (E = +E + 1, $ = 0, L = 0) : ($ = +$ + 1, L = 0)) : r === "<=" && (r = "<", O ? E = +E + 1 : $ = +$ + 1), r === "<" && (A = "-0"), I = `${r + E}.${$}.${L}${A}`) : O ? I = `>=${E}.0.0${A} <${+E + 1}.0.0-0` : N && (I = `>=${E}.${$}.0${A} <${E}.${+$ + 1}.0-0`), s("xRange return", I), I;
    });
  }, M = (P, R) => (s("replaceStars", P, R), P.trim().replace(i[h.STAR], "")), B = (P, R) => (s("replaceGTE0", P, R), P.trim().replace(i[R.includePrerelease ? h.GTE0PRE : h.GTE0], "")), _ = (P) => (R, w, I, r, E, $, L, A, k, O, N, X) => (S(I) ? w = "" : S(r) ? w = `>=${I}.0.0${P ? "-0" : ""}` : S(E) ? w = `>=${I}.${r}.0${P ? "-0" : ""}` : $ ? w = `>=${w}` : w = `>=${w}${P ? "-0" : ""}`, S(k) ? A = "" : S(O) ? A = `<${+k + 1}.0.0-0` : S(N) ? A = `<${k}.${+O + 1}.0-0` : X ? A = `<=${k}.${O}.${N}-${X}` : P ? A = `<${k}.${O}.${+N + 1}-0` : A = `<=${A}`, `${w} ${A}`.trim()), z = (P, R, w) => {
    for (let I = 0; I < P.length; I++)
      if (!P[I].test(R))
        return !1;
    if (R.prerelease.length && !w.includePrerelease) {
      for (let I = 0; I < P.length; I++)
        if (s(P[I].semver), P[I].semver !== c.ANY && P[I].semver.prerelease.length > 0) {
          const r = P[I].semver;
          if (r.major === R.major && r.minor === R.minor && r.patch === R.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Pe;
}
var Re, pr;
function Et() {
  if (pr) return Re;
  pr = 1;
  const f = zr();
  return Re = (b, v, n) => {
    try {
      v = new f(v, n);
    } catch {
      return !1;
    }
    return v.test(b);
  }, Re;
}
const yt = "0.33.5", Pt = { "@img/sharp-darwin-arm64": "0.33.5", "@img/sharp-darwin-x64": "0.33.5", "@img/sharp-libvips-darwin-arm64": "1.0.4", "@img/sharp-libvips-darwin-x64": "1.0.4", "@img/sharp-libvips-linux-arm": "1.0.5", "@img/sharp-libvips-linux-arm64": "1.0.4", "@img/sharp-libvips-linux-s390x": "1.0.4", "@img/sharp-libvips-linux-x64": "1.0.4", "@img/sharp-libvips-linuxmusl-arm64": "1.0.4", "@img/sharp-libvips-linuxmusl-x64": "1.0.4", "@img/sharp-linux-arm": "0.33.5", "@img/sharp-linux-arm64": "0.33.5", "@img/sharp-linux-s390x": "0.33.5", "@img/sharp-linux-x64": "0.33.5", "@img/sharp-linuxmusl-arm64": "0.33.5", "@img/sharp-linuxmusl-x64": "0.33.5", "@img/sharp-wasm32": "0.33.5", "@img/sharp-win32-ia32": "0.33.5", "@img/sharp-win32-x64": "0.33.5" }, Rt = { node: "^18.17.0 || ^20.3.0 || >=21.0.0" }, xt = { libvips: ">=8.15.3" }, Gr = {
  version: yt,
  optionalDependencies: Pt,
  engines: Rt,
  config: xt
};
var xe, vr;
function Ur() {
  if (vr) return xe;
  vr = 1;
  const { spawnSync: f } = U, { createHash: e } = U, b = ht(), v = Mr(), n = Et(), c = Ge(), { config: s, engines: o, optionalDependencies: i } = Gr, h = process.env.npm_package_config_libvips || /* istanbul ignore next */
  s.libvips, a = b(h).version, u = [
    "darwin-arm64",
    "darwin-x64",
    "linux-arm",
    "linux-arm64",
    "linux-s390x",
    "linux-x64",
    "linuxmusl-arm64",
    "linuxmusl-x64",
    "win32-ia32",
    "win32-x64"
  ], t = {
    encoding: "utf8",
    shell: !0
  }, g = (P) => {
    P instanceof Error ? console.error(`sharp: Installation error: ${P.message}`) : console.log(`sharp: ${P}`);
  }, l = () => c.isNonGlibcLinuxSync() ? c.familySync() : "", d = () => `${process.platform}${l()}-${process.arch}`, p = () => {
    if (F())
      return "wasm32";
    const { npm_config_arch: P, npm_config_platform: R, npm_config_libc: w } = process.env, I = typeof w == "string" ? w : l();
    return `${R || process.platform}${I}-${P || process.arch}`;
  }, y = () => {
    try {
      return G(`@img/sharp-libvips-dev-${p()}/include`);
    } catch {
      try {
        return require("@img/sharp-libvips-dev/include");
      } catch {
      }
    }
    return "";
  }, j = () => {
    try {
      return require("@img/sharp-libvips-dev/cplusplus");
    } catch {
    }
    return "";
  }, S = () => {
    try {
      return G(`@img/sharp-libvips-dev-${p()}/lib`);
    } catch {
      try {
        return G(`@img/sharp-libvips-${p()}/lib`);
      } catch {
      }
    }
    return "";
  }, C = () => {
    var P;
    if (((P = process.release) == null ? void 0 : P.name) === "node" && process.versions && !n(process.versions.node, o.node))
      return { found: process.versions.node, expected: o.node };
  }, F = () => {
    const { CC: P } = process.env;
    return !!(P && P.endsWith("/emcc"));
  }, T = () => process.platform === "darwin" && process.arch === "x64" ? (f("sysctl sysctl.proc_translated", t).stdout || "").trim() === "sysctl.proc_translated: 1" : !1, m = (P) => e("sha512").update(P).digest("hex"), x = () => {
    try {
      const P = m(`imgsharp-libvips-${p()}`), R = b(i[`@img/sharp-libvips-${p()}`]).version;
      return m(`${P}npm:${R}`).slice(0, 10);
    } catch {
    }
    return "";
  }, q = () => f(`node-gyp rebuild --directory=src ${F() ? "--nodedir=emscripten" : ""}`, {
    ...t,
    stdio: "inherit"
  }).status, M = () => process.platform !== "win32" ? (f("pkg-config --modversion vips-cpp", {
    ...t,
    env: {
      ...process.env,
      PKG_CONFIG_PATH: B()
    }
  }).stdout || "").trim() : "", B = () => process.platform !== "win32" ? [
    (f(
      'which brew >/dev/null 2>&1 && brew environment --plain | grep PKG_CONFIG_LIBDIR | cut -d" " -f2',
      t
    ).stdout || "").trim(),
    process.env.PKG_CONFIG_PATH,
    "/usr/local/lib/pkgconfig",
    "/usr/lib/pkgconfig",
    "/usr/local/libdata/pkgconfig",
    "/usr/libdata/pkgconfig"
  ].filter(Boolean).join(":") : "", _ = (P, R, w) => (w && w(`Detected ${R}, skipping search for globally-installed libvips`), P);
  return xe = {
    minimumLibvipsVersion: a,
    prebuiltPlatforms: u,
    buildPlatformArch: p,
    buildSharpLibvipsIncludeDir: y,
    buildSharpLibvipsCPlusPlusDir: j,
    buildSharpLibvipsLibDir: S,
    isUnsupportedNodeRuntime: C,
    runtimePlatformArch: d,
    log: g,
    yarnLocator: x,
    spawnRebuild: q,
    globalLibvipsVersion: M,
    pkgConfigPath: B,
    useGlobalLibvips: (P) => {
      if (process.env.SHARP_IGNORE_GLOBAL_LIBVIPS)
        return _(!1, "SHARP_IGNORE_GLOBAL_LIBVIPS", P);
      if (process.env.SHARP_FORCE_GLOBAL_LIBVIPS)
        return _(!0, "SHARP_FORCE_GLOBAL_LIBVIPS", P);
      if (T())
        return _(!1, "Rosetta", P);
      const R = M();
      return !!R && /* istanbul ignore next */
      v(R, a);
    }
  }, xe;
}
var wr;
function Z() {
  if (wr) return re.exports;
  wr = 1;
  const { familySync: f, versionSync: e } = Ge(), { runtimePlatformArch: b, isUnsupportedNodeRuntime: v, prebuiltPlatforms: n, minimumLibvipsVersion: c } = Ur(), s = b(), o = [
    `../src/build/Release/sharp-${s}.node`,
    "../src/build/Release/sharp-wasm32.node",
    `@img/sharp-${s}/sharp.node`,
    "@img/sharp-wasm32/sharp.node"
  ];
  let i;
  const h = [];
  for (const a of o)
    try {
      i = G(a);
      break;
    } catch (u) {
      h.push(u);
    }
  if (i)
    re.exports = i;
  else {
    const [a, u, t] = ["linux", "darwin", "win32"].map((d) => s.startsWith(d)), g = [`Could not load the "sharp" module using the ${s} runtime`];
    h.forEach((d) => {
      d.code !== "MODULE_NOT_FOUND" && g.push(`${d.code}: ${d.message}`);
    });
    const l = h.map((d) => d.message).join(" ");
    if (g.push("Possible solutions:"), v()) {
      const { found: d, expected: p } = v();
      g.push(
        "- Please upgrade Node.js:",
        `    Found ${d}`,
        `    Requires ${p}`
      );
    } else if (n.includes(s)) {
      const [d, p] = s.split("-"), y = d.endsWith("musl") ? " --libc=musl" : "";
      g.push(
        "- Ensure optional dependencies can be installed:",
        "    npm install --include=optional sharp",
        "- Ensure your package manager supports multi-platform installation:",
        "    See https://sharp.pixelplumbing.com/install#cross-platform",
        "- Add platform-specific dependencies:",
        `    npm install --os=${d.replace("musl", "")}${y} --cpu=${p} sharp`
      );
    } else
      g.push(
        `- Manually install libvips >= ${c}`,
        "- Add experimental WebAssembly-based dependencies:",
        "    npm install --cpu=wasm32 sharp",
        "    npm install @img/sharp-wasm32"
      );
    if (a && /(symbol not found|CXXABI_)/i.test(l))
      try {
        const { config: d } = G(`@img/sharp-libvips-${s}/package`), p = `${f()} ${e()}`, y = `${d.musl ? "musl" : "glibc"} ${d.musl || d.glibc}`;
        g.push(
          "- Update your OS:",
          `    Found ${p}`,
          `    Requires ${y}`
        );
      } catch {
      }
    throw a && /\/snap\/core[0-9]{2}/.test(l) && g.push(
      "- Remove the Node.js Snap, which does not support native modules",
      "    snap remove node"
    ), u && /Incompatible library version/.test(l) && g.push(
      "- Update Homebrew:",
      "    brew update && brew upgrade vips"
    ), h.some((d) => d.code === "ERR_DLOPEN_DISABLED") && g.push("- Run Node.js without using the --no-addons flag"), t && /The specified procedure could not be found/.test(l) && g.push(
      "- Using the canvas package on Windows?",
      "    See https://sharp.pixelplumbing.com/install#canvas-and-windows",
      "- Check for outdated versions of sharp in the dependency tree:",
      "    npm ls sharp"
    ), g.push(
      "- Consult the installation documentation:",
      "    See https://sharp.pixelplumbing.com/install"
    ), new Error(g.join(`
`));
  }
  return re.exports;
}
var Ie, Er;
function It() {
  if (Er) return Ie;
  Er = 1;
  const f = U, e = U, b = D();
  Z();
  const v = f.debuglog("sharp"), n = function(s, o) {
    if (arguments.length === 1 && !b.defined(s))
      throw new Error("Invalid input");
    return this instanceof n ? (e.Duplex.call(this), this.options = {
      // resize options
      topOffsetPre: -1,
      leftOffsetPre: -1,
      widthPre: -1,
      heightPre: -1,
      topOffsetPost: -1,
      leftOffsetPost: -1,
      widthPost: -1,
      heightPost: -1,
      width: -1,
      height: -1,
      canvas: "crop",
      position: 0,
      resizeBackground: [0, 0, 0, 255],
      useExifOrientation: !1,
      angle: 0,
      rotationAngle: 0,
      rotationBackground: [0, 0, 0, 255],
      rotateBeforePreExtract: !1,
      flip: !1,
      flop: !1,
      extendTop: 0,
      extendBottom: 0,
      extendLeft: 0,
      extendRight: 0,
      extendBackground: [0, 0, 0, 255],
      extendWith: "background",
      withoutEnlargement: !1,
      withoutReduction: !1,
      affineMatrix: [],
      affineBackground: [0, 0, 0, 255],
      affineIdx: 0,
      affineIdy: 0,
      affineOdx: 0,
      affineOdy: 0,
      affineInterpolator: this.constructor.interpolators.bilinear,
      kernel: "lanczos3",
      fastShrinkOnLoad: !0,
      // operations
      tint: [-1, 0, 0, 0],
      flatten: !1,
      flattenBackground: [0, 0, 0],
      unflatten: !1,
      negate: !1,
      negateAlpha: !0,
      medianSize: 0,
      blurSigma: 0,
      precision: "integer",
      minAmpl: 0.2,
      sharpenSigma: 0,
      sharpenM1: 1,
      sharpenM2: 2,
      sharpenX1: 2,
      sharpenY2: 10,
      sharpenY3: 20,
      threshold: 0,
      thresholdGrayscale: !0,
      trimBackground: [],
      trimThreshold: -1,
      trimLineArt: !1,
      gamma: 0,
      gammaOut: 0,
      greyscale: !1,
      normalise: !1,
      normaliseLower: 1,
      normaliseUpper: 99,
      claheWidth: 0,
      claheHeight: 0,
      claheMaxSlope: 3,
      brightness: 1,
      saturation: 1,
      hue: 0,
      lightness: 0,
      booleanBufferIn: null,
      booleanFileIn: "",
      joinChannelIn: [],
      extractChannel: -1,
      removeAlpha: !1,
      ensureAlpha: -1,
      colourspace: "srgb",
      colourspacePipeline: "last",
      composite: [],
      // output
      fileOut: "",
      formatOut: "input",
      streamOut: !1,
      keepMetadata: 0,
      withMetadataOrientation: -1,
      withMetadataDensity: 0,
      withIccProfile: "",
      withExif: {},
      withExifMerge: !0,
      resolveWithObject: !1,
      // output format
      jpegQuality: 80,
      jpegProgressive: !1,
      jpegChromaSubsampling: "4:2:0",
      jpegTrellisQuantisation: !1,
      jpegOvershootDeringing: !1,
      jpegOptimiseScans: !1,
      jpegOptimiseCoding: !0,
      jpegQuantisationTable: 0,
      pngProgressive: !1,
      pngCompressionLevel: 6,
      pngAdaptiveFiltering: !1,
      pngPalette: !1,
      pngQuality: 100,
      pngEffort: 7,
      pngBitdepth: 8,
      pngDither: 1,
      jp2Quality: 80,
      jp2TileHeight: 512,
      jp2TileWidth: 512,
      jp2Lossless: !1,
      jp2ChromaSubsampling: "4:4:4",
      webpQuality: 80,
      webpAlphaQuality: 100,
      webpLossless: !1,
      webpNearLossless: !1,
      webpSmartSubsample: !1,
      webpPreset: "default",
      webpEffort: 4,
      webpMinSize: !1,
      webpMixed: !1,
      gifBitdepth: 8,
      gifEffort: 7,
      gifDither: 1,
      gifInterFrameMaxError: 0,
      gifInterPaletteMaxError: 3,
      gifReuse: !0,
      gifProgressive: !1,
      tiffQuality: 80,
      tiffCompression: "jpeg",
      tiffPredictor: "horizontal",
      tiffPyramid: !1,
      tiffMiniswhite: !1,
      tiffBitdepth: 8,
      tiffTile: !1,
      tiffTileHeight: 256,
      tiffTileWidth: 256,
      tiffXres: 1,
      tiffYres: 1,
      tiffResolutionUnit: "inch",
      heifQuality: 50,
      heifLossless: !1,
      heifCompression: "av1",
      heifEffort: 4,
      heifChromaSubsampling: "4:4:4",
      heifBitdepth: 8,
      jxlDistance: 1,
      jxlDecodingTier: 0,
      jxlEffort: 7,
      jxlLossless: !1,
      rawDepth: "uchar",
      tileSize: 256,
      tileOverlap: 0,
      tileContainer: "fs",
      tileLayout: "dz",
      tileFormat: "last",
      tileDepth: "last",
      tileAngle: 0,
      tileSkipBlanks: -1,
      tileBackground: [255, 255, 255, 255],
      tileCentre: !1,
      tileId: "https://example.com/iiif",
      tileBasename: "",
      timeoutSeconds: 0,
      linearA: [],
      linearB: [],
      // Function to notify of libvips warnings
      debuglog: (i) => {
        this.emit("warning", i), v(i);
      },
      // Function to notify of queue length changes
      queueListener: function(i) {
        n.queue.emit("change", i);
      }
    }, this.options.input = this._createInputDescriptor(s, o, { allowStream: !0 }), this) : new n(s, o);
  };
  Object.setPrototypeOf(n.prototype, e.Duplex.prototype), Object.setPrototypeOf(n, e.Duplex);
  function c() {
    const s = this.constructor.call(), { debuglog: o, queueListener: i, ...h } = this.options;
    return s.options = structuredClone(h), s.options.debuglog = o, s.options.queueListener = i, this._isStreamInput() && this.on("finish", () => {
      this._flattenBufferIn(), s.options.input.buffer = this.options.input.buffer, s.emit("finish");
    }), s;
  }
  return Object.assign(n.prototype, { clone: c }), Ie = n, Ie;
}
var $e = { exports: {} }, Ae, yr;
function Wr() {
  return yr || (yr = 1, Ae = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  }), Ae;
}
var Le = { exports: {} }, Se, Pr;
function $t() {
  return Pr || (Pr = 1, Se = function(e) {
    return !e || typeof e == "string" ? !1 : e instanceof Array || Array.isArray(e) || e.length >= 0 && (e.splice instanceof Function || Object.getOwnPropertyDescriptor(e, e.length - 1) && e.constructor.name !== "String");
  }), Se;
}
var Rr;
function At() {
  if (Rr) return Le.exports;
  Rr = 1;
  var f = $t(), e = Array.prototype.concat, b = Array.prototype.slice, v = Le.exports = function(c) {
    for (var s = [], o = 0, i = c.length; o < i; o++) {
      var h = c[o];
      f(h) ? s = e.call(s, b.call(h)) : s.push(h);
    }
    return s;
  };
  return v.wrap = function(n) {
    return function() {
      return n(v(arguments));
    };
  }, Le.exports;
}
var xr;
function Lt() {
  if (xr) return $e.exports;
  xr = 1;
  var f = Wr(), e = At(), b = Object.hasOwnProperty, v = /* @__PURE__ */ Object.create(null);
  for (var n in f)
    b.call(f, n) && (v[f[n]] = n);
  var c = $e.exports = {
    to: {},
    get: {}
  };
  c.get = function(i) {
    var h = i.substring(0, 3).toLowerCase(), a, u;
    switch (h) {
      case "hsl":
        a = c.get.hsl(i), u = "hsl";
        break;
      case "hwb":
        a = c.get.hwb(i), u = "hwb";
        break;
      default:
        a = c.get.rgb(i), u = "rgb";
        break;
    }
    return a ? { model: u, value: a } : null;
  }, c.get.rgb = function(i) {
    if (!i)
      return null;
    var h = /^#([a-f0-9]{3,4})$/i, a = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i, u = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/, t = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/, g = /^(\w+)$/, l = [0, 0, 0, 1], d, p, y;
    if (d = i.match(a)) {
      for (y = d[2], d = d[1], p = 0; p < 3; p++) {
        var j = p * 2;
        l[p] = parseInt(d.slice(j, j + 2), 16);
      }
      y && (l[3] = parseInt(y, 16) / 255);
    } else if (d = i.match(h)) {
      for (d = d[1], y = d[3], p = 0; p < 3; p++)
        l[p] = parseInt(d[p] + d[p], 16);
      y && (l[3] = parseInt(y + y, 16) / 255);
    } else if (d = i.match(u)) {
      for (p = 0; p < 3; p++)
        l[p] = parseInt(d[p + 1], 0);
      d[4] && (d[5] ? l[3] = parseFloat(d[4]) * 0.01 : l[3] = parseFloat(d[4]));
    } else if (d = i.match(t)) {
      for (p = 0; p < 3; p++)
        l[p] = Math.round(parseFloat(d[p + 1]) * 2.55);
      d[4] && (d[5] ? l[3] = parseFloat(d[4]) * 0.01 : l[3] = parseFloat(d[4]));
    } else return (d = i.match(g)) ? d[1] === "transparent" ? [0, 0, 0, 0] : b.call(f, d[1]) ? (l = f[d[1]], l[3] = 1, l) : null : null;
    for (p = 0; p < 3; p++)
      l[p] = s(l[p], 0, 255);
    return l[3] = s(l[3], 0, 1), l;
  }, c.get.hsl = function(i) {
    if (!i)
      return null;
    var h = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/, a = i.match(h);
    if (a) {
      var u = parseFloat(a[4]), t = (parseFloat(a[1]) % 360 + 360) % 360, g = s(parseFloat(a[2]), 0, 100), l = s(parseFloat(a[3]), 0, 100), d = s(isNaN(u) ? 1 : u, 0, 1);
      return [t, g, l, d];
    }
    return null;
  }, c.get.hwb = function(i) {
    if (!i)
      return null;
    var h = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/, a = i.match(h);
    if (a) {
      var u = parseFloat(a[4]), t = (parseFloat(a[1]) % 360 + 360) % 360, g = s(parseFloat(a[2]), 0, 100), l = s(parseFloat(a[3]), 0, 100), d = s(isNaN(u) ? 1 : u, 0, 1);
      return [t, g, l, d];
    }
    return null;
  }, c.to.hex = function() {
    var i = e(arguments);
    return "#" + o(i[0]) + o(i[1]) + o(i[2]) + (i[3] < 1 ? o(Math.round(i[3] * 255)) : "");
  }, c.to.rgb = function() {
    var i = e(arguments);
    return i.length < 4 || i[3] === 1 ? "rgb(" + Math.round(i[0]) + ", " + Math.round(i[1]) + ", " + Math.round(i[2]) + ")" : "rgba(" + Math.round(i[0]) + ", " + Math.round(i[1]) + ", " + Math.round(i[2]) + ", " + i[3] + ")";
  }, c.to.rgb.percent = function() {
    var i = e(arguments), h = Math.round(i[0] / 255 * 100), a = Math.round(i[1] / 255 * 100), u = Math.round(i[2] / 255 * 100);
    return i.length < 4 || i[3] === 1 ? "rgb(" + h + "%, " + a + "%, " + u + "%)" : "rgba(" + h + "%, " + a + "%, " + u + "%, " + i[3] + ")";
  }, c.to.hsl = function() {
    var i = e(arguments);
    return i.length < 4 || i[3] === 1 ? "hsl(" + i[0] + ", " + i[1] + "%, " + i[2] + "%)" : "hsla(" + i[0] + ", " + i[1] + "%, " + i[2] + "%, " + i[3] + ")";
  }, c.to.hwb = function() {
    var i = e(arguments), h = "";
    return i.length >= 4 && i[3] !== 1 && (h = ", " + i[3]), "hwb(" + i[0] + ", " + i[1] + "%, " + i[2] + "%" + h + ")";
  }, c.to.keyword = function(i) {
    return v[i.slice(0, 3)];
  };
  function s(i, h, a) {
    return Math.min(Math.max(h, i), a);
  }
  function o(i) {
    var h = Math.round(i).toString(16).toUpperCase();
    return h.length < 2 ? "0" + h : h;
  }
  return $e.exports;
}
var je, Ir;
function Hr() {
  if (Ir) return je;
  Ir = 1;
  const f = Wr(), e = {};
  for (const n of Object.keys(f))
    e[f[n]] = n;
  const b = {
    rgb: { channels: 3, labels: "rgb" },
    hsl: { channels: 3, labels: "hsl" },
    hsv: { channels: 3, labels: "hsv" },
    hwb: { channels: 3, labels: "hwb" },
    cmyk: { channels: 4, labels: "cmyk" },
    xyz: { channels: 3, labels: "xyz" },
    lab: { channels: 3, labels: "lab" },
    lch: { channels: 3, labels: "lch" },
    hex: { channels: 1, labels: ["hex"] },
    keyword: { channels: 1, labels: ["keyword"] },
    ansi16: { channels: 1, labels: ["ansi16"] },
    ansi256: { channels: 1, labels: ["ansi256"] },
    hcg: { channels: 3, labels: ["h", "c", "g"] },
    apple: { channels: 3, labels: ["r16", "g16", "b16"] },
    gray: { channels: 1, labels: ["gray"] }
  };
  je = b;
  for (const n of Object.keys(b)) {
    if (!("channels" in b[n]))
      throw new Error("missing channels property: " + n);
    if (!("labels" in b[n]))
      throw new Error("missing channel labels property: " + n);
    if (b[n].labels.length !== b[n].channels)
      throw new Error("channel and label counts mismatch: " + n);
    const { channels: c, labels: s } = b[n];
    delete b[n].channels, delete b[n].labels, Object.defineProperty(b[n], "channels", { value: c }), Object.defineProperty(b[n], "labels", { value: s });
  }
  b.rgb.hsl = function(n) {
    const c = n[0] / 255, s = n[1] / 255, o = n[2] / 255, i = Math.min(c, s, o), h = Math.max(c, s, o), a = h - i;
    let u, t;
    h === i ? u = 0 : c === h ? u = (s - o) / a : s === h ? u = 2 + (o - c) / a : o === h && (u = 4 + (c - s) / a), u = Math.min(u * 60, 360), u < 0 && (u += 360);
    const g = (i + h) / 2;
    return h === i ? t = 0 : g <= 0.5 ? t = a / (h + i) : t = a / (2 - h - i), [u, t * 100, g * 100];
  }, b.rgb.hsv = function(n) {
    let c, s, o, i, h;
    const a = n[0] / 255, u = n[1] / 255, t = n[2] / 255, g = Math.max(a, u, t), l = g - Math.min(a, u, t), d = function(p) {
      return (g - p) / 6 / l + 1 / 2;
    };
    return l === 0 ? (i = 0, h = 0) : (h = l / g, c = d(a), s = d(u), o = d(t), a === g ? i = o - s : u === g ? i = 1 / 3 + c - o : t === g && (i = 2 / 3 + s - c), i < 0 ? i += 1 : i > 1 && (i -= 1)), [
      i * 360,
      h * 100,
      g * 100
    ];
  }, b.rgb.hwb = function(n) {
    const c = n[0], s = n[1];
    let o = n[2];
    const i = b.rgb.hsl(n)[0], h = 1 / 255 * Math.min(c, Math.min(s, o));
    return o = 1 - 1 / 255 * Math.max(c, Math.max(s, o)), [i, h * 100, o * 100];
  }, b.rgb.cmyk = function(n) {
    const c = n[0] / 255, s = n[1] / 255, o = n[2] / 255, i = Math.min(1 - c, 1 - s, 1 - o), h = (1 - c - i) / (1 - i) || 0, a = (1 - s - i) / (1 - i) || 0, u = (1 - o - i) / (1 - i) || 0;
    return [h * 100, a * 100, u * 100, i * 100];
  };
  function v(n, c) {
    return (n[0] - c[0]) ** 2 + (n[1] - c[1]) ** 2 + (n[2] - c[2]) ** 2;
  }
  return b.rgb.keyword = function(n) {
    const c = e[n];
    if (c)
      return c;
    let s = 1 / 0, o;
    for (const i of Object.keys(f)) {
      const h = f[i], a = v(n, h);
      a < s && (s = a, o = i);
    }
    return o;
  }, b.keyword.rgb = function(n) {
    return f[n];
  }, b.rgb.xyz = function(n) {
    let c = n[0] / 255, s = n[1] / 255, o = n[2] / 255;
    c = c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92, s = s > 0.04045 ? ((s + 0.055) / 1.055) ** 2.4 : s / 12.92, o = o > 0.04045 ? ((o + 0.055) / 1.055) ** 2.4 : o / 12.92;
    const i = c * 0.4124 + s * 0.3576 + o * 0.1805, h = c * 0.2126 + s * 0.7152 + o * 0.0722, a = c * 0.0193 + s * 0.1192 + o * 0.9505;
    return [i * 100, h * 100, a * 100];
  }, b.rgb.lab = function(n) {
    const c = b.rgb.xyz(n);
    let s = c[0], o = c[1], i = c[2];
    s /= 95.047, o /= 100, i /= 108.883, s = s > 8856e-6 ? s ** (1 / 3) : 7.787 * s + 16 / 116, o = o > 8856e-6 ? o ** (1 / 3) : 7.787 * o + 16 / 116, i = i > 8856e-6 ? i ** (1 / 3) : 7.787 * i + 16 / 116;
    const h = 116 * o - 16, a = 500 * (s - o), u = 200 * (o - i);
    return [h, a, u];
  }, b.hsl.rgb = function(n) {
    const c = n[0] / 360, s = n[1] / 100, o = n[2] / 100;
    let i, h, a;
    if (s === 0)
      return a = o * 255, [a, a, a];
    o < 0.5 ? i = o * (1 + s) : i = o + s - o * s;
    const u = 2 * o - i, t = [0, 0, 0];
    for (let g = 0; g < 3; g++)
      h = c + 1 / 3 * -(g - 1), h < 0 && h++, h > 1 && h--, 6 * h < 1 ? a = u + (i - u) * 6 * h : 2 * h < 1 ? a = i : 3 * h < 2 ? a = u + (i - u) * (2 / 3 - h) * 6 : a = u, t[g] = a * 255;
    return t;
  }, b.hsl.hsv = function(n) {
    const c = n[0];
    let s = n[1] / 100, o = n[2] / 100, i = s;
    const h = Math.max(o, 0.01);
    o *= 2, s *= o <= 1 ? o : 2 - o, i *= h <= 1 ? h : 2 - h;
    const a = (o + s) / 2, u = o === 0 ? 2 * i / (h + i) : 2 * s / (o + s);
    return [c, u * 100, a * 100];
  }, b.hsv.rgb = function(n) {
    const c = n[0] / 60, s = n[1] / 100;
    let o = n[2] / 100;
    const i = Math.floor(c) % 6, h = c - Math.floor(c), a = 255 * o * (1 - s), u = 255 * o * (1 - s * h), t = 255 * o * (1 - s * (1 - h));
    switch (o *= 255, i) {
      case 0:
        return [o, t, a];
      case 1:
        return [u, o, a];
      case 2:
        return [a, o, t];
      case 3:
        return [a, u, o];
      case 4:
        return [t, a, o];
      case 5:
        return [o, a, u];
    }
  }, b.hsv.hsl = function(n) {
    const c = n[0], s = n[1] / 100, o = n[2] / 100, i = Math.max(o, 0.01);
    let h, a;
    a = (2 - s) * o;
    const u = (2 - s) * i;
    return h = s * i, h /= u <= 1 ? u : 2 - u, h = h || 0, a /= 2, [c, h * 100, a * 100];
  }, b.hwb.rgb = function(n) {
    const c = n[0] / 360;
    let s = n[1] / 100, o = n[2] / 100;
    const i = s + o;
    let h;
    i > 1 && (s /= i, o /= i);
    const a = Math.floor(6 * c), u = 1 - o;
    h = 6 * c - a, (a & 1) !== 0 && (h = 1 - h);
    const t = s + h * (u - s);
    let g, l, d;
    switch (a) {
      default:
      case 6:
      case 0:
        g = u, l = t, d = s;
        break;
      case 1:
        g = t, l = u, d = s;
        break;
      case 2:
        g = s, l = u, d = t;
        break;
      case 3:
        g = s, l = t, d = u;
        break;
      case 4:
        g = t, l = s, d = u;
        break;
      case 5:
        g = u, l = s, d = t;
        break;
    }
    return [g * 255, l * 255, d * 255];
  }, b.cmyk.rgb = function(n) {
    const c = n[0] / 100, s = n[1] / 100, o = n[2] / 100, i = n[3] / 100, h = 1 - Math.min(1, c * (1 - i) + i), a = 1 - Math.min(1, s * (1 - i) + i), u = 1 - Math.min(1, o * (1 - i) + i);
    return [h * 255, a * 255, u * 255];
  }, b.xyz.rgb = function(n) {
    const c = n[0] / 100, s = n[1] / 100, o = n[2] / 100;
    let i, h, a;
    return i = c * 3.2406 + s * -1.5372 + o * -0.4986, h = c * -0.9689 + s * 1.8758 + o * 0.0415, a = c * 0.0557 + s * -0.204 + o * 1.057, i = i > 31308e-7 ? 1.055 * i ** (1 / 2.4) - 0.055 : i * 12.92, h = h > 31308e-7 ? 1.055 * h ** (1 / 2.4) - 0.055 : h * 12.92, a = a > 31308e-7 ? 1.055 * a ** (1 / 2.4) - 0.055 : a * 12.92, i = Math.min(Math.max(0, i), 1), h = Math.min(Math.max(0, h), 1), a = Math.min(Math.max(0, a), 1), [i * 255, h * 255, a * 255];
  }, b.xyz.lab = function(n) {
    let c = n[0], s = n[1], o = n[2];
    c /= 95.047, s /= 100, o /= 108.883, c = c > 8856e-6 ? c ** (1 / 3) : 7.787 * c + 16 / 116, s = s > 8856e-6 ? s ** (1 / 3) : 7.787 * s + 16 / 116, o = o > 8856e-6 ? o ** (1 / 3) : 7.787 * o + 16 / 116;
    const i = 116 * s - 16, h = 500 * (c - s), a = 200 * (s - o);
    return [i, h, a];
  }, b.lab.xyz = function(n) {
    const c = n[0], s = n[1], o = n[2];
    let i, h, a;
    h = (c + 16) / 116, i = s / 500 + h, a = h - o / 200;
    const u = h ** 3, t = i ** 3, g = a ** 3;
    return h = u > 8856e-6 ? u : (h - 16 / 116) / 7.787, i = t > 8856e-6 ? t : (i - 16 / 116) / 7.787, a = g > 8856e-6 ? g : (a - 16 / 116) / 7.787, i *= 95.047, h *= 100, a *= 108.883, [i, h, a];
  }, b.lab.lch = function(n) {
    const c = n[0], s = n[1], o = n[2];
    let i;
    i = Math.atan2(o, s) * 360 / 2 / Math.PI, i < 0 && (i += 360);
    const a = Math.sqrt(s * s + o * o);
    return [c, a, i];
  }, b.lch.lab = function(n) {
    const c = n[0], s = n[1], i = n[2] / 360 * 2 * Math.PI, h = s * Math.cos(i), a = s * Math.sin(i);
    return [c, h, a];
  }, b.rgb.ansi16 = function(n, c = null) {
    const [s, o, i] = n;
    let h = c === null ? b.rgb.hsv(n)[2] : c;
    if (h = Math.round(h / 50), h === 0)
      return 30;
    let a = 30 + (Math.round(i / 255) << 2 | Math.round(o / 255) << 1 | Math.round(s / 255));
    return h === 2 && (a += 60), a;
  }, b.hsv.ansi16 = function(n) {
    return b.rgb.ansi16(b.hsv.rgb(n), n[2]);
  }, b.rgb.ansi256 = function(n) {
    const c = n[0], s = n[1], o = n[2];
    return c === s && s === o ? c < 8 ? 16 : c > 248 ? 231 : Math.round((c - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(c / 255 * 5) + 6 * Math.round(s / 255 * 5) + Math.round(o / 255 * 5);
  }, b.ansi16.rgb = function(n) {
    let c = n % 10;
    if (c === 0 || c === 7)
      return n > 50 && (c += 3.5), c = c / 10.5 * 255, [c, c, c];
    const s = (~~(n > 50) + 1) * 0.5, o = (c & 1) * s * 255, i = (c >> 1 & 1) * s * 255, h = (c >> 2 & 1) * s * 255;
    return [o, i, h];
  }, b.ansi256.rgb = function(n) {
    if (n >= 232) {
      const h = (n - 232) * 10 + 8;
      return [h, h, h];
    }
    n -= 16;
    let c;
    const s = Math.floor(n / 36) / 5 * 255, o = Math.floor((c = n % 36) / 6) / 5 * 255, i = c % 6 / 5 * 255;
    return [s, o, i];
  }, b.rgb.hex = function(n) {
    const s = (((Math.round(n[0]) & 255) << 16) + ((Math.round(n[1]) & 255) << 8) + (Math.round(n[2]) & 255)).toString(16).toUpperCase();
    return "000000".substring(s.length) + s;
  }, b.hex.rgb = function(n) {
    const c = n.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!c)
      return [0, 0, 0];
    let s = c[0];
    c[0].length === 3 && (s = s.split("").map((u) => u + u).join(""));
    const o = parseInt(s, 16), i = o >> 16 & 255, h = o >> 8 & 255, a = o & 255;
    return [i, h, a];
  }, b.rgb.hcg = function(n) {
    const c = n[0] / 255, s = n[1] / 255, o = n[2] / 255, i = Math.max(Math.max(c, s), o), h = Math.min(Math.min(c, s), o), a = i - h;
    let u, t;
    return a < 1 ? u = h / (1 - a) : u = 0, a <= 0 ? t = 0 : i === c ? t = (s - o) / a % 6 : i === s ? t = 2 + (o - c) / a : t = 4 + (c - s) / a, t /= 6, t %= 1, [t * 360, a * 100, u * 100];
  }, b.hsl.hcg = function(n) {
    const c = n[1] / 100, s = n[2] / 100, o = s < 0.5 ? 2 * c * s : 2 * c * (1 - s);
    let i = 0;
    return o < 1 && (i = (s - 0.5 * o) / (1 - o)), [n[0], o * 100, i * 100];
  }, b.hsv.hcg = function(n) {
    const c = n[1] / 100, s = n[2] / 100, o = c * s;
    let i = 0;
    return o < 1 && (i = (s - o) / (1 - o)), [n[0], o * 100, i * 100];
  }, b.hcg.rgb = function(n) {
    const c = n[0] / 360, s = n[1] / 100, o = n[2] / 100;
    if (s === 0)
      return [o * 255, o * 255, o * 255];
    const i = [0, 0, 0], h = c % 1 * 6, a = h % 1, u = 1 - a;
    let t = 0;
    switch (Math.floor(h)) {
      case 0:
        i[0] = 1, i[1] = a, i[2] = 0;
        break;
      case 1:
        i[0] = u, i[1] = 1, i[2] = 0;
        break;
      case 2:
        i[0] = 0, i[1] = 1, i[2] = a;
        break;
      case 3:
        i[0] = 0, i[1] = u, i[2] = 1;
        break;
      case 4:
        i[0] = a, i[1] = 0, i[2] = 1;
        break;
      default:
        i[0] = 1, i[1] = 0, i[2] = u;
    }
    return t = (1 - s) * o, [
      (s * i[0] + t) * 255,
      (s * i[1] + t) * 255,
      (s * i[2] + t) * 255
    ];
  }, b.hcg.hsv = function(n) {
    const c = n[1] / 100, s = n[2] / 100, o = c + s * (1 - c);
    let i = 0;
    return o > 0 && (i = c / o), [n[0], i * 100, o * 100];
  }, b.hcg.hsl = function(n) {
    const c = n[1] / 100, o = n[2] / 100 * (1 - c) + 0.5 * c;
    let i = 0;
    return o > 0 && o < 0.5 ? i = c / (2 * o) : o >= 0.5 && o < 1 && (i = c / (2 * (1 - o))), [n[0], i * 100, o * 100];
  }, b.hcg.hwb = function(n) {
    const c = n[1] / 100, s = n[2] / 100, o = c + s * (1 - c);
    return [n[0], (o - c) * 100, (1 - o) * 100];
  }, b.hwb.hcg = function(n) {
    const c = n[1] / 100, o = 1 - n[2] / 100, i = o - c;
    let h = 0;
    return i < 1 && (h = (o - i) / (1 - i)), [n[0], i * 100, h * 100];
  }, b.apple.rgb = function(n) {
    return [n[0] / 65535 * 255, n[1] / 65535 * 255, n[2] / 65535 * 255];
  }, b.rgb.apple = function(n) {
    return [n[0] / 255 * 65535, n[1] / 255 * 65535, n[2] / 255 * 65535];
  }, b.gray.rgb = function(n) {
    return [n[0] / 100 * 255, n[0] / 100 * 255, n[0] / 100 * 255];
  }, b.gray.hsl = function(n) {
    return [0, 0, n[0]];
  }, b.gray.hsv = b.gray.hsl, b.gray.hwb = function(n) {
    return [0, 100, n[0]];
  }, b.gray.cmyk = function(n) {
    return [0, 0, 0, n[0]];
  }, b.gray.lab = function(n) {
    return [n[0], 0, 0];
  }, b.gray.hex = function(n) {
    const c = Math.round(n[0] / 100 * 255) & 255, o = ((c << 16) + (c << 8) + c).toString(16).toUpperCase();
    return "000000".substring(o.length) + o;
  }, b.rgb.gray = function(n) {
    return [(n[0] + n[1] + n[2]) / 3 / 255 * 100];
  }, je;
}
var ke, $r;
function St() {
  if ($r) return ke;
  $r = 1;
  const f = Hr();
  function e() {
    const c = {}, s = Object.keys(f);
    for (let o = s.length, i = 0; i < o; i++)
      c[s[i]] = {
        // http://jsperf.com/1-vs-infinity
        // micro-opt, but this is simple.
        distance: -1,
        parent: null
      };
    return c;
  }
  function b(c) {
    const s = e(), o = [c];
    for (s[c].distance = 0; o.length; ) {
      const i = o.pop(), h = Object.keys(f[i]);
      for (let a = h.length, u = 0; u < a; u++) {
        const t = h[u], g = s[t];
        g.distance === -1 && (g.distance = s[i].distance + 1, g.parent = i, o.unshift(t));
      }
    }
    return s;
  }
  function v(c, s) {
    return function(o) {
      return s(c(o));
    };
  }
  function n(c, s) {
    const o = [s[c].parent, c];
    let i = f[s[c].parent][c], h = s[c].parent;
    for (; s[h].parent; )
      o.unshift(s[h].parent), i = v(f[s[h].parent][h], i), h = s[h].parent;
    return i.conversion = o, i;
  }
  return ke = function(c) {
    const s = b(c), o = {}, i = Object.keys(s);
    for (let h = i.length, a = 0; a < h; a++) {
      const u = i[a];
      s[u].parent !== null && (o[u] = n(u, s));
    }
    return o;
  }, ke;
}
var qe, Ar;
function jt() {
  if (Ar) return qe;
  Ar = 1;
  const f = Hr(), e = St(), b = {}, v = Object.keys(f);
  function n(s) {
    const o = function(...i) {
      const h = i[0];
      return h == null ? h : (h.length > 1 && (i = h), s(i));
    };
    return "conversion" in s && (o.conversion = s.conversion), o;
  }
  function c(s) {
    const o = function(...i) {
      const h = i[0];
      if (h == null)
        return h;
      h.length > 1 && (i = h);
      const a = s(i);
      if (typeof a == "object")
        for (let u = a.length, t = 0; t < u; t++)
          a[t] = Math.round(a[t]);
      return a;
    };
    return "conversion" in s && (o.conversion = s.conversion), o;
  }
  return v.forEach((s) => {
    b[s] = {}, Object.defineProperty(b[s], "channels", { value: f[s].channels }), Object.defineProperty(b[s], "labels", { value: f[s].labels });
    const o = e(s);
    Object.keys(o).forEach((h) => {
      const a = o[h];
      b[s][h] = c(a), b[s][h].raw = n(a);
    });
  }), qe = b, qe;
}
var Ce, Lr;
function He() {
  if (Lr) return Ce;
  Lr = 1;
  const f = Lt(), e = jt(), b = [
    // To be honest, I don't really feel like keyword belongs in color convert, but eh.
    "keyword",
    // Gray conflicts with some method names, and has its own method defined.
    "gray",
    // Shouldn't really be in color-convert either...
    "hex"
  ], v = {};
  for (const t of Object.keys(e))
    v[[...e[t].labels].sort().join("")] = t;
  const n = {};
  function c(t, g) {
    if (!(this instanceof c))
      return new c(t, g);
    if (g && g in b && (g = null), g && !(g in e))
      throw new Error("Unknown model: " + g);
    let l, d;
    if (t == null)
      this.model = "rgb", this.color = [0, 0, 0], this.valpha = 1;
    else if (t instanceof c)
      this.model = t.model, this.color = [...t.color], this.valpha = t.valpha;
    else if (typeof t == "string") {
      const p = f.get(t);
      if (p === null)
        throw new Error("Unable to parse color from string: " + t);
      this.model = p.model, d = e[this.model].channels, this.color = p.value.slice(0, d), this.valpha = typeof p.value[d] == "number" ? p.value[d] : 1;
    } else if (t.length > 0) {
      this.model = g || "rgb", d = e[this.model].channels;
      const p = Array.prototype.slice.call(t, 0, d);
      this.color = u(p, d), this.valpha = typeof t[d] == "number" ? t[d] : 1;
    } else if (typeof t == "number")
      this.model = "rgb", this.color = [
        t >> 16 & 255,
        t >> 8 & 255,
        t & 255
      ], this.valpha = 1;
    else {
      this.valpha = 1;
      const p = Object.keys(t);
      "alpha" in t && (p.splice(p.indexOf("alpha"), 1), this.valpha = typeof t.alpha == "number" ? t.alpha : 0);
      const y = p.sort().join("");
      if (!(y in v))
        throw new Error("Unable to parse color from object: " + JSON.stringify(t));
      this.model = v[y];
      const { labels: j } = e[this.model], S = [];
      for (l = 0; l < j.length; l++)
        S.push(t[j[l]]);
      this.color = u(S);
    }
    if (n[this.model])
      for (d = e[this.model].channels, l = 0; l < d; l++) {
        const p = n[this.model][l];
        p && (this.color[l] = p(this.color[l]));
      }
    this.valpha = Math.max(0, Math.min(1, this.valpha)), Object.freeze && Object.freeze(this);
  }
  c.prototype = {
    toString() {
      return this.string();
    },
    toJSON() {
      return this[this.model]();
    },
    string(t) {
      let g = this.model in f.to ? this : this.rgb();
      g = g.round(typeof t == "number" ? t : 1);
      const l = g.valpha === 1 ? g.color : [...g.color, this.valpha];
      return f.to[g.model](l);
    },
    percentString(t) {
      const g = this.rgb().round(typeof t == "number" ? t : 1), l = g.valpha === 1 ? g.color : [...g.color, this.valpha];
      return f.to.rgb.percent(l);
    },
    array() {
      return this.valpha === 1 ? [...this.color] : [...this.color, this.valpha];
    },
    object() {
      const t = {}, { channels: g } = e[this.model], { labels: l } = e[this.model];
      for (let d = 0; d < g; d++)
        t[l[d]] = this.color[d];
      return this.valpha !== 1 && (t.alpha = this.valpha), t;
    },
    unitArray() {
      const t = this.rgb().color;
      return t[0] /= 255, t[1] /= 255, t[2] /= 255, this.valpha !== 1 && t.push(this.valpha), t;
    },
    unitObject() {
      const t = this.rgb().object();
      return t.r /= 255, t.g /= 255, t.b /= 255, this.valpha !== 1 && (t.alpha = this.valpha), t;
    },
    round(t) {
      return t = Math.max(t || 0, 0), new c([...this.color.map(o(t)), this.valpha], this.model);
    },
    alpha(t) {
      return t !== void 0 ? new c([...this.color, Math.max(0, Math.min(1, t))], this.model) : this.valpha;
    },
    // Rgb
    red: i("rgb", 0, h(255)),
    green: i("rgb", 1, h(255)),
    blue: i("rgb", 2, h(255)),
    hue: i(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, (t) => (t % 360 + 360) % 360),
    saturationl: i("hsl", 1, h(100)),
    lightness: i("hsl", 2, h(100)),
    saturationv: i("hsv", 1, h(100)),
    value: i("hsv", 2, h(100)),
    chroma: i("hcg", 1, h(100)),
    gray: i("hcg", 2, h(100)),
    white: i("hwb", 1, h(100)),
    wblack: i("hwb", 2, h(100)),
    cyan: i("cmyk", 0, h(100)),
    magenta: i("cmyk", 1, h(100)),
    yellow: i("cmyk", 2, h(100)),
    black: i("cmyk", 3, h(100)),
    x: i("xyz", 0, h(95.047)),
    y: i("xyz", 1, h(100)),
    z: i("xyz", 2, h(108.833)),
    l: i("lab", 0, h(100)),
    a: i("lab", 1),
    b: i("lab", 2),
    keyword(t) {
      return t !== void 0 ? new c(t) : e[this.model].keyword(this.color);
    },
    hex(t) {
      return t !== void 0 ? new c(t) : f.to.hex(this.rgb().round().color);
    },
    hexa(t) {
      if (t !== void 0)
        return new c(t);
      const g = this.rgb().round().color;
      let l = Math.round(this.valpha * 255).toString(16).toUpperCase();
      return l.length === 1 && (l = "0" + l), f.to.hex(g) + l;
    },
    rgbNumber() {
      const t = this.rgb().color;
      return (t[0] & 255) << 16 | (t[1] & 255) << 8 | t[2] & 255;
    },
    luminosity() {
      const t = this.rgb().color, g = [];
      for (const [l, d] of t.entries()) {
        const p = d / 255;
        g[l] = p <= 0.04045 ? p / 12.92 : ((p + 0.055) / 1.055) ** 2.4;
      }
      return 0.2126 * g[0] + 0.7152 * g[1] + 0.0722 * g[2];
    },
    contrast(t) {
      const g = this.luminosity(), l = t.luminosity();
      return g > l ? (g + 0.05) / (l + 0.05) : (l + 0.05) / (g + 0.05);
    },
    level(t) {
      const g = this.contrast(t);
      return g >= 7 ? "AAA" : g >= 4.5 ? "AA" : "";
    },
    isDark() {
      const t = this.rgb().color;
      return (t[0] * 2126 + t[1] * 7152 + t[2] * 722) / 1e4 < 128;
    },
    isLight() {
      return !this.isDark();
    },
    negate() {
      const t = this.rgb();
      for (let g = 0; g < 3; g++)
        t.color[g] = 255 - t.color[g];
      return t;
    },
    lighten(t) {
      const g = this.hsl();
      return g.color[2] += g.color[2] * t, g;
    },
    darken(t) {
      const g = this.hsl();
      return g.color[2] -= g.color[2] * t, g;
    },
    saturate(t) {
      const g = this.hsl();
      return g.color[1] += g.color[1] * t, g;
    },
    desaturate(t) {
      const g = this.hsl();
      return g.color[1] -= g.color[1] * t, g;
    },
    whiten(t) {
      const g = this.hwb();
      return g.color[1] += g.color[1] * t, g;
    },
    blacken(t) {
      const g = this.hwb();
      return g.color[2] += g.color[2] * t, g;
    },
    grayscale() {
      const t = this.rgb().color, g = t[0] * 0.3 + t[1] * 0.59 + t[2] * 0.11;
      return c.rgb(g, g, g);
    },
    fade(t) {
      return this.alpha(this.valpha - this.valpha * t);
    },
    opaquer(t) {
      return this.alpha(this.valpha + this.valpha * t);
    },
    rotate(t) {
      const g = this.hsl();
      let l = g.color[0];
      return l = (l + t) % 360, l = l < 0 ? 360 + l : l, g.color[0] = l, g;
    },
    mix(t, g) {
      if (!t || !t.rgb)
        throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof t);
      const l = t.rgb(), d = this.rgb(), p = g === void 0 ? 0.5 : g, y = 2 * p - 1, j = l.alpha() - d.alpha(), S = ((y * j === -1 ? y : (y + j) / (1 + y * j)) + 1) / 2, C = 1 - S;
      return c.rgb(
        S * l.red() + C * d.red(),
        S * l.green() + C * d.green(),
        S * l.blue() + C * d.blue(),
        l.alpha() * p + d.alpha() * (1 - p)
      );
    }
  };
  for (const t of Object.keys(e)) {
    if (b.includes(t))
      continue;
    const { channels: g } = e[t];
    c.prototype[t] = function(...l) {
      return this.model === t ? new c(this) : l.length > 0 ? new c(l, t) : new c([...a(e[this.model][t].raw(this.color)), this.valpha], t);
    }, c[t] = function(...l) {
      let d = l[0];
      return typeof d == "number" && (d = u(l, g)), new c(d, t);
    };
  }
  function s(t, g) {
    return Number(t.toFixed(g));
  }
  function o(t) {
    return function(g) {
      return s(g, t);
    };
  }
  function i(t, g, l) {
    t = Array.isArray(t) ? t : [t];
    for (const d of t)
      (n[d] || (n[d] = []))[g] = l;
    return t = t[0], function(d) {
      let p;
      return d !== void 0 ? (l && (d = l(d)), p = this[t](), p.color[g] = d, p) : (p = this[t]().color[g], l && (p = l(p)), p);
    };
  }
  function h(t) {
    return function(g) {
      return Math.max(0, Math.min(t, g));
    };
  }
  function a(t) {
    return Array.isArray(t) ? t : [t];
  }
  function u(t, g) {
    for (let l = 0; l < g; l++)
      typeof t[l] != "number" && (t[l] = 0);
    return t;
  }
  return Ce = c, Ce;
}
var Ne, Sr;
function kt() {
  if (Sr) return Ne;
  Sr = 1;
  const f = /* @__PURE__ */ He(), e = D(), b = Z(), v = {
    left: "low",
    center: "centre",
    centre: "centre",
    right: "high"
  };
  function n(u) {
    const { raw: t, density: g, limitInputPixels: l, ignoreIcc: d, unlimited: p, sequentialRead: y, failOn: j, failOnError: S, animated: C, page: F, pages: T, subifd: m } = u;
    return [t, g, l, d, p, y, j, S, C, F, T, m].some(e.defined) ? { raw: t, density: g, limitInputPixels: l, ignoreIcc: d, unlimited: p, sequentialRead: y, failOn: j, failOnError: S, animated: C, page: F, pages: T, subifd: m } : void 0;
  }
  function c(u, t, g) {
    const l = {
      failOn: "warning",
      limitInputPixels: Math.pow(16383, 2),
      ignoreIcc: !1,
      unlimited: !1,
      sequentialRead: !0
    };
    if (e.string(u))
      l.file = u;
    else if (e.buffer(u)) {
      if (u.length === 0)
        throw Error("Input Buffer is empty");
      l.buffer = u;
    } else if (e.arrayBuffer(u)) {
      if (u.byteLength === 0)
        throw Error("Input bit Array is empty");
      l.buffer = Buffer.from(u, 0, u.byteLength);
    } else if (e.typedArray(u)) {
      if (u.length === 0)
        throw Error("Input Bit Array is empty");
      l.buffer = Buffer.from(u.buffer, u.byteOffset, u.byteLength);
    } else if (e.plainObject(u) && !e.defined(t))
      t = u, n(t) && (l.buffer = []);
    else if (!e.defined(u) && !e.defined(t) && e.object(g) && g.allowStream)
      l.buffer = [];
    else
      throw new Error(`Unsupported input '${u}' of type ${typeof u}${e.defined(t) ? ` when also providing options of type ${typeof t}` : ""}`);
    if (e.object(t)) {
      if (e.defined(t.failOnError))
        if (e.bool(t.failOnError))
          l.failOn = t.failOnError ? "warning" : "none";
        else
          throw e.invalidParameterError("failOnError", "boolean", t.failOnError);
      if (e.defined(t.failOn))
        if (e.string(t.failOn) && e.inArray(t.failOn, ["none", "truncated", "error", "warning"]))
          l.failOn = t.failOn;
        else
          throw e.invalidParameterError("failOn", "one of: none, truncated, error, warning", t.failOn);
      if (e.defined(t.density))
        if (e.inRange(t.density, 1, 1e5))
          l.density = t.density;
        else
          throw e.invalidParameterError("density", "number between 1 and 100000", t.density);
      if (e.defined(t.ignoreIcc))
        if (e.bool(t.ignoreIcc))
          l.ignoreIcc = t.ignoreIcc;
        else
          throw e.invalidParameterError("ignoreIcc", "boolean", t.ignoreIcc);
      if (e.defined(t.limitInputPixels))
        if (e.bool(t.limitInputPixels))
          l.limitInputPixels = t.limitInputPixels ? Math.pow(16383, 2) : 0;
        else if (e.integer(t.limitInputPixels) && e.inRange(t.limitInputPixels, 0, Number.MAX_SAFE_INTEGER))
          l.limitInputPixels = t.limitInputPixels;
        else
          throw e.invalidParameterError("limitInputPixels", "positive integer", t.limitInputPixels);
      if (e.defined(t.unlimited))
        if (e.bool(t.unlimited))
          l.unlimited = t.unlimited;
        else
          throw e.invalidParameterError("unlimited", "boolean", t.unlimited);
      if (e.defined(t.sequentialRead))
        if (e.bool(t.sequentialRead))
          l.sequentialRead = t.sequentialRead;
        else
          throw e.invalidParameterError("sequentialRead", "boolean", t.sequentialRead);
      if (e.defined(t.raw))
        if (e.object(t.raw) && e.integer(t.raw.width) && t.raw.width > 0 && e.integer(t.raw.height) && t.raw.height > 0 && e.integer(t.raw.channels) && e.inRange(t.raw.channels, 1, 4))
          switch (l.rawWidth = t.raw.width, l.rawHeight = t.raw.height, l.rawChannels = t.raw.channels, l.rawPremultiplied = !!t.raw.premultiplied, u.constructor) {
            case Uint8Array:
            case Uint8ClampedArray:
              l.rawDepth = "uchar";
              break;
            case Int8Array:
              l.rawDepth = "char";
              break;
            case Uint16Array:
              l.rawDepth = "ushort";
              break;
            case Int16Array:
              l.rawDepth = "short";
              break;
            case Uint32Array:
              l.rawDepth = "uint";
              break;
            case Int32Array:
              l.rawDepth = "int";
              break;
            case Float32Array:
              l.rawDepth = "float";
              break;
            case Float64Array:
              l.rawDepth = "double";
              break;
            default:
              l.rawDepth = "uchar";
              break;
          }
        else
          throw new Error("Expected width, height and channels for raw pixel input");
      if (e.defined(t.animated))
        if (e.bool(t.animated))
          l.pages = t.animated ? -1 : 1;
        else
          throw e.invalidParameterError("animated", "boolean", t.animated);
      if (e.defined(t.pages))
        if (e.integer(t.pages) && e.inRange(t.pages, -1, 1e5))
          l.pages = t.pages;
        else
          throw e.invalidParameterError("pages", "integer between -1 and 100000", t.pages);
      if (e.defined(t.page))
        if (e.integer(t.page) && e.inRange(t.page, 0, 1e5))
          l.page = t.page;
        else
          throw e.invalidParameterError("page", "integer between 0 and 100000", t.page);
      if (e.defined(t.level))
        if (e.integer(t.level) && e.inRange(t.level, 0, 256))
          l.level = t.level;
        else
          throw e.invalidParameterError("level", "integer between 0 and 256", t.level);
      if (e.defined(t.subifd))
        if (e.integer(t.subifd) && e.inRange(t.subifd, -1, 1e5))
          l.subifd = t.subifd;
        else
          throw e.invalidParameterError("subifd", "integer between -1 and 100000", t.subifd);
      if (e.defined(t.create))
        if (e.object(t.create) && e.integer(t.create.width) && t.create.width > 0 && e.integer(t.create.height) && t.create.height > 0 && e.integer(t.create.channels)) {
          if (l.createWidth = t.create.width, l.createHeight = t.create.height, l.createChannels = t.create.channels, e.defined(t.create.noise)) {
            if (!e.object(t.create.noise))
              throw new Error("Expected noise to be an object");
            if (!e.inArray(t.create.noise.type, ["gaussian"]))
              throw new Error("Only gaussian noise is supported at the moment");
            if (!e.inRange(t.create.channels, 1, 4))
              throw e.invalidParameterError("create.channels", "number between 1 and 4", t.create.channels);
            if (l.createNoiseType = t.create.noise.type, e.number(t.create.noise.mean) && e.inRange(t.create.noise.mean, 0, 1e4))
              l.createNoiseMean = t.create.noise.mean;
            else
              throw e.invalidParameterError("create.noise.mean", "number between 0 and 10000", t.create.noise.mean);
            if (e.number(t.create.noise.sigma) && e.inRange(t.create.noise.sigma, 0, 1e4))
              l.createNoiseSigma = t.create.noise.sigma;
            else
              throw e.invalidParameterError("create.noise.sigma", "number between 0 and 10000", t.create.noise.sigma);
          } else if (e.defined(t.create.background)) {
            if (!e.inRange(t.create.channels, 3, 4))
              throw e.invalidParameterError("create.channels", "number between 3 and 4", t.create.channels);
            const d = f(t.create.background);
            l.createBackground = [
              d.red(),
              d.green(),
              d.blue(),
              Math.round(d.alpha() * 255)
            ];
          } else
            throw new Error("Expected valid noise or background to create a new input image");
          delete l.buffer;
        } else
          throw new Error("Expected valid width, height and channels to create a new input image");
      if (e.defined(t.text))
        if (e.object(t.text) && e.string(t.text.text)) {
          if (l.textValue = t.text.text, e.defined(t.text.height) && e.defined(t.text.dpi))
            throw new Error("Expected only one of dpi or height");
          if (e.defined(t.text.font))
            if (e.string(t.text.font))
              l.textFont = t.text.font;
            else
              throw e.invalidParameterError("text.font", "string", t.text.font);
          if (e.defined(t.text.fontfile))
            if (e.string(t.text.fontfile))
              l.textFontfile = t.text.fontfile;
            else
              throw e.invalidParameterError("text.fontfile", "string", t.text.fontfile);
          if (e.defined(t.text.width))
            if (e.integer(t.text.width) && t.text.width > 0)
              l.textWidth = t.text.width;
            else
              throw e.invalidParameterError("text.width", "positive integer", t.text.width);
          if (e.defined(t.text.height))
            if (e.integer(t.text.height) && t.text.height > 0)
              l.textHeight = t.text.height;
            else
              throw e.invalidParameterError("text.height", "positive integer", t.text.height);
          if (e.defined(t.text.align))
            if (e.string(t.text.align) && e.string(this.constructor.align[t.text.align]))
              l.textAlign = this.constructor.align[t.text.align];
            else
              throw e.invalidParameterError("text.align", "valid alignment", t.text.align);
          if (e.defined(t.text.justify))
            if (e.bool(t.text.justify))
              l.textJustify = t.text.justify;
            else
              throw e.invalidParameterError("text.justify", "boolean", t.text.justify);
          if (e.defined(t.text.dpi))
            if (e.integer(t.text.dpi) && e.inRange(t.text.dpi, 1, 1e6))
              l.textDpi = t.text.dpi;
            else
              throw e.invalidParameterError("text.dpi", "integer between 1 and 1000000", t.text.dpi);
          if (e.defined(t.text.rgba))
            if (e.bool(t.text.rgba))
              l.textRgba = t.text.rgba;
            else
              throw e.invalidParameterError("text.rgba", "bool", t.text.rgba);
          if (e.defined(t.text.spacing))
            if (e.integer(t.text.spacing) && e.inRange(t.text.spacing, -1e6, 1e6))
              l.textSpacing = t.text.spacing;
            else
              throw e.invalidParameterError("text.spacing", "integer between -1000000 and 1000000", t.text.spacing);
          if (e.defined(t.text.wrap))
            if (e.string(t.text.wrap) && e.inArray(t.text.wrap, ["word", "char", "word-char", "none"]))
              l.textWrap = t.text.wrap;
            else
              throw e.invalidParameterError("text.wrap", "one of: word, char, word-char, none", t.text.wrap);
          delete l.buffer;
        } else
          throw new Error("Expected a valid string to create an image with text.");
    } else if (e.defined(t))
      throw new Error("Invalid input options " + t);
    return l;
  }
  function s(u, t, g) {
    Array.isArray(this.options.input.buffer) ? e.buffer(u) ? (this.options.input.buffer.length === 0 && this.on("finish", () => {
      this.streamInFinished = !0;
    }), this.options.input.buffer.push(u), g()) : g(new Error("Non-Buffer data on Writable Stream")) : g(new Error("Unexpected data on Writable Stream"));
  }
  function o() {
    this._isStreamInput() && (this.options.input.buffer = Buffer.concat(this.options.input.buffer));
  }
  function i() {
    return Array.isArray(this.options.input.buffer);
  }
  function h(u) {
    const t = Error();
    return e.fn(u) ? (this._isStreamInput() ? this.on("finish", () => {
      this._flattenBufferIn(), b.metadata(this.options, (g, l) => {
        g ? u(e.nativeError(g, t)) : u(null, l);
      });
    }) : b.metadata(this.options, (g, l) => {
      g ? u(e.nativeError(g, t)) : u(null, l);
    }), this) : this._isStreamInput() ? new Promise((g, l) => {
      const d = () => {
        this._flattenBufferIn(), b.metadata(this.options, (p, y) => {
          p ? l(e.nativeError(p, t)) : g(y);
        });
      };
      this.writableFinished ? d() : this.once("finish", d);
    }) : new Promise((g, l) => {
      b.metadata(this.options, (d, p) => {
        d ? l(e.nativeError(d, t)) : g(p);
      });
    });
  }
  function a(u) {
    const t = Error();
    return e.fn(u) ? (this._isStreamInput() ? this.on("finish", () => {
      this._flattenBufferIn(), b.stats(this.options, (g, l) => {
        g ? u(e.nativeError(g, t)) : u(null, l);
      });
    }) : b.stats(this.options, (g, l) => {
      g ? u(e.nativeError(g, t)) : u(null, l);
    }), this) : this._isStreamInput() ? new Promise((g, l) => {
      this.on("finish", function() {
        this._flattenBufferIn(), b.stats(this.options, (d, p) => {
          d ? l(e.nativeError(d, t)) : g(p);
        });
      });
    }) : new Promise((g, l) => {
      b.stats(this.options, (d, p) => {
        d ? l(e.nativeError(d, t)) : g(p);
      });
    });
  }
  return Ne = function(u) {
    Object.assign(u.prototype, {
      // Private
      _inputOptionsFromObject: n,
      _createInputDescriptor: c,
      _write: s,
      _flattenBufferIn: o,
      _isStreamInput: i,
      // Public
      metadata: h,
      stats: a
    }), u.align = v;
  }, Ne;
}
var Oe, jr;
function qt() {
  if (jr) return Oe;
  jr = 1;
  const f = D(), e = {
    center: 0,
    centre: 0,
    north: 1,
    east: 2,
    south: 3,
    west: 4,
    northeast: 5,
    southeast: 6,
    southwest: 7,
    northwest: 8
  }, b = {
    top: 1,
    right: 2,
    bottom: 3,
    left: 4,
    "right top": 5,
    "right bottom": 6,
    "left bottom": 7,
    "left top": 8
  }, v = {
    background: "background",
    copy: "copy",
    repeat: "repeat",
    mirror: "mirror"
  }, n = {
    entropy: 16,
    attention: 17
  }, c = {
    nearest: "nearest",
    linear: "linear",
    cubic: "cubic",
    mitchell: "mitchell",
    lanczos2: "lanczos2",
    lanczos3: "lanczos3"
  }, s = {
    contain: "contain",
    cover: "cover",
    fill: "fill",
    inside: "inside",
    outside: "outside"
  }, o = {
    contain: "embed",
    cover: "crop",
    fill: "ignore_aspect",
    inside: "max",
    outside: "min"
  };
  function i(l) {
    return l.angle % 360 !== 0 || l.useExifOrientation === !0 || l.rotationAngle !== 0;
  }
  function h(l) {
    return l.width !== -1 || l.height !== -1;
  }
  function a(l, d, p) {
    if (h(this.options) && this.options.debuglog("ignoring previous resize options"), this.options.widthPost !== -1 && this.options.debuglog("operation order will be: extract, resize, extract"), f.defined(l))
      if (f.object(l) && !f.defined(p))
        p = l;
      else if (f.integer(l) && l > 0)
        this.options.width = l;
      else
        throw f.invalidParameterError("width", "positive integer", l);
    else
      this.options.width = -1;
    if (f.defined(d))
      if (f.integer(d) && d > 0)
        this.options.height = d;
      else
        throw f.invalidParameterError("height", "positive integer", d);
    else
      this.options.height = -1;
    if (f.object(p)) {
      if (f.defined(p.width))
        if (f.integer(p.width) && p.width > 0)
          this.options.width = p.width;
        else
          throw f.invalidParameterError("width", "positive integer", p.width);
      if (f.defined(p.height))
        if (f.integer(p.height) && p.height > 0)
          this.options.height = p.height;
        else
          throw f.invalidParameterError("height", "positive integer", p.height);
      if (f.defined(p.fit)) {
        const y = o[p.fit];
        if (f.string(y))
          this.options.canvas = y;
        else
          throw f.invalidParameterError("fit", "valid fit", p.fit);
      }
      if (f.defined(p.position)) {
        const y = f.integer(p.position) ? p.position : n[p.position] || b[p.position] || e[p.position];
        if (f.integer(y) && (f.inRange(y, 0, 8) || f.inRange(y, 16, 17)))
          this.options.position = y;
        else
          throw f.invalidParameterError("position", "valid position/gravity/strategy", p.position);
      }
      if (this._setBackgroundColourOption("resizeBackground", p.background), f.defined(p.kernel))
        if (f.string(c[p.kernel]))
          this.options.kernel = c[p.kernel];
        else
          throw f.invalidParameterError("kernel", "valid kernel name", p.kernel);
      f.defined(p.withoutEnlargement) && this._setBooleanOption("withoutEnlargement", p.withoutEnlargement), f.defined(p.withoutReduction) && this._setBooleanOption("withoutReduction", p.withoutReduction), f.defined(p.fastShrinkOnLoad) && this._setBooleanOption("fastShrinkOnLoad", p.fastShrinkOnLoad);
    }
    return i(this.options) && h(this.options) && (this.options.rotateBeforePreExtract = !0), this;
  }
  function u(l) {
    if (f.integer(l) && l > 0)
      this.options.extendTop = l, this.options.extendBottom = l, this.options.extendLeft = l, this.options.extendRight = l;
    else if (f.object(l)) {
      if (f.defined(l.top))
        if (f.integer(l.top) && l.top >= 0)
          this.options.extendTop = l.top;
        else
          throw f.invalidParameterError("top", "positive integer", l.top);
      if (f.defined(l.bottom))
        if (f.integer(l.bottom) && l.bottom >= 0)
          this.options.extendBottom = l.bottom;
        else
          throw f.invalidParameterError("bottom", "positive integer", l.bottom);
      if (f.defined(l.left))
        if (f.integer(l.left) && l.left >= 0)
          this.options.extendLeft = l.left;
        else
          throw f.invalidParameterError("left", "positive integer", l.left);
      if (f.defined(l.right))
        if (f.integer(l.right) && l.right >= 0)
          this.options.extendRight = l.right;
        else
          throw f.invalidParameterError("right", "positive integer", l.right);
      if (this._setBackgroundColourOption("extendBackground", l.background), f.defined(l.extendWith))
        if (f.string(v[l.extendWith]))
          this.options.extendWith = v[l.extendWith];
        else
          throw f.invalidParameterError("extendWith", "one of: background, copy, repeat, mirror", l.extendWith);
    } else
      throw f.invalidParameterError("extend", "integer or object", l);
    return this;
  }
  function t(l) {
    const d = h(this.options) || this.options.widthPre !== -1 ? "Post" : "Pre";
    return this.options[`width${d}`] !== -1 && this.options.debuglog("ignoring previous extract options"), ["left", "top", "width", "height"].forEach(function(p) {
      const y = l[p];
      if (f.integer(y) && y >= 0)
        this.options[p + (p === "left" || p === "top" ? "Offset" : "") + d] = y;
      else
        throw f.invalidParameterError(p, "integer", y);
    }, this), i(this.options) && !h(this.options) && (this.options.widthPre === -1 || this.options.widthPost === -1) && (this.options.rotateBeforePreExtract = !0), this;
  }
  function g(l) {
    if (this.options.trimThreshold = 10, f.defined(l))
      if (f.object(l)) {
        if (f.defined(l.background) && this._setBackgroundColourOption("trimBackground", l.background), f.defined(l.threshold))
          if (f.number(l.threshold) && l.threshold >= 0)
            this.options.trimThreshold = l.threshold;
          else
            throw f.invalidParameterError("threshold", "positive number", l.threshold);
        f.defined(l.lineArt) && this._setBooleanOption("trimLineArt", l.lineArt);
      } else
        throw f.invalidParameterError("trim", "object", l);
    return i(this.options) && (this.options.rotateBeforePreExtract = !0), this;
  }
  return Oe = function(l) {
    Object.assign(l.prototype, {
      resize: a,
      extend: u,
      extract: t,
      trim: g
    }), l.gravity = e, l.strategy = n, l.kernel = c, l.fit = s, l.position = b;
  }, Oe;
}
var Fe, kr;
function Ct() {
  if (kr) return Fe;
  kr = 1;
  const f = D(), e = {
    clear: "clear",
    source: "source",
    over: "over",
    in: "in",
    out: "out",
    atop: "atop",
    dest: "dest",
    "dest-over": "dest-over",
    "dest-in": "dest-in",
    "dest-out": "dest-out",
    "dest-atop": "dest-atop",
    xor: "xor",
    add: "add",
    saturate: "saturate",
    multiply: "multiply",
    screen: "screen",
    overlay: "overlay",
    darken: "darken",
    lighten: "lighten",
    "colour-dodge": "colour-dodge",
    "color-dodge": "colour-dodge",
    "colour-burn": "colour-burn",
    "color-burn": "colour-burn",
    "hard-light": "hard-light",
    "soft-light": "soft-light",
    difference: "difference",
    exclusion: "exclusion"
  };
  function b(v) {
    if (!Array.isArray(v))
      throw f.invalidParameterError("images to composite", "array", v);
    return this.options.composite = v.map((n) => {
      if (!f.object(n))
        throw f.invalidParameterError("image to composite", "object", n);
      const c = this._inputOptionsFromObject(n), s = {
        input: this._createInputDescriptor(n.input, c, { allowStream: !1 }),
        blend: "over",
        tile: !1,
        left: 0,
        top: 0,
        hasOffset: !1,
        gravity: 0,
        premultiplied: !1
      };
      if (f.defined(n.blend))
        if (f.string(e[n.blend]))
          s.blend = e[n.blend];
        else
          throw f.invalidParameterError("blend", "valid blend name", n.blend);
      if (f.defined(n.tile))
        if (f.bool(n.tile))
          s.tile = n.tile;
        else
          throw f.invalidParameterError("tile", "boolean", n.tile);
      if (f.defined(n.left))
        if (f.integer(n.left))
          s.left = n.left;
        else
          throw f.invalidParameterError("left", "integer", n.left);
      if (f.defined(n.top))
        if (f.integer(n.top))
          s.top = n.top;
        else
          throw f.invalidParameterError("top", "integer", n.top);
      if (f.defined(n.top) !== f.defined(n.left))
        throw new Error("Expected both left and top to be set");
      if (s.hasOffset = f.integer(n.top) && f.integer(n.left), f.defined(n.gravity))
        if (f.integer(n.gravity) && f.inRange(n.gravity, 0, 8))
          s.gravity = n.gravity;
        else if (f.string(n.gravity) && f.integer(this.constructor.gravity[n.gravity]))
          s.gravity = this.constructor.gravity[n.gravity];
        else
          throw f.invalidParameterError("gravity", "valid gravity", n.gravity);
      if (f.defined(n.premultiplied))
        if (f.bool(n.premultiplied))
          s.premultiplied = n.premultiplied;
        else
          throw f.invalidParameterError("premultiplied", "boolean", n.premultiplied);
      return s;
    }), this;
  }
  return Fe = function(v) {
    v.prototype.composite = b, v.blend = e;
  }, Fe;
}
var Te, qr;
function Nt() {
  if (qr) return Te;
  qr = 1;
  const f = /* @__PURE__ */ He(), e = D(), b = {
    integer: "integer",
    float: "float",
    approximate: "approximate"
  };
  function v(m, x) {
    if ((this.options.useExifOrientation || this.options.angle || this.options.rotationAngle) && this.options.debuglog("ignoring previous rotate options"), !e.defined(m))
      this.options.useExifOrientation = !0;
    else if (e.integer(m) && !(m % 90))
      this.options.angle = m;
    else if (e.number(m)) {
      if (this.options.rotationAngle = m, e.object(x) && x.background) {
        const q = f(x.background);
        this.options.rotationBackground = [
          q.red(),
          q.green(),
          q.blue(),
          Math.round(q.alpha() * 255)
        ];
      }
    } else
      throw e.invalidParameterError("angle", "numeric", m);
    return this;
  }
  function n(m) {
    return this.options.flip = e.bool(m) ? m : !0, this;
  }
  function c(m) {
    return this.options.flop = e.bool(m) ? m : !0, this;
  }
  function s(m, x) {
    const q = [].concat(...m);
    if (q.length === 4 && q.every(e.number))
      this.options.affineMatrix = q;
    else
      throw e.invalidParameterError("matrix", "1x4 or 2x2 array", m);
    if (e.defined(x))
      if (e.object(x)) {
        if (this._setBackgroundColourOption("affineBackground", x.background), e.defined(x.idx))
          if (e.number(x.idx))
            this.options.affineIdx = x.idx;
          else
            throw e.invalidParameterError("options.idx", "number", x.idx);
        if (e.defined(x.idy))
          if (e.number(x.idy))
            this.options.affineIdy = x.idy;
          else
            throw e.invalidParameterError("options.idy", "number", x.idy);
        if (e.defined(x.odx))
          if (e.number(x.odx))
            this.options.affineOdx = x.odx;
          else
            throw e.invalidParameterError("options.odx", "number", x.odx);
        if (e.defined(x.ody))
          if (e.number(x.ody))
            this.options.affineOdy = x.ody;
          else
            throw e.invalidParameterError("options.ody", "number", x.ody);
        if (e.defined(x.interpolator))
          if (e.inArray(x.interpolator, Object.values(this.constructor.interpolators)))
            this.options.affineInterpolator = x.interpolator;
          else
            throw e.invalidParameterError("options.interpolator", "valid interpolator name", x.interpolator);
      } else
        throw e.invalidParameterError("options", "object", x);
    return this;
  }
  function o(m, x, q) {
    if (!e.defined(m))
      this.options.sharpenSigma = -1;
    else if (e.bool(m))
      this.options.sharpenSigma = m ? -1 : 0;
    else if (e.number(m) && e.inRange(m, 0.01, 1e4)) {
      if (this.options.sharpenSigma = m, e.defined(x))
        if (e.number(x) && e.inRange(x, 0, 1e4))
          this.options.sharpenM1 = x;
        else
          throw e.invalidParameterError("flat", "number between 0 and 10000", x);
      if (e.defined(q))
        if (e.number(q) && e.inRange(q, 0, 1e4))
          this.options.sharpenM2 = q;
        else
          throw e.invalidParameterError("jagged", "number between 0 and 10000", q);
    } else if (e.plainObject(m)) {
      if (e.number(m.sigma) && e.inRange(m.sigma, 1e-6, 10))
        this.options.sharpenSigma = m.sigma;
      else
        throw e.invalidParameterError("options.sigma", "number between 0.000001 and 10", m.sigma);
      if (e.defined(m.m1))
        if (e.number(m.m1) && e.inRange(m.m1, 0, 1e6))
          this.options.sharpenM1 = m.m1;
        else
          throw e.invalidParameterError("options.m1", "number between 0 and 1000000", m.m1);
      if (e.defined(m.m2))
        if (e.number(m.m2) && e.inRange(m.m2, 0, 1e6))
          this.options.sharpenM2 = m.m2;
        else
          throw e.invalidParameterError("options.m2", "number between 0 and 1000000", m.m2);
      if (e.defined(m.x1))
        if (e.number(m.x1) && e.inRange(m.x1, 0, 1e6))
          this.options.sharpenX1 = m.x1;
        else
          throw e.invalidParameterError("options.x1", "number between 0 and 1000000", m.x1);
      if (e.defined(m.y2))
        if (e.number(m.y2) && e.inRange(m.y2, 0, 1e6))
          this.options.sharpenY2 = m.y2;
        else
          throw e.invalidParameterError("options.y2", "number between 0 and 1000000", m.y2);
      if (e.defined(m.y3))
        if (e.number(m.y3) && e.inRange(m.y3, 0, 1e6))
          this.options.sharpenY3 = m.y3;
        else
          throw e.invalidParameterError("options.y3", "number between 0 and 1000000", m.y3);
    } else
      throw e.invalidParameterError("sigma", "number between 0.01 and 10000", m);
    return this;
  }
  function i(m) {
    if (!e.defined(m))
      this.options.medianSize = 3;
    else if (e.integer(m) && e.inRange(m, 1, 1e3))
      this.options.medianSize = m;
    else
      throw e.invalidParameterError("size", "integer between 1 and 1000", m);
    return this;
  }
  function h(m) {
    let x;
    if (e.number(m))
      x = m;
    else if (e.plainObject(m)) {
      if (!e.number(m.sigma))
        throw e.invalidParameterError("options.sigma", "number between 0.3 and 1000", x);
      if (x = m.sigma, "precision" in m)
        if (e.string(b[m.precision]))
          this.options.precision = b[m.precision];
        else
          throw e.invalidParameterError("precision", "one of: integer, float, approximate", m.precision);
      if ("minAmplitude" in m)
        if (e.number(m.minAmplitude) && e.inRange(m.minAmplitude, 1e-3, 1))
          this.options.minAmpl = m.minAmplitude;
        else
          throw e.invalidParameterError("minAmplitude", "number between 0.001 and 1", m.minAmplitude);
    }
    if (!e.defined(m))
      this.options.blurSigma = -1;
    else if (e.bool(m))
      this.options.blurSigma = m ? -1 : 0;
    else if (e.number(x) && e.inRange(x, 0.3, 1e3))
      this.options.blurSigma = x;
    else
      throw e.invalidParameterError("sigma", "number between 0.3 and 1000", x);
    return this;
  }
  function a(m) {
    return this.options.flatten = e.bool(m) ? m : !0, e.object(m) && this._setBackgroundColourOption("flattenBackground", m.background), this;
  }
  function u() {
    return this.options.unflatten = !0, this;
  }
  function t(m, x) {
    if (!e.defined(m))
      this.options.gamma = 2.2;
    else if (e.number(m) && e.inRange(m, 1, 3))
      this.options.gamma = m;
    else
      throw e.invalidParameterError("gamma", "number between 1.0 and 3.0", m);
    if (!e.defined(x))
      this.options.gammaOut = this.options.gamma;
    else if (e.number(x) && e.inRange(x, 1, 3))
      this.options.gammaOut = x;
    else
      throw e.invalidParameterError("gammaOut", "number between 1.0 and 3.0", x);
    return this;
  }
  function g(m) {
    if (this.options.negate = e.bool(m) ? m : !0, e.plainObject(m) && "alpha" in m)
      if (e.bool(m.alpha))
        this.options.negateAlpha = m.alpha;
      else
        throw e.invalidParameterError("alpha", "should be boolean value", m.alpha);
    return this;
  }
  function l(m) {
    if (e.plainObject(m)) {
      if (e.defined(m.lower))
        if (e.number(m.lower) && e.inRange(m.lower, 0, 99))
          this.options.normaliseLower = m.lower;
        else
          throw e.invalidParameterError("lower", "number between 0 and 99", m.lower);
      if (e.defined(m.upper))
        if (e.number(m.upper) && e.inRange(m.upper, 1, 100))
          this.options.normaliseUpper = m.upper;
        else
          throw e.invalidParameterError("upper", "number between 1 and 100", m.upper);
    }
    if (this.options.normaliseLower >= this.options.normaliseUpper)
      throw e.invalidParameterError(
        "range",
        "lower to be less than upper",
        `${this.options.normaliseLower} >= ${this.options.normaliseUpper}`
      );
    return this.options.normalise = !0, this;
  }
  function d(m) {
    return this.normalise(m);
  }
  function p(m) {
    if (e.plainObject(m)) {
      if (e.integer(m.width) && m.width > 0)
        this.options.claheWidth = m.width;
      else
        throw e.invalidParameterError("width", "integer greater than zero", m.width);
      if (e.integer(m.height) && m.height > 0)
        this.options.claheHeight = m.height;
      else
        throw e.invalidParameterError("height", "integer greater than zero", m.height);
      if (e.defined(m.maxSlope))
        if (e.integer(m.maxSlope) && e.inRange(m.maxSlope, 0, 100))
          this.options.claheMaxSlope = m.maxSlope;
        else
          throw e.invalidParameterError("maxSlope", "integer between 0 and 100", m.maxSlope);
    } else
      throw e.invalidParameterError("options", "plain object", m);
    return this;
  }
  function y(m) {
    if (!e.object(m) || !Array.isArray(m.kernel) || !e.integer(m.width) || !e.integer(m.height) || !e.inRange(m.width, 3, 1001) || !e.inRange(m.height, 3, 1001) || m.height * m.width !== m.kernel.length)
      throw new Error("Invalid convolution kernel");
    return e.integer(m.scale) || (m.scale = m.kernel.reduce(function(x, q) {
      return x + q;
    }, 0)), m.scale < 1 && (m.scale = 1), e.integer(m.offset) || (m.offset = 0), this.options.convKernel = m, this;
  }
  function j(m, x) {
    if (!e.defined(m))
      this.options.threshold = 128;
    else if (e.bool(m))
      this.options.threshold = m ? 128 : 0;
    else if (e.integer(m) && e.inRange(m, 0, 255))
      this.options.threshold = m;
    else
      throw e.invalidParameterError("threshold", "integer between 0 and 255", m);
    return !e.object(x) || x.greyscale === !0 || x.grayscale === !0 ? this.options.thresholdGrayscale = !0 : this.options.thresholdGrayscale = !1, this;
  }
  function S(m, x, q) {
    if (this.options.boolean = this._createInputDescriptor(m, q), e.string(x) && e.inArray(x, ["and", "or", "eor"]))
      this.options.booleanOp = x;
    else
      throw e.invalidParameterError("operator", "one of: and, or, eor", x);
    return this;
  }
  function C(m, x) {
    if (!e.defined(m) && e.number(x) ? m = 1 : e.number(m) && !e.defined(x) && (x = 0), !e.defined(m))
      this.options.linearA = [];
    else if (e.number(m))
      this.options.linearA = [m];
    else if (Array.isArray(m) && m.length && m.every(e.number))
      this.options.linearA = m;
    else
      throw e.invalidParameterError("a", "number or array of numbers", m);
    if (!e.defined(x))
      this.options.linearB = [];
    else if (e.number(x))
      this.options.linearB = [x];
    else if (Array.isArray(x) && x.length && x.every(e.number))
      this.options.linearB = x;
    else
      throw e.invalidParameterError("b", "number or array of numbers", x);
    if (this.options.linearA.length !== this.options.linearB.length)
      throw new Error("Expected a and b to be arrays of the same length");
    return this;
  }
  function F(m) {
    if (!Array.isArray(m))
      throw e.invalidParameterError("inputMatrix", "array", m);
    if (m.length !== 3 && m.length !== 4)
      throw e.invalidParameterError("inputMatrix", "3x3 or 4x4 array", m.length);
    const x = m.flat().map(Number);
    if (x.length !== 9 && x.length !== 16)
      throw e.invalidParameterError("inputMatrix", "cardinality of 9 or 16", x.length);
    return this.options.recombMatrix = x, this;
  }
  function T(m) {
    if (!e.plainObject(m))
      throw e.invalidParameterError("options", "plain object", m);
    if ("brightness" in m)
      if (e.number(m.brightness) && m.brightness >= 0)
        this.options.brightness = m.brightness;
      else
        throw e.invalidParameterError("brightness", "number above zero", m.brightness);
    if ("saturation" in m)
      if (e.number(m.saturation) && m.saturation >= 0)
        this.options.saturation = m.saturation;
      else
        throw e.invalidParameterError("saturation", "number above zero", m.saturation);
    if ("hue" in m)
      if (e.integer(m.hue))
        this.options.hue = m.hue % 360;
      else
        throw e.invalidParameterError("hue", "number", m.hue);
    if ("lightness" in m)
      if (e.number(m.lightness))
        this.options.lightness = m.lightness;
      else
        throw e.invalidParameterError("lightness", "number", m.lightness);
    return this;
  }
  return Te = function(m) {
    Object.assign(m.prototype, {
      rotate: v,
      flip: n,
      flop: c,
      affine: s,
      sharpen: o,
      median: i,
      blur: h,
      flatten: a,
      unflatten: u,
      gamma: t,
      negate: g,
      normalise: l,
      normalize: d,
      clahe: p,
      convolve: y,
      threshold: j,
      boolean: S,
      linear: C,
      recomb: F,
      modulate: T
    });
  }, Te;
}
var _e, Cr;
function Ot() {
  if (Cr) return _e;
  Cr = 1;
  const f = /* @__PURE__ */ He(), e = D(), b = {
    multiband: "multiband",
    "b-w": "b-w",
    bw: "b-w",
    cmyk: "cmyk",
    srgb: "srgb"
  };
  function v(u) {
    return this._setBackgroundColourOption("tint", u), this;
  }
  function n(u) {
    return this.options.greyscale = e.bool(u) ? u : !0, this;
  }
  function c(u) {
    return this.greyscale(u);
  }
  function s(u) {
    if (!e.string(u))
      throw e.invalidParameterError("colourspace", "string", u);
    return this.options.colourspacePipeline = u, this;
  }
  function o(u) {
    return this.pipelineColourspace(u);
  }
  function i(u) {
    if (!e.string(u))
      throw e.invalidParameterError("colourspace", "string", u);
    return this.options.colourspace = u, this;
  }
  function h(u) {
    return this.toColourspace(u);
  }
  function a(u, t) {
    if (e.defined(t))
      if (e.object(t) || e.string(t)) {
        const g = f(t);
        this.options[u] = [
          g.red(),
          g.green(),
          g.blue(),
          Math.round(g.alpha() * 255)
        ];
      } else
        throw e.invalidParameterError("background", "object or string", t);
  }
  return _e = function(u) {
    Object.assign(u.prototype, {
      // Public
      tint: v,
      greyscale: n,
      grayscale: c,
      pipelineColourspace: s,
      pipelineColorspace: o,
      toColourspace: i,
      toColorspace: h,
      // Private
      _setBackgroundColourOption: a
    }), u.colourspace = b, u.colorspace = b;
  }, _e;
}
var Be, Nr;
function Ft() {
  if (Nr) return Be;
  Nr = 1;
  const f = D(), e = {
    and: "and",
    or: "or",
    eor: "eor"
  };
  function b() {
    return this.options.removeAlpha = !0, this;
  }
  function v(o) {
    if (f.defined(o))
      if (f.number(o) && f.inRange(o, 0, 1))
        this.options.ensureAlpha = o;
      else
        throw f.invalidParameterError("alpha", "number between 0 and 1", o);
    else
      this.options.ensureAlpha = 1;
    return this;
  }
  function n(o) {
    const i = { red: 0, green: 1, blue: 2, alpha: 3 };
    if (Object.keys(i).includes(o) && (o = i[o]), f.integer(o) && f.inRange(o, 0, 4))
      this.options.extractChannel = o;
    else
      throw f.invalidParameterError("channel", "integer or one of: red, green, blue, alpha", o);
    return this;
  }
  function c(o, i) {
    return Array.isArray(o) ? o.forEach(function(h) {
      this.options.joinChannelIn.push(this._createInputDescriptor(h, i));
    }, this) : this.options.joinChannelIn.push(this._createInputDescriptor(o, i)), this;
  }
  function s(o) {
    if (f.string(o) && f.inArray(o, ["and", "or", "eor"]))
      this.options.bandBoolOp = o;
    else
      throw f.invalidParameterError("boolOp", "one of: and, or, eor", o);
    return this;
  }
  return Be = function(o) {
    Object.assign(o.prototype, {
      // Public instance functions
      removeAlpha: b,
      ensureAlpha: v,
      extractChannel: n,
      joinChannel: c,
      bandbool: s
    }), o.bool = e;
  }, Be;
}
var De, Or;
function Tt() {
  if (Or) return De;
  Or = 1;
  const f = U, e = D(), b = Z(), v = /* @__PURE__ */ new Map([
    ["heic", "heif"],
    ["heif", "heif"],
    ["avif", "avif"],
    ["jpeg", "jpeg"],
    ["jpg", "jpeg"],
    ["jpe", "jpeg"],
    ["tile", "tile"],
    ["dz", "tile"],
    ["png", "png"],
    ["raw", "raw"],
    ["tiff", "tiff"],
    ["tif", "tiff"],
    ["webp", "webp"],
    ["gif", "gif"],
    ["jp2", "jp2"],
    ["jpx", "jp2"],
    ["j2k", "jp2"],
    ["j2c", "jp2"],
    ["jxl", "jxl"]
  ]), n = /\.(jp[2x]|j2[kc])$/i, c = () => new Error("JP2 output requires libvips with support for OpenJPEG"), s = (r) => 1 << 31 - Math.clz32(Math.ceil(Math.log2(r)));
  function o(r, E) {
    let $;
    if (e.string(r) ? e.string(this.options.input.file) && f.resolve(this.options.input.file) === f.resolve(r) ? $ = new Error("Cannot use same file for input and output") : n.test(f.extname(r)) && !this.constructor.format.jp2k.output.file && ($ = c()) : $ = new Error("Missing output file path"), $)
      if (e.fn(E))
        E($);
      else
        return Promise.reject($);
    else {
      this.options.fileOut = r;
      const L = Error();
      return this._pipeline(E, L);
    }
    return this;
  }
  function i(r, E) {
    e.object(r) ? this._setBooleanOption("resolveWithObject", r.resolveWithObject) : this.options.resolveWithObject && (this.options.resolveWithObject = !1), this.options.fileOut = "";
    const $ = Error();
    return this._pipeline(e.fn(r) ? r : E, $);
  }
  function h() {
    return this.options.keepMetadata |= 1, this;
  }
  function a(r) {
    if (e.object(r))
      for (const [E, $] of Object.entries(r))
        if (e.object($))
          for (const [L, A] of Object.entries($))
            if (e.string(A))
              this.options.withExif[`exif-${E.toLowerCase()}-${L}`] = A;
            else
              throw e.invalidParameterError(`${E}.${L}`, "string", A);
        else
          throw e.invalidParameterError(E, "object", $);
    else
      throw e.invalidParameterError("exif", "object", r);
    return this.options.withExifMerge = !1, this.keepExif();
  }
  function u(r) {
    return this.withExif(r), this.options.withExifMerge = !0, this;
  }
  function t() {
    return this.options.keepMetadata |= 8, this;
  }
  function g(r, E) {
    if (e.string(r))
      this.options.withIccProfile = r;
    else
      throw e.invalidParameterError("icc", "string", r);
    if (this.keepIccProfile(), e.object(E) && e.defined(E.attach))
      if (e.bool(E.attach))
        E.attach || (this.options.keepMetadata &= -9);
      else
        throw e.invalidParameterError("attach", "boolean", E.attach);
    return this;
  }
  function l() {
    return this.options.keepMetadata = 31, this;
  }
  function d(r) {
    if (this.keepMetadata(), this.withIccProfile("srgb"), e.object(r)) {
      if (e.defined(r.orientation))
        if (e.integer(r.orientation) && e.inRange(r.orientation, 1, 8))
          this.options.withMetadataOrientation = r.orientation;
        else
          throw e.invalidParameterError("orientation", "integer between 1 and 8", r.orientation);
      if (e.defined(r.density))
        if (e.number(r.density) && r.density > 0)
          this.options.withMetadataDensity = r.density;
        else
          throw e.invalidParameterError("density", "positive number", r.density);
      e.defined(r.icc) && this.withIccProfile(r.icc), e.defined(r.exif) && this.withExifMerge(r.exif);
    }
    return this;
  }
  function p(r, E) {
    const $ = v.get((e.object(r) && e.string(r.id) ? r.id : r).toLowerCase());
    if (!$)
      throw e.invalidParameterError("format", `one of: ${[...v.keys()].join(", ")}`, r);
    return this[$](E);
  }
  function y(r) {
    if (e.object(r)) {
      if (e.defined(r.quality))
        if (e.integer(r.quality) && e.inRange(r.quality, 1, 100))
          this.options.jpegQuality = r.quality;
        else
          throw e.invalidParameterError("quality", "integer between 1 and 100", r.quality);
      if (e.defined(r.progressive) && this._setBooleanOption("jpegProgressive", r.progressive), e.defined(r.chromaSubsampling))
        if (e.string(r.chromaSubsampling) && e.inArray(r.chromaSubsampling, ["4:2:0", "4:4:4"]))
          this.options.jpegChromaSubsampling = r.chromaSubsampling;
        else
          throw e.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", r.chromaSubsampling);
      const E = e.bool(r.optimizeCoding) ? r.optimizeCoding : r.optimiseCoding;
      if (e.defined(E) && this._setBooleanOption("jpegOptimiseCoding", E), e.defined(r.mozjpeg))
        if (e.bool(r.mozjpeg))
          r.mozjpeg && (this.options.jpegTrellisQuantisation = !0, this.options.jpegOvershootDeringing = !0, this.options.jpegOptimiseScans = !0, this.options.jpegProgressive = !0, this.options.jpegQuantisationTable = 3);
        else
          throw e.invalidParameterError("mozjpeg", "boolean", r.mozjpeg);
      const $ = e.bool(r.trellisQuantization) ? r.trellisQuantization : r.trellisQuantisation;
      e.defined($) && this._setBooleanOption("jpegTrellisQuantisation", $), e.defined(r.overshootDeringing) && this._setBooleanOption("jpegOvershootDeringing", r.overshootDeringing);
      const L = e.bool(r.optimizeScans) ? r.optimizeScans : r.optimiseScans;
      e.defined(L) && (this._setBooleanOption("jpegOptimiseScans", L), L && (this.options.jpegProgressive = !0));
      const A = e.number(r.quantizationTable) ? r.quantizationTable : r.quantisationTable;
      if (e.defined(A))
        if (e.integer(A) && e.inRange(A, 0, 8))
          this.options.jpegQuantisationTable = A;
        else
          throw e.invalidParameterError("quantisationTable", "integer between 0 and 8", A);
    }
    return this._updateFormatOut("jpeg", r);
  }
  function j(r) {
    if (e.object(r)) {
      if (e.defined(r.progressive) && this._setBooleanOption("pngProgressive", r.progressive), e.defined(r.compressionLevel))
        if (e.integer(r.compressionLevel) && e.inRange(r.compressionLevel, 0, 9))
          this.options.pngCompressionLevel = r.compressionLevel;
        else
          throw e.invalidParameterError("compressionLevel", "integer between 0 and 9", r.compressionLevel);
      e.defined(r.adaptiveFiltering) && this._setBooleanOption("pngAdaptiveFiltering", r.adaptiveFiltering);
      const E = r.colours || r.colors;
      if (e.defined(E))
        if (e.integer(E) && e.inRange(E, 2, 256))
          this.options.pngBitdepth = s(E);
        else
          throw e.invalidParameterError("colours", "integer between 2 and 256", E);
      if (e.defined(r.palette) ? this._setBooleanOption("pngPalette", r.palette) : [r.quality, r.effort, r.colours, r.colors, r.dither].some(e.defined) && this._setBooleanOption("pngPalette", !0), this.options.pngPalette) {
        if (e.defined(r.quality))
          if (e.integer(r.quality) && e.inRange(r.quality, 0, 100))
            this.options.pngQuality = r.quality;
          else
            throw e.invalidParameterError("quality", "integer between 0 and 100", r.quality);
        if (e.defined(r.effort))
          if (e.integer(r.effort) && e.inRange(r.effort, 1, 10))
            this.options.pngEffort = r.effort;
          else
            throw e.invalidParameterError("effort", "integer between 1 and 10", r.effort);
        if (e.defined(r.dither))
          if (e.number(r.dither) && e.inRange(r.dither, 0, 1))
            this.options.pngDither = r.dither;
          else
            throw e.invalidParameterError("dither", "number between 0.0 and 1.0", r.dither);
      }
    }
    return this._updateFormatOut("png", r);
  }
  function S(r) {
    if (e.object(r)) {
      if (e.defined(r.quality))
        if (e.integer(r.quality) && e.inRange(r.quality, 1, 100))
          this.options.webpQuality = r.quality;
        else
          throw e.invalidParameterError("quality", "integer between 1 and 100", r.quality);
      if (e.defined(r.alphaQuality))
        if (e.integer(r.alphaQuality) && e.inRange(r.alphaQuality, 0, 100))
          this.options.webpAlphaQuality = r.alphaQuality;
        else
          throw e.invalidParameterError("alphaQuality", "integer between 0 and 100", r.alphaQuality);
      if (e.defined(r.lossless) && this._setBooleanOption("webpLossless", r.lossless), e.defined(r.nearLossless) && this._setBooleanOption("webpNearLossless", r.nearLossless), e.defined(r.smartSubsample) && this._setBooleanOption("webpSmartSubsample", r.smartSubsample), e.defined(r.preset))
        if (e.string(r.preset) && e.inArray(r.preset, ["default", "photo", "picture", "drawing", "icon", "text"]))
          this.options.webpPreset = r.preset;
        else
          throw e.invalidParameterError("preset", "one of: default, photo, picture, drawing, icon, text", r.preset);
      if (e.defined(r.effort))
        if (e.integer(r.effort) && e.inRange(r.effort, 0, 6))
          this.options.webpEffort = r.effort;
        else
          throw e.invalidParameterError("effort", "integer between 0 and 6", r.effort);
      e.defined(r.minSize) && this._setBooleanOption("webpMinSize", r.minSize), e.defined(r.mixed) && this._setBooleanOption("webpMixed", r.mixed);
    }
    return T(r, this.options), this._updateFormatOut("webp", r);
  }
  function C(r) {
    if (e.object(r)) {
      e.defined(r.reuse) && this._setBooleanOption("gifReuse", r.reuse), e.defined(r.progressive) && this._setBooleanOption("gifProgressive", r.progressive);
      const E = r.colours || r.colors;
      if (e.defined(E))
        if (e.integer(E) && e.inRange(E, 2, 256))
          this.options.gifBitdepth = s(E);
        else
          throw e.invalidParameterError("colours", "integer between 2 and 256", E);
      if (e.defined(r.effort))
        if (e.number(r.effort) && e.inRange(r.effort, 1, 10))
          this.options.gifEffort = r.effort;
        else
          throw e.invalidParameterError("effort", "integer between 1 and 10", r.effort);
      if (e.defined(r.dither))
        if (e.number(r.dither) && e.inRange(r.dither, 0, 1))
          this.options.gifDither = r.dither;
        else
          throw e.invalidParameterError("dither", "number between 0.0 and 1.0", r.dither);
      if (e.defined(r.interFrameMaxError))
        if (e.number(r.interFrameMaxError) && e.inRange(r.interFrameMaxError, 0, 32))
          this.options.gifInterFrameMaxError = r.interFrameMaxError;
        else
          throw e.invalidParameterError("interFrameMaxError", "number between 0.0 and 32.0", r.interFrameMaxError);
      if (e.defined(r.interPaletteMaxError))
        if (e.number(r.interPaletteMaxError) && e.inRange(r.interPaletteMaxError, 0, 256))
          this.options.gifInterPaletteMaxError = r.interPaletteMaxError;
        else
          throw e.invalidParameterError("interPaletteMaxError", "number between 0.0 and 256.0", r.interPaletteMaxError);
    }
    return T(r, this.options), this._updateFormatOut("gif", r);
  }
  function F(r) {
    if (!this.constructor.format.jp2k.output.buffer)
      throw c();
    if (e.object(r)) {
      if (e.defined(r.quality))
        if (e.integer(r.quality) && e.inRange(r.quality, 1, 100))
          this.options.jp2Quality = r.quality;
        else
          throw e.invalidParameterError("quality", "integer between 1 and 100", r.quality);
      if (e.defined(r.lossless))
        if (e.bool(r.lossless))
          this.options.jp2Lossless = r.lossless;
        else
          throw e.invalidParameterError("lossless", "boolean", r.lossless);
      if (e.defined(r.tileWidth))
        if (e.integer(r.tileWidth) && e.inRange(r.tileWidth, 1, 32768))
          this.options.jp2TileWidth = r.tileWidth;
        else
          throw e.invalidParameterError("tileWidth", "integer between 1 and 32768", r.tileWidth);
      if (e.defined(r.tileHeight))
        if (e.integer(r.tileHeight) && e.inRange(r.tileHeight, 1, 32768))
          this.options.jp2TileHeight = r.tileHeight;
        else
          throw e.invalidParameterError("tileHeight", "integer between 1 and 32768", r.tileHeight);
      if (e.defined(r.chromaSubsampling))
        if (e.string(r.chromaSubsampling) && e.inArray(r.chromaSubsampling, ["4:2:0", "4:4:4"]))
          this.options.jp2ChromaSubsampling = r.chromaSubsampling;
        else
          throw e.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", r.chromaSubsampling);
    }
    return this._updateFormatOut("jp2", r);
  }
  function T(r, E) {
    if (e.object(r) && e.defined(r.loop))
      if (e.integer(r.loop) && e.inRange(r.loop, 0, 65535))
        E.loop = r.loop;
      else
        throw e.invalidParameterError("loop", "integer between 0 and 65535", r.loop);
    if (e.object(r) && e.defined(r.delay))
      if (e.integer(r.delay) && e.inRange(r.delay, 0, 65535))
        E.delay = [r.delay];
      else if (Array.isArray(r.delay) && r.delay.every(e.integer) && r.delay.every(($) => e.inRange($, 0, 65535)))
        E.delay = r.delay;
      else
        throw e.invalidParameterError("delay", "integer or an array of integers between 0 and 65535", r.delay);
  }
  function m(r) {
    if (e.object(r)) {
      if (e.defined(r.quality))
        if (e.integer(r.quality) && e.inRange(r.quality, 1, 100))
          this.options.tiffQuality = r.quality;
        else
          throw e.invalidParameterError("quality", "integer between 1 and 100", r.quality);
      if (e.defined(r.bitdepth))
        if (e.integer(r.bitdepth) && e.inArray(r.bitdepth, [1, 2, 4, 8]))
          this.options.tiffBitdepth = r.bitdepth;
        else
          throw e.invalidParameterError("bitdepth", "1, 2, 4 or 8", r.bitdepth);
      if (e.defined(r.tile) && this._setBooleanOption("tiffTile", r.tile), e.defined(r.tileWidth))
        if (e.integer(r.tileWidth) && r.tileWidth > 0)
          this.options.tiffTileWidth = r.tileWidth;
        else
          throw e.invalidParameterError("tileWidth", "integer greater than zero", r.tileWidth);
      if (e.defined(r.tileHeight))
        if (e.integer(r.tileHeight) && r.tileHeight > 0)
          this.options.tiffTileHeight = r.tileHeight;
        else
          throw e.invalidParameterError("tileHeight", "integer greater than zero", r.tileHeight);
      if (e.defined(r.miniswhite) && this._setBooleanOption("tiffMiniswhite", r.miniswhite), e.defined(r.pyramid) && this._setBooleanOption("tiffPyramid", r.pyramid), e.defined(r.xres))
        if (e.number(r.xres) && r.xres > 0)
          this.options.tiffXres = r.xres;
        else
          throw e.invalidParameterError("xres", "number greater than zero", r.xres);
      if (e.defined(r.yres))
        if (e.number(r.yres) && r.yres > 0)
          this.options.tiffYres = r.yres;
        else
          throw e.invalidParameterError("yres", "number greater than zero", r.yres);
      if (e.defined(r.compression))
        if (e.string(r.compression) && e.inArray(r.compression, ["none", "jpeg", "deflate", "packbits", "ccittfax4", "lzw", "webp", "zstd", "jp2k"]))
          this.options.tiffCompression = r.compression;
        else
          throw e.invalidParameterError("compression", "one of: none, jpeg, deflate, packbits, ccittfax4, lzw, webp, zstd, jp2k", r.compression);
      if (e.defined(r.predictor))
        if (e.string(r.predictor) && e.inArray(r.predictor, ["none", "horizontal", "float"]))
          this.options.tiffPredictor = r.predictor;
        else
          throw e.invalidParameterError("predictor", "one of: none, horizontal, float", r.predictor);
      if (e.defined(r.resolutionUnit))
        if (e.string(r.resolutionUnit) && e.inArray(r.resolutionUnit, ["inch", "cm"]))
          this.options.tiffResolutionUnit = r.resolutionUnit;
        else
          throw e.invalidParameterError("resolutionUnit", "one of: inch, cm", r.resolutionUnit);
    }
    return this._updateFormatOut("tiff", r);
  }
  function x(r) {
    return this.heif({ ...r, compression: "av1" });
  }
  function q(r) {
    if (e.object(r)) {
      if (e.string(r.compression) && e.inArray(r.compression, ["av1", "hevc"]))
        this.options.heifCompression = r.compression;
      else
        throw e.invalidParameterError("compression", "one of: av1, hevc", r.compression);
      if (e.defined(r.quality))
        if (e.integer(r.quality) && e.inRange(r.quality, 1, 100))
          this.options.heifQuality = r.quality;
        else
          throw e.invalidParameterError("quality", "integer between 1 and 100", r.quality);
      if (e.defined(r.lossless))
        if (e.bool(r.lossless))
          this.options.heifLossless = r.lossless;
        else
          throw e.invalidParameterError("lossless", "boolean", r.lossless);
      if (e.defined(r.effort))
        if (e.integer(r.effort) && e.inRange(r.effort, 0, 9))
          this.options.heifEffort = r.effort;
        else
          throw e.invalidParameterError("effort", "integer between 0 and 9", r.effort);
      if (e.defined(r.chromaSubsampling))
        if (e.string(r.chromaSubsampling) && e.inArray(r.chromaSubsampling, ["4:2:0", "4:4:4"]))
          this.options.heifChromaSubsampling = r.chromaSubsampling;
        else
          throw e.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", r.chromaSubsampling);
      if (e.defined(r.bitdepth))
        if (e.integer(r.bitdepth) && e.inArray(r.bitdepth, [8, 10, 12])) {
          if (r.bitdepth !== 8 && this.constructor.versions.heif)
            throw e.invalidParameterError("bitdepth when using prebuilt binaries", 8, r.bitdepth);
          this.options.heifBitdepth = r.bitdepth;
        } else
          throw e.invalidParameterError("bitdepth", "8, 10 or 12", r.bitdepth);
    } else
      throw e.invalidParameterError("options", "Object", r);
    return this._updateFormatOut("heif", r);
  }
  function M(r) {
    if (e.object(r)) {
      if (e.defined(r.quality))
        if (e.integer(r.quality) && e.inRange(r.quality, 1, 100))
          this.options.jxlDistance = r.quality >= 30 ? 0.1 + (100 - r.quality) * 0.09 : 53 / 3e3 * r.quality * r.quality - 23 / 20 * r.quality + 25;
        else
          throw e.invalidParameterError("quality", "integer between 1 and 100", r.quality);
      else if (e.defined(r.distance))
        if (e.number(r.distance) && e.inRange(r.distance, 0, 15))
          this.options.jxlDistance = r.distance;
        else
          throw e.invalidParameterError("distance", "number between 0.0 and 15.0", r.distance);
      if (e.defined(r.decodingTier))
        if (e.integer(r.decodingTier) && e.inRange(r.decodingTier, 0, 4))
          this.options.jxlDecodingTier = r.decodingTier;
        else
          throw e.invalidParameterError("decodingTier", "integer between 0 and 4", r.decodingTier);
      if (e.defined(r.lossless))
        if (e.bool(r.lossless))
          this.options.jxlLossless = r.lossless;
        else
          throw e.invalidParameterError("lossless", "boolean", r.lossless);
      if (e.defined(r.effort))
        if (e.integer(r.effort) && e.inRange(r.effort, 3, 9))
          this.options.jxlEffort = r.effort;
        else
          throw e.invalidParameterError("effort", "integer between 3 and 9", r.effort);
    }
    return this._updateFormatOut("jxl", r);
  }
  function B(r) {
    if (e.object(r) && e.defined(r.depth))
      if (e.string(r.depth) && e.inArray(
        r.depth,
        ["char", "uchar", "short", "ushort", "int", "uint", "float", "complex", "double", "dpcomplex"]
      ))
        this.options.rawDepth = r.depth;
      else
        throw e.invalidParameterError("depth", "one of: char, uchar, short, ushort, int, uint, float, complex, double, dpcomplex", r.depth);
    return this._updateFormatOut("raw");
  }
  function _(r) {
    if (e.object(r)) {
      if (e.defined(r.size))
        if (e.integer(r.size) && e.inRange(r.size, 1, 8192))
          this.options.tileSize = r.size;
        else
          throw e.invalidParameterError("size", "integer between 1 and 8192", r.size);
      if (e.defined(r.overlap))
        if (e.integer(r.overlap) && e.inRange(r.overlap, 0, 8192)) {
          if (r.overlap > this.options.tileSize)
            throw e.invalidParameterError("overlap", `<= size (${this.options.tileSize})`, r.overlap);
          this.options.tileOverlap = r.overlap;
        } else
          throw e.invalidParameterError("overlap", "integer between 0 and 8192", r.overlap);
      if (e.defined(r.container))
        if (e.string(r.container) && e.inArray(r.container, ["fs", "zip"]))
          this.options.tileContainer = r.container;
        else
          throw e.invalidParameterError("container", "one of: fs, zip", r.container);
      if (e.defined(r.layout))
        if (e.string(r.layout) && e.inArray(r.layout, ["dz", "google", "iiif", "iiif3", "zoomify"]))
          this.options.tileLayout = r.layout;
        else
          throw e.invalidParameterError("layout", "one of: dz, google, iiif, iiif3, zoomify", r.layout);
      if (e.defined(r.angle))
        if (e.integer(r.angle) && !(r.angle % 90))
          this.options.tileAngle = r.angle;
        else
          throw e.invalidParameterError("angle", "positive/negative multiple of 90", r.angle);
      if (this._setBackgroundColourOption("tileBackground", r.background), e.defined(r.depth))
        if (e.string(r.depth) && e.inArray(r.depth, ["onepixel", "onetile", "one"]))
          this.options.tileDepth = r.depth;
        else
          throw e.invalidParameterError("depth", "one of: onepixel, onetile, one", r.depth);
      if (e.defined(r.skipBlanks))
        if (e.integer(r.skipBlanks) && e.inRange(r.skipBlanks, -1, 65535))
          this.options.tileSkipBlanks = r.skipBlanks;
        else
          throw e.invalidParameterError("skipBlanks", "integer between -1 and 255/65535", r.skipBlanks);
      else e.defined(r.layout) && r.layout === "google" && (this.options.tileSkipBlanks = 5);
      const E = e.bool(r.center) ? r.center : r.centre;
      if (e.defined(E) && this._setBooleanOption("tileCentre", E), e.defined(r.id))
        if (e.string(r.id))
          this.options.tileId = r.id;
        else
          throw e.invalidParameterError("id", "string", r.id);
      if (e.defined(r.basename))
        if (e.string(r.basename))
          this.options.tileBasename = r.basename;
        else
          throw e.invalidParameterError("basename", "string", r.basename);
    }
    if (e.inArray(this.options.formatOut, ["jpeg", "png", "webp"]))
      this.options.tileFormat = this.options.formatOut;
    else if (this.options.formatOut !== "input")
      throw e.invalidParameterError("format", "one of: jpeg, png, webp", this.options.formatOut);
    return this._updateFormatOut("dz");
  }
  function z(r) {
    if (!e.plainObject(r))
      throw e.invalidParameterError("options", "object", r);
    if (e.integer(r.seconds) && e.inRange(r.seconds, 0, 3600))
      this.options.timeoutSeconds = r.seconds;
    else
      throw e.invalidParameterError("seconds", "integer between 0 and 3600", r.seconds);
    return this;
  }
  function P(r, E) {
    return e.object(E) && E.force === !1 || (this.options.formatOut = r), this;
  }
  function R(r, E) {
    if (e.bool(E))
      this.options[r] = E;
    else
      throw e.invalidParameterError(r, "boolean", E);
  }
  function w() {
    if (!this.options.streamOut) {
      this.options.streamOut = !0;
      const r = Error();
      this._pipeline(void 0, r);
    }
  }
  function I(r, E) {
    return typeof r == "function" ? (this._isStreamInput() ? this.on("finish", () => {
      this._flattenBufferIn(), b.pipeline(this.options, ($, L, A) => {
        $ ? r(e.nativeError($, E)) : r(null, L, A);
      });
    }) : b.pipeline(this.options, ($, L, A) => {
      $ ? r(e.nativeError($, E)) : r(null, L, A);
    }), this) : this.options.streamOut ? (this._isStreamInput() ? (this.once("finish", () => {
      this._flattenBufferIn(), b.pipeline(this.options, ($, L, A) => {
        $ ? this.emit("error", e.nativeError($, E)) : (this.emit("info", A), this.push(L)), this.push(null), this.on("end", () => this.emit("close"));
      });
    }), this.streamInFinished && this.emit("finish")) : b.pipeline(this.options, ($, L, A) => {
      $ ? this.emit("error", e.nativeError($, E)) : (this.emit("info", A), this.push(L)), this.push(null), this.on("end", () => this.emit("close"));
    }), this) : this._isStreamInput() ? new Promise(($, L) => {
      this.once("finish", () => {
        this._flattenBufferIn(), b.pipeline(this.options, (A, k, O) => {
          A ? L(e.nativeError(A, E)) : this.options.resolveWithObject ? $({ data: k, info: O }) : $(k);
        });
      });
    }) : new Promise(($, L) => {
      b.pipeline(this.options, (A, k, O) => {
        A ? L(e.nativeError(A, E)) : this.options.resolveWithObject ? $({ data: k, info: O }) : $(k);
      });
    });
  }
  return De = function(r) {
    Object.assign(r.prototype, {
      // Public
      toFile: o,
      toBuffer: i,
      keepExif: h,
      withExif: a,
      withExifMerge: u,
      keepIccProfile: t,
      withIccProfile: g,
      keepMetadata: l,
      withMetadata: d,
      toFormat: p,
      jpeg: y,
      jp2: F,
      png: j,
      webp: S,
      tiff: m,
      avif: x,
      heif: q,
      jxl: M,
      gif: C,
      raw: B,
      tile: _,
      timeout: z,
      // Private
      _updateFormatOut: P,
      _setBooleanOption: R,
      _read: w,
      _pipeline: I
    });
  }, De;
}
var Me, Fr;
function _t() {
  if (Fr) return Me;
  Fr = 1;
  const f = U, e = Ge(), b = D(), { runtimePlatformArch: v } = Ur(), n = Z(), c = v(), s = n.libvipsVersion(), o = n.format();
  o.heif.output.alias = ["avif", "heic"], o.jpeg.output.alias = ["jpe", "jpg"], o.tiff.output.alias = ["tif"], o.jp2k.output.alias = ["j2c", "j2k", "jp2", "jpx"];
  const i = {
    /** [Nearest neighbour interpolation](http://en.wikipedia.org/wiki/Nearest-neighbor_interpolation). Suitable for image enlargement only. */
    nearest: "nearest",
    /** [Bilinear interpolation](http://en.wikipedia.org/wiki/Bilinear_interpolation). Faster than bicubic but with less smooth results. */
    bilinear: "bilinear",
    /** [Bicubic interpolation](http://en.wikipedia.org/wiki/Bicubic_interpolation) (the default). */
    bicubic: "bicubic",
    /** [LBB interpolation](https://github.com/libvips/libvips/blob/master/libvips/resample/lbb.cpp#L100). Prevents some "[acutance](http://en.wikipedia.org/wiki/Acutance)" but typically reduces performance by a factor of 2. */
    locallyBoundedBicubic: "lbb",
    /** [Nohalo interpolation](http://eprints.soton.ac.uk/268086/). Prevents acutance but typically reduces performance by a factor of 3. */
    nohalo: "nohalo",
    /** [VSQBS interpolation](https://github.com/libvips/libvips/blob/master/libvips/resample/vsqbs.cpp#L48). Prevents "staircasing" when enlarging. */
    vertexSplitQuadraticBasisSpline: "vsqbs"
  };
  let h = {
    vips: s.semver
  };
  if (!s.isGlobal)
    if (s.isWasm)
      try {
        h = require("@img/sharp-wasm32/versions");
      } catch {
      }
    else
      try {
        h = G(`@img/sharp-${c}/versions`);
      } catch {
        try {
          h = G(`@img/sharp-libvips-${c}/versions`);
        } catch {
        }
      }
  h.sharp = Gr.version, h.heif && o.heif && (o.heif.input.fileSuffix = [".avif"], o.heif.output.alias = ["avif"]);
  function a(y) {
    return b.bool(y) ? y ? n.cache(50, 20, 100) : n.cache(0, 0, 0) : b.object(y) ? n.cache(y.memory, y.files, y.items) : n.cache();
  }
  a(!0);
  function u(y) {
    return n.concurrency(b.integer(y) ? y : null);
  }
  e.familySync() === e.GLIBC && !n._isUsingJemalloc() ? n.concurrency(1) : e.familySync() === e.MUSL && n.concurrency() === 1024 && n.concurrency(U.availableParallelism());
  const t = new f.EventEmitter();
  function g() {
    return n.counters();
  }
  function l(y) {
    return n.simd(b.bool(y) ? y : null);
  }
  function d(y) {
    if (b.object(y))
      if (Array.isArray(y.operation) && y.operation.every(b.string))
        n.block(y.operation, !0);
      else
        throw b.invalidParameterError("operation", "Array<string>", y.operation);
    else
      throw b.invalidParameterError("options", "object", y);
  }
  function p(y) {
    if (b.object(y))
      if (Array.isArray(y.operation) && y.operation.every(b.string))
        n.block(y.operation, !1);
      else
        throw b.invalidParameterError("operation", "Array<string>", y.operation);
    else
      throw b.invalidParameterError("options", "object", y);
  }
  return Me = function(y) {
    y.cache = a, y.concurrency = u, y.counters = g, y.simd = l, y.format = o, y.interpolators = i, y.versions = h, y.queue = t, y.block = d, y.unblock = p;
  }, Me;
}
var ze, Tr;
function Bt() {
  if (Tr) return ze;
  Tr = 1;
  const f = It();
  return kt()(f), qt()(f), Ct()(f), Nt()(f), Ot()(f), Ft()(f), Tt()(f), _t()(f), ze = f, ze;
}
var Dt = Bt();
const Mt = /* @__PURE__ */ it(Dt);
async function zt({
  filePath: f,
  outputPath: e,
  opt: b
}) {
  const { ext: v, base: n } = _r(f), c = e || f;
  if (!Y.includes(v))
    return;
  const s = et(f);
  let o = Mt(s);
  if (v.includes(W.jpeg) || v.includes(W.jpg))
    o = o.jpeg(b.jpgOptions);
  else {
    const h = v.split(".")[v.split(".").length - 1];
    o = o[h](b[`${h.toLocaleLowerCase()}Options`]);
  }
  const i = await o.toBuffer();
  return console.log(
    `${n}：${Xe(s.length)} ============> ${Xe(
      i.length
    )}`
  ), new Promise((h, a) => {
    rt(c, i, (u) => {
      if (u) {
        a(u);
        return;
      }
      h(c);
    });
  });
}
async function Xr(f) {
  const e = [], b = Jr(f);
  for (let v = 0; v < b.length; v++) {
    const n = Vr(f, b[v]);
    if (await Zr(n).isFile())
      e.push(n);
    else {
      const s = await Xr(n);
      e.push(...s);
    }
  }
  return e;
}
async function Gt(f, e) {
  const b = await Xr(f);
  return await Promise.all(
    b.filter((v) => Y.includes(_r(v).ext)).map((v) => zt({
      filePath: v,
      outputPath: v,
      opt: e
    }))
  );
}
const Ut = {
  quality: Dr,
  formats: Y
};
function Qt(f) {
  const e = Object.assign({}, Ut, f);
  tt(e);
  let b;
  return {
    name: "vite:image-tools",
    configResolved(v) {
      b = Object.assign(b || {}, v);
    },
    async closeBundle() {
      const { isProduction: v, root: n, build: c } = b;
      if (v) {
        const s = Qr.join(n, c.outDir);
        await Gt(s, e);
      }
    }
  };
}
export {
  Qt as default
};
