import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export const DeviceFrame = ({ url, image, device = 'desktop' }) => {

    // Define styles based on device type
    const getDeviceStyles = () => {
        switch (device) {
            case 'mobile':
                return {
                    container: 'max-w-[300px] h-[600px] border-[12px] rounded-[2.5rem]',
                    frameColor: 'border-gray-900 bg-gray-900',
                    notch: true,
                    label: 'Mobile View'
                };
            case 'tablet':
                return {
                    container: 'max-w-[460px] h-[600px] border-[16px] rounded-[2rem]',
                    frameColor: 'border-gray-800 bg-gray-800',
                    notch: false,
                    label: 'Tablet View'
                };
            case 'desktop':
            default:
                return {
                    container: 'w-full border-4 rounded-lg',
                    frameColor: 'border-gray-700 bg-gray-700',
                    notch: false,
                    label: 'Desktop View'
                };
        }
    };

    const styles = getDeviceStyles();

    const handleOpenDemo = () => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    // Helper to render the screen content (Image + Overlay)
    const renderScreenContent = () => (
        <div className="relative group w-full h-full bg-gray-900 cursor-pointer overflow-hidden" onClick={handleOpenDemo}>
            {/* Static Image */}
            <img
                src={image}
                alt="Live Preview"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
            />

            {/* Overlay Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm text-blue-600 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-xl transform transition-transform group-hover:scale-110">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-blue-600 border-b-[10px] border-b-transparent ml-1"></div>
                </div>
                <span className="bg-black/60 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider backdrop-blur-md border border-white/20 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                    Open Live Demo
                </span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full bg-gray-50 py-8 px-4 rounded-xl transition-all duration-500 overflow-hidden">

            {/* Desktop View (Laptop Mockup) */}
            {device === 'desktop' ? (
                <div className="relative mx-auto w-full max-w-4xl flex flex-col items-center">
                    {/* Screen Part */}
                    <div className="relative border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-auto w-[88%] aspect-video shadow-xl z-10">
                        <div className="rounded-lg overflow-hidden w-full h-full bg-white relative group">
                            {renderScreenContent()}
                        </div>
                    </div>
                    {/* Laptop Base */}
                    <div className="relative mx-auto bg-gray-900 rounded-b-xl rounded-t-sm h-[17px] w-full md:h-[24px] shadow-xl z-20">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[15%] h-[5px] md:h-[8px] bg-gray-800"></div>
                    </div>
                </div>
            ) : (
                /* Mobile/Tablet View */
                <div className={`relative w-full transition-all duration-500 shadow-2xl ${styles.container} ${styles.frameColor} flex flex-col mx-auto transform scale-90 sm:scale-100`}>
                    {/* Camera/Notch for Mobile */}
                    {styles.notch && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-b-xl z-10"></div>
                    )}

                    {/* Top Bar for Tablet */}
                    {!styles.notch && (
                        <div className="h-4 w-full bg-inherit relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-gray-600 before:rounded-full"></div>
                    )}

                    {/* Screen Content */}
                    <div className="flex-1 w-full relative bg-white overflow-hidden rounded-[calc(2.5rem-12px)] group">
                        {renderScreenContent()}
                    </div>

                    {/* Home Bar/Button area */}
                    <div className="h-5 w-full flex items-center justify-center">
                        <div className="w-16 h-1 bg-gray-700 rounded-full opacity-50"></div>
                    </div>
                </div>
            )}

            <p className="mt-6 text-gray-500 text-sm font-medium flex items-center gap-2">
                {device === 'mobile' && <Smartphone size={16} />}
                {device === 'tablet' && <Tablet size={16} />}
                {device === 'desktop' && <Monitor size={16} />}
                {styles.label}
            </p>
        </div>
    );
};
