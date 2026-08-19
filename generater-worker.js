const VIEWER_CODE = 'export default {\n  async fetch(request, env, ctx) {\n    const url = new URL(request.url);\n    const origin = url.origin;\n    const path = url.pathname;\n    if (request.method === \'OPTIONS\') return new Response(null, { headers: corsH() });\n    if (request.method === \'POST\' && path === \'/update\') {\n      if (!env.SECRET || request.headers.get(\'X-Secret\') !== env.SECRET)\n        return jsonR({ success:false, error:\'Unauthorized\' }, 401);\n      try {\n        const f = await request.formData();\n        const puts = [];\n        const kv = env.KV;\n        const title = f.get(\'title\'); const tku = f.get(\'tiktokUrl\');\n        const bg = f.get(\'background\'); const ogp = f.get(\'ogpImage\'); const icon = f.get(\'appIcon\');\n        if (title) puts.push(kv.put(\'title\', title));\n        if (tku)   puts.push(kv.put(\'tiktokUrl\', tku));\n        if (bg)    puts.push(kv.put(\'background\', await bg.arrayBuffer()));\n        if (ogp)   puts.push(kv.put(\'ogpImage\', await ogp.arrayBuffer()));\n        if (icon)  puts.push(kv.put(\'appIcon\', await icon.arrayBuffer()));\n        await Promise.all(puts);\n        return jsonR({ success:true }, 200);\n      } catch(e) { return jsonR({ success:false, error:e.message }, 500); }\n    }\n    if (path === \'/background.png\') return img(env.KV, \'background\');\n    if (path === \'/ogp-image.png\')  return img(env.KV, \'ogpImage\');\n    if (path === \'/app-icon.png\')   return img(env.KV, \'appIcon\');\n    const title = (await env.KV.get(\'title\')) || \'TikTok\';\n    const tku   = (await env.KV.get(\'tiktokUrl\')) || \'#\';\n    return new Response(html(title, tku, origin), { headers:{ \'Content-Type\':\'text/html;charset=UTF-8\',\'Cache-Control\':\'no-cache\' } });\n  }\n};\nasync function img(kv, key) {\n  const d = await kv.get(key, { type:\'arrayBuffer\' });\n  if (!d) return new Response(\'Not found\', { status:404 });\n  return new Response(d, { headers:{ \'Content-Type\':\'image/png\',\'Cache-Control\':\'no-cache\' } });\n}\nfunction jsonR(b, s) { return new Response(JSON.stringify(b), { status:s, headers:{ \'Content-Type\':\'application/json\',...corsH() } }); }\nfunction corsH() { return { \'Access-Control-Allow-Origin\':\'*\',\'Access-Control-Allow-Methods\':\'POST,GET,OPTIONS\',\'Access-Control-Allow-Headers\':\'X-Secret\' }; }\nfunction html(title, tiktokUrl, origin) { return `<!DOCTYPE html>\n<html lang="ja"><head><meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<title>${title}</title>\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="TikTokのアプリで全機能をお試しください">\n<meta property="og:image" content="${origin}/ogp-image.png">\n<meta property="og:url" content="${origin}/">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${origin}/ogp-image.png">\n<style>\n*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%;width:100%;background:#000;font-family:-apple-system,"Hiragino Sans",sans-serif;overflow:hidden;position:fixed;inset:0}\n.s{position:relative;width:100%;height:100dvh;max-width:480px;margin:0 auto;overflow:hidden;background:#000}\n.bg{position:absolute;inset:0}.bg img{width:100%;height:100%;object-fit:cover;display:block}\n.ov{position:absolute;inset:0;background:rgba(0,0,0,0.514);z-index:3001;display:flex;align-items:center;justify-content:center;padding:0 20px}\n.mc{background:#fff;border-radius:12px;width:100%;max-width:336px;box-shadow:0 4px 24px rgba(0,0,0,0.3);animation:fu .25s cubic-bezier(.22,1,.36,1)}\n@keyframes fu{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}\n.mb{padding:28px 24px 0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}\n.mi{width:60px;height:60px;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.15)}\n.mi img{width:100%;height:100%;object-fit:cover;display:block}\n.mt{font-size:17px;font-weight:700;color:#161823;line-height:1.35}\n.md{font-size:13px;color:rgba(22,24,35,.7);line-height:1.55}\n.ma{padding:18px 20px 22px;display:flex;flex-direction:column;align-items:center;position:relative}\n.fi{position:absolute;top:-18px;left:50%;font-size:30px;pointer-events:none;z-index:10;animation:tf 1.8s ease-in-out infinite;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))}\n@keyframes tf{0%,30%,70%,100%{transform:translateX(-50%) translateY(0) rotate(-8deg) scale(1)}45%,55%{transform:translateX(-50%) translateY(22px) rotate(-3deg) scale(.92)}}\n.bo{display:block;width:100%;padding:13px 0;background:#fe2c55;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:4px;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 2px 8px rgba(254,44,85,.35);transition:opacity .15s}\n.bo:active{opacity:.82}\n.bl{display:block;width:100%;padding:12px 0 0;background:none;border:none;color:rgba(22,24,35,.55);font-size:15px;cursor:pointer;text-align:center}\n</style></head><body>\n<div class="s">\n  <div class="bg"><img src="${origin}/background.png" alt=""></div>\n  <div class="ov" id="ov">\n    <div class="mc">\n      <div class="mb">\n        <div class="mi"><img src="${origin}/app-icon.png" alt=""></div>\n        <p class="mt">TikTokのアプリで全機能をお試しください</p>\n        <p class="md">アプリでさらに多くの動画と優れた機能をお楽しみください</p>\n      </div>\n      <div class="ma">\n        <div class="fi">☝️</div>\n        <a href="${tiktokUrl}" class="bo">TikTokを開く</a>\n        <button class="bl" onclick="document.getElementById(\'ov\').style.display=\'none\'">後で</button>\n      </div>\n    </div>\n  </div>\n</div>\n</body></html>`; }\n';
const GEN_HTML = '<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>サイトジェネレーター</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{background:#0f0f0f;color:#fff;font-family:-apple-system,"Hiragino Sans",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}\n.card{background:#1a1a1a;border-radius:20px;padding:32px 28px;width:100%;max-width:480px;display:flex;flex-direction:column;gap:20px}\nh1{font-size:20px;font-weight:700}\n.sub{font-size:13px;color:rgba(255,255,255,.45);margin-top:4px;line-height:1.5}\n.sec{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:-8px}\n.field{display:flex;flex-direction:column;gap:8px}\n.fl{font-size:13px;font-weight:600;color:rgba(255,255,255,.7)}\ninput[type=text],input[type=url]{background:#2a2a2a;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:13px 14px;color:#fff;font-size:15px;outline:none;width:100%;transition:border-color .2s;font-family:inherit}\ninput:focus{border-color:rgba(255,255,255,.35)}\n.hint{font-size:12px;color:rgba(255,255,255,.3);margin-top:4px;line-height:1.6}\n.divider{height:1px;background:rgba(255,255,255,.07)}\n.file-btn{display:block;background:#2a2a2a;border:1.5px dashed rgba(255,255,255,.15);border-radius:10px;padding:18px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;font-size:14px;color:rgba(255,255,255,.5)}\n.file-btn:hover{border-color:rgba(255,255,255,.35);background:#333}\n.file-btn.selected{border-color:#fe2c55;color:#fe2c55;border-style:solid}\ninput[type=file]{display:none}\n.fixed-box{background:#2a2a2a;border-radius:10px;padding:18px;text-align:center;font-size:14px;color:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.06)}\n.fb{display:inline-block;background:rgba(254,44,85,.15);color:#fe2c55;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;margin-left:4px}\n.btn-deploy{display:block;width:100%;background:linear-gradient(90deg,#fe2c55,#ff4d6d);color:#fff;border:none;border-radius:12px;padding:15px;font-size:16px;font-weight:700;cursor:pointer;transition:opacity .2s}\n.btn-deploy:disabled{opacity:.4;cursor:not-allowed}\n.status{font-size:13px;text-align:center;color:rgba(255,255,255,.5);min-height:18px;line-height:1.6}\n.status.ok{color:#4ade80}.status.err{color:#fe2c55}\n.result{background:#1e2e1e;border:1px solid rgba(74,222,128,.3);border-radius:10px;padding:14px;font-size:13px;color:#4ade80;word-break:break-all;display:none;text-align:center;line-height:1.8}\n.result a{color:#4ade80}\n.info{background:#222;border-radius:10px;padding:14px 16px;font-size:12px;color:rgba(255,255,255,.45);line-height:1.8;border:1px solid rgba(255,255,255,.06)}\n.info strong{color:rgba(255,255,255,.75)}\n</style>\n</head>\n<body>\n<div class="card">\n  <div>\n    <h1>サイトジェネレーター</h1>\n    <div class="sub">Worker名と画像を入力するだけで自動デプロイ</div>\n  </div>\n\n  <div class="info">\n    認証情報はこのジェネレーター自身のWorkerに保存済みのため、入力不要です。<br>\n    <strong>CF_ACCOUNT_ID</strong> と <strong>CF_API_TOKEN</strong> がVariables and Secretsに設定されていれば動作します。\n  </div>\n\n  <div class="sec">デプロイ設定</div>\n\n  <div class="field">\n    <label class="fl">Worker名</label>\n    <input type="text" id="workerName" placeholder="例: my-tiktok-site">\n    <div class="hint">英小文字・数字・ハイフンのみ。<strong>worker名.subdomain.workers.dev</strong> になります</div>\n  </div>\n  <div class="field">\n    <label class="fl">TikTokプロフィールURL</label>\n    <input type="url" id="tiktokUrl" placeholder="https://www.tiktok.com/@username">\n  </div>\n  <div class="field">\n    <label class="fl">OGPタイトル <span style="color:rgba(255,255,255,.3);font-weight:400">(SNSシェア時のタイトル)</span></label>\n    <input type="text" id="ogpTitle" placeholder="例: 俺の動画見て">\n  </div>\n\n  <div class="divider"></div>\n\n  <div class="field">\n    <label class="fl">背景画像</label>\n    <label class="file-btn" id="bgLabel" for="bgInput">タップして選択</label>\n    <input type="file" id="bgInput" accept="image/*">\n  </div>\n  <div class="field">\n    <label class="fl">OGP画像</label>\n    <label class="file-btn" id="ogpLabel" for="ogpInput">タップして選択</label>\n    <input type="file" id="ogpInput" accept="image/*">\n  </div>\n  <div class="field">\n    <label class="fl">アプリアイコン</label>\n    <label class="file-btn" id="iconLabel" for="iconInput">タップして選択</label>\n    <input type="file" id="iconInput" accept="image/*">\n  </div>\n\n  <button class="btn-deploy" id="deployBtn" disabled>自動デプロイ</button>\n  <div class="status" id="status"></div>\n  <div class="result" id="result"></div>\n</div>\n<script>\nlet bgData=null,ogpData=null,iconData=null;\nfunction onFile(inputId,labelId,setter){\n  document.getElementById(inputId).addEventListener(\'change\',function(){\n    if(this.files.length>0){\n      setter(this.files[0]);\n      document.getElementById(labelId).textContent=this.files[0].name;\n      document.getElementById(labelId).classList.add(\'selected\');\n    }\n    check();\n  });\n}\nonFile(\'bgInput\',\'bgLabel\',f=>bgData=f);\nonFile(\'ogpInput\',\'ogpLabel\',f=>ogpData=f);\nonFile(\'iconInput\',\'iconLabel\',f=>iconData=f);\n[\'workerName\',\'tiktokUrl\',\'ogpTitle\'].forEach(id=>document.getElementById(id).addEventListener(\'input\',check));\nfunction check(){\n  document.getElementById(\'deployBtn\').disabled=!(\n    bgData&&ogpData&&iconData&&\n    document.getElementById(\'workerName\').value.trim()&&\n    document.getElementById(\'tiktokUrl\').value.trim()&&\n    document.getElementById(\'ogpTitle\').value.trim()\n  );\n}\nfunction setStatus(msg,type){\n  const el=document.getElementById(\'status\');\n  el.textContent=msg;el.className=\'status\'+(type?\' \'+type:\'\');\n}\ndocument.getElementById(\'deployBtn\').addEventListener(\'click\',async()=>{\n  const btn=document.getElementById(\'deployBtn\');\n  btn.disabled=true;\n  document.getElementById(\'result\').style.display=\'none\';\n  setStatus(\'デプロイ中... しばらくお待ちください\');\n  try{\n    const form=new FormData();\n    form.append(\'workerName\',document.getElementById(\'workerName\').value.trim().toLowerCase());\n    form.append(\'tiktokUrl\',document.getElementById(\'tiktokUrl\').value.trim());\n    form.append(\'title\',document.getElementById(\'ogpTitle\').value.trim());\n    form.append(\'background\',bgData,\'background.png\');\n    form.append(\'ogpImage\',ogpData,\'ogp-image.png\');\n    form.append(\'appIcon\',iconData,\'app-icon.png\');\n    const res=await fetch(\'/deploy\',{method:\'POST\',body:form});\n    const json=await res.json();\n    if(!res.ok||!json.success) throw new Error(json.error||\'デプロイ失敗\');\n    setStatus(\'✓ デプロイ完了！\',\'ok\');\n    const r=document.getElementById(\'result\');\n    r.innerHTML=\'公開URL: <a href="\'+json.url+\'" target="_blank">\'+json.url+\'</a><br><small style="opacity:.6">（反映まで数秒かかる場合があります）</small>\';\n    r.style.display=\'block\';\n  }catch(e){\n    setStatus(\'エラー: \'+e.message,\'err\');\n  }\n  btn.disabled=false;\n});\n</script>\n</body>\n</html>';
const SECRET = '123456';
const COMPAT = '2025-01-01';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(GEN_HTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }
    if (request.method === 'POST' && url.pathname === '/deploy') {
      return handleDeploy(request, env);
    }
    return new Response('Not found', { status: 404 });
  }
};

function jsonR(body, status=200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}

async function cfFetch(url, token, method='GET', body=null, contentType='application/json') {
  const headers = { 'Authorization': 'Bearer ' + token };
  if (contentType) headers['Content-Type'] = contentType;
  const opts = { method, headers };
  if (body) opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  const r = await fetch(url, opts);
  return { ok: r.ok, status: r.status, json: await r.json() };
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
    const deployRes = await fetch(base + '/workers/scripts/' + workerName, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token },
      body: scriptForm,
    });
    const deployJson = await deployRes.json();
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

    // ④ workers.dev有効化
    step = '④workers.dev有効化';
    await cfFetch(base + '/workers/scripts/' + workerName + '/subdomain', token, 'POST', { enabled:true });

    // ⑤ サブドメイン取得
    step = '⑤サブドメイン取得';
    const sdRes = await cfFetch(base + '/workers/subdomain', token);
    if (!sdRes.ok) throw new Error('HTTP ' + sdRes.status);
    const subdomain = sdRes.json.result?.subdomain;
    if (!subdomain) throw new Error('サブドメインが空でした: ' + JSON.stringify(sdRes.json));
    const workerUrl = 'https://' + workerName + '.' + subdomain + '.workers.dev';

    // ⑥ 画像・データをViewerWorkerへPOST
    step = '⑥データ送信準備(1.5秒待機)';
    await new Promise(r => setTimeout(r, 1500));
    step = '⑥データ送信';
    const dataForm = new FormData();
    dataForm.append('title', title);
    dataForm.append('tiktokUrl', tiktokUrl);
    if (background) dataForm.append('background', background, 'background.png');
    if (ogpImage)   dataForm.append('ogpImage',   ogpImage,   'ogp-image.png');
    if (appIcon)    dataForm.append('appIcon',     appIcon,    'app-icon.png');
    const uploadRes = await fetch(workerUrl + '/update', {
      method: 'POST',
      headers: { 'X-Secret': SECRET },
      body: dataForm,
    });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok || !uploadJson.success)
      throw new Error(uploadJson.error || 'HTTP ' + uploadRes.status);

    return jsonR({ success:true, url:workerUrl });
  } catch(e) {
    return jsonR({ success:false, error:'[' + step + '] ' + e.message }, 500);
  }
}
