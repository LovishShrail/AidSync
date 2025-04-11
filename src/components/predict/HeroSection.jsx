import React from 'react';
import { Button } from "../ui/button";
import { motion } from 'framer-motion';
import { ChevronDown, Zap, Shield } from 'lucide-react';

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className=" h-screen flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* Dynamic background with gradient and pattern */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }} />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 md:h-2 md:w-2 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, Math.random() * 1.5 + 1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* <div className="flex justify-center mb-6">
            <motion.div 
              className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4"
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <Zap className="h-8 w-8 text-blue-300" />
            </motion.div>
          </div> */}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-700 leading-tight">
            AI-Powered Frame Interpolation & Prediction
          </h1>

          <motion.div
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-lg md:text-xl  text-gray-600 mb-0">
              Enhancing disaster response with advanced AI that interpolates and predicts video frames,
              providing responders with clearer situational awareness when every second counts.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              <Shield className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-blue-100/30 px-8 py-6 text-lg rounded-lg transition-all duration-300"
            >
              Learn More
            </Button>

          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0],
          y: [0, 10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        <ChevronDown className="text-white h-8 w-8" />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;