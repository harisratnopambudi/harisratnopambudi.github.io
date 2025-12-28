import React from 'react';
import { ScrollText } from 'lucide-react';

export const Terms = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 animate-fade-in-up">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <ScrollText size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    Terms & Conditions
                </h1>
                <p className="text-gray-500 text-lg">
                    Last updated: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm space-y-10">
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <h3 className="text-xl font-semibold text-gray-900 m-0">Introduction</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-11 text-justify">
                        Welcome to Haris DevLab. By accessing our website and purchasing our digital products, you agree to be bound by these Terms and Conditions.
                    </p>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <h3 className="text-xl font-semibold text-gray-900 m-0">Digital Products</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-11 text-justify">
                        All products listed are digital assets (software, templates, scripts). Upon purchase, you will receive a license to use the product according to the specific license terms mentioned on the product page.
                    </p>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <h3 className="text-xl font-semibold text-gray-900 m-0">Refund Policy</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-11 text-justify">
                        Due to the nature of digital products, <strong className="text-gray-800">all sales are final</strong>. We do not offer refunds once the product files have been downloaded or sent, unless the product is technically defective and cannot be fixed by our support team.
                    </p>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <h3 className="text-xl font-semibold text-gray-900 m-0">Support</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-11 text-justify">
                        We provide technical support for the installation and configuration of our products for 6 months from the date of purchase. Customization requests may incur additional fees.
                    </p>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                        <h3 className="text-xl font-semibold text-gray-900 m-0">License Usage</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-11 text-justify">
                        You may not resell, redistribute, or share our products in their original or modified form to third parties without explicit written permission.
                    </p>
                </section>
            </div>
        </div>
    );
};
