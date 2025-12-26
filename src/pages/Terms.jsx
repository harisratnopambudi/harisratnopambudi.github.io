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

            <div className="prose prose-lg prose-blue mx-auto bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                <section>
                    <h3 className="mb-3">1. Introduction</h3>
                    <p className="leading-relaxed">
                        Welcome to Haris DevLab Co. By accessing our website and purchasing our digital products, you agree to be bound by these Terms and Conditions.
                    </p>
                </section>

                <section>
                    <h3 className="mb-3">2. Digital Products</h3>
                    <p className="leading-relaxed">
                        All products listed are digital assets (software, templates, scripts). Upon purchase, you will receive a license to use the product according to the specific license terms mentioned on the product page.
                    </p>
                </section>

                <section>
                    <h3 className="mb-3">3. Refund Policy</h3>
                    <p className="leading-relaxed">
                        Due to the nature of digital products, <strong>all sales are final</strong>. We do not offer refunds once the product files have been downloaded or sent, unless the product is technically defective and cannot be fixed by our support team.
                    </p>
                </section>

                <section>
                    <h3 className="mb-3">4. Support</h3>
                    <p className="leading-relaxed">
                        We provide technical support for the installation and configuration of our products for 6 months from the date of purchase. Customization requests may incur additional fees.
                    </p>
                </section>

                <section>
                    <h3 className="mb-3">5. License Usage</h3>
                    <p className="leading-relaxed">
                        You may not resell, redistribute, or share our products in their original or modified form to third parties without explicit written permission.
                    </p>
                </section>
            </div>
        </div>
    );
};
