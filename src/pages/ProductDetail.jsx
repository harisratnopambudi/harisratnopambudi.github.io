import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// import { PRODUCTS } from '../data/products'; // REMOVED
import { Button } from '../components/ui/Button';
import { ArrowLeft, Check, ShoppingCart, Share2, Wifi, Battery, Signal, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const ProductDetail = () => {
    const { id } = useParams();
    // const product = PRODUCTS.find(p => p.id === parseInt(id)); // REMOVED STATIC
    // State for image handling and repo size
    const [selectedImage, setSelectedImage] = useState(0);
    const [repoSize, setRepoSize] = useState(null);

    // Derived state pattern: Reset state when ID changes (Recommended by React Docs)
    const [prevId, setPrevId] = useState(id);
    const [activeProduct, setActiveProduct] = useState(null); // Rename dbProduct to activeProduct
    const [isLoading, setIsLoading] = useState(true);

    // Combine static and DB product
    // const activeProduct = product || dbProduct; // REMOVED

    useEffect(() => {
        // Reset state on ID change
        if (id !== prevId) {
            setPrevId(id);
            setSelectedImage(0);
            setRepoSize(null);
            setActiveProduct(null);
            setIsLoading(true);
        }

        const fetchDbProduct = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    const formatted = {
                        id: data.id,
                        title: data.title,
                        price: parseFloat(data.price) || 0,
                        originalPrice: parseFloat(data.original_price) || 0,
                        category: data.category,
                        domain: data.domain,
                        shortDesc: data.short_desc,
                        desc: data.description,
                        img: data.image_url,
                        images: data.gallery_urls || [data.image_url],
                        features: data.features || [],
                        demoUrl: data.demo_url,
                        shopeeUrl: data.shopee_url,
                        size: data.size,
                        githubRepo: data.github_repo
                    };
                    setActiveProduct(formatted);
                    // Init Repo Size if applicable
                    if (formatted.size) setRepoSize(formatted.size);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDbProduct();

    }, [id, prevId]); // Removed 'product' dep

    // Slideshow interval (depends on activeProduct)
    useEffect(() => {
        let interval;
        if (activeProduct && activeProduct.images && activeProduct.images.length > 1) {
            interval = setInterval(() => {
                setSelectedImage((prev) => (prev + 1) % activeProduct.images.length);
            }, 3000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [activeProduct]);

    // Fetch GitHub Size (depends on activeProduct)
    useEffect(() => {
        if (activeProduct && !activeProduct.size && activeProduct.githubRepo) {
            fetch(`https://api.github.com/repos/${activeProduct.githubRepo}`)
                .then(res => res.json())
                .then(data => {
                    if (data.size) {
                        const sizeKB = data.size;
                        setRepoSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
                    }
                })
                .catch(err => console.error("Failed to fetch repo size:", err));
        }
    }, [activeProduct]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading product details...</p>
            </div>
        );
    }

    if (!activeProduct) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                <p className="text-gray-500 mb-6">The product you are looking for does not exist.</p>
                <Link to="/">
                    <Button variant="primary">Back to Catalog</Button>
                </Link>
            </div>
        );
    }

    // Ensure we have an array of images; fallback to [activeProduct.img] if no array
    const images = activeProduct.images && activeProduct.images.length > 0 ? activeProduct.images : [activeProduct.img];

    const price = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(activeProduct.price);

    const handleOrder = () => {
        const message = `Halo Haris DevLab, saya ingin membeli produk "${activeProduct.title}" seharga ${price}. Mohon infonya.`;
        const waUrl = `https://wa.me/6287784477751?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: activeProduct.title,
                text: `Cek produk ${activeProduct.title} di Haris DevLab!`,
                url: window.location.href,
            });
        } else {
            // Fallback copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link disalin ke clipboard!');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Catalog
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-start">
                {/* Product Image Section */}
                <div className="w-full">
                    {/* Main Image */}
                    {/* Main Image with iPhone XR Mockup */}
                    <div className="flex justify-center lg:justify-end lg:pr-10">
                        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[672px] w-[310px] shadow-xl">
                            <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-10"></div>
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                                {/* Sliding Container */}
                                <div
                                    className="flex h-full transition-transform duration-500 ease-in-out bg-white"
                                    style={{ transform: `translateX(-${selectedImage * 100}%)` }}
                                >
                                    {images.map((img, idx) => (
                                        <div key={idx} className="min-w-full h-full">
                                            <img
                                                src={img}
                                                alt={`${activeProduct.title} ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Status Bar Overlay */}
                                <div className="absolute top-0 left-0 w-full h-12 px-6 flex justify-between items-start z-20 pt-3">
                                    <span className="text-white font-semibold text-xs ml-2">9:41</span>
                                    <div className="flex items-center gap-1.5 mr-2">
                                        <Signal size={12} className="text-white fill-white" />
                                        <Wifi size={12} className="text-white" />
                                        <Battery size={12} className="text-white fill-white" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>


                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm shadow-blue-200">
                            {activeProduct.category}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200">
                            {activeProduct.domain}
                        </span>
                        {repoSize && (
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200">
                                Size: {repoSize}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                        {activeProduct.title}
                    </h1>

                    <div className="flex flex-col mb-6">
                        {activeProduct.originalPrice && (
                            <span className="text-lg text-gray-400 line-through mb-1">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(activeProduct.originalPrice)}
                            </span>
                        )}
                        <span className="text-4xl font-bold text-blue-600 tracking-tight">
                            {price}
                        </span>
                    </div>

                    <div className="prose prose-lg text-gray-600 mb-8 leading-relaxed text-justify">
                        <p>{activeProduct.desc}</p>
                    </div>

                    <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Product Features</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeProduct.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-gray-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {activeProduct.shopeeUrl ? (
                            <>
                                <a
                                    href={activeProduct.shopeeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button
                                        className="w-full py-4 text-base shadow-xl shadow-orange-600/20 hover:shadow-orange-600/30 transform hover:-translate-y-1 !bg-orange-500 !hover:bg-orange-600 !border-orange-500 text-white"
                                    >
                                        <ShoppingCart size={20} className="mr-2" />
                                        Order Now
                                    </Button>
                                </a>
                                <Button
                                    onClick={handleOrder}
                                    variant="outline"
                                    className="flex-1 py-4 text-base"
                                >
                                    <MessageCircle size={20} className="mr-2" />
                                    WhatsApp
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleOrder}
                                className="flex-1 py-4 text-base shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-1"
                            >
                                <ShoppingCart size={20} className="mr-2" />
                                Order Now
                            </Button>
                        )}

                        {activeProduct.demoUrl && (
                            <a href={activeProduct.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-none">
                                <Button variant="outline" className="h-full px-6 py-4">
                                    Live Demo
                                </Button>
                            </a>
                        )}
                        <Button variant="secondary" onClick={handleShare} className="px-6 py-4">
                            <Share2 size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
