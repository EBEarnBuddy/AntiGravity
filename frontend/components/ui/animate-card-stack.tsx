"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const cardData = [
  {
    id: 1,
    title: "Startups",
    description: "Collaborate with co-founders and early team members to build, launch, and scale startups through long-term, structured teamwork.",
    icon: "🚀",
    gradient: "from-emerald-500 to-teal-600",
    keyPoints: [
      "Co-founder & early team discovery",
      "Equity, long-term roles, and ownership-driven collaboration"
    ]
  },
  {
    id: 2,
    title: "Colancing",
    description: "Execute freelance projects as coordinated teams by bringing multiple specialists together inside a shared execution workspace.",
    icon: "💼",
    gradient: "from-green-500 to-emerald-600",
    keyPoints: [
      "Team-based freelancing",
      "Designers, developers, writers working together",
      "Faster delivery through collaboration"
    ]
  },
  {
    id: 3,
    title: "Circles",
    description: "Create or join communities where people network, collaborate, host events, and turn conversations into real opportunities.",
    icon: "🌐",
    gradient: "from-teal-500 to-cyan-600",
    keyPoints: [
      "Community, opportunity, and event circles",
      "Collaboration-driven growth"
    ]
  },
]

function AnimatedCard({ card, index }: { card: typeof cardData[0], index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: false,
    margin: "-100px",
    amount: 0.3
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.25, 0.1, 0.25, 1.0] // cubic-bezier for smooth, premium feel
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 shadow-2xl overflow-hidden backdrop-blur-sm hover:border-gray-700 transition-colors duration-500">
        <div className="p-10">
          {/* Icon and Title */}
          <div className="flex items-center gap-5 mb-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-4xl shadow-lg`}>
              {card.icon}
            </div>
            <h3 className="text-4xl font-bold text-white">{card.title}</h3>
          </div>

          {/* Description */}
          <p className="text-xl leading-relaxed text-gray-300 mb-6">
            {card.description}
          </p>

          {/* Key Points */}
          <div className="space-y-3 mb-6">
            {card.keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`mt-1.5 h-2 w-2 rounded-full bg-gradient-to-r ${card.gradient} flex-shrink-0`}></div>
                <p className="text-sm text-gray-400 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          {/* Decorative Element */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
            <div className={`h-1 w-24 rounded-full bg-gradient-to-r ${card.gradient}`}></div>
            <div className="text-sm font-medium text-gray-500">Learn More →</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AnimatedCardStack() {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12 relative z-10 space-y-12">
      {cardData.map((card, index) => (
        <AnimatedCard key={card.id} card={card} index={index} />
      ))}
    </div>
  )
}
