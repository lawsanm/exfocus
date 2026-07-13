import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subjects/:path*",
    "/assignments/:path*",
    "/exams/:path*",
    "/quizzes/:path*",
    "/projects/:path*",
    "/planner/:path*",
    "/calendar/:path*",
    "/focus/:path*",
    "/analytics/:path*",
    "/gamification/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
