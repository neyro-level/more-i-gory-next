export const runtime = "nodejs";

export function GET() {
  return Response.json({ ok: true }, { status: 200, headers: { "cache-control": "no-store" } });
}
