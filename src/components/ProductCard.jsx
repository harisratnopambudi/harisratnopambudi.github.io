import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const ProductCard = ({ product }) => {
    const price = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(product.price);

    return (
        <Link to={`/product/${product.id}`} className="group block h-full">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 h-full flex flex-col cursor-pointer">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img
                        src={product.img}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-700 shadow-sm border border-blue-100">
                        {product.category}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-grow">
                        {product.shortDesc}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                            {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(product.originalPrice)}
                                </span>
                            )}
                            <span className="text-lg font-bold text-gray-900 tracking-tight">
                                {price}
                            </span>
                        </div>
                        <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                            <ArrowRight size={16} />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
