import React from 'react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const Catalog = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Premium MikroTik Hotspot Templates <br className="hidden md:block" /> by <span className="text-blue-600">Haris DevLab</span>
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                    Elevate your WiFi business with our collection of high-quality, modern, and feature-rich MikroTik hotspot templates.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};
