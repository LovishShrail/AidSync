// src/pages/RerunViewerPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { WebViewer } from '@rerun-io/web-viewer';

const RerunViewer = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadViewer = async () => {
      try {
        // Create a new WebViewer instance
        const viewer = new WebViewer();

        // Save reference to clean up later
        viewerRef.current = viewer;

        // Start the viewer
        await viewer.start(null, containerRef.current);

        // Load your converted RRD file
        try {
          // Use the model.rrd file instead of map-f.rrd
          await viewer.open('/models/model.rrd');
          console.log('RRD file loaded successfully');
        } catch (fileError) {
          console.error("Failed to load RRD file:", fileError);
          // setError("Failed to load 3D model file. Please make sure the conversion was successful.");
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize 3D viewer:", error);
        setError("Failed to initialize 3D viewer");
        setLoading(false);
      }
    };

    loadViewer();

    // Clean up on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.stop();
      }
    };
  }, []);

  return (
    // <div className="w-screen h-screen relative">
    
    //   <div ref={containerRef} className="absolute inset-0" />
    //   {loading && (
    //     <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
    //       <div className="text-white text-lg p-5 rounded-lg">
    //         Loading 3D model...
    //       </div>
    //     </div>
    //   )}

    //   {/* Error Overlay */}
    //   {error && (
    //     <div className="absolute inset-0 flex items-center justify-center bg-red-600/70 z-10">
    //       <div className="text-white text-lg p-5 rounded-lg">
    //         {error}
    //       </div>
    //     </div>
    //   )}
    // </div>

    <div ref={containerRef} className="w-100% h-screen flex items-center justify-center" >
       {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px'
        }}>
          Loading 3D model...
        </div>
         )}
      </div>

  );
};

export default RerunViewer;