import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { hasJoinedChannel, markChannelJoined } from '../utils/database';

interface ChannelJoinPopupProps {
  onClose?: () => void;
}

const ChannelJoinPopup: React.FC<ChannelJoinPopupProps> = ({ onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const checkChannelStatus = async () => {
      try {
        const hasJoined = await hasJoinedChannel();
        
        if (!hasJoined) {
          const timer = setTimeout(() => {
            setShowPopup(true);
          }, 2000);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error checking channel status:', error);
      }
    };

    checkChannelStatus();
  }, []);

  const handleJoinChannel = async () => {
    setIsJoining(true);
    
    // Open WhatsApp channel in new tab
    window.open('https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O', '_blank');
    
    // Simulate join verification (in real app, this would be verified)
    setTimeout(async () => {
      try {
        await markChannelJoined();
        setIsJoining(false);
        setShowPopup(false);
        if (onClose) onClose();
      } catch (error) {
        console.error('Error marking channel joined:', error);
        setIsJoining(false);
      }
    }, 3000);
  };

  const handleSkip = () => {
    setShowPopup(false);
    if (onClose) onClose();
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="relative p-6">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-white" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Our Official Channel
            </h2>
            
            <p className="text-gray-600 mb-6">
              Stay updated with the latest giveaways and announcements from{' '}
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Luminora by HANS TECH
              </span>
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleJoinChannel}
                disabled={isJoining}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  'Join WhatsApp Channel'
                )}
              </button>
              
              <button
                onClick={handleSkip}
                className="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelJoinPopup;