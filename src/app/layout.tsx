import '@/app/globals.css'
import {Metadata} from 'next';

export const metadata: Metadata = {
    title: {
        template: '%s | Lys Manager',
        default: 'Lys Manager',
    }
};

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html lang="en">
        <body className="antialiased">{children}</body>
        </html>
    );
}