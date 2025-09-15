import React from 'react';
import Card from './Card';
import { motion } from 'framer-motion';
import { PackageIcon, CalendarIcon, BookOpenIcon } from './icons/InterfaceIcons';
import { useCart } from '../context/CartContext';

const MotionDiv = motion.div as any;

const ProductCard = ({ item, type, onClick }: { item: any, type: string, onClick?: () => void }) => {
    const { addToCart } = useCart();
    const isService = type === 'services';
    const isCourse = type === 'courses';

    const imageUrl = item.imageUrl || `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400`;
    const title = 'name' in item ? item.name : item.title;
    const description = item.description;
    const price = item.price;
    
    let Icon, typeLabel;
    if (isService) {
        Icon = CalendarIcon;
        typeLabel = 'Servicio';
    } else if (isCourse) {
        Icon = BookOpenIcon;
        typeLabel = 'Curso';
    } else {
        Icon = PackageIcon;
        typeLabel = 'Producto';
    }

    const handleAddToCart = () => {
        const cartItemType = isService ? 'service' : isCourse ? 'course' : 'product';
        addToCart(item, cartItemType);
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="h-full"
        >
            <Card className="flex flex-col h-full !p-0 overflow-hidden">
                <div className="relative cursor-pointer" onClick={onClick}>
                    <img src={imageUrl} alt={title} className="w-full h-48 object-cover" loading="lazy" />
                    <div className="absolute top-2 right-2 flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full">
                        <Icon className="h-4 w-4 text-purple-500" />
                        <span>{typeLabel}</span>
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-grow line-clamp-3">{description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="font-bold text-xl">${price.toFixed(2)}</span>
                        <button
                            onClick={handleAddToCart}
                            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700"
                        >
                            Añadir
                        </button>
                    </div>
                </div>
            </Card>
        </MotionDiv>
    );
};

export default ProductCard;
