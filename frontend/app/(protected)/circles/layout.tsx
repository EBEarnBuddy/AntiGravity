import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Circles | EarnBuddy',
    description: 'Connect with communities and collaboration circles.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
