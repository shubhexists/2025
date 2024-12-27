import { query } from "@/lib/db";

export async function POST(req: any) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      description TEXT
    );
  `;
  try {
    await query(createTableQuery, []);
    return new Response(
      JSON.stringify({ message: "Table initialized successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to initialize table" }),
      { status: 500 }
    );
  }
}
