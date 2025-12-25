import { Button } from "@/components/ui/button";
// import { Check, Pencil, Star, Sparkles, Zap } from "lucide-react"; // REMOVED unused and replaced Check
import { Check } from 'lucide-react';
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
                <div className="text-xl text-slate-900 font-black uppercase tracking-widest bg-green-400 inline-block px-4 py-1 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    {tag}
                </div>
                <div className="relative">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        {title}
                    </h2>
                </div>
                <p className="text-xl text-gray-300 font-bold max-w-2xl mx-auto">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {tiers.map((tier, index) => (
                    <div
                        key={tier.name}
                        className="relative group transition-all duration-300 hover:-translate-y-2"
                    >
                        <div
                            className={cn(
                                "absolute inset-0",
                                tier.popular ? "bg-green-400" : "bg-white",
                                "border-4 border-slate-900",
                                "rounded-none shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
                                "transition-all duration-300",
                                "group-hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]"
                            )}
                        />

                        <div className="relative p-6 h-full flex flex-col">
                            {tier.popular && (
                                <div
                                    className="absolute -top-5 -right-5 bg-black text-white 
                                    px-4 py-1 rounded-none text-sm border-2 border-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transform rotate-3"
                                >
                                    Popular!
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-black mb-2 uppercase text-slate-900">
                                    {tier.name}
                                </h3>
                                <p className={cn(
                                    "text-sm font-bold",
                                    "text-slate-700"
                                )}>
                                    {tier.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className={cn(
                                    "text-4xl font-black",
                                    "text-slate-900"
                                )}>
                                    {typeof tier.price === 'number' ? `₹${tier.price}` : tier.price}
                                </span>
                                {typeof tier.price === 'number' && (
                                    <span className="font-bold text-slate-500">
                                        /month
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 mb-8 flex-1">
                                {tier.features.map((feature, idx) => (
                                    <div
                                        key={feature}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-6 h-6 border-2 border-slate-900 bg-white flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <Check className="w-4 h-4 text-slate-900" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 leading-tight">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {tier.limits && tier.limits.length > 0 && (
                                <div className="mb-6 p-4 border-2 border-slate-900 bg-slate-50">
                                    <p className="text-xs font-black uppercase mb-2 text-slate-900">Limits</p>
                                    {tier.limits.map((limit) => (
                                        <p key={limit} className="text-xs font-bold text-slate-600 mb-1">• {limit}</p>
                                    ))}
                                </div>
                            )}

                            <Button
                                className={cn(
                                    "w-full h-14 text-lg border-2 border-slate-900 rounded-none relative overflow-hidden transition-all",
                                    tier.popular
                                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                        : "bg-white text-slate-900 hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                )}
                            >
                                <span className="font-black uppercase tracking-wider relative z-10">Get Started</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


export { CreativePricing, type PricingTier }
