import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

export const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    // STATE MUST BE AT TOP LEVEL (Rules of Hooks)
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

    // Screenshot Tool State
    const [activeTab, setActiveTab] = useState('generator');
    const [screenshotUrl, setScreenshotUrl] = useState('https://harisdevlab.online/loginhotspot3/login.html');
    const [iframeUrl, setIframeUrl] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureStatus, setCaptureStatus] = useState('');
    const iframeRef = useRef(null);

    // Simple protection
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'haris123') { // Hardcoded simple password
            setIsAuthenticated(true);
        } else {
            alert('Password salah!');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-center mb-6">Restricted Access</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-3 rounded-xl mb-4"
                        placeholder="Admin Password"
                        autoFocus
                    />
                    <Button className="w-full justify-center">Login</Button>
                </form>
            </div>
        );
    }

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

    const handleLoadUrl = (e) => {
        e.preventDefault();
        setIframeUrl(screenshotUrl);
    };

    const handleQuickLink = (filename) => {
        // Extract base path
        let basePath = screenshotUrl;
        if (basePath.includes('.html')) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        } else if (!basePath.endsWith('/')) {
            basePath = basePath + '/';
        }

        const newUrl = `${basePath}${filename}`;
        setScreenshotUrl(newUrl);
        setIframeUrl(newUrl);
    };

    const handleBatchCapture = async () => {
        if (!iframeRef.current) return;

        setIsCapturing(true);
        const pages = ['login.html', 'status.html', 'logout.html', 'alogin.html', 'error.html', 'menu.html', 'info.html', 'contact.html'];
        const zip = new JSZip();

        // Extract base path from current input
        let basePath = screenshotUrl;
        if (basePath.includes('.html')) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        } else if (!basePath.endsWith('/')) {
            basePath = basePath + '/';
        }

        try {
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const url = `${basePath}${page}`;

                setCaptureStatus(`Loading ${page} (${i + 1}/${pages.length})...`);
                setIframeUrl(url);

                // Wait for load + render
                await new Promise(resolve => setTimeout(resolve, 3000));

                setCaptureStatus(`Capturing ${page}...`);

                // Capture
                try {
                    const canvas = await html2canvas(iframeRef.current.contentDocument.body, {
                        width: 414,
                        height: 896,
                        useCORS: true,
                        windowWidth: 414,
                        windowHeight: 896
                    });

                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    zip.file(`${page.replace('.html', '')}-mobile.png`, blob);
                } catch (err) {
                    console.error(`Failed to capture ${page}:`, err);
                    // Continue to next page even if one fails
                }
            }

            setCaptureStatus('Generating ZIP...');
            const zipContent = await zip.generateAsync({ type: 'blob' });
            saveAs(zipContent, 'hotspot-screenshots.zip');
            setCaptureStatus('Done!');

        } catch (error) {
            console.error("Batch capture failed:", error);
            alert("Error: " + error.message + "\nMake sure the target site is on the SAME DOMAIN.");
        } finally {
            setIsCapturing(false);
            setCaptureStatus('');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b">
                <button
                    className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'generator' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('generator')}
                >
                    Product Generator
                </button>
                <button
                    className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'screenshot' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('screenshot')}
                >
                    Screenshot Tool
                </button>
            </div>

            {activeTab === 'generator' ? (
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
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Target URL</h2>
                            <form onSubmit={handleLoadUrl} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Website URL</label>
                                    <input
                                        value={screenshotUrl}
                                        onChange={(e) => setScreenshotUrl(e.target.value)}
                                        className="w-full border p-2 rounded-lg"
                                        placeholder="https://..."
                                        disabled={isCapturing}
                                    />
                                </div>
                                <Button className="w-full justify-center" disabled={isCapturing}>Load Website</Button>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

                            <Button
                                onClick={handleBatchCapture}
                                className="w-full justify-center mb-4 bg-green-600 hover:bg-green-700"
                                disabled={isCapturing || !iframeUrl}
                            >
                                {isCapturing ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                                {isCapturing ? 'Processing...' : 'Auto Capture All & Zip'}
                            </Button>

                            {captureStatus && (
                                <div className="mb-4 text-sm text-center font-medium text-blue-600 bg-blue-50 p-2 rounded-lg">
                                    {captureStatus}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('login.html')} disabled={isCapturing}>Login</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('status.html')} disabled={isCapturing}>Status</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('logout.html')} disabled={isCapturing}>Logout</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('alogin.html')} disabled={isCapturing}>ALogin</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('error.html')} disabled={isCapturing}>Error</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('menu.html')} disabled={isCapturing}>Menu</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('info.html')} disabled={isCapturing}>Info</Button>
                                <Button variant="outline" size="sm" onClick={() => handleQuickLink('contact.html')} disabled={isCapturing}>Contact</Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">Instructions</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                1. Enter the full URL of your login page.
                            </p>
                            <p className="text-sm text-blue-700 mb-2">
                                2. Click "Load Website".
                            </p>
                            <p className="text-sm text-blue-700">
                                3. Click <b>Auto Capture All & Zip</b> to automatically visit all standard pages, screenshot them, and download a ZIP file.
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3 flex justify-center bg-gray-100 p-8 rounded-3xl min-h-[950px]">
                        {/* Plain Viewport Container */}
                        <div className="bg-white shadow-2xl relative">
                            {/* 414x896 Viewport */}
                            <div style={{ width: '414px', height: '896px' }} className="overflow-hidden bg-white">
                                {iframeUrl ? (
                                    <iframe
                                        ref={iframeRef}
                                        src={iframeUrl}
                                        className="w-full h-full border-0"
                                        title="Preview"
                                    // No sandbox allows scripts, but keeping it flexible. 
                                    // IMPORTANT: html2canvas needs access to contentDocument, so SAME ORIGIN is mandatory.
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Enter URL to Load
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
