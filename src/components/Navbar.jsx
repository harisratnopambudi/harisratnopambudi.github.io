import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Catalog', path: '/' }, // Assuming Catalog is Home for now
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white rotate-3 transition-transform group-hover:rotate-0">
                            <ShoppingBag size={18} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">
                            Haris <span className="text-blue-600">DevLab Co.</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive(link.path) && link.path !== '/' ? 'text-blue-600' : 'text-gray-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Collapse Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                            >
                                {link.name}
                            </Link>
                        ))}

                    </div>
                </div>
            )}
        </nav>
    );
};
