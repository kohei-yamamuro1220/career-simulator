// 共有リンク: OG タグ付きのページを返し、ブラウザはゲーム本体（#r=...）へ送る
export default function handler(req, res) {
  const d = String(req.query.d || '');
  let o = {};
  try { o = JSON.parse(Buffer.from(d.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch (e) {}
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const base = `https://${req.headers.host}`;
  const fmt = v => Math.round(Number(v) || 0).toLocaleString('ja-JP');
  const path = (o.path || []).map(x => String(x).split(':')[1]).join('→');
  const og = `${base}/api/og?` + new URLSearchParams({ rk: o.rk || '', mx: o.mx || 0, nw: o.nw || 0, title: o.title || '', uni: o.uni || '', path });
  const title = o.rk ? `あなたのキャリアは${o.rk}「${o.title}」 — キャリアシミュレーター` : 'キャリアシミュレーター';
  const desc = o.rk ? `${o.uni}卒 → ${path}。最高年収 ${fmt(o.mx)}万円。年収3000万円に、たどり着けるか。` : '大学ガチャから始まる、22歳〜50歳のキャリアシミュレーター';
  const target = `${base}/#r=${d}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(og)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url" content="${esc(base + '/api/r?d=' + d)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(og)}">
<meta http-equiv="refresh" content="0;url=${esc(target)}"><script>location.replace(${JSON.stringify(target)})</script>
<style>body{background:#0C1117;color:#EEF2F7;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0}</style></head>
<body><a href="${esc(target)}" style="color:#E3B84D">結果を見る →</a></body></html>`);
}
