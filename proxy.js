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

  // 1. PUBLIC & SYSTEM ASSETS (Always allow)
  if (
    pathname.startsWith("/_next") ||
    pathname === "/maintenance" ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  // 2. CHECK MAINTENANCE STATUS
  // Note: For high performance, fetch this from a Cache/Redis if possible
  try {
    const configRes = await fetch(
      `${req.nextUrl.origin}/api/system/config-status`,
      {
        next: { revalidate: 0 }, // Ensure we don't cache the "Off" status
      },
    );
    const config = await configRes.json();

    // If Maintenance is ON and user is NOT an Admin, redirect
    if (
      config?.isMaintenanceMode &&
      role !== "admin" &&
      pathname !== "/login"
    ) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  } catch (e) {
    console.error("Middleware Config Fetch Failed", e);
  }

  // 3. AUTHENTICATION CHECK
  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!user) return NextResponse.next();

  /* ================= ROLE PROTECTION ================= */

  // ADMIN - Only Admins can enter /admin
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // TEACHER - Teachers and Admins can enter /teacher
  if (pathname.startsWith("/teacher") && !["teacher", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // STUDENT - Only Students can enter /student
  if (pathname.startsWith("/student") && role !== "student") {
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
    "/login", // Added login to allow redirecting away if already auth'd
  ],
};