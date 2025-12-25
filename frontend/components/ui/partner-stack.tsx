"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Squares2X2Icon, Square3Stack3DIcon, ListBulletIcon } from "@heroicons/react/24/solid"
import Image from "next/image"

export type LayoutMode = "stack" | "grid" | "list"

export interface PartnerCardData {
    id: string
    name: string
    logo: string
    description: string
}

export interface PartnerCardStackProps {
    partners?: PartnerCardData[]
    className?: string
    defaultLayout?: LayoutMode
}

const layoutIcons = {
    stack: Square3Stack3DIcon,
    grid: Squares2X2Icon,
    list: ListBulletIcon,
}

const SWIPE_THRESHOLD = 50

export function PartnerCardStack({
    partners = [],
    className,
    defaultLayout = "stack",
}: PartnerCardStackProps) {
    const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    if (!partners || partners.length === 0) {
        return null
    }

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info
        const swipe = Math.abs(offset.x) * velocity.x

        if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
            // Swiped left - go to next card
            setActiveIndex((prev) => (prev + 1) % partners.length)
        } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
            // Swiped right - go to previous card
            setActiveIndex((prev) => (prev - 1 + partners.length) % partners.length)
        }
        setIsDragging(false)
    }

    const getStackOrder = () => {
        const reordered = []
        for (let i = 0; i < partners.length; i++) {
            const index = (activeIndex + i) % partners.length
            reordered.push({ ...partners[index], stackPosition: i })
        }
        return reordered.reverse() // Reverse so top card renders last (on top)
    }

    const getLayoutStyles = (stackPosition: number) => {
        switch (layout) {
            case "stack":
                return {
                    top: stackPosition * 12,
                    left: stackPosition * 12,
                    zIndex: partners.length - stackPosition,
                    rotate: (stackPosition - 1) * 3,
                }
            case "grid":
                return {
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    rotate: 0,
                }
            case "list":
                return {
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    rotate: 0,
                }
        }
    }

    const containerStyles = {
        stack: "relative h-80 w-80",
        grid: "grid grid-cols-2 gap-6",
        list: "flex flex-col gap-4",
    }

    const displayPartners = layout === "stack" ? getStackOrder() : partners.map((p, i) => ({ ...p, stackPosition: i }))

    return (
        <div className={cn("space-y-6", className)}>
            {/* Layout Toggle */}
            <div className="flex items-center justify-center gap-1 rounded-lg bg-green-100/50 p-1 w-fit mx-auto border border-green-200">
                {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
                    const Icon = layoutIcons[mode]
                    return (
                        <button
                            key={mode}
                            onClick={() => setLayout(mode)}
                            className={cn(
                                "rounded-md p-2.5 transition-all",
                                layout === mode
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-gray-600 hover:text-primary hover:bg-green-50",
                            )}
                            aria-label={`Switch to ${mode} layout`}
                        >
                            <Icon className="h-5 w-5" />
                        </button>
                    )
                })}
            </div>

            {/* Cards Container */}
            <LayoutGroup>
                <motion.div layout className={cn(containerStyles[layout], "mx-auto")}>
                    <AnimatePresence mode="popLayout">
                        {displayPartners.map((partner) => {
                            const styles = getLayoutStyles(partner.stackPosition)
                            const isTopCard = layout === "stack" && partner.stackPosition === 0

                            return (
                                <motion.div
                                    key={partner.id}
                                    layoutId={partner.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: 0,
                                        ...styles,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8, x: -200 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                    drag={isTopCard ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.7}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={handleDragEnd}
                                    whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                                    className={cn(
                                        "cursor-pointer rounded-2xl border-2 border-green-200 bg-white shadow-lg",
                                        "hover:border-primary hover:shadow-xl transition-all duration-300",
                                        layout === "stack" && "absolute w-72 h-64",
                                        layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing shadow-2xl",
                                        layout === "grid" && "w-full aspect-square",
                                        layout === "list" && "w-full",
                                    )}
                                >
                                    <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
                                        {/* Logo */}
                                        <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-inner">
                                            <Image
                                                src={partner.logo}
                                                alt={partner.name}
                                                width={120}
                                                height={120}
                                                className="object-contain"
                                                draggable={false}
                                            />
                                        </div>

                                        {/* Name */}
                                        <div className="text-center">
                                            <h3 className="font-bold text-xl text-slate-900">{partner.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{partner.description}</p>
                                        </div>
                                    </div>

                                    {isTopCard && (
                                        <div className="absolute bottom-3 left-0 right-0 text-center">
                                            <span className="text-xs text-gray-400">Swipe to navigate</span>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>

            {layout === "stack" && partners.length > 1 && (
                <div className="flex justify-center gap-2">
                    {partners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                index === activeIndex ? "w-8 bg-primary" : "w-2 bg-gray-300 hover:bg-primary/50",
                            )}
                            aria-label={`Go to ${partners[index].name}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
