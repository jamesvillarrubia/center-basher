import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

// ---------------------------------------------------------------------------
// Config (set via `pulumi config`; see infra/README.md). The Cloudflare API
// token is read from the `cloudflare:apiToken` secret or CLOUDFLARE_API_TOKEN.
// ---------------------------------------------------------------------------
const cfg = new pulumi.Config();
const accountId = cfg.require("accountId");
const domain = cfg.get("domain") ?? "thecenterisalie.org";
const githubOwner = cfg.get("githubOwner") ?? "jamesvillarrubia";
const githubRepo = cfg.get("githubRepo") ?? "center-basher";
const productionBranch = cfg.get("productionBranch") ?? "claude/dazzling-maxwell-sSHUR";
const projectName = cfg.get("projectName") ?? "thecenterisalie";

// ---------------------------------------------------------------------------
// 1. DNS zone. After `pulumi up`, point GoDaddy's nameservers at the
//    `nameservers` output below so Cloudflare becomes authoritative.
//    NOTE: this makes Cloudflare authoritative for ALL DNS on the domain. If
//    there are existing records (email/MX, etc.) at GoDaddy, replicate them as
//    additional `cloudflare.Record` resources here BEFORE switching nameservers.
// ---------------------------------------------------------------------------
const zone = new cloudflare.Zone("zone", {
    accountId: accountId,
    zone: domain,
    type: "full",
});

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
    zoneId: zone.id,
    name: "@",
    type: "CNAME",
    value: target, // provider v6 renames this field to `content`
    proxied: true,
}, { dependsOn: [apexDomain] });
new cloudflare.Record("www-cname", {
    zoneId: zone.id,
    name: "www",
    type: "CNAME",
    value: target,
    proxied: true,
}, { dependsOn: [wwwDomain] });

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const nameservers = zone.nameServers; // <- set these at GoDaddy
export const pagesPreviewUrl = `https://${projectName}.pages.dev`;
export const siteUrl = `https://${domain}`;
