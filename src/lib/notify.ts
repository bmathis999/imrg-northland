import "server-only";

/**
 * Optional email alert to the chapter inbox through Resend's free tier.
 * Does nothing unless RESEND_API_KEY and NOTIFY_EMAIL are set. Failures are
 * logged, never shown to the visitor: the request is already saved.
 */
export async function notifyChapter(subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM ?? "IMRG Northland website <website@northlandimrg.com>";
  if (!key || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("notifyChapter failed", res.status);
  } catch (err) {
    console.error("notifyChapter error", err instanceof Error ? err.message : err);
  }
}
