import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

// ---------------------------------------------------------------------------
// Config (set via `pulumi config`; see infra/README.md). The Cloudflare API
// token is read from the `cloudflare:apiToken` secret or CLOUDFLARE_API_TOKEN.
// ---------------------------------------------------------------------------
const cfg = new pulumi.Config();
// IDs come from `pulumi config` OR the git-ignored infra/.env (CLOUDFLARE_*).
const accountId = cfg.get("accountId") ?? process.env.CLOUDFLARE_ACCOUNT_ID;
const zoneId = cfg.get("zoneId") ?? process.env.CLOUDFLARE_ZONE_ID;
if (!accountId) throw new Error("Set `pulumi config set accountId <id>` or CLOUDFLARE_ACCOUNT_ID");
if (!zoneId) throw new Error("Set `pulumi config set zoneId <id>` or CLOUDFLARE_ZONE_ID");
const domain = cfg.get("domain") ?? "thecenterisalie.org";
const githubOwner = cfg.get("githubOwner") ?? "jamesvillarrubia";
const githubRepo = cfg.get("githubRepo") ?? "center-basher";
const productionBranch = cfg.get("productionBranch") ?? "claude/dazzling-maxwell-sSHUR";
const projectName = cfg.get("projectName") ?? "thecenterisalie";

// ---------------------------------------------------------------------------
// 1. DNS zone — already exists in Cloudflare, so we reference it by ID (we do
//    NOT create it). The `nameservers` output below is what GoDaddy must point
//    at (if you haven't already). NOTE: once GoDaddy points here, Cloudflare is
//    authoritative for ALL DNS on the domain — replicate any existing email/MX
//    records as `cloudflare.Record` resources before switching, or they break.
// ---------------------------------------------------------------------------
const zone = cloudflare.getZoneOutput({ zoneId: zoneId });

// ---------------------------------------------------------------------------
// 2. Cloudflare Pages project, wired to the GitHub repo for auto-build on push.
//    PREREQUISITE: the GitHub account must be linked to Cloudflare once via the
//    dashboard (Workers & Pages -> Create -> Pages -> Connect to Git -> authorize
//    the Cloudflare app on this repo) before this resource can be created.
// ---------------------------------------------------------------------------
const site = new cloudflare.PagesProject("site", {
    accountId: accountId,
    name: projectName,
    productionBranch: productionBranch,
    source: {
        type: "github",
        config: {
            owner: githubOwner,
            repoName: githubRepo,
            productionBranch: productionBranch,
            deploymentsEnabled: true,
            productionDeploymentEnabled: true,
            prCommentsEnabled: true,
        },
    },
    // The site lives in web/; the build copies data/ into dist/ (see web/vite.config.js).
    buildConfig: {
        buildCommand: "pnpm install && pnpm build",
        destinationDir: "dist",
        rootDir: "web",
    },
});

// ---------------------------------------------------------------------------
// 3. Custom domains on the Pages project (apex + www).
// ---------------------------------------------------------------------------
const apexDomain = new cloudflare.PagesDomain("apex", {
    accountId: accountId,
    projectName: site.name,
    domain: domain,
});
const wwwDomain = new cloudflare.PagesDomain("www", {
    accountId: accountId,
    projectName: site.name,
    domain: pulumi.interpolate`www.${domain}`,
});

// ---------------------------------------------------------------------------
// 4. DNS records routing the domain to the Pages project (proxied; the apex
//    relies on Cloudflare's CNAME flattening). If `pulumi up` reports the
//    record already exists (Cloudflare auto-created it when the custom domain
//    was attached), either delete these two resources or `pulumi import` them.
// ---------------------------------------------------------------------------
const target = `${projectName}.pages.dev`;
new cloudflare.Record("apex-cname", {
    zoneId: zoneId,
    name: "@",
    type: "CNAME",
    content: target,
    proxied: true,
}, { dependsOn: [apexDomain] });
new cloudflare.Record("www-cname", {
    zoneId: zoneId,
    name: "www",
    type: "CNAME",
    content: target,
    proxied: true,
}, { dependsOn: [wwwDomain] });

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const nameservers = zone.nameServers; // <- set these at GoDaddy
export const pagesPreviewUrl = `https://${projectName}.pages.dev`;
export const siteUrl = `https://${domain}`;
