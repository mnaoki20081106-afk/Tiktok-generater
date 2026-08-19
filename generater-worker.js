const VIEWER_CODE = 'export default {\n  async fetch(request, env, ctx) {\n    const url = new URL(request.url);\n    const origin = url.origin;\n    const path = url.pathname;\n    if (request.method === \'OPTIONS\') return new Response(null, { headers: corsH() });\n    if (request.method === \'POST\' && path === \'/update\') {\n      if (!env.SECRET || request.headers.get(\'X-Secret\') !== env.SECRET)\n        return jsonR({ success:false, error:\'Unauthorized\' }, 401);\n      try {\n        const f = await request.formData();\n        const puts = [];\n        const kv = env.KV;\n        const title = f.get(\'title\'); const tku = f.get(\'tiktokUrl\');\n        const bg = f.get(\'background\'); const ogp = f.get(\'ogpImage\'); const icon = f.get(\'appIcon\');\n        if (title) puts.push(kv.put(\'title\', title));\n        if (tku)   puts.push(kv.put(\'tiktokUrl\', tku));\n        if (bg)    puts.push(kv.put(\'background\', await bg.arrayBuffer()));\n        if (ogp)   puts.push(kv.put(\'ogpImage\', await ogp.arrayBuffer()));\n        if (icon)  puts.push(kv.put(\'appIcon\', await icon.arrayBuffer()));\n        await Promise.all(puts);\n        return jsonR({ success:true }, 200);\n      } catch(e) { return jsonR({ success:false, error:e.message }, 500); }\n    }\n    if (path === \'/background.png\') return img(env.KV, \'background\');\n    if (path === \'/ogp-image.png\')  return img(env.KV, \'ogpImage\');\n    if (path === \'/app-icon.png\')   return img(env.KV, \'appIcon\');\n    const title = (await env.KV.get(\'title\')) || \'TikTok\';\n    const tku   = (await env.KV.get(\'tiktokUrl\')) || \'#\';\n    return new Response(html(title, tku, origin), { headers:{ \'Content-Type\':\'text/html;charset=UTF-8\',\'Cache-Control\':\'no-cache\' } });\n  }\n};\nasync function img(kv, key) {\n  const d = await kv.get(key, { type:\'arrayBuffer\' });\n  if (!d) return new Response(\'Not found\', { status:404 });\n  return new Response(d, { headers:{ \'Content-Type\':\'image/png\',\'Cache-Control\':\'no-cache\' } });\n}\nfunction jsonR(b, s) { return new Response(JSON.stringify(b), { status:s, headers:{ \'Content-Type\':\'application/json\',...corsH() } }); }\nfunction corsH() { return { \'Access-Control-Allow-Origin\':\'*\',\'Access-Control-Allow-Methods\':\'POST,GET,OPTIONS\',\'Access-Control-Allow-Headers\':\'X-Secret\' }; }\nfunction html(title, tiktokUrl, origin) { return `<!DOCTYPE html>\n<html lang="ja"><head><meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<title>${title}</title>\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="TikTokのアプリで全機能をお試しください">\n<meta property="og:image" content="${origin}/ogp-image.png">\n<meta property="og:url" content="${origin}/">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${origin}/ogp-image.png">\n<style>\n*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%;width:100%;background:#000;font-family:-apple-system,"Hiragino Sans",sans-serif;overflow:hidden;position:fixed;inset:0}\n.s{position:relative;width:100%;height:100vh;height:calc(var(--vh,1vh) * 100);height:100svh;height:100dvh;max-width:480px;margin:0 auto;overflow:hidden;background:#000}\n.bg{position:absolute;inset:0}.bg img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}\n.ov{position:absolute;inset:0;background:rgba(0,0,0,0.514);z-index:3001;display:flex;align-items:center;justify-content:center;padding:0 20px}\n.mc{background:#fff;border-radius:12px;width:100%;max-width:336px;box-shadow:0 4px 24px rgba(0,0,0,0.3);animation:fu .25s cubic-bezier(.22,1,.36,1)}\n@keyframes fu{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}\n.mb{padding:28px 24px 0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}\n.mi{width:60px;height:60px;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.15)}\n.mi img{width:100%;height:100%;object-fit:cover;display:block}\n.mt{font-size:17px;font-weight:700;color:#161823;line-height:1.35}\n.md{font-size:13px;color:rgba(22,24,35,.7);line-height:1.55}\n.ma{padding:18px 20px 22px;display:flex;flex-direction:column;align-items:center;position:relative}\n.bo{display:block;width:100%;padding:13px 0;background:#fe2c55;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:4px;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 2px 8px rgba(254,44,85,.35);transition:opacity .15s}\n.bo:active{opacity:.82}\n.bl{display:block;width:100%;padding:12px 0 0;background:none;border:none;color:rgba(22,24,35,.55);font-size:15px;cursor:pointer;text-align:center}\n</style></head><body>\n<div class="s">\n  <div class="bg"><img src="${origin}/background.png" alt=""></div>\n  <div class="ov" id="ov">\n    <div class="mc">\n      <div class="mb">\n        <div class="mi"><img src="${origin}/app-icon.png" alt=""></div>\n        <p class="mt">TikTokのアプリで全機能をお試しください</p>\n        <p class="md">アプリでさらに多くの動画と優れた機能をお楽しみください</p>\n      </div>\n      <div class="ma">\n        <a href="${tiktokUrl}" class="bo">TikTokを開く</a>\n        <button class="bl" onclick="document.getElementById(\'ov\').style.display=\'none\'">後で</button>\n      </div>\n    </div>\n  </div>\n</div>\n<script>function setVh(){document.documentElement.style.setProperty(\'--vh\',window.innerHeight*0.01+\'px\')}setVh();addEventListener(\'resize\',setVh);addEventListener(\'orientationchange\',setVh);</script>\n</body></html>`; }\n';
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
    ];
    if (background) kvPuts.push(putKV('background', await background.arrayBuffer(), 'application/octet-stream'));
    if (ogpImage)   kvPuts.push(putKV('ogpImage', await ogpImage.arrayBuffer(), 'application/octet-stream'));
    if (appIcon)    kvPuts.push(putKV('appIcon', await appIcon.arrayBuffer(), 'application/octet-stream'));
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
