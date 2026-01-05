import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home"
]);

const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const currentUrl = new URL(req.url);
    const isHomepage = currentUrl.pathname === "/home";
    const isApiReq = currentUrl.pathname.startsWith("/api");

    // DEBUG: Log everything
    console.log('PATH:', currentUrl.pathname, '| USER:', userId ? 'LOGGED IN' : 'NOT LOGGED IN');

    // If logged in and trying to access auth pages (except home), redirect to home
    if (userId && isPublicRoute(req) && !isHomepage) {
        console.log('Redirecting logged-in user away from auth page');
        return NextResponse.redirect(new URL("/home", req.url));
    }

    // If not logged in, protect non-public routes
    if (!userId) {
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            console.log('Not logged in, redirecting to sign-in');
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }

        if (isApiReq && !isPublicApiRoute(req)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    console.log('Allowing access');
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};