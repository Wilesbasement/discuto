import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("supabase")) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}
