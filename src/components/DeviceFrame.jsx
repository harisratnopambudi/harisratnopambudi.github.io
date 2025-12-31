import React from 'react';

export const DeviceFrame = ({ type = 'mobile', children, scale = 1 }) => {
    // Base styles for the outer shell
    const shellStyles = {
        mobile: "relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] shadow-xl",
        tablet: "relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[1.5rem] shadow-xl",
        laptop: "relative mx-auto bg-gray-900 rounded-[1rem] shadow-xl pt-2 pb-8 px-8", // Simplified laptop base
    };

    // Dimensions for the viewport area (Screen)
    const viewports = {
        mobile: { width: 393, height: 852 },
        tablet: { width: 768, height: 1024 },
        laptop: { width: 1280, height: 800 } // approx 13" aspect
    };

    const dims = viewports[type] || viewports.mobile;

    // Inner Screen Content styling
    const screenStyle = {
        width: `${dims.width}px`,
        height: `${dims.height}px`,
        backgroundColor: 'white',
        overflow: 'hidden',
        position: 'relative'
    };

    if (type === 'laptop') {
        return (
            <div
                className="device-frame-wrapper inline-block"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
                {/* Laptop Lid/Screen */}
                <div className="bg-gray-800 rounded-t-xl p-3 pb-0 mx-auto w-fit shadow-2xl relative">
                    {/* Camera */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    {/* Screen Bezel */}
                    <div className="bg-black p-1 rounded-t-lg border-2 border-gray-700 border-b-0">
                        {/* Actual Screen Content */}
                        <div style={screenStyle} className="bg-white">
                            {children}
                        </div>
                    </div>
                </div>
                {/* Laptop Body/Keyboard Base */}
                <div className="bg-gray-700 h-4 w-full rounded-b-lg relative shadow-lg">
                    {/* Notch to open */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-b-md"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`device-frame-wrapper inline-block ${shellStyles[type]}`}
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
            {/* Notch / Camera / Buttons for Mobile/Tablet */}
            <div className={`h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg`}></div>
            <div className={`h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg`}></div>
            <div className={`h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg`}></div>

            {/* Inner Screen */}
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                {/* Top Island/Notch Mockup */}
                {type === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[25px] w-[100px] bg-black rounded-b-xl z-20 flex justify-center items-center gap-2">
                        <div className="w-10 h-1 rounded-full bg-gray-800/50"></div>
                    </div>
                )}

                {/* Content Container */}
                <div style={screenStyle} className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
};
