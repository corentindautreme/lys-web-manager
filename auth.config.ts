import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login/error'
    },
    callbacks: {
        signIn({user}) {
            if (user.name) {
                return user.name == 'corentindautreme';
            }
            return false;
        },
        authorized({auth, request: {nextUrl}}) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                console.log('Unauthenticated user, redirecting to login page')
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                console.log('Redirecting to URL /')
                return Response.redirect(new URL('/', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now // I assume this array is overridden in auth.ts
} satisfies NextAuthConfig;