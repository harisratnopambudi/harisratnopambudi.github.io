import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from '../components/ProductCard';
import { DeviceFrame } from '../components/DeviceFrame';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Copy, Check, Download, Loader2, Mail, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SAVED_LINKS } from '../data/savedLinks';
import { PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabaseClient';

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
    return injectSymbols(hashBase).slice(0, 28).toUpperCase();
}

export const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('generator');

    // Generator State
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

    // Email/License State
    const [emailData, setEmailData] = useState({
        buyerEmail: '',
        productName: '',
        licenseKey: '',
        fileLink: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Screenshot Tool State
    const [screenshotUrl, setScreenshotUrl] = useState('https://harisdevlab.online/loginhotspot3/login.html');
    const [iframeUrl, setIframeUrl] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureStatus, setCaptureStatus] = useState('');
    const [deviceType, setDeviceType] = useState('mobile'); // 'mobile', 'tablet', 'laptop'
    const [zoomLevel, setZoomLevel] = useState(0.8);
    const iframeRef = useRef(null);

    // Chat State
    const [orderNumber, setOrderNumber] = useState('');
    const [copied, setCopied] = useState(false);

    // Transaction State
    const [transactions, setTransactions] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);


    const [email, setEmail] = useState('');

    useEffect(() => {
        // Cek sesi login saat aplikasi dimuat
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsAuthenticated(true);
            }
        };
        checkSession();

        // Listen for Auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert('Login Gagal: ' + error.message);
            } else {
                // setIsAuthenticated(true) handled by onAuthStateChange
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan sistem');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
    };

    // --- Generator Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (index, value, field) => {
        const newArray = [...product[field]];
        newArray[index] = value;
        setProduct(prev => ({ ...prev, [field]: newArray }));
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

    const previewProduct = {
        ...product,
        price: parseInt(product.price) || 0,
        originalPrice: parseInt(product.originalPrice) || 0
    };

    // --- Screenshot Handlers ---
    const handleLoadUrl = (e) => {
        e.preventDefault();
        setIframeUrl(screenshotUrl);
    };

    const handleQuickLink = (filename) => {
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
        alert("Automation temporarily disabled for safety checks.");
        /*
        // Automation logic here...
        // For debugging, we disable the complex capture loop to verify basic UI first
        */
    };

    // --- License Handlers ---
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

    const handleRecordTransaction = async () => {
        const productInfo = PRODUCTS.find(p => p.title === emailData.productName);
        const price = productInfo ? productInfo.price : 0;
        try {
            const { error } = await supabase
                .from('transactions')
                .insert([{
                    buyer_email: emailData.buyerEmail,
                    product_name: emailData.productName,
                    license_key: emailData.licenseKey,
                    price: price,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.error('Supabase Insert Error:', error);
                alert('Warning: Gagal menyimpan data penjualan ke Supabase. Cek console.');
            } else {
                console.log('Transaction recorded successfully');
            }
        } catch (err) {
            console.error('Transaction Error:', err);
        }
    };

    // --- Transaction Handlers ---
    const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setTransactions(data || []);
            const total = (data || []).reduce((sum, item) => sum + (item.price || 0), 0);
            setTotalRevenue(total);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

        try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) throw error;
            // Refresh table
            fetchTransactions();
        } catch (err) {
            console.error('Error deleting transaction:', err);
            alert('Gagal menghapus data.');
        }
    };

    const handleCopyKey = (key) => {
        navigator.clipboard.writeText(key);
        alert('License Key disalin: ' + key);
    };



    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab]);


    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-center mb-6">Restricted Access</h2>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-3 rounded-xl mb-4"
                        placeholder="Admin Email"
                        autoFocus
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-3 rounded-xl mb-4"
                        placeholder="Admin Password"
                    />
                    <Button className="w-full justify-center">Login</Button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                    Sign Out
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b overflow-x-auto">
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'generator' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('generator')}>Product Generator</button>
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'screenshot' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('screenshot')}>Screenshot Tool</button>
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'email' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('email')}>Email Sender</button>
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'transactions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('transactions')}>Transactions</button>
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'order-chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('order-chat')}>Order Chat</button>
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
                                    <input value={img} onChange={(e) => handleArrayChange(idx, e.target.value, 'images')} className="w-full border p-2 rounded-lg" placeholder="https://..." />
                                    <button onClick={() => removeArrayItem(idx, 'images')} className="text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('images')} className="mt-1"><Plus size={16} className="mr-1" /> Add Image</Button>
                        </div>

                        {/* Features Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Features</label>
                            {product.features.map((feat, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input value={feat} onChange={(e) => handleArrayChange(idx, e.target.value, 'features')} className="w-full border p-2 rounded-lg" placeholder="Feature name" />
                                    <button onClick={() => removeArrayItem(idx, 'features')} className="text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" size="sm" onClick={() => addArrayItem('features')} className="mt-1"><Plus size={16} className="mr-1" /> Add Feature</Button>
                        </div>
                    </div>

                    {/* Preview & Output */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Card Preview</h2>
                            <div className="max-w-sm"><ProductCard product={previewProduct} /></div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white relative">
                            <h2 className="text-lg font-bold mb-4 text-slate-300">Generated Config Code</h2>
                            <div className="absolute top-4 right-4">
                                <Button variant="secondary" onClick={copyToClipboard} className="bg-slate-700 text-white border-none hover:bg-slate-600">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
                                </Button>
                            </div>
                            <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm font-mono text-green-400">{generateCode()}</pre>
                            <p className="text-slate-500 text-xs mt-4">Instructions: Copy into <code>src/data/products.js</code>.</p>
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
                                    <input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="https://..." disabled={isCapturing} />
                                </div>
                                <Button className="w-full justify-center" disabled={isCapturing}>Load Website</Button>
                            </form>
                        </div>

                        {/* Device Controls */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Device Config</h2>

                            <div className="flex gap-2 mb-4">
                                <Button
                                    size="sm"
                                    variant={deviceType === 'mobile' ? 'primary' : 'outline'}
                                    onClick={() => setDeviceType('mobile')}
                                >
                                    Mobile
                                </Button>
                                <Button
                                    size="sm"
                                    variant={deviceType === 'tablet' ? 'primary' : 'outline'}
                                    onClick={() => setDeviceType('tablet')}
                                >
                                    Tablet
                                </Button>
                                <Button
                                    size="sm"
                                    variant={deviceType === 'laptop' ? 'primary' : 'outline'}
                                    onClick={() => setDeviceType('laptop')}
                                >
                                    Laptop
                                </Button>
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Zoom View ({Math.round(zoomLevel * 100)}%)</label>
                                <input
                                    type="range"
                                    min="0.3"
                                    max="1.5"
                                    step="0.1"
                                    value={zoomLevel}
                                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">Instructions</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                1. Enter URL & Load.
                            </p>
                            <p className="text-sm text-blue-700 mb-2">
                                2. Adjust Device & Zoom.
                            </p>
                            <p className="text-sm text-blue-700">
                                3. Use Snipping Tool (Win+Shift+S) to capture the preview. Automated capture is currently disabled.
                            </p>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3 flex justify-center bg-gray-100 p-8 rounded-3xl min-h-[950px] overflow-auto">
                        <div className="relative origin-top">
                            <DeviceFrame type={deviceType} scale={zoomLevel}>
                                {iframeUrl ? (
                                    <iframe
                                        ref={iframeRef}
                                        src={iframeUrl}
                                        className="w-full h-full border-0"
                                        title="Preview"
                                        sandbox="allow-scripts allow-same-origin allow-forms"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                        Enter URL to Load
                                    </div>
                                )}
                            </DeviceFrame>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'email' ? (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center"><Mail className="mr-3 text-blue-600" /> Send Product License</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Buyer Email</label>
                                <input type="email" name="buyerEmail" value={emailData.buyerEmail} onChange={(e) => setEmailData({ ...emailData, buyerEmail: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="buyer@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <select name="productName" value={emailData.productName} onChange={(e) => {
                                    const selectedName = e.target.value;
                                    const selectedFile = SAVED_LINKS.find(f => f.name === selectedName);
                                    setEmailData({ ...emailData, productName: selectedName, fileLink: selectedFile ? selectedFile.url : emailData.fileLink });
                                }} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                                    <option value="">-- Select Product --</option>
                                    {SAVED_LINKS.map(file => (<option key={file.id} value={file.name}>{file.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">License Key</label>
                                <div className="flex gap-2 relative">
                                    <input name="licenseKey" value={emailData.licenseKey} onChange={(e) => setEmailData({ ...emailData, licenseKey: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-blue-600 flex-1" placeholder="XXXX-XXXX-XXXX-XXXX" />
                                    <Button onClick={handleGenerateKey} disabled={isGenerating || !emailData.buyerEmail} className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap" title="Auto-generate based on Email">
                                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : '⚡ Generate'}
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Download Link (ZIP)</label>
                                <input name="fileLink" value={emailData.fileLink} onChange={(e) => setEmailData({ ...emailData, fileLink: e.target.value })} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="https://drive.google.com/..." />
                            </div>
                            <div className="pt-4">
                                <Button onClick={async () => {
                                    await handleRecordTransaction();
                                    const subject = encodeURIComponent(`License Key Activation - ${emailData.productName}`);
                                    const body = encodeURIComponent(`Halo,\n\nTerima kasih telah membeli produk ${emailData.productName}!\n\nBerikut adalah detail lisensi Anda:\n\nProduct: ${emailData.productName}\nLicense Key: ${emailData.licenseKey}\nDownload Link: ${emailData.fileLink}\n\nPanduan Instalasi:\n1. Download file dari link di atas.\n2. Ekstrak file ZIP.\n3. Masukkan License Key pada file config.js atau saat diminta sistem.\n\nJika ada pertanyaan, silakan balas email ini.\n\nSalam,\nHaris DevLab`);
                                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailData.buyerEmail}&su=${subject}&body=${body}`;
                                    window.open(gmailUrl, '_blank');
                                }} className="w-full py-4 text-lg justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30" disabled={!emailData.buyerEmail || !emailData.productName}>
                                    <Mail className="mr-2" /> Open in Gmail
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-2">This will open a new tab with your Gmail composed and ready to send.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'order-chat' ? (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 flex items-center"><MessageSquare className="mr-3 text-blue-600" /> Order Status Chat</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">No. Pesanan</label>
                                <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. 251230PUVFNH59" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Generated Message</label>
                                <textarea className="w-full bg-white border p-3 rounded-lg text-sm font-mono h-32 focus:outline-none resize-none" readOnly value={orderNumber ? `Halo Admin, mohon bantuannya untuk merubah status pesanan berikut menjadi Terkirim karena produk digital sudah dikirim via email/chat.\n\nNo. Pesanan: ${orderNumber}\n\nTerima kasih.` : 'Enter an Order Number to generate message...'} />
                            </div>
                            <Button onClick={() => {
                                const text = `Halo Admin, mohon bantuannya untuk merubah status pesanan berikut menjadi Terkirim karena produk digital sudah dikirim via email/chat.\n\nNo. Pesanan: ${orderNumber}\n\nTerima kasih.`;
                                navigator.clipboard.writeText(text);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }} className="w-full py-4 text-lg justify-center bg-blue-600 hover:bg-blue-700" disabled={!orderNumber}>
                                {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />} {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'transactions' ? (
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-full"><span className="text-2xl font-bold">Rp</span></div>
                            <div><p className="text-green-100 font-medium">Total Revenue</p><h2 className="text-3xl font-bold">Rp {totalRevenue.toLocaleString('id-ID')}</h2></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
                            <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoadingTransactions}>{isLoadingTransactions ? <Loader2 className="animate-spin" size={16} /> : 'Refresh'}</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-semibold">
                                    <tr>
                                        <th className="p-4">Date</th><th className="p-4">Product</th><th className="p-4">Buyer Email</th><th className="p-4">License Key</th><th className="p-4 text-right">Price</th><th className="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoadingTransactions ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading data...</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">No transactions recorded yet.</td></tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 whitespace-nowrap">{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                                                <td className="p-4 font-medium text-gray-900">{tx.product_name}</td>
                                                <td className="p-4">{tx.buyer_email}</td>
                                                <td className="p-4 font-mono text-xs bg-gray-50 rounded px-2 py-1 select-all">{tx.license_key}</td>
                                                <td className="p-4 text-right font-medium text-green-600">Rp {parseFloat(tx.price).toLocaleString('id-ID')}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleCopyKey(tx.license_key)} title="Copy Key" className="px-3 py-1 gap-2">
                                                            <Copy size={16} /> <span className="text-xs">Copy</span>
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteTransaction(tx.id)} title="Hapus Data" className="px-3 py-1 gap-2 text-red-600 border-red-200 hover:bg-red-50">
                                                            <Trash2 size={16} /> <span className="text-xs">Hapus</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </div >
    );
};
