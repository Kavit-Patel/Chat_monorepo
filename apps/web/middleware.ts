// File: middleware.js (at the root of your Next.js project)

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Assuming you store a token in cookies to manage login status
  const token = request.cookies.get("chat_next");

  // Conditions for allowing the request without a redirect:
  // 1. The request is for authentication-related paths or the login page.
  // 2. A valid token exists (the user is logged in).
  if (token) {
    return NextResponse.next();
  }

  // Specific logic for the root path (main page)
  // Redirect to login if trying to access the main page without a token
  if (!token && pathname === "/dashboard") {
    // Adjust the URL to your login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For all other cases, just proceed as usual
  return NextResponse.next();
}
