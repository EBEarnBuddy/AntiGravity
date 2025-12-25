"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

interface Links {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
    undefined
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...(props as React.ComponentProps<"div">)} />
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof motion.div>) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-4 py-4 hidden md:flex md:flex-col transition-colors duration-300 w-[280px] flex-shrink-0 overflow-hidden",
                !open ? "bg-green-600 border-none text-white" : "bg-white border-r border-slate-200",
                className
            )}
            animate={{
                width: animate ? (open ? "280px" : "80px") : "280px",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) => {
    const { open, setOpen } = useSidebar();
    return (
        <>
            <div
                className={cn(
                    "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white border-b-2 border-slate-900 w-full"
                )}
                {...props}
            >
                <div className="flex justify-end z-20 w-full">
                    <Bars3Icon
                        className="w-8 h-8 text-slate-900 cursor-pointer"
                        onClick={() => setOpen(!open)}
                    />
                </div>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                            }}
                            className={cn(
                                "fixed h-full w-full inset-0 bg-white p-10 z-[100] flex flex-col justify-between border-r-4 border-slate-900",
                                className
                            )}
                        >
                            <div
                                className="absolute right-10 top-10 z-50 text-slate-800 cursor-pointer"
                                onClick={() => setOpen(!open)}
                            >
                                <XMarkIcon className="w-8 h-8" />
                            </div>
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export const SidebarLink = ({
    link,
    className,
    isActive,
    ...props
}: {
    link: Links;
    className?: string;
    isActive?: boolean;
    props?: LinkProps;
}) => {
    const { open, animate } = useSidebar();
    return (
        <Link
            href={link.href}
            className={cn(
                "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-none transition-all duration-200 border-l-4 border-transparent",
                isActive
                    ? (!open ? "bg-white text-green-700 font-bold border-green-700" : "bg-green-50 text-green-700 font-bold border-green-700")
                    : (!open ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"),
                className
            )}
            {...props}
        >
            {link.icon}
            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 uppercase tracking-wide font-bold"
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
