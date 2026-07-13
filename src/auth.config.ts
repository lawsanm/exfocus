import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { env } from "@/lib/env";

const AUTH_ROUTE_PREFIXES = ["/login", "/register"];

/**
 * Edge-compatible config: no Prisma, no bcrypt. Used directly by
 * middleware.ts. src/auth.ts extends this with the Credentials provider
 * and the Prisma adapter for use in Node.js runtime (route handlers,
 * server components, server actions).
 */
export const authConfig: NextAuthConfig = {
  providers: env.AUTH_GOOGLE_ID
    ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
    : [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix),
      );

      if (isOnAuthRoute) {
        return isLoggedIn ? Response.redirect(new URL("/dashboard", request.nextUrl)) : true;
      }

      return isLoggedIn;
    },
  },
};
