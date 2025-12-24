"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Users, MessageCircle, TrendingUp, Repeat } from "lucide-react"

const ecosystemSteps = [
    {
        id: 1,
        icon: Users,
        heading: "Opportunities Bring People Together",
        content: "Everything starts with an opportunity. Startup roles and colancing projects are posted, people apply based on skills, and once accepted, collaboration begins immediately — not in isolation.",
    },
    {
        id: 2,
        icon: MessageCircle,
        heading: "Circles Turn Matches into Collaboration",
        content: "Every meaningful interaction on EarnBuddy happens inside Circles. Startup roles and colancing projects create private Opportunity Circles, communities exist as public Community Circles, and collaborations between communities form Event Circles.",
    },
    {
        id: 3,
        icon: TrendingUp,
        heading: "Communities Create Momentum",
        content: "Community Circles drive visibility and energy. They enable discussions, collaborations, and events that attract new talent, ideas, and opportunities into the ecosystem.",
    },
    {
        id: 4,
        icon: Repeat,
        heading: "Collaboration Compounds Growth",
        content: "As people collaborate, they build reputation, relationships, and visibility. This leads to better opportunities, stronger teams, and repeat collaboration — creating a self-reinforcing growth loop.",
    },
]

function EcosystemStep({ step, index }: { step: typeof ecosystemSteps[0], index: number }) {
    const ref = useRef(null)
    const isInView = useInView(ref, {
        once: false,
        margin: "-100px",
        amount: 0.3
    })

    const Icon = step.icon

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className="relative"
        >
            {/* Connector Line */}
            {index < ecosystemSteps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-24 bg-gradient-to-b from-primary/40 to-transparent -z-10" />
            )}

            <div className="flex gap-6 items-start">
                {/* Icon Circle */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.heading}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{step.content}</p>
                </div>
            </div>
        </motion.div>
    )
}

function EcosystemLoop() {
    const ref = useRef(null)
    const isInView = useInView(ref, {
        once: false,
        margin: "-100px",
        amount: 0.5
    })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className="mt-16 p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl"
        >
            <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                <span className="font-semibold text-slate-900">Opportunities</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-900">Circles</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-900">Collaboration</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-900">Events</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-900">Reputation</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Better Opportunities</span>
            </div>
        </motion.div>
    )
}

export default function EcosystemExplainer() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Explaining Our <span className="text-primary">Ecosystem</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Where opportunities, communities, and collaboration work together — not in isolation.
                    </p>
                </div>

                {/* Ecosystem Steps - Vertical Flow */}
                <div className="space-y-16 mb-12">
                    {ecosystemSteps.map((step, index) => (
                        <EcosystemStep key={step.id} step={step} index={index} />
                    ))}
                </div>

                {/* Ecosystem Loop Highlight */}
                <EcosystemLoop />
            </div>
        </section>
    )
}
