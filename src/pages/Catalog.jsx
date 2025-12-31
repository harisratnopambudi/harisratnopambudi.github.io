import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabaseClient';

export const Catalog = () => {
    const [dbProducts, setDbProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching products:', error);
                } else if (data) {
                    // Map DB columns (snake_case) to Frontend Props (camelCase)
                    const formatted = data.map(p => ({
                        id: p.id,
                        title: p.title,
                        price: parseFloat(p.price) || 0,
                        originalPrice: parseFloat(p.original_price) || 0,
                        category: p.category,
                        domain: p.domain,
                        shortDesc: p.short_desc,
                        desc: p.description,
                        img: p.image_url,
                        images: p.gallery_urls || [p.image_url], // Fallback to main image
                        features: p.features || [],
                        demoUrl: p.demo_url,
                        shopeeUrl: p.shopee_url,
                        size: p.size
                    }));
                    setDbProducts(formatted);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Premium Mikrotik Hotspot Login Page Templates <br className="hidden md:block" /> by <span className="text-blue-600">Haris DevLab</span>
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                    Elevate your WiFi business with our collection of high-quality, modern, and feature-rich MikroTik hotspot templates.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {dbProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {isLoading && dbProducts.length === 0 && (
                <p className="text-center text-gray-400 mt-4">Loading dynamic products...</p>
            )}
        </div>
    );
};
