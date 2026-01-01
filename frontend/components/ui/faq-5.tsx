import { Badge } from "@/components/ui/badge";

export interface FaqItem {
    question: string;
    answer: string;
}

export interface Faq5Props {
    badge?: string;
    heading?: string;
    description?: string;
    faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
    {
        question: "What is EarnBuddy?",
        answer: "EarnBuddy is a platform that connects ambitious students (Builders) with startup founders, enabling them to gain real-world experience, build portfolios, and earn while they learn.",
    },
    {
        question: "Who can join as a Builder?",
        answer: "Any student with a skill—be it coding, design, marketing, or content—can join. We especially look for people who want to move beyond hello-world projects.",
    },
    {
        question: "How do I get verified?",
        answer: "Complete your profile, add your projects, and pass a basic skill assessment or get vouching from a partner institution like E-Cell IIT BHU.",
    },
    {
        question: "Is it free to join?",
        answer: "Yes, joining the waitlist and creating a profile is completely free for students.",
    },
];

export const Faq5 = ({
    badge = "FAQ",
    heading = "Common Questions",
    description = "Everything you need to know about the platform.",
    faqs = defaultFaqs,
}: Faq5Props) => {
    return (
        <section className="py-24 bg-white text-slate-900">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-block bg-green-400 text-slate-900 px-3 py-1 text-xs font-black uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                        {badge}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">{heading}</h2>
                    <p className="mt-4 text-slate-500 text-lg font-bold max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>
                <div className="mx-auto mt-14 space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="flex gap-6 bg-white p-6 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-none bg-slate-900 text-green-400 font-black font-mono text-lg border-2 border-slate-900">
                                {index + 1}
                            </span>
                            <div>
                                <h3 className="font-black text-xl mb-2 text-slate-900 uppercase">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
