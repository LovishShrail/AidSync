import React from 'react';
import HeroSection from '../components/predict/HeroSection';
import HowItWorksSection from '../components/predict/HowItWorksSection';
import CarouselSection from '../components/predict/CarousalSection';
import AdvantagesSection from '../components/predict/AdvantageSection';
import ScrollToTopButton from '../components/predict/ScrollToTopButton';
import { Link } from 'react-router-dom'

// Placeholder frames - these would be replaced with actual images

const interpolationFrames = [
    '/predict/interpolated/i_001.png',
    '/predict/interpolated/i_002.png',
    '/predict/interpolated/i_003.png',
    '/predict/interpolated/i_004.png',
    '/predict/interpolated/i_005.png',
    '/predict/interpolated/i_006.png',
    '/predict/interpolated/i_007.png',
    '/predict/interpolated/i_008.png',
    '/predict/interpolated/i_009.png',
    '/predict/interpolated/i_010.png',
    '/predict/interpolated/i_011.png',
    '/predict/interpolated/i_012.png',
    '/predict/interpolated/i_013.png',
    '/predict/interpolated/i_014.png',
    '/predict/interpolated/i_015.png',
    '/predict/interpolated/i_016.png',
    '/predict/interpolated/i_017.png',
    '/predict/interpolated/i_018.png',
    '/predict/interpolated/i_019.png',
    '/predict/interpolated/i_020.png'
];


const predictionFrames = [
    '/predict/predicted_frames/predicted_frame_001.png',
    '/predict/predicted_frames/predicted_frame_002.png',
    '/predict/predicted_frames/predicted_frame_003.png',
    '/predict/predicted_frames/predicted_frame_004.png',
    '/predict/predicted_frames/predicted_frame_005.png'
];

const Index = () => {
    return (
        <div className="overflow-x-hidden">
            <div className="bg-white p-4 flex items-center justify-start border-b-5 border-gradient-to-r from-white to-indigo-500"
                style={{
                    borderImageSlice: 1,
                    borderImageSource: 'linear-gradient(to right, white, #4338ca)'
                }}>
                <div className="h-12 pl-2 flex items-center">
                    <div className="font-bold text-2xl">
                        <Link to="/" className="focus:outline-none hover:opacity-90 transition-opacity duration-200">
                            <img
                                src="/AidsyncLogo.png"
                                alt="AidSync3D Logo"
                                className="h-18 object-contain"
                            />
                        </Link>

                    </div>
                </div>
            </div>
            {/* Hero Section */}
            <HeroSection />

            {/* How It Works Section */}
            <HowItWorksSection />


            <div className={`mb-27 mt-15`}>
                <div className="flex justify-center">
                    <h1 className="text-3xl font-bold mb-6 text-black relative inline-block after:block after:h-1 after:w-20 after:bg-indigo-700 after:mx-auto after:mt-2">
                        Original Satellite Images
                    </h1>
                </div>
                <div className="grid md:grid-cols-2 gap-8 m-10">
                    {/* Image A - First satellite image */}
                    <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg h-[400px]">
                        <img
                             // Update with your actual path
                            src="/predict/original/original_pre.png"
                            alt="Original Satellite Image A"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.jpg"; // Fallback image
                            }}
                        />
                    </div>

                    {/* Image B - Second satellite image */}
                    <div className="bg-gray-200 h-[400px] rounded-lg overflow-hidden shadow-lg">
                        <img
                            
                            src="/predict/original/original_post.png"  // Update with your actual path
                            alt="Original Satellite Image B"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.jpg"; // Fallback image
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Interpolation Demonstration */}
            <CarouselSection
                title="Frame Interpolation"
                description="Our AI technology generates intermediate frames between two satellite images, transforming still snapshots into a smooth, continuous video that reveals critical motion and transitions in disaster zones."
                frames={interpolationFrames}
                type="interpolation"
            />

            {/* Prediction Demonstration */}
            <CarouselSection
                title="Frame Prediction"
                description="Using advanced machine learning models, we predict future frames to help emergency responders anticipate developing situations."
                frames={predictionFrames}
                type="prediction"
            />

            {/* Advantages Section */}
            <AdvantagesSection />

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </div>
    );
};

export default Index;
