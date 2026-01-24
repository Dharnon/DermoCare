import Image from "next/image";

interface ProductCardProps {
    image: string;
    name: string;
    price: string;
}

export function ProductCard({ image, name, price }: ProductCardProps) {
    return (
        <div className="flex-shrink-0 w-40 bg-white dark:bg-neutral-800 p-4 rounded-[2rem] ios-shadow">
            <div className="aspect-square bg-neutral-50 dark:bg-neutral-700 rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="mix-blend-multiply dark:mix-blend-normal transform hover:scale-110 transition-transform object-cover"
                />
            </div>
            <p className="font-bold text-sm mb-1 line-clamp-1">{name}</p>
            <p className="text-xs text-secondary font-bold">{price}</p>
        </div>
    );
}
