import React, { useEffect, useRef, useState } from 'react';
import RerunViewer from '../components/rescue/RerunViewer';
import { ArrowDown, Camera, Map, Rotate3d, Crosshair, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom'

const RescuePage = () => {
    const [isVisible, setIsVisible] = useState({
        hero: false,
        explanation: false,
        process: false,
        gallery: false,
        model: false
    });

    const heroRef = useRef(null);
    const explanationRef = useRef(null);
    const processRef = useRef(null);
    const galleryRef = useRef(null);
    const modelRef = useRef(null);

    // Intersection Observer setup for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(prev => ({
                        ...prev,
                        [entry.target.dataset.section]: true
                    }));
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        if (heroRef.current) observer.observe(heroRef.current);
        if (explanationRef.current) observer.observe(explanationRef.current);
        if (processRef.current) observer.observe(processRef.current);
        if (galleryRef.current) observer.observe(galleryRef.current);
        if (modelRef.current) observer.observe(modelRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <>
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
            <div className="min-h-screen bg-white text-gray-800">
                {/* Hero Section */}
                <section
                    ref={heroRef}
                    data-section="hero"
                    className="h-screen flex flex-col justify-center items-center text-center relative overflow-hidden"
                >

                    <div className={`transition-all duration-1000 transform ${isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                            Vision To Rescue
                        </h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-600">
                            Transforming raw imagery into detailed, navigable 3D maps for precise disaster response
                        </p>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-px rounded-full inline-block">
                            <button className="bg-white hover:bg-gray-100 text-gray-800 py-3 px-8 rounded-full transition-all flex items-center space-x-2 shadow-md">
                                <span>Discover How</span>
                                <ArrowDown className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Subtle background elements */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div className="absolute h-96 w-96 bg-blue-600 rounded-full filter blur-3xl opacity-5 -top-48 -left-48 animate-pulse"></div>
                        <div className="absolute h-96 w-96 bg-indigo-700 rounded-full filter blur-3xl opacity-5 -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>

                    <div className="absolute bottom-10 animate-bounce">
                        <ArrowDown className="h-8 w-8 text-blue-600 opacity-70" />
                    </div>
                </section>

                {/* Explanation Section */}
                <section
                    ref={explanationRef}
                    data-section="explanation"
                    className="py-20 px-6 md:px-16 max-w-7xl mx-auto"
                >
                    <div className={`transition-all duration-1000 delay-300 transform ${isVisible.explanation ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                                Empowering Rescue Teams with Immersive Technology
                            </span>
                        </h2>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <p className="text-lg md:text-xl text-gray-600">
                                    In disaster scenarios, every minute counts. Traditional mapping techniques often fail to provide the comprehensive situational awareness needed for effective response.
                                </p>
                                <p className="text-lg md:text-xl text-gray-600">
                                    Our technology bridges this critical gap by instantly transforming ordinary images into detailed, navigable 3D maps that emergency teams can use to plan and execute rescue operations with unprecedented precision.
                                </p>
                                <p className="text-lg md:text-xl text-gray-600">
                                    This immersive perspective allows responders to visualize disaster zones from any angle, identify optimal routes, locate potential hazards, and coordinate resources efficiently.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-px rounded-xl shadow-lg">
                                <div className="bg-white p-8 rounded-xl h-full">
                                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Key Benefits</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <span className="bg-blue-600 p-1 rounded-full mr-3 mt-1">
                                                <Crosshair className="h-5 w-5 text-white" />
                                            </span>
                                            <span className="text-gray-600">Precise targeting of critical areas</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-indigo-700 p-1 rounded-full mr-3 mt-1">
                                                <Navigation className="h-5 w-5 text-white" />
                                            </span>
                                            <span className="text-gray-600">Intuitive navigation in complex environments</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-blue-600 p-1 rounded-full mr-3 mt-1">
                                                <Rotate3d className="h-5 w-5 text-white" />
                                            </span>
                                            <span className="text-gray-600">Complete 360° visualization</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-indigo-700 p-1 rounded-full mr-3 mt-1">
                                                <Map className="h-5 w-5 text-white" />
                                            </span>
                                            <span className="text-gray-600">Real-time terrain assessment</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section
                    ref={processRef}
                    data-section="process"
                    className="py-20 px-6 md:px-16 bg-gray-50"
                >
                    <div className={`max-w-7xl mx-auto transition-all duration-1000 delay-300 transform ${isVisible.process ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                                How It Works
                            </span>
                        </h2>

                        <div className="relative">
                            {/* Process timeline */}
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-700"></div>

                            {/* Step 1 */}
                            <div className="relative pl-12 md:pl-0 mb-24">
                                <div className="md:w-1/2 md:pr-16 md:text-right">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-px rounded-xl shadow-lg">
                                        <div className="bg-white p-6 rounded-xl">
                                            <h3 className="text-2xl font-bold mb-3 text-gray-800">Image Acquisition</h3>
                                            <p className="text-gray-600">Multiple images are captured from different angles using standard cameras, drones, or mobile devices.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute left-0 md:left-1/2 top-6 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 transform md:-translate-x-1/2 flex items-center justify-center">
                                    <Camera className="h-4 w-4 text-white" />
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative pl-12 md:pl-0 mb-24">
                                <div className="md:w-1/2 md:pl-16 md:ml-auto">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-px rounded-xl shadow-lg">
                                        <div className="bg-white p-6 rounded-xl">
                                            <h3 className="text-2xl font-bold mb-3 text-gray-800">AI Processing</h3>
                                            <p className="text-gray-600">Our advanced algorithms analyze the images, identifying common features and calculating spatial relationships.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute left-0 md:left-1/2 top-6 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 transform md:-translate-x-1/2 flex items-center justify-center">
                                    <div className="animate-pulse">
                                        <Crosshair className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative pl-12 md:pl-0 mb-24">
                                <div className="md:w-1/2 md:pr-16 md:text-right">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-px rounded-xl shadow-lg">
                                        <div className="bg-white p-6 rounded-xl">
                                            <h3 className="text-2xl font-bold mb-3 text-gray-800">3D Reconstruction</h3>
                                            <p className="text-gray-600">The system generates a detailed 3D point cloud, creating an accurate digital representation of the physical space.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute left-0 md:left-1/2 top-6 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 transform md:-translate-x-1/2 flex items-center justify-center">
                                    <Rotate3d className="h-4 w-4 text-white" />
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="relative pl-12 md:pl-0">
                                <div className="md:w-1/2 md:pl-16 md:ml-auto">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-px rounded-xl shadow-lg">
                                        <div className="bg-white p-6 rounded-xl">
                                            <h3 className="text-2xl font-bold mb-3 text-gray-800">Interactive Visualization</h3>
                                            <p className="text-gray-600">Rescue teams can interact with the 3D model in real-time, navigating through the terrain to plan effective response strategies.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute left-0 md:left-1/2 top-6 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 transform md:-translate-x-1/2 flex items-center justify-center">
                                    <Map className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Section - Placeholder for 5 images */}
                <section
                    ref={galleryRef}
                    data-section="gallery"
                    className="py-20 px-6 md:px-16 max-w-7xl mx-auto"
                >
                    <div className={`transition-all duration-1000 delay-300 transform ${isVisible.gallery ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                                Source Imagery
                            </span>
                        </h2>

                        <p className="text-center text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                            These 5 images from different angles are processed by our system to create a comprehensive 3D model shown below.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
                            {[
                                '../public/rescueImage/00003.png',
                                '../public/rescueImage/00005.png',
                                '../public/rescueImage/00007.png',
                                '../public/rescueImage/00011.png',
                                '../public/rescueImage/00013.png',
                                
                            ].map((src, index) => (
                                <div
                                    key={index}
                                    className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl overflow-hidden relative group shadow-md"
                                >
                                    <img
                                        src={src}
                                        alt={`Input Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                        <span className="p-4 text-white font-medium">Image {index + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3D Model Viewer Section */}
                <section
                    ref={modelRef}
                    data-section="model"
                    className="py-20 px-6 md:px-16 bg-gray-50"
                >
                    <div className={`max-w-7xl mx-auto transition-all duration-1000 delay-300 transform ${isVisible.model ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                                3D Reconstructed Model
                            </span>
                        </h2>

                        <p className="text-center text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                            Interact with the fully reconstructed 3D model below, demonstrating the power of our technology.
                        </p>

                        {/* 3D Model Viewer Component */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-px rounded-xl shadow-lg">
                            <div className="bg-white rounded-xl overflow-hidden h-[600px]">
                                <RerunViewer />
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                This interactive model was created using just the 5 images shown above, demonstrating how quickly our system can transform raw imagery into actionable 3D intelligence.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-20 px-6 md:px-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
                                Ready to Transform Disaster Response?
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl text-gray-600 mb-8">
                            Join the growing network of emergency services using our technology to save lives.
                        </p>

                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-px rounded-full inline-block shadow-lg">
                            <button className="bg-white hover:bg-gray-50 text-gray-800 py-3 px-8 rounded-full transition-all">
                                Contact Us
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default RescuePage;