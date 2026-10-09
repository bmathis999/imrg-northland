// Cloudflare adapter settings.
// Page cache is stored in Workers KV, which is on Cloudflare's free plan without a
// payment method (R2, the adapter's default, needs one on file).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
