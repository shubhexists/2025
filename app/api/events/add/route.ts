import { query } from "@/lib/db";

export async function POST(req: any) {
  const { id, date, title, description } = await req.json();

  try {
    await query(
      "INSERT INTO events (id, date, title, description) VALUES ($1, $2, $3, $4)",
      [id, date, title, description]
    );
    return new Response(
      JSON.stringify({ message: "Event added successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to add event" }), {
      status: 500,
    });
  }
}
