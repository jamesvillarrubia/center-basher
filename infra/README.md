# infra — Cloudflare DNS + Pages for thecenterisalie.org (Pulumi)

Infrastructure as code for hosting the essay. Pulumi (`@pulumi/cloudflare`,
TypeScript) provisions:

- the **DNS zone** for `thecenterisalie.org` + the routing records,
- a **Cloudflare Pages** project wired to this GitHub repo (auto-build on push),
- the **custom-domain** bindings (apex + `www`).

The site itself is the Vite app in `../web` (build: `pnpm install && pnpm build`,
output `dist/`; `web/vite.config.js` copies `data/` into `dist/` so the figures
load in production).

---

## One-time manual prerequisites (Pulumi can't do these)

1. **Cloudflare API token.** dash.cloudflare.com → *My Profile → API Tokens →
   Create Token → Create Custom Token*. Permissions:
   - Account · **Cloudflare Pages** · Edit
   - Account · **Account Settings** · Read
   - Zone · **Zone** · Edit
   - Zone · **DNS** · Edit
   - Zone Resources: *All zones* (or add the zone after it exists).
   Also copy your **Account ID** (dashboard right sidebar / Workers & Pages overview).

2. **Link GitHub to Cloudflare (once).** Workers & Pages → *Create* → *Pages* →
   *Connect to Git* → authorize the Cloudflare GitHub app on
   `jamesvillarrubia/center-basher`. You can stop once it's authorized — Pulumi
   creates the actual project. (The Pages API can't create a github-sourced
   project until this connection exists.)

3. **GoDaddy** is the registrar. You'll switch its nameservers to Cloudflare in
   step 5 below. ⚠️ Switching nameservers makes Cloudflare authoritative for
   **all** DNS on the domain. If `thecenterisalie.org` already has email (MX) or
   other live records at GoDaddy, add them as `cloudflare.Record` resources in
   `index.ts` **before** switching, or they'll stop resolving.

---

## Deploy

```bash
cd infra
pnpm install

pulumi login                       # Pulumi Cloud
pulumi stack select prod || pulumi stack init prod

# config
pulumi config set accountId <CLOUDFLARE_ACCOUNT_ID>
pulumi config set --secret cloudflare:apiToken <CLOUDFLARE_API_TOKEN>

pulumi preview                     # review — fix any schema diffs (see Gotchas)
pulumi up
```

`pulumi up` prints outputs, including **`nameservers`** (two `*.ns.cloudflare.com`
hosts) and `pagesPreviewUrl` (`https://thecenterisalie.pages.dev`).

## 5. Point GoDaddy at Cloudflare

GoDaddy → your domain → **DNS / Nameservers → Change → Enter my own nameservers**
→ paste the two `nameservers` values from the Pulumi output → save. Propagation
takes minutes to a few hours. Cloudflare also emails when the zone goes active.

After that:
- `https://thecenterisalie.org` and `https://www.thecenterisalie.org` serve the site.
- Every push to **`claude/dazzling-maxwell-sSHUR`** auto-builds and deploys.
- Cloudflare provisions the TLS cert automatically (a few minutes after the zone
  is active).

---

## Gotchas

- **Provider schema drift.** Pinned to `@pulumi/cloudflare` v5. If you bump to v6,
  some fields rename — notably `cloudflare.Record.value` → `content`, and the
  `Zone`/`PagesProject` arg shapes shift. `pulumi preview` will tell you; adjust
  `index.ts` accordingly.
- **"record already exists"** on the apex/www CNAME: Cloudflare sometimes
  auto-creates the routing record when a Pages custom domain is attached. If so,
  delete the two `cloudflare.Record` resources in `index.ts`, or
  `pulumi import cloudflare:index/record:Record apex-cname <zoneId>/<recordId>`.
- **Build can't find pnpm / wrong Node:** Cloudflare Pages auto-detects pnpm from
  `web/pnpm-lock.yaml`. If the build needs a specific Node, add a `NODE_VERSION`
  env var to the Pages project (production env) or a `web/.node-version` file.
- **The production branch is `claude/dazzling-maxwell-sSHUR`.** If you later merge
  to `main`, update `productionBranch` here and in the Pages project.
