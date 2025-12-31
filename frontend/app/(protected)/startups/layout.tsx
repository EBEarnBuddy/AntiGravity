import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Startups | EarnBuddy',
    description: 'Find and join high-potential startups.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
