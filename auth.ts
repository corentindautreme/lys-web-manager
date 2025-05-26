import NextAuth from 'next-auth';

import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        GitHub({
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    // I like using the login better than the display name
                    name: profile.login,
                    email: profile.email,
                    image: profile.avatar_url
                }
            }
        })
    ]
});