import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from '../components/ProductCard';
import { DeviceFrame } from '../components/DeviceFrame';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Copy, Check, Mail, MessageSquare, Loader2, Download, Upload, Save, Edit, FileJson, Send } from 'lucide-react';
// import { SAVED_LINKS } from '../data/savedLinks'; // REMOVED - Using Dynamic DB
import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabaseClient';

// CONFIGURATION & SECRETS
// CRYPTO UTILITIES REMOVED - Logic moved to Supabase RPC 'generate_license_key'

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
        desc: '',
        demoUrl: '',
        shopeeUrl: '', // Add this
        img: 'https://placehold.co/600x338/2563eb/ffffff?text=Thumbnail',
        images: ['https://placehold.co/600x338/2563eb/ffffff?text=Thumbnail'],
        features: [''],
        size: '', // Manual override size
        zipUrl: '' // GDrive Link definition
    });

    // Email/License State
    const [emailData, setEmailData] = useState({
        buyerEmail: '',
        productName: '',
        licenseKey: '',
        fileLink: ''
    });
    const [isGenerating, setIsGenerating] = useState(false); // Valid state
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null); // Track which index is uploading
    const [editingId, setEditingId] = useState(null); // ID if editing existing product

    // Management State
    const [manageProducts, setManageProducts] = useState([]);
    const [isLoadingManage, setIsLoadingManage] = useState(false);

    // Screenshot Tool State
    const [screenshotUrl, setScreenshotUrl] = useState('https://harisdevlab.online/loginhotspot3/login.html');
    const [iframeUrl, setIframeUrl] = useState('');

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
    shopeeUrl: "${product.shopeeUrl}",
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

    // --- Database & Storage Handlers ---
    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingIndex(index);
        try {
            // 1. Upload to Supabase Storage
            const fileName = `img-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            // 3. Update State
            handleArrayChange(index, publicUrl, 'images');

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + (error.message || 'Unknown error'));
        } finally {
            setUploadingIndex(null);
        }
    };



    // --- Management Handlers ---
    const fetchManageProducts = async () => {
        setIsLoadingManage(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setManageProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            alert('Failed to load products.');
        } finally {
            setIsLoadingManage(false);
        }
    };

    const handleEditProduct = (prod) => {
        // Map DB columns back to state
        setProduct({
            id: prod.id, // Keep DB ID
            title: prod.title,
            price: prod.price,
            originalPrice: prod.original_price,
            category: prod.category,
            domain: prod.domain,
            shortDesc: prod.short_desc,
            desc: prod.description,
            img: prod.image_url,
            images: prod.gallery_urls || [],
            features: prod.features || [],
            demoUrl: prod.demo_url,
            shopeeUrl: prod.shopee_url,
            zipUrl: prod.zip_url || '',
            size: prod.size || ''
        });
        setEditingId(prod.id);
        setActiveTab('generator');
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchManageProducts(); // Refresh list
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete product.');
        }
    };

    const handleExportJson = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(manageProducts, null, 2)
        )}`;
        const linkContainer = document.createElement("a");
        linkContainer.href = jsonString;
        linkContainer.download = "products_backup.json";
        linkContainer.click();
    };



    // Update Save Handler for Edit Mode
    const handleSaveToDatabase = async () => {
        const mode = editingId ? 'Update' : 'Save';
        if (!window.confirm(`${mode} this product to the Database?`)) return;

        setIsSaving(true);
        try {
            const payload = {
                title: product.title,
                price: parseFloat(product.price) || 0,
                original_price: parseFloat(product.originalPrice) || 0,
                category: product.category,
                domain: product.domain,
                short_desc: product.shortDesc,
                description: product.desc,
                image_url: product.images[0] || product.img,
                gallery_urls: product.images,
                features: product.features,
                demo_url: product.demoUrl || null,
                shopee_url: product.shopeeUrl || null,
                zip_url: product.zipUrl || null,
                size: product.size || null
            };

            let error;
            if (editingId) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            alert(`✅ Product ${mode}d Successfully!`);
            // Reset state after success
            if (editingId) {
                setEditingId(null);
                setProduct({
                    ...product,
                    id: Date.now() // Reset ID for next new product
                });
            }
        } catch (err) {
            console.error("Save error:", err);
            alert(`❌ Failed to ${mode.toLowerCase()}: ` + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Screenshot Handlers ---
    const handleLoadUrl = (e) => {
        e.preventDefault();
        setIframeUrl(screenshotUrl);
    };



    // --- License Handlers ---
    const handleGenerateKey = async () => {
        if (!emailData.buyerEmail) {
            alert('Please enter Buyer Email first!');
            return;
        }
        setIsGenerating(true);
        try {
            // Call Supabase RPC function (Server-Side Generation)
            const { data, error } = await supabase.rpc('generate_license_key', {
                buyer_email: emailData.buyerEmail,
                product_name: emailData.productName || 'LoginHotspot3'
            });

            if (error) throw error;
            setEmailData(prev => ({ ...prev, licenseKey: data }));
        } catch (error) {
            console.error("Key gen failed:", error);
            alert("Failed to generate key");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRecordTransaction = async () => {
        const productInfo = manageProducts.find(p => p.title === emailData.productName);
        const price = productInfo ? parseFloat(productInfo.price) : 0;
        const netPrice = Math.max(0, price - 3500); // Deduct service fee

        try {
            const { error } = await supabase
                .from('transactions')
                .insert([{
                    buyer_email: emailData.buyerEmail,
                    product_name: emailData.productName,
                    license_key: emailData.licenseKey,
                    price: netPrice,
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
        } else if (activeTab === 'manage' || activeTab === 'email') {
            fetchManageProducts();
        }
    }, [activeTab]);

    // Clear editing state when switching tabs manually
    useEffect(() => {
        if (activeTab !== 'generator' && editingId) {
            // Optional: Alert user they are leaving edit mode? 
            // For now we keep state but maybe reset if they start fresh.
            // Let's reset if they go to 'manage' to avoid confusion.
            if (activeTab === 'manage') {
                setEditingId(null);
                setProduct({ ...product, id: Date.now(), title: '', price: '', category: '' }); // Partial reset or full reset
            }
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
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'generator' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('generator')}>{editingId ? 'Edit Product' : 'Product Generator'}</button>
                <button className={`pb-4 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('manage')}>Manage Products</button>
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
                            <label className="block text-sm font-medium mb-1">Shopee URL (opt)</label>
                            <input name="shopeeUrl" value={product.shopeeUrl} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="https://shopee.co.id/..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Size (Manual)</label>
                                <input name="size" value={product.size} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. 5 MB" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Backup Link (GDrive)</label>
                                <input name="zipUrl" value={product.zipUrl} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="https://drive.google..." />
                            </div>
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
                                <div key={idx} className="flex gap-2 mb-2 items-center">
                                    <div className="relative flex-1">
                                        <input value={img} onChange={(e) => handleArrayChange(idx, e.target.value, 'images')} className="w-full border p-2 rounded-lg pr-10" placeholder="https://..." />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <label className="cursor-pointer p-1 hover:bg-gray-100 rounded-full block" title="Upload Image">
                                                {uploadingIndex === idx ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Upload size={16} className="text-gray-500" />}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} disabled={uploadingIndex !== null} />
                                            </label>
                                        </div>
                                    </div>
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
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button onClick={handleSaveToDatabase} disabled={isSaving} className={`${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white border-none`}>
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Edit size={18} /> : <Save size={18} />)}
                                    <span className="ml-2">{isSaving ? 'Processing...' : (editingId ? 'Update Product' : 'Save to DB')}</span>
                                </Button>
                                <Button onClick={copyToClipboard} className="bg-slate-700 text-white border-none hover:bg-slate-600">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span className="ml-2">{copied ? 'Copied' : 'Copy Code'}</span>
                                </Button>
                            </div>
                            <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm font-mono text-green-400">{generateCode()}</pre>
                            <p className="text-slate-500 text-xs mt-4">Instructions: Copy into <code>src/data/products.js</code>.</p>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'manage' ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
                            <p className="text-gray-500">Edit active products or delete old ones.</p>
                        </div>

                        <div className="flex gap-2">
                            {/* <Button onClick={handleMigrateLegacy} variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                <Upload size={16} className="mr-2" /> Migrate Legacy
                            </Button> */}
                            <Button onClick={fetchManageProducts} variant="outline" size="sm">
                                {isLoadingManage ? <Loader2 className="animate-spin" size={16} /> : 'Refresh List'}
                            </Button>
                            <Button onClick={handleExportJson} variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                <FileJson size={16} className="mr-2" /> Export JSON
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-semibold">
                                    <tr>
                                        <th className="p-4">Image</th>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {manageProducts.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">No products found in Database.</td></tr>
                                    ) : (
                                        manageProducts.map((prod) => (
                                            <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <img src={prod.image_url} alt="" className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{prod.title}</td>
                                                <td className="p-4">{prod.category}</td>
                                                <td className="p-4 text-green-600 font-medium">Rp {prod.price?.toLocaleString('id-ID')}</td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(prod)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                            <Edit size={16} /> <span className="ml-1">Edit</span>
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(prod.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                                            <Trash2 size={16} /> <span className="ml-1">Delete</span>
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
            ) : activeTab === 'screenshot' ? (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Target URL</h2>
                            <form onSubmit={handleLoadUrl} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Website URL</label>
                                    <label className="block text-sm font-medium mb-1">Website URL</label>
                                    <input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="https://..." />
                                </div>
                                <Button className="w-full justify-center">Load Website</Button>
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
                                    const selectedProduct = manageProducts.find(p => p.title === selectedName);
                                    setEmailData({
                                        ...emailData,
                                        productName: selectedName,
                                        fileLink: selectedProduct ? (selectedProduct.zip_url || '') : ''
                                    });
                                }} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                                    <option value="">-- Select Product --</option>
                                    {manageProducts.map(prod => (<option key={prod.id} value={prod.title}>{prod.title}</option>))}
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
                                <input name="fileLink" value={emailData.fileLink} readOnly className="w-full border p-3 rounded-xl bg-gray-100 text-gray-500 focus:outline-none text-sm cursor-not-allowed" placeholder="Auto-filled from Product Data (Manage Link via Edit Product)" />
                            </div>
                            <div className="pt-4">
                                <Button onClick={async () => {
                                    if (!emailData.buyerEmail || !emailData.productName) return;

                                    // Simple validation for keys
                                    if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || import.meta.env.VITE_EMAILJS_SERVICE_ID.includes('YOUR_')) {
                                        alert('⚠️ Please configure EmailJS keys in .env file first!');
                                        return;
                                    }

                                    setIsSending(true);
                                    try {
                                        // 1. Record Transaction first
                                        await handleRecordTransaction();

                                        // 2. Get Product Details
                                        const selectedProduct = manageProducts.find(p => p.title === emailData.productName);
                                        const price = selectedProduct ? parseFloat(selectedProduct.price) : 0;
                                        const serviceFee = 2000;
                                        const total = price + serviceFee;

                                        const formattedPrice = new Intl.NumberFormat('id-ID').format(price);
                                        const formattedTotal = new Intl.NumberFormat('id-ID').format(total);

                                        const imageUrl = selectedProduct ? (selectedProduct.image_url || selectedProduct.img) : 'https://placehold.co/100';

                                        // 2. Prepare Template Params
                                        const templateParams = {
                                            buyer_email: emailData.buyerEmail,
                                            order_id: `ORD-${Date.now().toString().slice(-6)}`,
                                            product_name: emailData.productName,
                                            product_image: imageUrl,
                                            product_price: formattedPrice,
                                            service_fee: '2.000',
                                            total_price: formattedTotal,
                                            license_key: emailData.licenseKey,
                                            download_link: emailData.fileLink || 'Link not provided',
                                            site_link: window.location.origin
                                        };

                                        // 3. Send Email
                                        await emailjs.send(
                                            import.meta.env.VITE_EMAILJS_SERVICE_ID,
                                            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                                            templateParams,
                                            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                                        );

                                        alert('✅ Email sent successfully!');
                                    } catch (error) {
                                        console.error('Email sending failed:', error);
                                        alert('❌ Failed to send email: ' + (error.text || error.message));
                                    } finally {
                                        setIsSending(false);
                                    }
                                }} className="w-full py-4 text-lg justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30" disabled={isSending || !emailData.buyerEmail || !emailData.productName}>
                                    {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                                    {isSending ? 'Sending...' : 'Send Email Now'}
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-2">Make sure EmailJS credentials are set in .env file.</p>
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
            ) : null
            }
        </div >
    );
};
