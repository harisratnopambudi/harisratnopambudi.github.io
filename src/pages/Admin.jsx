import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

export const Admin = () => {
    const [product, setProduct] = useState({
        id: Date.now(),
        title: '',
        price: '',
        originalPrice: '',
        category: '',
        domain: '',
        demoUrl: '',
        shortDesc: '',
        desc: '',
        img: 'https://placehold.co/600x338/2563eb/ffffff?text=Thumbnail',
        images: ['https://placehold.co/600x338/2563eb/ffffff?text=Thumbnail'],
        features: ['']
    });

    const [copied, setCopied] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const convertDriveLink = (url) => {
        if (url && url.includes('drive.google.com') && url.includes('/view')) {
            const id = url.split('/d/')[1].split('/')[0];
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
        return url;
    };

    const handleArrayChange = (index, value, field) => {
        const processedValue = field === 'images' ? convertDriveLink(value) : value;
        const newArray = [...product[field]];
        newArray[index] = processedValue;

        // If updating first image, also update main img for compatibility
        if (field === 'images' && index === 0) {
            setProduct(prev => ({ ...prev, [field]: newArray, img: processedValue }));
        } else {
            setProduct(prev => ({ ...prev, [field]: newArray }));
        }
    };

    const addArrayItem = (field) => {
        setProduct(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (index, field) => {
        const newArray = product[field].filter((_, i) => i !== index);
        setProduct(prev => ({ ...prev, [field]: newArray }));
    };

    const generateCode = () => {
        const code = `
  {
    id: ${Date.now()},
    title: "${product.title}",
    price: ${product.price || 0},
    originalPrice: ${product.originalPrice || 0},
    category: "${product.category}",
    domain: "${product.domain}",
    shortDesc: "${product.shortDesc}",
    desc: "${product.desc}",
    demoUrl: "${product.demoUrl}",
    img: "${product.images[0] || product.img}",
    images: ${JSON.stringify(product.images, null, 6).replace(/\[\s+/g, '[').replace(/\s+\]/g, ']')},
    features: ${JSON.stringify(product.features)}
  },`;
        return code;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Derived state for preview
    const previewProduct = {
        ...product,
        price: parseInt(product.price) || 0,
        originalPrice: parseInt(product.originalPrice) || 0
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Generator</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Input Details</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input name="title" value={product.title} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="Product Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <input name="category" value={product.category} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Tools" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price (IDR)</label>
                            <input name="price" type="number" value={product.price} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="150000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Original Price (opt)</label>
                            <input name="originalPrice" type="number" value={product.originalPrice} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="200000" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Domain / Label</label>
                        <input name="domain" value={product.domain} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. SaaS, Offline" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Demo URL (opt)</label>
                        <input name="demoUrl" value={product.demoUrl} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="https://example.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Short Description</label>
                        <input name="shortDesc" value={product.shortDesc} onChange={handleChange} className="w-full border p-2 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Description</label>
                        <textarea name="desc" value={product.desc} onChange={handleChange} className="w-full border p-2 rounded-lg" rows="3" />
                    </div>

                    {/* Images Field */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Images (URL)</label>
                        {product.images.map((img, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    value={img}
                                    onChange={(e) => handleArrayChange(idx, e.target.value, 'images')}
                                    className="w-full border p-2 rounded-lg"
                                    placeholder="https://..."
                                />
                                <button onClick={() => removeArrayItem(idx, 'images')} className="text-red-500"><Trash2 size={18} /></button>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('images')} className="mt-1">
                            <Plus size={16} className="mr-1" /> Add Image
                        </Button>
                    </div>

                    {/* Features Field */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Features</label>
                        {product.features.map((feat, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    value={feat}
                                    onChange={(e) => handleArrayChange(idx, e.target.value, 'features')}
                                    className="w-full border p-2 rounded-lg"
                                    placeholder="Feature name"
                                />
                                <button onClick={() => removeArrayItem(idx, 'features')} className="text-red-500"><Trash2 size={18} /></button>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('features')} className="mt-1">
                            <Plus size={16} className="mr-1" /> Add Feature
                        </Button>
                    </div>
                </div>

                {/* Preview & Output */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Card Preview</h2>
                        <div className="max-w-sm">
                            <ProductCard product={previewProduct} />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative">
                        <h2 className="text-lg font-bold mb-4 text-slate-300">Generated Config Code</h2>
                        <div className="absolute top-4 right-4">
                            <Button variant="secondary" onClick={copyToClipboard} className="bg-slate-700 text-white border-none hover:bg-slate-600">
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
                            </Button>
                        </div>
                        <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm font-mono text-green-400">
                            {generateCode()}
                        </pre>
                        <p className="text-slate-500 text-xs mt-4">
                            Instructions: Copy this code and paste it into <code>src/data/products.js</code> inside the <code>PRODUCTS</code> array.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
