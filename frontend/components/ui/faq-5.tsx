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
        <section className="py-24 bg-primary text-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <Badge variant="white" className="mb-4">{badge}</Badge>
                    <h2 className="text-4xl font-bold">{heading}</h2>
                    <p className="mt-4 text-green-50 text-lg">
                        {description}
                    </p>
                </div>
                <div className="mx-auto mt-14">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-8 flex gap-6 bg-white/10 p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary font-bold font-mono text-sm">
                                {index + 1}
                            </span>
                            <div>
                                <h3 className="font-bold text-xl mb-2">{faq.question}</h3>
                                <p className="text-green-50 leading-relaxed">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
