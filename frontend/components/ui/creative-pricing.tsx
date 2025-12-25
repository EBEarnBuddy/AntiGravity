import { Button } from "@/components/ui/button";
// import { Check, Pencil, Star, Sparkles, Zap } from "lucide-react"; // REMOVED unused and replaced Check
import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface PricingTier {
    name: string;
    icon: React.ReactNode;
    price: number | string;
    description: string;
    features: string[];
    limits?: string[];
    bestFor?: string;
    popular?: boolean;
    color: string;
}

function CreativePricing({
    tag = "Simple Pricing",
    title = "Make Short Videos That Pop",
    description = "Edit, enhance, and go viral in minutes",
    tiers,
}: {
    tag?: string;
    title?: string;
    description?: string;
    tiers: PricingTier[];
}) {
    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="text-center space-y-6 mb-16">
                <div className="text-xl text-white rotate-[-1deg] font-black uppercase tracking-widest bg-white/10 inline-block px-4 py-1 border-2 border-white">
                    {tag}
                </div>
                <div className="relative">
                    <h2 className="text-4xl md:text-5xl font-black text-white rotate-[-1deg] uppercase tracking-tighter">
                        {title}
                        <div className="absolute -right-12 top-0 text-amber-500 rotate-12 hidden">

                        </div>
                        <div className="absolute -left-8 bottom-0 text-primary -rotate-12 hidden">

                        </div>
                    </h2>
                    <div
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-3 bg-primary/20 
                        rotate-[-1deg] rounded-none blur-sm"
                    />
                </div>
                <p className="text-xl text-gray-300 rotate-[-1deg] font-bold">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {tiers.map((tier, index) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "relative group",
                            "transition-all duration-300",
                            index === 0 && "rotate-[-1deg]",
                            index === 1 && "rotate-[1deg]",
                            index === 2 && "rotate-[-1deg]",
                            index === 3 && "rotate-[1deg]"
                        )}
                    >
                        <div
                            className={cn(
                                "absolute inset-0",
                                tier.popular ? "bg-primary" : "bg-white",
                                "border-2 border-slate-900",
                                "rounded-none shadow-[4px_4px_0px_0px] shadow-slate-900",
                                "transition-all duration-300",
                                "group-hover:shadow-[8px_8px_0px_0px] group-hover:shadow-slate-900",
                                "group-hover:translate-x-[-4px]",
                                "group-hover:translate-y-[-4px]"
                            )}
                        />

                        <div className="relative p-6">
                            {tier.popular && (
                                <div
                                    className="absolute -top-4 -right-4 bg-black text-white 
                                    px-3 py-1 rounded-none rotate-12 text-sm border-2 border-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                                >
                                    Popular!
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={cn(
                                    "text-2xl font-black mb-2 uppercase",
                                    tier.popular ? "text-white" : "text-slate-900"
                                )}>
                                    {tier.name}
                                </h3>
                                <p className={cn(
                                    "text-sm font-bold",
                                    tier.popular ? "text-white/90" : "text-slate-500"
                                )}>
                                    {tier.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className={cn(
                                    "text-4xl font-black",
                                    tier.popular ? "text-white" : "text-slate-900"
                                )}>
                                    {typeof tier.price === 'number' ? `₹${tier.price}` : tier.price}
                                </span>
                                {typeof tier.price === 'number' && (
                                    <span className={cn(
                                        "font-bold",
                                        tier.popular ? "text-white/80" : "text-slate-400"
                                    )}>
                                        /month
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                {tier.features.map((feature, idx) => (
                                    <div
                                        key={feature}
                                        className="flex items-start gap-2"
                                    >
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-none border-2 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white",
                                                tier.popular ? "border-slate-900" : "border-slate-900"
                                            )}
                                        >
                                            <CheckIcon className={cn(
                                                "w-4 h-4",
                                                "text-primary"
                                            )} />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            tier.popular ? "text-white" : "text-slate-700"
                                        )}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {tier.limits && tier.limits.length > 0 && (
                                <div className={cn(
                                    "mb-4 p-3 rounded-lg border",
                                    tier.popular
                                        ? "bg-white/10 border-white/20"
                                        : "bg-zinc-900/50 border-zinc-700"
                                )}>
                                    <p className={cn(
                                        "text-xs font-bold mb-2",
                                        tier.popular ? "text-white" : "text-zinc-300"
                                    )}>Limits</p>
                                    {tier.limits.map((limit) => (
                                        <p key={limit} className={cn(
                                            "text-xs",
                                            tier.popular ? "text-white/80" : "text-zinc-400"
                                        )}>• {limit}</p>
                                    ))}
                                </div>
                            )}

                            {tier.bestFor && (
                                <p className={cn(
                                    "text-xs italic mb-4",
                                    tier.popular ? "text-white/70" : "text-zinc-400"
                                )}>
                                    <strong>Best for:</strong> {tier.bestFor}
                                </p>
                            )}

                            <Button
                                className={cn(
                                    "w-full h-12 text-lg relative",
                                    "border-2",
                                    tier.popular ? "border-white" : "border-zinc-600",
                                    "transition-all duration-300",
                                    "shadow-[4px_4px_0px_0px] shadow-white",
                                    "hover:shadow-[6px_6px_0px_0px]",
                                    "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                                    tier.popular
                                        ? [
                                            "bg-white text-primary",
                                            "hover:bg-zinc-100",
                                            "active:bg-white",
                                        ]
                                        : [
                                            "bg-transparent text-zinc-100",
                                            "hover:bg-zinc-700",
                                            "active:bg-transparent",
                                        ]
                                )}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none hidden">
                <div className="absolute top-40 left-20 text-4xl rotate-12">

                </div>
                <div className="absolute bottom-40 right-20 text-4xl -rotate-12">

                </div>
            </div>
        </div>
    );
}


export { CreativePricing, type PricingTier }
