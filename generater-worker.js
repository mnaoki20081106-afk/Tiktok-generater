const VIEWER_CODE = 'export default {\n  async fetch(request, env, ctx) {\n    const url = new URL(request.url);\n    const origin = url.origin;\n    const path = url.pathname;\n    if (request.method === \'OPTIONS\') return new Response(null, { headers: corsH() });\n    if (request.method === \'POST\' && path === \'/update\') {\n      if (!env.SECRET || request.headers.get(\'X-Secret\') !== env.SECRET)\n        return jsonR({ success:false, error:\'Unauthorized\' }, 401);\n      try {\n        const f = await request.formData();\n        const puts = [];\n        const kv = env.KV;\n        const textFields = [\'title\',\'tiktokUrl\',\'username\',\'description\',\'musicName\',\'likeCount\',\'commentCount\',\'shareCount\'];\n        for (const key of textFields) {\n          const v = f.get(key);\n          if (v !== null && v !== undefined) puts.push(kv.put(key, v));\n        }\n        const fileFields = [\'background\',\'ogpImage\',\'appIcon\',\'avatar\'];\n        for (const key of fileFields) {\n          const v = f.get(key);\n          if (v && typeof v.arrayBuffer === \'function\') puts.push(kv.put(key, await v.arrayBuffer()));\n        }\n        await Promise.all(puts);\n        return jsonR({ success:true }, 200);\n      } catch(e) { return jsonR({ success:false, error:e.message }, 500); }\n    }\n    if (path === \'/background.png\') return img(env.KV, \'background\');\n    if (path === \'/ogp-image.png\')  return img(env.KV, \'ogpImage\');\n    if (path === \'/app-icon.png\')   return img(env.KV, \'appIcon\');\n    if (path === \'/avatar.png\')     return img(env.KV, \'avatar\');\n\n    const kv = env.KV;\n    const [title, tku, username, description, musicName, likeCount, commentCount, shareCount] = await Promise.all([\n      kv.get(\'title\'), kv.get(\'tiktokUrl\'), kv.get(\'username\'), kv.get(\'description\'),\n      kv.get(\'musicName\'), kv.get(\'likeCount\'), kv.get(\'commentCount\'), kv.get(\'shareCount\'),\n    ]);\n    return new Response(html({\n      title: title || \'TikTok\',\n      tiktokUrl: tku || \'#\',\n      username: username || \'user\',\n      description: description || \'\',\n      musicName: musicName || \'オリジナル楽曲\',\n      likeCount: likeCount || \'0\',\n      commentCount: commentCount || \'0\',\n      shareCount: shareCount || \'0\',\n      origin,\n    }), { headers:{ \'Content-Type\':\'text/html;charset=UTF-8\',\'Cache-Control\':\'no-cache\' } });\n  }\n};\n\nasync function img(kv, key) {\n  const d = await kv.get(key, { type:\'arrayBuffer\' });\n  if (!d) return new Response(\'Not found\', { status:404 });\n  return new Response(d, { headers:{ \'Content-Type\':\'image/png\',\'Cache-Control\':\'no-cache\' } });\n}\nfunction jsonR(b, s) { return new Response(JSON.stringify(b), { status:s, headers:{ \'Content-Type\':\'application/json\',...corsH() } }); }\nfunction corsH() { return { \'Access-Control-Allow-Origin\':\'*\',\'Access-Control-Allow-Methods\':\'POST,GET,OPTIONS\',\'Access-Control-Allow-Headers\':\'X-Secret\' }; }\nfunction esc(s) { return String(s==null?\'\':s).replace(/[&<>"\']/g, c => ({\'&\':\'&amp;\',\'<\':\'&lt;\',\'>\':\'&gt;\',\'"\':\'&quot;\',"\'":\'&#39;\'}[c])); }\nfunction renderDescription(text) {\n  const escaped = esc(text);\n  return escaped.replace(/(^|\\s)(#[^\\s#]+)/g, (m, pre, tag) => pre + \'<span class="tag">\' + tag + \'</span>\');\n}\nfunction html(d) {\n  const { title, tiktokUrl, username, description, musicName, likeCount, commentCount, shareCount, origin } = d;\n  const t = esc(title);\n  const u = esc(username);\n  const m = esc(musicName);\n  const lc = esc(likeCount);\n  const cc = esc(commentCount);\n  const sc = esc(shareCount);\n  const descHtml = renderDescription(description);\n  return `<!DOCTYPE html>\n<html lang="ja"><head><meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<title>${t}</title>\n<meta property="og:title" content="${t}">\n<meta property="og:description" content="TikTokのアプリで全機能をお試しください">\n<meta property="og:image" content="${origin}/ogp-image.png">\n<meta property="og:url" content="${origin}/">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${origin}/ogp-image.png">\n<style>\n*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%;width:100%;background:#000;font-family:-apple-system,"Hiragino Sans",sans-serif;overflow:hidden;position:fixed;inset:0}\n.s{position:relative;width:100%;height:100vh;height:calc(var(--vh,1vh) * 100);height:100svh;height:100dvh;max-width:480px;margin:0 auto;overflow:hidden;background:#000}\n.bg{position:absolute;inset:0}.bg img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}\n.rail{position:absolute;right:10px;bottom:112px;display:flex;flex-direction:column;align-items:center;gap:18px;z-index:10}\n.rail-avatar{position:relative;display:block;width:46px;height:46px}\n.avatar{width:46px;height:46px;border-radius:50%;overflow:hidden;border:2px solid #fff;background:#333}\n.avatar img{width:100%;height:100%;object-fit:cover;display:block}\n.follow{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);width:22px;height:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))}\n.rail-item{display:flex;flex-direction:column;align-items:center;gap:4px;color:#fff;background:none;border:none}\n.rail-item svg{width:34px;height:34px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}\n.rail-item span{font-size:12px;font-weight:600;text-shadow:0 1px 2px rgba(0,0,0,.4)}\n.disc{width:42px;height:42px;border-radius:50%;overflow:hidden;border:3px solid #3a3a3a;background:#222;animation:spin 4s linear infinite;margin-top:2px}\n.disc img{width:100%;height:100%;object-fit:cover;display:block}\n@keyframes spin{to{transform:rotate(360deg)}}\n.caption{position:absolute;left:14px;right:78px;bottom:104px;color:#fff;z-index:10}\n.uname{font-size:15px;font-weight:700;margin-bottom:6px;text-shadow:0 1px 3px rgba(0,0,0,.4)}\n.desc-wrap{max-height:4.4em;overflow:hidden;transition:max-height .2s ease}\n.desc-wrap.expanded{max-height:none}\n.desc{font-size:13.5px;line-height:1.47;text-shadow:0 1px 3px rgba(0,0,0,.4);word-break:break-word}\n.desc .tag{font-weight:700}\n.more{display:none;background:none;border:none;color:rgba(255,255,255,.75);font-size:13px;font-weight:600;padding:4px 0 0;cursor:pointer;text-align:left}\n.music{display:flex;align-items:center;gap:6px;font-size:12.5px;opacity:.9;margin-top:8px;text-shadow:0 1px 3px rgba(0,0,0,.4)}\n.music .mtext{max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.ov{position:absolute;inset:0;background:rgba(0,0,0,0.514);z-index:3001;display:flex;align-items:center;justify-content:center;padding:0 20px}\n.mc{background:#fff;border-radius:12px;width:100%;max-width:336px;box-shadow:0 4px 24px rgba(0,0,0,0.3);animation:fu .25s cubic-bezier(.22,1,.36,1)}\n@keyframes fu{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}\n.mb{padding:28px 24px 0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}\n.mi{width:60px;height:60px;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.15)}\n.mi img{width:100%;height:100%;object-fit:cover;display:block}\n.mt{font-size:17px;font-weight:700;color:#161823;line-height:1.35}\n.md{font-size:13px;color:rgba(22,24,35,.7);line-height:1.55}\n.ma{padding:18px 20px 22px;display:flex;flex-direction:column;align-items:center;position:relative}\n.bo{display:block;width:100%;padding:13px 0;background:#fe2c55;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:4px;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 2px 8px rgba(254,44,85,.35);transition:opacity .15s}\n.bo:active{opacity:.82}\n.bl{display:block;width:100%;padding:12px 0 0;background:none;border:none;color:rgba(22,24,35,.55);font-size:15px;cursor:pointer;text-align:center}\n</style></head><body>\n<div class="s">\n  <div class="bg"><img src="${origin}/background.png" alt=""></div>\n\n  <div class="rail">\n    <div class="rail-avatar">\n      <div class="avatar"><img src="${origin}/avatar.png" alt=""></div>\n      <svg class="follow" viewBox="0 0 28 28"><path fill="#FE2C55" d="M14 25C20.6274 25 26 19.6274 26 13C26 6.37258 20.6274 1 14 1C7.37258 1 2 6.37258 2 13C2 19.6274 7.37258 25 14 25Z"></path><path fill="#fff" d="M9.5 14C9.22386 14 9 13.7761 9 13.5V12.5C9 12.2239 9.22386 12 9.5 12H18.5C18.7761 12 19 12.2239 19 12.5V13.5C19 13.7761 18.7761 14 18.5 14H9.5Z"></path><path fill="#fff" d="M13 8.5C13 8.22386 13.2239 8 13.5 8H14.5C14.7761 8 15 8.22386 15 8.5V17.5C15 17.7761 14.7761 18 14.5 18H13.5C13.2239 18 13 17.7761 13 17.5V8.5Z"></path></svg>\n    </div>\n    <div class="rail-item">\n      <svg viewBox="0 0 48 48"><path fill="#fff" d="M24 9.44c3.2-4.03 7.61-5.56 12-4.67 2.31.47 5.59 2.28 7.75 5.48 2.26 3.32 3.21 7.99.98 13.85-1.75 4.57-5.5 8.83-9.28 12.2a56.6 56.6 0 0 1-10.52 7.47l-.93.49-.93-.49a56.6 56.6 0 0 1-10.52-7.47c-3.78-3.37-7.53-7.63-9.28-12.2-2.24-5.86-1.28-10.53.98-13.85C6.4 7.05 9.69 5.24 12 4.77c4.39-.9 8.8.64 12 4.67Z"></path></svg>\n      <span>${lc}</span>\n    </div>\n    <div class="rail-item">\n      <svg viewBox="0 0 48 48"><path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M38.5 35.31c4.1-4.11 6.5-8.4 6.5-13.38C45 11.8 35.73 3.6 24.3 3.6S3.6 11.8 3.6 21.93C3.6 32.05 13.17 39 24.6 39v3.36c0 1.06 1.1 1.75 2.04 1.24 2.92-1.58 8.33-4.76 11.85-8.29ZM14.23 19.46a2.95 2.95 0 0 1 2.96 2.93 2.95 2.95 0 0 1-2.96 2.94 2.95 2.95 0 0 1-2.95-2.94 2.95 2.95 0 0 1 2.95-2.93Zm13.02 2.93a2.95 2.95 0 0 0-2.96-2.93 2.95 2.95 0 0 0-2.96 2.93 2.95 2.95 0 0 0 2.96 2.94 2.95 2.95 0 0 0 2.96-2.94Zm7.1-2.93a2.95 2.95 0 0 1 2.95 2.93 2.95 2.95 0 0 1-2.96 2.94 2.95 2.95 0 0 1-2.95-2.94 2.95 2.95 0 0 1 2.95-2.93Z"></path></svg>\n      <span>${cc}</span>\n    </div>\n    <div class="rail-item">\n      <svg viewBox="0 0 48 48"><path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M25.56 4.07a1.98 1.98 0 0 0-2.15-.42 1.95 1.95 0 0 0-1.21 1.8v8.34c-5.4.35-10.04 2.2-13.43 5.68C4.97 23.35 3 29.03 3 36.19c0 .79.48 1.5 1.22 1.8.73.3 1.58.13 2.14-.42 3.34-3.31 7.65-4.56 11.25-4.95 1.8-.2 3.37-.18 4.5-.1h.09v9.03c0 .78.46 1.48 1.18 1.79.72.3 1.56.16 2.13-.37l18.87-17.49a1.94 1.94 0 0 0 .04-2.8L25.56 4.07Z"></path></svg>\n      <span>${sc}</span>\n    </div>\n    <div class="disc"><img src="${origin}/avatar.png" alt=""></div>\n  </div>\n\n  <div class="caption">\n    <div class="uname">@${u}</div>\n    <div class="desc-wrap" id="descWrap"><div class="desc" id="descText">${descHtml}</div></div>\n    <button class="more" id="moreBtn">続きを見る</button>\n    <div class="music">🎵<span class="mtext">${m}</span></div>\n  </div>\n\n  <div class="ov" id="ov">\n    <div class="mc">\n      <div class="mb">\n        <div class="mi"><img src="${origin}/app-icon.png" alt=""></div>\n        <p class="mt">TikTokのアプリで全機能をお試しください</p>\n        <p class="md">アプリでさらに多くの動画と優れた機能をお楽しみください</p>\n      </div>\n      <div class="ma">\n        <a href="${tiktokUrl}" class="bo">TikTokを開く</a>\n        <button class="bl" onclick="document.getElementById(\'ov\').style.display=\'none\'">後で</button>\n      </div>\n    </div>\n  </div>\n</div>\n<script>\nfunction setVh(){document.documentElement.style.setProperty(\'--vh\',window.innerHeight*0.01+\'px\')}\nsetVh();addEventListener(\'resize\',setVh);addEventListener(\'orientationchange\',setVh);\n(function(){\n  var wrap=document.getElementById(\'descWrap\');\n  var btn=document.getElementById(\'moreBtn\');\n  requestAnimationFrame(function(){\n    if(wrap.scrollHeight>wrap.clientHeight+2){btn.style.display=\'block\';}\n  });\n  btn.addEventListener(\'click\',function(){\n    wrap.classList.toggle(\'expanded\');\n    btn.textContent=wrap.classList.contains(\'expanded\')?\'閉じる\':\'続きを見る\';\n  });\n})();\n</script>\n</body></html>`;\n}\n';
const SECRET = '123456';
const COMPAT = '2025-01-01';

// このWorkerはデプロイAPI専用。操作画面(GitHub Pages)からCORS経由で叩かれる。
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsH() });
    }
    if (request.method === 'GET' && url.pathname === '/') {
      return jsonR({ ok: true, message: 'サイトジェネレーターAPI。操作画面はGitHub Pagesを利用してください。' });
    }
    if (request.method === 'POST' && url.pathname === '/deploy') {
      return handleDeploy(request, env);
    }
    return jsonR({ success: false, error: 'Not found' }, 404);
  }
};

function corsH() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonR(body, status=200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', ...corsH() }
  });
}

async function withRetry(fn, { retries=6, baseDelayMs=1000 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

async function cfFetch(url, token, method='GET', body=null, contentType='application/json') {
  const headers = { 'Authorization': 'Bearer ' + token };
  if (contentType) headers['Content-Type'] = contentType;
  const opts = { method, headers };
  if (body) opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  return withRetry(async () => {
    const r = await fetch(url, opts);
    return { ok: r.ok, status: r.status, json: await r.json() };
  }, { retries: 3, baseDelayMs: 800 });
}

async function handleDeploy(request, env) {
  let step = '初期化';
  try {
    const form = await request.formData();
    const workerName = form.get('workerName')?.trim().toLowerCase();
    const tiktokUrl  = form.get('tiktokUrl')?.trim();
    const title      = form.get('title')?.trim();
    const background = form.get('background');
    const ogpImage   = form.get('ogpImage');
    const appIcon    = form.get('appIcon');
    const avatar     = form.get('avatar');
    const username      = form.get('username')?.trim() || '';
    const description   = form.get('description')?.trim() || '';
    const musicName     = form.get('musicName')?.trim() || '';
    const likeCount      = form.get('likeCount')?.trim() || '0';
    const commentCount   = form.get('commentCount')?.trim() || '0';
    const shareCount     = form.get('shareCount')?.trim() || '0';

    if (!workerName || !tiktokUrl || !title)
      return jsonR({ success:false, error:'必須フィールドが不足しています' }, 400);

    if (!/^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/.test(workerName))
      return jsonR({ success:false, error:'Worker名は英小文字・数字・ハイフンのみ(先頭末尾はハイフン不可)' }, 400);

    const accountId = env.CF_ACCOUNT_ID;
    const token     = env.CF_API_TOKEN;
    if (!accountId || !token)
      return jsonR({ success:false, error:'CF_ACCOUNT_ID または CF_API_TOKEN が設定されていません' }, 500);

    const base = 'https://api.cloudflare.com/client/v4/accounts/' + accountId;

    // ① KV作成/取得
    step = '①KV一覧取得';
    const kvListRes = await cfFetch(base + '/storage/kv/namespaces?per_page=100', token);
    if (!kvListRes.ok) throw new Error(kvListRes.json?.errors?.[0]?.message || 'HTTP ' + kvListRes.status);
    const kvTitle = 'SITE_DATA_' + workerName;
    let kvId;
    const existing = kvListRes.json.result?.find(ns => ns.title === kvTitle);
    if (existing) {
      kvId = existing.id;
    } else {
      step = '①KV作成';
      const kvCreate = await cfFetch(base + '/storage/kv/namespaces', token, 'POST', { title: kvTitle });
      if (!kvCreate.ok) throw new Error(kvCreate.json?.errors?.[0]?.message || 'HTTP ' + kvCreate.status);
      kvId = kvCreate.json.result.id;
    }

    // ② Workerスクリプトをデプロイ
    step = '②Workerデプロイ';
    const metadata = {
      main_module: 'index.js',
      compatibility_date: COMPAT,
      bindings: [{ type:'kv_namespace', name:'KV', namespace_id:kvId }]
    };
    const scriptForm = new FormData();
    scriptForm.append('metadata', new Blob([JSON.stringify(metadata)], { type:'application/json' }), 'blob');
    scriptForm.append('index.js', new Blob([VIEWER_CODE], { type:'application/javascript+module' }), 'index.js');
    const { deployRes, deployJson } = await withRetry(async () => {
      const res = await fetch(base + '/workers/scripts/' + workerName, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token },
        body: scriptForm,
      });
      return { deployRes: res, deployJson: await res.json() };
    }, { retries: 3, baseDelayMs: 800 });
    if (!deployRes.ok || !deployJson.success)
      throw new Error(deployJson.errors?.[0]?.message || 'HTTP ' + deployRes.status);

    // ③ SECRET変数を設定
    step = '③SECRET設定';
    const secretRes = await cfFetch(
      base + '/workers/scripts/' + workerName + '/secrets',
      token, 'PUT', { name:'SECRET', text:SECRET, type:'secret_text' }
    );
    if (!secretRes.ok)
      throw new Error(secretRes.json?.errors?.[0]?.message || 'HTTP ' + secretRes.status);

    // ④ 画像・データをKV名前空間へ直接書き込み
    // 新規デプロイ直後のworkers.dev URLはWorker間サブリクエストだと
    // "Network connection lost" のような接続エラーになりやすく、
    // リトライを重ねても解消しないことがあるため、
    // 新しいサイトWorker自体を経由せず、Cloudflareの
    // KV書き込みAPIへ直接アクセスしてデータを反映する。
    step = '④データをKVへ書き込み';
    const kvValuesBase = base + '/storage/kv/namespaces/' + kvId + '/values/';
    async function putKV(key, body, contentType) {
      return withRetry(async () => {
        const res = await fetch(kvValuesBase + encodeURIComponent(key), {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': contentType },
          body,
        });
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.errors?.[0]?.message || 'HTTP ' + res.status);
      }, { retries: 3, baseDelayMs: 800 });
    }
    const kvPuts = [
      putKV('title', title, 'text/plain'),
      putKV('tiktokUrl', tiktokUrl, 'text/plain'),
      putKV('username', username, 'text/plain'),
      putKV('description', description, 'text/plain'),
      putKV('musicName', musicName, 'text/plain'),
      putKV('likeCount', likeCount, 'text/plain'),
      putKV('commentCount', commentCount, 'text/plain'),
      putKV('shareCount', shareCount, 'text/plain'),
    ];
    if (background) kvPuts.push(putKV('background', await background.arrayBuffer(), 'application/octet-stream'));
    if (ogpImage)   kvPuts.push(putKV('ogpImage', await ogpImage.arrayBuffer(), 'application/octet-stream'));
    if (appIcon)    kvPuts.push(putKV('appIcon', await appIcon.arrayBuffer(), 'application/octet-stream'));
    if (avatar)     kvPuts.push(putKV('avatar', await avatar.arrayBuffer(), 'application/octet-stream'));
    await Promise.all(kvPuts);

    // ⑤ workers.dev有効化
    step = '⑤workers.dev有効化';
    await cfFetch(base + '/workers/scripts/' + workerName + '/subdomain', token, 'POST', { enabled:true });

    // ⑥ サブドメイン取得（公開URL算出のため）
    step = '⑥サブドメイン取得';
    const sdRes = await cfFetch(base + '/workers/subdomain', token);
    if (!sdRes.ok) throw new Error('HTTP ' + sdRes.status);
    const subdomain = sdRes.json.result?.subdomain;
    if (!subdomain) throw new Error('サブドメインが空でした: ' + JSON.stringify(sdRes.json));
    const workerUrl = 'https://' + workerName + '.' + subdomain + '.workers.dev';

    return jsonR({ success:true, url:workerUrl });
  } catch(e) {
    return jsonR({ success:false, error:'[' + step + '] ' + e.message }, 500);
  }
}
