"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, placeholder = "Search...", ...props }, ref) => {
        return (
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    ref={ref}
                    type="text"
                    placeholder={placeholder}
                    className={cn(
                        "w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-soft",
                        "text-gray-900 placeholder:text-gray-400",
                        "border border-transparent focus:border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-100",
                        "transition-all duration-200",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
