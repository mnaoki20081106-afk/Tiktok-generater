# Tiktok-generater

TikTokプロフィール誘導用のランディングサイトを、Cloudflare Workers上に自動デプロイ/上書きするジェネレーターです。

## 構成

- **操作画面（このリポジトリの `docs/index.html`）**: GitHub Pagesで配信する静的HTML。Worker名・TikTok URL・画像を入力してデプロイAPIを呼び出すだけ。
- **デプロイAPI（`generater-worker.js`）**: Cloudflare Worker。Cloudflare APIを叩いて実際のサイト用Workerを作成/更新する。CORS対応済みで、GitHub Pagesからのクロスオリジン呼び出しを受け付ける。
- **公開されるサイト（`VIEWER_CODE`）**: デプロイAPIが動的に生成し、Cloudflare上の別Workerとしてデプロイするコード。実際にユーザーが閲覧するTikTok誘導ページ本体。

## セットアップ

### 1. デプロイAPI用Workerをデプロイ

1. `generater-worker.js` の内容でCloudflare Workerを新規作成（例: `tiktok-generator-api`）。
2. Worker の Settings → Variables and Secrets に以下を設定:
   - `CF_ACCOUNT_ID`: CloudflareアカウントID
   - `CF_API_TOKEN`: Workers編集権限を持つAPIトークン
3. デプロイ後、`https://tiktok-generator-api.<subdomain>.workers.dev` のようなURLが発行される。これを操作画面から使用する。

### 2. 操作画面をGitHub Pagesで公開

1. このリポジトリの Settings → Pages で、Source を `docs/` フォルダに設定。
2. 公開されたURL（例: `https://<user>.github.io/Tiktok-generater/`）にアクセス。
3. 「デプロイAPIのURL」欄に手順1で発行されたWorkerのURLを入力（ブラウザに保存されるので初回のみでOK）。
4. Worker名・TikTokプロフィールURL・OGPタイトル・各種画像を入力して「自動デプロイ」を押すと、公開サイトがCloudflare上に作成/上書きされる。

## デプロイが失敗する場合

デプロイAPI Worker新規作成直後は、`workers.dev` サブドメインのDNS/エッジ伝播が完了しておらず、
公開サイトへの初回データ送信でネットワークエラーになることがあります。
`generater-worker.js` 側は指数バックオフ付きのリトライ（最大6回、合計約60秒）でこれを吸収します。
それでも失敗する場合は、時間を置いて再度「自動デプロイ」を実行してください（同名Workerは上書きされます）。
