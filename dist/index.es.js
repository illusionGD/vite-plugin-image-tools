import { readFileSync as b, existsSync as $, writeFile as D, mkdirSync as I, writeFileSync as C } from "fs";
import j, { parse as d, extname as E, join as v } from "path";
import P from "crypto";
var p = /* @__PURE__ */ ((e) => (e.png = "png", e.jpg = "jpg", e.jpeg = "jpeg", e.webp = "webp", e))(p || {});
const h = [];
for (const e in p)
  Object.prototype.hasOwnProperty.call(p, e) && h.push(p[e]);
const g = {
  quality: 80,
  enableDev: !1,
  enableDevWebp: !1,
  enableWebP: !0,
  regExp: `\\.(${h.join("|")})$`,
  include: h,
  cacheDir: "node_modules/.cache/vite-plugin-image"
}, k = {};
function q(e) {
  k[e] = B(e);
}
function F() {
  return k;
}
function N({ name: e, type: t, content: n, quality: c, enableWebP: r }) {
  const u = P.createHash("md5").update(n).update(JSON.stringify({ quality: c, enableWebP: r })).digest("hex");
  return `${e}_${u.slice(0, 8)}.${t}`;
}
function m(e) {
  return new RegExp(g.regExp).test(e);
}
function S(e) {
  for (const t in e) {
    const n = e[t];
    if (!m(t))
      continue;
    const { fileName: c } = n, { base: r } = d(c);
    q(r);
  }
}
async function H(e) {
  for (const t in e) {
    const n = e[t], { ext: c } = d(t), { quality: r, enableWebP: u } = g;
    if (/(js|css|html)$/.test(t) && u && (/(js)$/.test(t) ? n.code = y(n.code) : /(css|html)$/.test(t) && (n.source = y(n.source))), !!m(t)) {
      if (n.source && n.source instanceof Buffer) {
        const o = await w(n.source, {
          type: c,
          quality: r
        });
        n.source = o;
      }
      if (u) {
        const o = await w(n.source, {
          type: p.webp,
          quality: r
        }), s = B(t), i = structuredClone(n);
        i.source = o, i.fileName = s, e[s] = i;
      }
    }
  }
}
function y(e) {
  const t = F();
  let n = e;
  for (const c in t)
    n = n.replace(new RegExp(c, "g"), t[c]);
  return n;
}
function B(e) {
  const [t, n] = e.split("?"), c = E(t), r = e.replace(c, ".webp");
  return n ? `${r}?${n}` : r;
}
const J = require("sharp");
function K(e) {
  const t = e.includes(".") ? e.replace(".", "") : e;
  return t === p.jpg || t === p.jpeg ? "jpeg" : t;
}
async function w(e, { type: t, quality: n }) {
  const c = K(t);
  return await J(e).toFormat(c, { quality: n }).toBuffer();
}
async function O(e, { type: t, quality: n }) {
  if (!m(e))
    return;
  const c = b(e), { ext: r } = d(e);
  return r.replace(".", "") === t ? c : await w(c, {
    type: t,
    quality: n
  });
}
async function R(e) {
  const { enableDevWebp: t, quality: n, enableWebP: c, cacheDir: r } = g, { ext: u, name: o } = d(e), s = t ? p.webp : u.replace(".", ""), i = b(e), f = N({
    name: o,
    type: s,
    content: i,
    quality: n,
    enableWebP: c
  }), a = v(r, f);
  if ($(a))
    return b(a);
  const l = await O(e, {
    type: s,
    quality: n
  });
  if (l)
    return D(a, l, () => {
    }), l;
}
function Q(e = {}) {
  e && !e.regExp && e.include && (g.regExp = `\\.(${e.include.join("|")})$`);
  const { enableDevWebp: t, cacheDir: n, enableDev: c } = Object.assign(
    g,
    e
  );
  let r = !1;
  const u = j.resolve(process.cwd(), n);
  return $(u) || I(u, { recursive: !0 }), {
    name: "vite-plugin-image-tools",
    config(o, { command: s }) {
      r = s === "build";
    },
    configResolved(o) {
    },
    // 开发模式：拦截图片请求，处理图片压缩和转webp
    configureServer(o) {
      c && o.middlewares.use(async (s, i, f) => {
        if (!m(s.url || "")) return f();
        try {
          const a = decodeURIComponent(
            j.resolve(
              process.cwd(),
              s.url.split("?")[0].slice(1)
            )
          );
          m(a) || f();
          const { ext: l } = d(a), W = t ? p.webp : l.replace(".", ""), x = await R(a);
          x || f(), i.setHeader("Content-Type", `image/${W}`), i.end(x);
        } catch {
          f();
        }
      });
    },
    // 构建模式：替换最终产物中的资源
    async generateBundle(o, s) {
      r && (S(s), await H(s));
    },
    async writeBundle(o, s) {
      for (const i in s) {
        const f = s[i];
        if (/(html)$/.test(i)) {
          const a = y(f.source);
          C(v(o.dir, f.fileName), a);
        }
      }
    }
  };
}
export {
  Q as default
};
