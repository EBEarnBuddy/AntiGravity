import * as React from "react";
import { ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAutoScroll } from "@/components/hooks/use-auto-scroll";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
    smooth?: boolean;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
    ({ className, children, smooth = true, ...props }, _ref) => {
        const {
            scrollRef,
            isAtBottom,
            autoScrollEnabled,
            scrollToBottom,
            disableAutoScroll,
        } = useAutoScroll({
            smooth,
            content: children,
        });

        return (
            <div className="relative w-full h-full">
                <div
                    className={`flex flex-col w-full h-full p-6 overflow-y-auto ${className}`}
                    ref={scrollRef}
                    onWheel={disableAutoScroll}
                    onTouchMove={disableAutoScroll}
                    {...props}
                >
                    <div className="flex flex-col gap-6">{children}</div>
                </div>

                {!isAtBottom && (
                    <Button
                        onClick={() => {
                            scrollToBottom();
                        }}
                        size="icon"
                        variant="outline"
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 inline-flex rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-slate-50 border-2 border-slate-900 hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        aria-label="Scroll to bottom"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                )}
            </div>
        );
    }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
