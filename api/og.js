import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const h = (type, style, ...children) => ({ type, props: { style, children: children.length > 1 ? children : children[0] } });

async function loadFont(text) {
  const css = await (await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0' } }
  )).text();
  const m = css.match(/src: url\((.+?)\) format\('(truetype|opentype|woff)'\)/);
  if (!m) return null;
  return await (await fetch(m[1])).arrayBuffer();
}

export default async function handler(req) {
  const u = new URL(req.url);
  const q = k => u.searchParams.get(k) || '';
  const rk = q('rk'), title = q('title'), uni = q('uni'), path = q('path');
  const mx = Number(q('mx') || 0), nw = Number(q('nw') || 0);
  const fmt = v => Math.round(v).toLocaleString('ja-JP');
  const oku = v => Math.abs(v) >= 10000 ? `${(v / 10000).toFixed(1)}億円` : `${fmt(v)}万円`;
  const isResult = !!rk;

  const gold = '#D9BC7C', ink = '#F2EDE4', ink2 = '#C9C2B4', ink3 = '#857D6E';
  const rankColor = rk === 'SS' || rk === 'S' ? gold : rk === 'A' ? '#4CD48A' : rk === 'E' ? '#FF6B81' : ink;

  const body = isResult
    ? h('div', { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 56, width: '100%' },
        h('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 300 },
          h('div', { fontSize: 26, color: ink2 }, 'あなたのキャリアは'),
          h('div', { fontSize: 220, lineHeight: 1, color: rankColor, fontWeight: 700 }, rk)),
        h('div', { display: 'flex', flexDirection: 'column', flex: 1 },
          h('div', { fontSize: 54, color: ink, fontWeight: 700, lineHeight: 1.25 }, `あなたは「${title}」`),
          h('div', { fontSize: 28, color: ink2, marginTop: 22 }, `最高年収 ${fmt(mx)}万円　総資産 ${oku(nw)}`),
          h('div', { fontSize: 22, color: ink3, marginTop: 10 }, `${uni}卒 → ${path}`.slice(0, 60))))
    : h('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
        h('div', { fontSize: 92, color: gold, fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }, '年収3000万円に、\nたどり着けるか。'),
        h('div', { fontSize: 30, color: ink2, marginTop: 24 }, '大学ガチャから始まる、22歳〜50歳のキャリアシミュレーター'));

  const tree = h('div', {
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '56px 72px', backgroundColor: '#050507', backgroundImage: 'linear-gradient(180deg, #050507 0%, #07080D 60%, #1A1208 100%)', color: ink, fontFamily: 'NotoJP'
    },
    h('div', { display: 'flex', alignItems: 'center', gap: 14 },
      h('div', { fontSize: 30, color: gold, fontWeight: 700 }, 'キャリアシミュレーター'),
      h('div', { fontSize: 20, color: ink3 }, '年収3000万円を目指せるか')),
    body,
    h('div', { display: 'flex', justifyContent: 'space-between', fontSize: 20, color: ink3 },
      h('div', {}, 'career-simulator-gules.vercel.app'),
      h('div', {}, '企業名は実在ですが、結果はゲーム上の演出です')));

  const chars = [...new Set(('キャリアシミュレーター年収3000万円を目指せるか企業名は実在ですが、結果はゲーム上の演出です大学ガチャから始まる、22歳〜50歳のあなたのキャリアはあなたは「」最高年収万円　総資産億円卒→にたどり着けるかcareer-simulatorgules.vercel.app0123456789,.SABCDE' + rk + title + uni + path).split(''))].join('');
  let fonts = [];
  try { const data = await loadFont(chars); if (data) fonts = [{ name: 'NotoJP', data, weight: 700, style: 'normal' }]; } catch (e) {}

  return new ImageResponse(tree, { width: 1200, height: 630, fonts, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } });
}
