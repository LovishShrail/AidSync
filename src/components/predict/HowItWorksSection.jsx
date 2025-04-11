import React from 'react';
import { motion } from 'framer-motion';
import { SatelliteDish, Film, BrainCircuit } from 'lucide-react';

const steps = [
  {
    icon: <SatelliteDish className="h-16 w-16 mb-6 text-blue-500 group-hover:text-blue-600 transition-colors" />,
    title: "Data Capture",
    description: "Low-framerate video footage or images are collected from drones and satellites monitoring disaster areas in real-time."
  },
  {
    icon: <Film className="h-16 w-16 mb-6 text-blue-500 group-hover:text-blue-600 transition-colors" />,
    title: "Frame Interpolation",
    description: "AI algorithms analyze existing frames and generate intermediate frames, enhancing visual clarity and smoothness."
  },
  {
    icon: <BrainCircuit className="h-16 w-16 mb-6 text-blue-500 group-hover:text-blue-600 transition-colors" />,
    title: "Frame Prediction",
    description: "Advanced neural networks predict future frames, giving emergency responders crucial foresight into developing situations."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gray-50/80 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0wIDMwaDYwTTMwIDBWNjAiIHN0cm9rZT0iIzAwMDgiIG9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMC41Ii8+CjxwYXRoIGQ9Ik0xNSAwdjYwTTQ1IDB2NjBNMCAxNWg2ME0wIDQ1aDYwIiBzdHJva2U9IiMwMDA4IiBvcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3N2Zz4=')]"></div>
      
      {/* Blue circle decorative elements */}
      <motion.div 
        className="absolute left-0 top-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
        animate={{ 
          x: [-20, 20, -20], 
          opacity: [0.5, 0.7, 0.5] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      ></motion.div>
      <motion.div 
        className="absolute right-0 bottom-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"
        animate={{ 
          x: [20, -20, 20], 
          opacity: [0.6, 0.8, 0.6] 
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      ></motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <span className="text-blue-600 font-semibold">Our Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered system turns fragmented video data into smooth, predictive visualizations
            that help emergency teams save lives.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group bg-white p-8 rounded-xl shadow-lg flex flex-col items-center text-center relative border border-gray-100 overflow-hidden transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-200 translate-x-2 -translate-y-2">{index + 1}</span>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {step.icon}
                <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-full"></div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Connection lines between steps (only visible on desktop) */}
        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>
    </section>
  );
};

export default HowItWorksSection;