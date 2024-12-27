import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM events ORDER BY date ASC", []);
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch events" }), {
      status: 500,
    });
  }
}
