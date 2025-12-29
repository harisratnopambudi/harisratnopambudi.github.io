import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Check, ShoppingCart, Share2 } from 'lucide-react';

export const ProductDetail = () => {
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === parseInt(id));
    const [selectedImage, setSelectedImage] = useState(0);
    const [repoSize, setRepoSize] = useState(null);

    // Scroll to top on mount and set up slideshow
    useEffect(() => {
        window.scrollTo(0, 0);
        setSelectedImage(0); // Reset image on product change
        setRepoSize(null);

        // Slideshow interval
        let interval;
        if (product && product.images && product.images.length > 1) {
            interval = setInterval(() => {
                setSelectedImage((prev) => (prev + 1) % product.images.length);
            }, 3000); // Change every 3 seconds
        }

        // Fetch Repo Size if githubRepo is defined
        if (product && product.size) {
            setRepoSize(product.size);
        } else if (product && product.githubRepo) {
            fetch(`https://api.github.com/repos/${product.githubRepo}`)
                .then(res => res.json())
                .then(data => {
                    if (data.size) {
                        // Size is in KB. Convert to MB if > 1024 KB
                        const sizeKB = data.size;
                        let formattedSize = '';
                        if (sizeKB > 1024) {
                            formattedSize = `${(sizeKB / 1024).toFixed(1)} MB`;
                        } else {
                            formattedSize = `${sizeKB} KB`;
                        }
                        setRepoSize(formattedSize);
                    }
                })
                .catch(err => console.error("Failed to fetch repo size:", err));
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [id, product]);

    if (!product) {
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

    // Ensure we have an array of images; fallback to [product.img] if no array
    const images = product.images && product.images.length > 0 ? product.images : [product.img];

    const price = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(product.price);

    const handleOrder = () => {
        const message = `Halo Haris DevLab, saya ingin membeli produk "${product.title}" seharga ${price}. Mohon infonya.`;
        const waUrl = `https://wa.me/6287784477751?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.title,
                text: `Cek produk ${product.title} di Haris DevLab!`,
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
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
                                <img
                                    key={selectedImage}
                                    src={images[selectedImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>


                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm shadow-blue-200">
                            {product.category}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200">
                            {product.domain}
                        </span>
                        {repoSize && (
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200">
                                Size: {repoSize}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                        {product.title}
                    </h1>

                    <div className="flex flex-col mb-6">
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through mb-1">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(product.originalPrice)}
                            </span>
                        )}
                        <span className="text-4xl font-bold text-blue-600 tracking-tight">
                            {price}
                        </span>
                    </div>

                    <div className="prose prose-lg text-gray-600 mb-8 leading-relaxed text-justify">
                        <p>{product.desc}</p>
                    </div>

                    <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Product Features</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {product.features.map((feature, idx) => (
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
                        <Button
                            onClick={handleOrder}
                            className="flex-1 py-4 text-base shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-1"
                        >
                            <ShoppingCart size={20} className="mr-2" />
                            Order Now
                        </Button>
                        {product.demoUrl && (
                            <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-none">
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
