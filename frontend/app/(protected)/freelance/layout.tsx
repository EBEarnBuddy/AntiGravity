import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Freelance | EarnBuddy',
    description: 'Find freelance gigs and projects.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
