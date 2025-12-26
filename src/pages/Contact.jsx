import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Contact = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Get in Touch
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                    Have questions about our products or need custom solutions? We're here to help.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Email</h4>
                                    <p className="text-gray-500">support@harisdevlab.co</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">WhatsApp</h4>
                                    <p className="text-gray-500">+62 812-3456-7890</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Office</h4>
                                    <p className="text-gray-500">Jakarta, Indonesia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-blue-900/5">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Send Message</h3>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Your Email"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="Inquiry about..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                rows="4"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>
                        <Button className="w-full justify-center">
                            <Send size={18} className="mr-2" />
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
