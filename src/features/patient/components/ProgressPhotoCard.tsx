import { Maximize2 } from "lucide-react";

interface ProgressPhotoCardProps {
    imageUrl: string;
    tag: string;
    title: string;
    subtitle: string;
}

export function ProgressPhotoCard({ imageUrl, tag, title, subtitle }: ProgressPhotoCardProps) {
    return (
        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden ios-shadow group">
            <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                {tag}
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                    <p className="text-white font-bold">{title}</p>
                    <p className="text-white/70 text-[10px] italic">{subtitle}</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                    <Maximize2 size={18} />
                </button>
            </div>
        </div>
    );
}
