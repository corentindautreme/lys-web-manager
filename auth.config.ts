import type { NextAuthConfig } from 'next-auth';
import { GithubOrganization } from '@/app/types/auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login/error'
    },
    callbacks: {
        async signIn({user}) {
            // on debug mode, check that the user is a member of the LysEurovision organization
            if (process.env.DEBUG === 'TRUE') {
                if (user.name) {
                    try {
                        const response = await fetch(`https://api.github.com/users/${user.name}/orgs`);
                        if (response.ok) {
                            const orgs = await response.json() as GithubOrganization[];
                            return orgs.some(org => org.login === "LysEurovision");
                        }
                        return false;
                    } catch (e) {
                        console.error(`Unable to check ${user.name}'s accesses on Github`);
                        console.error(e);
                        return false;
                    }
                }
                return false;
            }
            // in prod, only check against this (very restrictive) whitelist
            else if (user.name) {
                return user.name === 'corentindautreme';
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