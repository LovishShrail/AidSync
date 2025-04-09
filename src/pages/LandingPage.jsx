import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleRescueClick = () => {
    console.log("Navigating to rescue section");
    navigate('/rescue');
  };

  const handleReliefClick = () => {
    console.log("Navigating to relief section");
    navigate('/home');
  };

  const handlePredictClick = () => {
    console.log("Navigating to predict section");
    navigate('/predict');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white p-4 flex items-center justify-center border-b-5 border-gradient-to-r from-white to-indigo-500" 
           style={{ 
             borderImageSlice: 1,
             borderImageSource: 'linear-gradient(to right, white, #4338ca)'
           }}>
        <div className="h-16 flex items-center">
          <div className="font-bold text-2xl">
            <img
              src="/AidsyncLogo.png"
              alt="AidSync3D Logo"
              className="h-23 w-78 object-contain ml-[-30px]"
            />
          </div>
        </div>
      </div>
      
      {/* Main Content - Three Sections */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Rescue Section - First Section */}
        <button 
          onClick={handlePredictClick}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center p-8 focus:outline-none group"
        >
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4 group-hover:text-5xl transition-all duration-300">Predict</h1>
            <p className="text-lg mb-6">AI-Powered Analysis: Forecasts potential disaster zones and severity using historical data. Early Warning Systems: Provides crucial time for evacuation and preparation.</p>
            <div className="flex items-center justify-center group-hover:translate-x-2 transition-all duration-300">
              <span className="mr-2">Learn More</span>
              <ArrowRight size={20} />
            </div>
          </div>
        </button>
        <button 
          onClick={handleRescueClick}
          className="flex-1  bg-white text-black flex flex-col items-center justify-center p-8 focus:outline-none group"
        >
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4 group-hover:text-5xl transition-all duration-300">Rescue</h1>
            <p className="text-lg mb-6">3D Reconstruction: Enables real-time mapping of disaster zones to identify critical areas. Frame Interpolation: Enhances video clarity for better situational awareness.</p>
            <div className="flex items-center justify-center group-hover:translate-x-2 transition-all duration-300">
              <span className="mr-2">Learn More</span>
              <ArrowRight size={20} />
            </div>
          </div>
        </button>
        
        {/* Predict Section - Middle Section */}
        
        {/* Relief Section - Last Section */}
        <button 
          onClick={handleReliefClick}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center p-8 focus:outline-none group"
        >
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4 group-hover:text-5xl transition-all duration-300">Relief</h1>
            <p className="text-lg mb-6">Blockchain Technology: Ensures secure donation tracking, resource allocation, and real-time audit logs.</p>
            <div className="flex items-center justify-center group-hover:translate-x-2 transition-all duration-300">
              <span className="mr-2">Learn More</span>
              <ArrowRight size={20} />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}