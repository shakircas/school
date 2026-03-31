// import { NextResponse } from "next/server";
// import { auth } from "@/auth";

// export default auth((req) => {
//   const { pathname } = req.nextUrl;
//   const user = req.auth?.user;

//   // ❌ Not logged in
//   if (!user && pathname !== "/login") {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   if (!user) return NextResponse.next();

//   const role = user.role;

//   /* ================= ROLE PROTECTION ================= */

//   // ADMIN
//   if (pathname.startsWith("/admin") && role !== "admin") {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

//   // TEACHER
//   if (pathname.startsWith("/teacher") && !["teacher", "admin"].includes(role)) {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

//   // STUDENT
//   if (pathname.startsWith("/student") && role !== "student") {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }
//   // middleware.ts
//   if (
//     pathname.startsWith("/teacher/analytics") &&
//     role !== "teacher" &&
//     role !== "admin"
//   ) {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/teacher/:path*",
//     "/student/:path*",
//     "/dashboard/:path*",
//   ],
// };

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const role = user?.role;

  // 1. PUBLIC & SYSTEM ASSETS
  if (
    pathname.startsWith("/_next") ||
    pathname === "/maintenance" ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/api/system") // Important: Don't block the config API itself
  ) {
    return NextResponse.next();
  }

  // 2. CHECK MAINTENANCE STATUS (Optional: Wrap in a try-catch as you did)
  // Optimization: Only check maintenance for non-admin routes
  if (role !== "admin" && pathname !== "/maintenance") {
    try {
      const configRes = await fetch(
        `${req.nextUrl.origin}/api/system/config-status`,
      );
      const config = await configRes.json();
      if (config?.isMaintenanceMode) {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    } catch (e) {
      console.error("Maintenance check failed");
    }
  }

  // 3. AUTHENTICATION & LOGIN REDIRECT
  if (!user) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // FIX: Redirect already logged-in users away from /login
  if (user && pathname === "/login") {
    const target =
      role === "admin"
        ? "/admin"
        : role === "teacher"
          ? "/teacher"
          : "/student";
    return NextResponse.redirect(new URL(target, req.url));
  }

  /* ================= ROLE PROTECTION ================= */

  // ADMIN - Only Admins
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // TEACHER - Teachers and Admins
  if (pathname.startsWith("/teacher") && !["teacher", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // STUDENT - Only Students
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // GENERAL DASHBOARD - Catch-all for shared assets
  if (pathname.startsWith("/dashboard") && !role) {
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
    "/login",
  ],
};
