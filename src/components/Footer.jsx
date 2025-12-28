import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h3 className="font-bold text-gray-900 text-lg">Haris DevLab</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Premium Digital Products & Licenses.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Catalog</Link>
                        <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
                        <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            &copy; {new Date().getFullYear()} Made with <Heart size={14} className="fill-red-500 text-red-500" />
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
};
