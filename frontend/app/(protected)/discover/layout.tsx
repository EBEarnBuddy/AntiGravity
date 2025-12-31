import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Discover | EarnBuddy',
    description: 'Your dashboard for opportunities, circles, and events.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
