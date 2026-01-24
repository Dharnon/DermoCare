"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface PendingReview {
    id: string;
    patientName: string;
    patientAvatar?: string;
    condition: string;
    day: number;
    hasNewUpdate?: boolean;
    progressImage?: string;
}

interface PendingReviewsProps {
    reviews: PendingReview[];
}

export function PendingReviews({ reviews }: PendingReviewsProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-slate-900">Pending Reviews</h2>
                <Link
                    href="/doctor/reviews"
                    className="text-sm font-semibold text-[#F4A492] hover:text-[#F4A492]/80 transition-colors"
                >
                    View All
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {reviews.map((review) => (
                    <Link
                        key={review.id}
                        href={`/doctor/review/${review.id}`}
                        className="flex-shrink-0 group"
                    >
                        <div className="bg-white rounded-3xl p-4 ios-shadow w-[180px] transition-all duration-200 hover:shadow-md group-hover:scale-[1.02]">
                            {/* Patient Info */}
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={review.patientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.patientName}`}
                                    alt={review.patientName}
                                    className="w-10 h-10 rounded-xl object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">
                                        {review.patientName}
                                    </p>
                                    <p className="text-xs text-[#7A869A] truncate">
                                        {review.condition} • Day {review.day}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Image Preview */}
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 mb-3">
                                {review.progressImage ? (
                                    <img
                                        src={review.progressImage}
                                        alt="Progress"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-300 text-3xl">
                                            image
                                        </span>
                                    </div>
                                )}
                                {review.hasNewUpdate && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#F4A492]/20 text-[#F4A492] text-[10px] font-bold uppercase">
                                        NEW
                                    </span>
                                )}
                            </div>

                            {/* Action */}
                            <button className="w-full py-2.5 rounded-xl bg-[#F4A492]/10 text-[#F4A492] text-sm font-semibold hover:bg-[#F4A492]/20 transition-colors">
                                Review Photo
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
