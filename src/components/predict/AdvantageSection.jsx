import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Eye, 
  Target, 
  AlertTriangle, 
  Clock, 
  Users
} from 'lucide-react';

const advantages = [
  {
    icon: <MapPin className="h-10 w-10 text-blue-500" />,
    title: "Real-time Support",
    description: "Provide immediate visual intelligence to teams working in disaster zones with limited connectivity."
  },
  {
    icon: <Eye className="h-10 w-10 text-blue-500" />,
    title: "Enhanced Awareness",
    description: "Transform choppy footage into smooth videos that reveal critical details in disaster environments."
  },
  {
    icon: <Target className="h-10 w-10 text-blue-500" />,
    title: "Improved Decision-Making",
    description: "Make faster, more accurate decisions based on clearer visual information and predictive insights."
  },
  {
    icon: <AlertTriangle className="h-10 w-10 text-blue-500" />,
    title: "Early Warning",
    description: "Anticipate developments and potential hazards through AI-powered frame prediction technology."
  },
  {
    icon: <Clock className="h-10 w-10 text-blue-500" />,
    title: "Time Efficiency",
    description: "Reduce the time needed to assess situations and allocate resources where they're needed most."
  },
  {
    icon: <Users className="h-10 w-10 text-blue-500" />,
    title: "Team Coordination",
    description: "Share enhanced visual data across response teams for better coordination during critical operations."
  }
];

// Animation variants to fix TypeScript error
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AdvantagesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <span className="text-blue-600 font-semibold">Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Key Advantages</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our technology provides critical benefits for emergency responders working in disaster scenarios.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl mb-5 shadow-inner group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {advantage.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AdvantagesSection;