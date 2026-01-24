"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    AlertTriangle,
    ArrowLeft,
    ChevronDown,
    Info,
    List,
    MessageCircle,
    MoreHorizontal,
    ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AccordionItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: string;
}

const accordionItems: AccordionItem[] = [
    {
        id: "benefits",
        title: "Benefits & Effects",
        icon: <Info className="h-5 w-5" />,
        content:
            "Accelerates cell turnover, improves skin texture, reduces fine lines, and treats persistent acne.",
    },
    {
        id: "ingredients",
        title: "Ingredients List",
        icon: <List className="h-5 w-5" />,
        content:
            "Tretinoin 0.05%, Aqua, Cetyl Alcohol, Stearyl Alcohol, Isopropyl Myristate, Polyoxyl Stearate, Stearic Acid, Butylated Hydroxytoluene.",
    },
    {
        id: "sideeffects",
        title: "Side Effects & Safety",
        icon: <AlertTriangle className="h-5 w-5" />,
        content:
            "May cause dryness, peeling, redness, and increased sun sensitivity. Avoid during pregnancy. Always use sunscreen during the day.",
    },
];

export default function ProductDetailsPage() {
    const [openSection, setOpenSection] = useState<string | null>("benefits");

    return (
        <div className="min-h-screen bg-background pb-28">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/patient/products"
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Link>
                    <h1 className="font-bold text-gray-900">Product Details</h1>
                    <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreHorizontal className="h-6 w-6 text-gray-400" />
                    </button>
                </div>
            </header>

            <div className="px-6 space-y-6">
                {/* Product Image */}
                <div className="relative animate-in">
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-pink-50 to-coral-light flex items-center justify-center">
                        <div className="w-32 h-32 rounded-2xl bg-white/50 flex items-center justify-center text-6xl">
                            🧴
                        </div>
                    </div>
                    <Badge
                        variant="prescribed"
                        className="absolute top-4 right-4 text-xs"
                    >
                        RX Prescribed
                    </Badge>
                </div>

                {/* Product Info */}
                <div className="flex items-start justify-between animate-in">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">
                            Tretinoin Cream
                        </h2>
                        <p className="text-gray-500">0.05% Concentration</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-400">$42.00</p>
                        <p className="text-xs text-gray-400 uppercase">Insurance Covered</p>
                    </div>
                </div>

                {/* Doctor's Instructions */}
                <div className="bg-white rounded-2xl p-5 shadow-soft animate-in">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar size="md">
                            <AvatarImage src="/avatars/doctor.png" />
                            <AvatarFallback>DS</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-gray-900">Dr. Sarah&apos;s Instructions</p>
                            <p className="text-xs text-coral">Updated 3 days ago</p>
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        &quot;Apply a pea-sized amount to clean, dry skin. Start by using it every
                        other night to allow your skin to adjust. Avoid the eye area and
                        corners of the mouth. Follow up with a rich moisturizer.&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 uppercase">Frequency</p>
                            <p className="font-bold text-gray-900">Every 2 Days</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 uppercase">Time</p>
                            <p className="font-bold text-gray-900">Night Routine</p>
                        </div>
                    </div>
                </div>

                {/* Accordion Sections */}
                <div className="space-y-3 animate-in">
                    {accordionItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                            <button
                                onClick={() =>
                                    setOpenSection(openSection === item.id ? null : item.id)
                                }
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">{item.icon}</span>
                                    <span className="font-semibold text-gray-900">{item.title}</span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "h-5 w-5 text-gray-400 transition-transform",
                                        openSection === item.id && "rotate-180"
                                    )}
                                />
                            </button>
                            {openSection === item.id && (
                                <div className="px-4 pb-4">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-gradient-to-t from-background via-background to-transparent">
                <div className="flex gap-3 max-w-lg mx-auto">
                    <Button variant="coral" className="flex-1">
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        Order Now
                    </Button>
                    <Button variant="secondary" size="icon">
                        <MessageCircle className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
