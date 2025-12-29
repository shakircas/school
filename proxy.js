import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // ❌ Not logged in
  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user) return NextResponse.next();

  const role = user.role;

  /* ================= ROLE PROTECTION ================= */

  // ADMIN
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // TEACHER
  if (pathname.startsWith("/teacher") && !["teacher", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // STUDENT
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  // middleware.ts
  if (
    pathname.startsWith("/teacher/analytics") &&
    role !== "teacher" &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/dashboard/:path*",
  ],
};
