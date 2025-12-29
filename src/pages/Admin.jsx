import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Copy, Check, Download, Loader2, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SAVED_LINKS } from '../data/savedLinks';

// CONFIGURATION & SECRETS
const _0x4f2a = ['M', 'i', 'k', 'r', 'o', 't', 'i', 'k', 'A', 'd', 'm', 'i', 'n', 'S', 'e', 'c', 'r', 'e', 't', 'K', 'e', 'y', '2', '0', '2', '5', '!', '@', '#'];
const SECRET_ADMIN = _0x4f2a.join('');
const CHARS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARS_DIGITS = '0123456789';
const CHARS_SYMBOLS = '@#$%&*-_+=!?';

// CRYPTO UTILITIES
async function hmacSHA256(message, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const msgData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function injectSymbols(hashStr) {
    let result = '';
    for (let i = 0; i < hashStr.length; i++) {
        const char = hashStr[i].toUpperCase();
        if (CHARS_UPPER.includes(char) || CHARS_DIGITS.includes(char)) {
            result += char;
        } else {
            const hexVal = parseInt(char, 16);
            result += CHARS_UPPER[hexVal % CHARS_UPPER.length];
        }
    }

    const symbolCount = 4;
    let finalArr = result.split('');
    for (let i = 0; i < symbolCount; i++) {
        const pos = Math.floor(Math.random() * finalArr.length);
        const sym = CHARS_SYMBOLS[Math.floor(Math.random() * CHARS_SYMBOLS.length)];
        finalArr.splice(pos, 0, sym);
    }

    return shuffleString(finalArr.join(''));
}

async function generateLicenseKey(username, appName) {
    const timestamp = Date.now().toString();
    const randomSalt = crypto.getRandomValues(new Uint8Array(8))
        .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

    const input = username + appName + timestamp + randomSalt;
    const hashBase = await hmacSHA256(input, SECRET_ADMIN);
    // Slice to 28 chars to match example format roughly
    return injectSymbols(hashBase).slice(0, 28).toUpperCase();
}

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

    const [emailData, setEmailData] = useState({
        buyerEmail: '',
        productName: '',
        licenseKey: '',
        fileLink: ''
    });

    const [copied, setCopied] = useState(false);

    // Screenshot Tool State
    const [activeTab, setActiveTab] = useState('generator');
    const [screenshotUrl, setScreenshotUrl] = useState('https://harisdevlab.online/loginhotspot3/login.html');
    const [iframeUrl, setIframeUrl] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); // New state for key generation
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

    const handleGenerateKey = async () => {
        if (!emailData.buyerEmail) {
            alert('Please enter Buyer Email first!');
            return;
        }

        setIsGenerating(true);
        try {
            const key = await generateLicenseKey(emailData.buyerEmail, emailData.productName || 'LoginHotspot3');
            setEmailData(prev => ({ ...prev, licenseKey: key }));
        } catch (error) {
            console.error("Key gen failed:", error);
            alert("Failed to generate key");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBatchCapture = async () => {
        if (!iframeRef.current) return;

        // CORS / Domain Check
        const currentDomain = window.location.hostname;
        let targetDomain = '';
        try {
            targetDomain = new URL(screenshotUrl).hostname;
        } catch (e) {
            alert("Invalid URL format");
            return;
        }

        if (currentDomain !== targetDomain) {
            const proceed = window.confirm(
                `WARNING: You are on "${currentDomain}" but trying to capture "${targetDomain}".\n\n` +
                `Browsers BLOCK automated screenshots across different domains for security.\n` +
                `Required: Admin and Target must be on the SAME DOMAIN.\n\n` +
                `The ZIP will likely be empty. Continue anyway?`
            );
            if (!proceed) return;
        }

        setIsCapturing(true);
        // Removed alogin.html as requested
        const pages = ['login.html', 'status.html', 'logout.html', 'error.html', 'menu.html', 'info.html', 'contact.html'];
        const zip = new JSZip();
        let capturedCount = 0;

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

                // Wait for load + render (adjusted to 7s as requested)
                await new Promise(resolve => setTimeout(resolve, 7000));

                setCaptureStatus(`Capturing ${page}...`);

                // Check access
                try {
                    const doc = iframeRef.current.contentDocument;
                    if (!doc) throw new Error("Acccess Denied (CORS)");

                    // Inject CSS to hide scrollbars to prevent black bars/scroll artifacts
                    const style = doc.createElement('style');
                    style.innerHTML = `
                        ::-webkit-scrollbar { display: none !important; }
                        body, html { -ms-overflow-style: none !important; scrollbar-width: none !important; overflow: hidden !important; }
                    `;
                    doc.head.appendChild(style);

                    const canvas = await html2canvas(doc.documentElement, {
                        width: 414,
                        height: 896,
                        useCORS: true,
                        allowTaint: false, // MUST be false to export image
                        foreignObjectRendering: true, // REQUIRED for complex CSS (Glassmorphism etc)
                        imageTimeout: 0, // Wait for images
                        windowWidth: 414,
                        windowHeight: 896,
                        scale: 1,
                        logging: false,
                        backgroundColor: null // Preserve transparency if any
                    });

                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (blob) {
                        zip.file(`${page.replace('.html', '')}-mobile.png`, blob);
                        capturedCount++;
                    } else {
                        console.error("Null blob for " + page);
                    }
                } catch (err) {
                    console.error(`Failed to capture ${page}:`, err);
                    // Add a text file explaining the error for this page
                    zip.file(`${page}-ERROR.txt`, `Failed to capture: ${err.message}\nMost likely Cross-Origin blocking.\nTry running Admin on same domain as target.`);
                }
            }

            if (capturedCount === 0) {
                alert("All screenshots failed! Check the generated ZIP for ERROR.txt files to see why (likely CORS/Domain issues).");
            }

            setCaptureStatus('Generating ZIP...');
            const zipContent = await zip.generateAsync({ type: 'blob' });
            saveAs(zipContent, 'hotspot-screenshots.zip');
            setCaptureStatus('Done!');

        } catch (error) {
            console.error("Batch capture failed:", error);
            alert("Error: " + error.message);
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
                <button
                    className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('email')}
                >
                    Email Sender
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
            ) : activeTab === 'screenshot' ? (
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
            ) : (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <Mail className="mr-3 text-blue-600" />
                            Send Product License
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Buyer Email</label>
                                <input
                                    type="email"
                                    name="buyerEmail"
                                    value={emailData.buyerEmail}
                                    onChange={(e) => setEmailData({ ...emailData, buyerEmail: e.target.value })}
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="buyer@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <select
                                    name="productName"
                                    value={emailData.productName}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const selectedFile = SAVED_LINKS.find(f => f.name === selectedName);
                                        setEmailData({
                                            ...emailData,
                                            productName: selectedName,
                                            fileLink: selectedFile ? selectedFile.url : emailData.fileLink
                                        });
                                    }}
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                    <option value="">-- Select Product --</option>
                                    {SAVED_LINKS.map(file => (
                                        <option key={file.id} value={file.name}>{file.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">License Key</label>
                                <div className="flex gap-2 relative">
                                    <input
                                        name="licenseKey"
                                        value={emailData.licenseKey}
                                        onChange={(e) => setEmailData({ ...emailData, licenseKey: e.target.value })}
                                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-blue-600 flex-1"
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                    />
                                    <Button
                                        onClick={handleGenerateKey}
                                        disabled={isGenerating || !emailData.buyerEmail}
                                        className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                                        title="Auto-generate based on Email"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : '⚡ Generate'}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Download Link (ZIP)</label>

                                {/* Quick Select Dropdown Removed - Moved to Product Name */}

                                <input
                                    name="fileLink"
                                    value={emailData.fileLink}
                                    onChange={(e) => setEmailData({ ...emailData, fileLink: e.target.value })}
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={() => {
                                        const subject = encodeURIComponent(`License Key Activation - ${emailData.productName}`);
                                        const body = encodeURIComponent(`Halo,

Terima kasih telah membeli produk ${emailData.productName}!

Berikut adalah detail lisensi Anda:

Product: ${emailData.productName}
License Key: ${emailData.licenseKey}
Download Link: ${emailData.fileLink}

Panduan Instalasi:
1. Download file dari link di atas.
2. Ekstrak file ZIP.
3. Masukkan License Key pada file config.js atau saat diminta sistem.

Jika ada pertanyaan, silakan balas email ini.

Salam,
Haris DevLab

---
Lihat produk kami lainnya:
Website: https://harisdevlab.online/
Shopee: https://shopee.co.id/harisdevlab`);

                                        // Open Gmail Compose Window
                                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailData.buyerEmail}&su=${subject}&body=${body}`;
                                        window.open(gmailUrl, '_blank');
                                    }}
                                    className="w-full py-4 text-lg justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
                                    disabled={!emailData.buyerEmail || !emailData.productName}
                                >
                                    <Mail className="mr-2" />
                                    Open in Gmail
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    This will open a new tab with your Gmail composed and ready to send.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};
