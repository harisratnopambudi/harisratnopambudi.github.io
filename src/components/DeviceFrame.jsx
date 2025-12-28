import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Loader } from 'lucide-react';

export const DeviceFrame = ({ url, device = 'desktop', onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

    const getDeviceStyles = () => {
        switch (device) {
            case 'mobile':
                return {
                    // Adjusted height to prevent clipping on smaller screens, added max-height
                    container: 'max-w-[300px] h-[600px] border-[12px] rounded-[2.5rem]', // Reduced width and height for a sleeker phone look
                    frameColor: 'border-gray-900 bg-gray-900',
                    notch: true,
                    label: 'Mobile View'
                };
            case 'tablet':
                return {
                    container: 'max-w-[460px] h-[600px] border-[16px] rounded-[2rem]', // Reduced height to align with Buy Now button
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

    return (
        <div className="flex flex-col items-center justify-center w-full bg-gray-50 py-8 px-4 rounded-xl transition-all duration-500 overflow-hidden">
            {/* Screen Content - Conditional Rendering based on Device Type */}
            {device === 'desktop' ? (
                // Widescreen Laptop Mockup
                // Base width will be 100% of the max-w-4xl container.
                // Screen width will be ~88% of that.
                <div className="relative mx-auto w-full max-w-4xl flex flex-col items-center">
                    {/* Screen Part */}
                    <div className="relative border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-auto w-[88%] aspect-video shadow-xl z-10">
                        <div className="rounded-lg overflow-hidden w-full h-full bg-white relative group">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                                    <Loader className="animate-spin text-blue-600" size={32} />
                                </div>
                            )}
                            {/* 
                                Desktop Scaling Trick:
                                We want scaling to happen from top-left, but inside a container that fits perfectly.
                            */}
                            <div className="w-[285%] h-[285%] origin-top-left transform scale-[0.35]">
                                <iframe
                                    src={url}
                                    title="Live Preview"
                                    className="w-full h-full border-0"
                                    onLoad={() => setIsLoading(false)}
                                    allowFullScreen
                                    scrolling="no"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`relative w-full transition-all duration-500 shadow-2xl ${styles.container} ${styles.frameColor} flex flex-col mx-auto transform scale-90 sm:scale-100`}>
                    {/* Camera/Notch for Mobile */}
                    {styles.notch && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-b-xl z-10"></div>
                    )}

                    {/* Top Bar */}
                    {!styles.notch && (
                        <div className="h-4 w-full bg-inherit relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-gray-600 before:rounded-full"></div>
                    )}

                    {/* Screen Content for Mobile/Tablet */}
                    <div className="flex-1 w-full relative bg-white overflow-hidden rounded-[calc(2.5rem-12px)] group">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0">
                                <Loader className="animate-spin text-blue-600" size={32} />
                            </div>
                        )}
                        {/* 
                             Mobile Scaling Logic:
                             Visual width: ~276px (300px - 24px border)
                             Desired rendered width: 360px (Standard Android/small iOS)
                             Scale factor: 276 / 360 = ~0.766
                             Let's maintain roughly 360px content width.
                             If we use a wrapper of 130% width and scale 0.77...
                        */}
                        {device === 'mobile' && (
                            <div className="w-[130.5%] h-[130.5%] origin-top-left transform scale-[0.766] overflow-hidden">
                                <style>{`
                                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                                `}</style>
                                <iframe
                                    src={url}
                                    title="Live Preview"
                                    className="w-full h-full border-0 hide-scrollbar"
                                    onLoad={() => setIsLoading(false)}
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* 
                             Tablet Scaling Logic:
                             Visual width: ~428px (460px - 32px border)
                             Visual height: ~568px (600px - 32px border)
                             Desired rendered width: 768px (iPad Portrait)
                             Scale factor: 428 / 768 = ~0.557
                        */}
                        {device === 'tablet' && (
                            <div className="w-[179.5%] h-[179.5%] origin-top-left transform scale-[0.557] overflow-hidden">
                                <style>{`
                                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                                `}</style>
                                <iframe
                                    src={url}
                                    title="Live Preview"
                                    className="w-full h-full border-0 hide-scrollbar"
                                    onLoad={() => setIsLoading(false)}
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {device !== 'mobile' && device !== 'tablet' && (
                            <iframe
                                src={url}
                                title="Live Preview"
                                className="w-full h-full border-0"
                                onLoad={() => setIsLoading(false)}
                                allowFullScreen
                            />
                        )}
                    </div>

                    {/* Home Bar/Button area */}
                    <div className="h-5 w-full flex items-center justify-center">
                        <div className="w-16 h-1 bg-gray-700 rounded-full opacity-50"></div>
                    </div>
                </div>
            )}

            {/* Laptop Base (Only for Desktop) */}
            {device === 'desktop' && (
                // Base is 100% of the max-w-4xl container
                <div className="relative mx-auto bg-gray-900 rounded-b-xl rounded-t-sm h-[17px] w-full md:h-[24px] shadow-xl z-20">
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[15%] h-[5px] md:h-[8px] bg-gray-800"></div>
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
