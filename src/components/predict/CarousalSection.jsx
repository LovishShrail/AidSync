import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Film, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/button';

const CarouselSection = ({ title, description, frames, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentInterpolatedFrame, setCurrentInterpolatedFrame] = useState(0);
  const [isVisible, setIsVisible] = useState({
    howItWorks: false,
    interpolation: false,
    prediction: false,
    advantages: false
  });
  const [videoElement, setVideoElement] = useState(null);

  const setupVideo = (element) => {
    if (element) {
      setVideoElement(element);
      const playVideo = () => {
        element.playbackRate = 0.25;
        element.loop = true;
        element.muted = true; // Ensure muted
        element.play().catch(e => console.log("Autoplay prevented:", e));
      };

      // Try to play when metadata loads
      element.addEventListener('loadedmetadata', playVideo);

      // Also try on mount
      playVideo();

      return () => {
        element.removeEventListener('loadedmetadata', playVideo);
      };
    }
  };

  

  useEffect(() => {
    if (videoElement) {
      // Ensure settings persist after user interactions
      const handlePlay = () => {
        videoElement.playbackRate = 0.25;
      };

      videoElement.addEventListener('play', handlePlay);
      return () => videoElement.removeEventListener('play', handlePlay);
    }
  }, [videoElement]);

  useEffect(() => {
    const verifyVideo = async () => {
      const path = `/videos/${type}-demo.mp4`;
      try {
        const res = await fetch(path);
        console.log(`Video ${path} exists:`, res.ok);
        if (!res.ok) throw new Error('File not found');
        
        const blob = await res.blob();
        console.log('Video details:', {
          size: blob.size,
          type: blob.type
        });
      } catch (error) {
        console.error('Video verification failed:', error);
      }
    };
    
    verifyVideo();
  }, [type]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = ['howItWorks', 'interpolation', 'prediction', 'advantages'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === frames.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? frames.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const bgColor =
    type === 'interpolation'
      ? 'bg-gradient-to-b from-white to-blue-50'
      : 'bg-gradient-to-b from-blue-50 to-white';

  return (
    <section className={`py-24 ${bgColor} relative overflow-hidden`}>
      {/* Decorative Background SVGs */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute left-0 top-0 h-48 w-48 text-blue-100 opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M55.2,-75.2C71.4,-64.6,84.2,-47.1,88.9,-27.7C93.6,-8.3,90.3,12.9,81.7,31C73.2,49,59.4,63.9,42.6,73.4C25.8,82.8,5.9,86.7,-14.9,84.8C-35.8,82.9,-57.6,75.1,-71.3,59.4C-85,43.7,-90.6,20.1,-88.6,-2.1C-86.5,-24.2,-76.9,-45,-61.6,-56.6C-46.4,-68.1,-25.4,-70.4,-3.6,-65.8C18.2,-61.2,38.9,-49.7,55.2,-75.2Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute right-0 bottom-0 h-64 w-64 text-indigo-100 opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M47.5,-67.2C57.7,-55.1,59.9,-35.8,64.4,-17.5C68.9,0.9,75.7,18.3,71.6,32.4C67.5,46.5,52.6,57.3,37.4,65.5C22.2,73.7,6.8,79.2,-9.8,78.8C-26.3,78.3,-44,71.8,-55.8,59.3C-67.5,46.8,-73.5,28.1,-76.1,8.6C-78.8,-10.9,-78.2,-31.3,-68.1,-45.3C-57.9,-59.3,-38.2,-67,-20,-73.1C-1.8,-79.2,15,-79.5,29.8,-75C44.7,-70.4,57.6,-51,47.5,-67.2Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <span className="text-blue-600 font-semibold">
              {type === 'interpolation' ? 'AI Enhancement' : 'Future Prediction'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{title}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>

        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-xl shadow-2xl border border-gray-200">
            <div className="relative aspect-video flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              {frames.length > 0 ? (
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={frames[currentIndex]}
                  alt={`Frame ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400 p-10 w-full h-full flex flex-col items-center justify-center">
                  <div className="mb-4 relative">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="absolute inset-0 rounded-full bg-blue-500/30"
                      ></motion.div>
                      {type === 'interpolation'
                        ? <Film className="h-10 w-10 text-blue-400" />
                        : <BrainCircuit className="h-10 w-10 text-blue-400" />}
                    </div>
                  </div>
                  <p className="text-lg font-medium text-white mb-1">Frame {currentIndex + 1}/20</p>
                  <p className="text-sm text-gray-400">
                    {type === 'interpolation'
                      ? "Interpolated frame between source images"
                      : "AI-predicted future frame"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="absolute -left-4 -right-4 top-1/2 transform -translate-y-1/2 flex justify-between">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white shadow-lg hover:bg-blue-50 border-gray-200"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6 text-blue-600" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white shadow-lg hover:bg-blue-50 border-gray-200"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6 text-blue-600" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: frames.length > 0 ? frames.length : 20 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${currentIndex === index ? "bg-blue-600 w-6" : "bg-gray-300 w-2 hover:bg-gray-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Video Placeholder */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-16 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-xl border border-gray-200"
        >
          <div className="relative aspect-video bg-black">
            <video
              ref={setupVideo}
              autoPlay
              muted
              playsInline
              controls
              className="w-full h-full"
              poster={type === 'interpolation'
                ? '/predict/interpolated/i_001.png'
                : '/predict/predicted_frames/predicted_frame_001.png'}
              onError={(e) => {
                const video = e.target;
                console.error('Video error details:', {
                  error: video.error,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.currentSrc
                });

                // Fallback strategy
                if (video.error && video.error.code === video.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                  video.src = '/videos/fallback.mp4';
                }
              }}
              onCanPlay={() => console.log('Video can play')}
              onStalled={() => console.warn('Video stalled')}
              onSuspend={() => console.warn('Video loading suspended')}
            >
              <source
                src={type === 'interpolation'
                  ? '/videos/interpolated_video.mp4'
                  : '/videos/future_prediction.mp4'}
                type="video/mp4"
              />
            </video>
            {/* Optional play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 text-center">
            <p className="text-gray-700 font-medium">
              {type === 'interpolation'
                ? "Smooth video created from interpolated frames"
                : "Predictive video showing potential future events"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CarouselSection;
