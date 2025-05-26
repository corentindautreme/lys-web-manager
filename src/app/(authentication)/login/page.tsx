import { Suspense } from 'react';
import LoginForm from '@/app/components/login-form';

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm/>
        </Suspense>
    );
}