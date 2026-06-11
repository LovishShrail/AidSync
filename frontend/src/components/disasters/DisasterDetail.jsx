import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContract } from '../../hooks/useContract';
import { useWallet } from '../../hooks/useWallet';
import StatusBadge from '../common/StatusBadge';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import DonationForm from '../donations/DonationForm';
import RecentDonations from '../donations/RecentDonations';
import LeaderboardTable from '../donations/LeaderboardTable';
import { formatEther } from '../../utils/formatters';
import { Maximize2, Minimize2 } from 'lucide-react';



const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract } = useContract();
  const { connected } = useWallet();
  
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  // Fullscreen container ref and handler
  const modelContainerRef = useRef(null);
  const inlineModelContainerRef = useRef(null);
  const [isInlineFullscreen, setIsInlineFullscreen] = useState(false);
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modelContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleInlineFullscreen = () => {
    if (!document.fullscreenElement) {
      inlineModelContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInlineFullscreen(document.fullscreenElement === inlineModelContainerRef.current);
      setIsModalFullscreen(document.fullscreenElement === modelContainerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  // Self-healing multi-gateway state variables
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [videoHash, setVideoHash] = useState('');
  const [modelHash, setModelHash] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (disaster) {
      if (disaster.videoUrl) {
        const vHash = disaster.videoUrl.includes('/') 
          ? disaster.videoUrl.split('/').pop() 
          : disaster.videoUrl;
        setVideoHash(vHash);
      }
      if (disaster.modelUrl) {
        const mHash = disaster.modelUrl.includes('/') 
          ? disaster.modelUrl.split('/').pop() 
          : disaster.modelUrl;
        setModelHash(mHash);
      }
      setGatewayIndex(0); // Reset gateway to index 0 on data change
    }
  }, [disaster]);

  const videoGateways = videoHash ? [
    `https://gateway.pinata.cloud/ipfs/${videoHash}`,
    `https://ipfs.io/ipfs/${videoHash}`,
    `https://dweb.link/ipfs/${videoHash}`,
    `https://nftstorage.link/ipfs/${videoHash}`
  ] : [];

  const currentVideoUrl = videoGateways[gatewayIndex] || '';

  const handleVideoError = () => {
    console.warn(`Video load failed on gateway: ${videoGateways[gatewayIndex]}. Trying next fallback...`);
    if (gatewayIndex < videoGateways.length - 1) {
      setGatewayIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      videoRef.current.load();
    }
  }, [currentVideoUrl]);

  // Load Google <model-viewer> dynamically to support native 3D rendering in the browser
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  
  useEffect(() => {
    const fetchDisasterDetails = async () => {
      try {
        const disasterData = await contract.getDisaster(id);
        
        let videoUrl = '';
        let modelUrl = '';
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const dbRes = await fetch(`${apiBase}/api/disasters/${id}`);
          if (dbRes.ok) {
            const dbData = await dbRes.json();
            videoUrl = dbData.videoUrl || '';
            modelUrl = dbData.modelUrl || '';
          }
        } catch (dbErr) {
          console.warn("Could not fetch off-chain media:", dbErr);
        }

        setDisaster({
          disasterName: disasterData.disasterName,
          severity: disasterData.severity,
          disasterType: disasterData.disasterType,
          description: disasterData.description,
          affectedAreas: disasterData.affectedAreas,
          affectedPeopleCount: disasterData.affectedPeopleCount,
          targetCollectionAmount: disasterData.targetCollectionAmount,
          totalCollectedAmount: disasterData.totalCollectedAmount,
          reliefOrganizations: disasterData.reliefOrganizations,
          videoUrl,
          modelUrl
        });
        
        const orgPromises = disasterData.reliefOrganizations.map(async (orgAddress) => {
          const [name] = await contract.getOrganization(orgAddress);
          return { address: orgAddress, name };
        });
        
        const orgsWithNames = await Promise.all(orgPromises);
        setOrganizations(orgsWithNames);
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch disaster details:", error);
        setLoading(false);
      }
    };
    
    if (contract && id !== undefined) {
      fetchDisasterDetails();
    }
  }, [contract, id]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!disaster) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Disaster Not Found</h2>
        <p className="text-gray-600 mb-6">The disaster you're looking for doesn't exist or has been deleted.</p>
        <button 
          onClick={() => navigate('/disasters')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Disasters
        </button>
      </div>
    );
  }
  
  const progress = disaster.totalCollectedAmount > 0 
    ? (Number(disaster.totalCollectedAmount) / Number(disaster.targetCollectionAmount)) * 100
    : 0;
    
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <style>{`
        #fullscreen-viewer-container:fullscreen,
        #inline-model-container:fullscreen {
          width: 100% !important;
          height: 100% !important;
          background-color: #0f172a !important;
          border-radius: 0px !important;
          padding: 0 !important;
        }
        #fullscreen-viewer-container:fullscreen model-viewer,
        #inline-model-container:fullscreen model-viewer {
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{disaster.disasterName}</h1>
              <div className="flex items-center space-x-3">
                <StatusBadge 
                  label={disaster.severity} 
                  color={getSeverityColor(disaster.severity)} 
                />
                <span className="text-gray-500">{disaster.disasterType}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDonationModal(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Donate Now
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{disaster.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Affected Areas</h3>
                <p className="text-gray-700">{disaster.affectedAreas}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Affected People</h3>
                <p className="text-gray-700">{disaster.affectedPeopleCount.toLocaleString()}</p>
              </div>
            </div>

            {(disaster.videoUrl || disaster.modelUrl) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {disaster.videoUrl && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span>Drone Video Footage</span>
                      </h3>
                      <video 
                        ref={videoRef}
                        controls 
                        className="w-full rounded-lg shadow-inner bg-black aspect-video object-contain"
                        preload="metadata"
                        onError={handleVideoError}
                      >
                        <source 
                          src={currentVideoUrl} 
                          type="video/mp4" 
                        />
                        Your browser does not support the video tag.
                      </video>
                      {gatewayIndex > 0 && (
                        <p className="text-[10px] text-orange-500 mt-1 font-semibold">
                          Warning: Default gateway failed. Switched to fallback gateway #{gatewayIndex}
                        </p>
                      )}
                    </div>
                    <div className="mt-3">
                      <a 
                        href={videoHash ? `https://gateway.pinata.cloud/ipfs/${videoHash}` : disaster.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-center border border-blue-500 text-blue-600 text-xs font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        Open Video (Pinata Gateway)
                      </a>
                    </div>
                  </div>
                )}

                {disaster.modelUrl && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span>Interactive 3D Terrain Model</span>
                      </h3>
                      <div 
                        ref={inlineModelContainerRef}
                        id="inline-model-container"
                        className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden aspect-video relative group"
                      >
                        {/* eslint-disable-next-line react/no-unknown-property */}
                        <model-viewer
                          src={modelHash ? `https://gateway.pinata.cloud/ipfs/${modelHash}` : disaster.modelUrl}
                          camera-controls=""
                          auto-rotate=""
                          shadow-intensity="1"
                          style={{ width: '100%', height: '100%', display: 'block', minHeight: '180px' }}
                        ></model-viewer>
                        <button
                          onClick={toggleInlineFullscreen}
                          className={`absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all flex items-center justify-center shadow-md backdrop-blur-sm z-10 ${
                            isInlineFullscreen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                          title={isInlineFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                          {isInlineFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 font-mono line-clamp-1">
                        CID: {modelHash}
                      </p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <a 
                        href={modelHash ? `https://gateway.pinata.cloud/ipfs/${modelHash}` : disaster.modelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Download Model
                      </a>
                      <button 
                        onClick={() => setShowModelModal(true)}
                        className="flex-1 text-center border border-indigo-600 text-indigo-600 text-xs font-semibold py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        Open 3D Viewer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Donation Progress</h3>
              <ProgressBar 
                progress={progress} 
                text={`${formatEther(disaster.totalCollectedAmount)} of ${formatEther(disaster.targetCollectionAmount)} ETH (${progress.toFixed(1)}%)`} 
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Relief Organizations</h3>
              <div className="flex flex-wrap gap-2">
                {organizations.map((org) => (
                  <div key={org.address} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {org.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Top donors and leaderboard */}
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Donors</h2>
          <LeaderboardTable 
            donors={topDonors.addresses} 
            amounts={topDonors.amounts} 
            contract={contract}
          />
        </div> */}
        
        {/* Recent donations */}
        {/* <div>
          <h2 className="text-2xl font-bold mb-4">Recent Donations</h2>
          <RecentDonations disasterId={id} />
        </div> */}
      </div>
      
      {/* Donation Modal */}
      <Modal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        title="Make a Donation"
      >
        {!connected ? (
          <div className="py-4 text-center">
            <p className="mb-4 text-gray-700">Please connect your wallet to make a donation.</p>
            <button 
              onClick={() => {/* Connect wallet logic */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <DonationForm 
            disasterId={id} 
            organizations={organizations}
            onSuccess={() => setShowDonationModal(false)}
          />
        )}
      </Modal>

      {/* Fullscreen 3D Model Modal */}
      <Modal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        title="3D Terrain Inspector"
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col space-y-3">
          <div 
            ref={modelContainerRef}
            id="fullscreen-viewer-container"
            className="w-full h-[600px] bg-slate-100 rounded-lg overflow-hidden relative group"
          >
            {/* eslint-disable-next-line react/no-unknown-property */}
            <model-viewer
              src={modelHash ? `https://gateway.pinata.cloud/ipfs/${modelHash}` : disaster.modelUrl}
              camera-controls=""
              auto-rotate=""
              shadow-intensity="1"
              style={{ width: '100%', height: '100%', display: 'block' }}
            ></model-viewer>
            <button
              onClick={toggleFullscreen}
              className={`absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all flex items-center justify-center shadow-md backdrop-blur-sm z-10 ${
                isModalFullscreen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
              }`}
              title={isModalFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isModalFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DisasterDetail;