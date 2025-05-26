import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // exclude /api/auth/.* routes so the authentication can actually be performed
    matcher: ['/((?!api/auth/.*|_next/static|_next/image|.*\\.png$).*)'],
};