import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Share2, Calendar, ExternalLink, Download, Crown, Copy, Check } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import { getGiveaway, joinGiveaway, trackReferralClick, getLeaderboard, endGiveaway } from '../utils/database';
import { Giveaway, User } from '../types';
import QRCode from 'qrcode';

const GiveawayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referrerId = searchParams.get('ref');
  
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', avatar: '' });
  const [referralLink, setReferralLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasTrackedReferral, setHasTrackedReferral] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchGiveawayData = async () => {
      try {
        const giveawayData = await getGiveaway(id);
        if (!giveawayData) {
          navigate('/');
          return;
        }

        setGiveaway(giveawayData);
        const leaderboardData = await getLeaderboard(id);
        setLeaderboard(leaderboardData);

        // If this is a referral click and giveaway is active, track it
        if (referrerId && giveawayData.isActive && !hasTrackedReferral) {
          try {
            const tracked = await trackReferralClick(id, referrerId);
            if (tracked) {
              setHasTrackedReferral(true);
              // Redirect to channel after a short delay
              setTimeout(() => {
                window.open(giveawayData.channelUrl, '_blank');
              }, 2000);
            }
          } catch (error) {
            console.error('Error tracking referral:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching giveaway data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchGiveawayData();
  }, [id, referrerId, navigate, hasTrackedReferral]);

  const handleJoinGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !giveaway || !formData.name.trim()) return;

    setIsJoining(true);
    try {
      const user = await joinGiveaway(id, formData.name.trim(), formData.avatar);
      setCurrentUser(user);
      
      // Generate referral link
      const baseUrl = window.location.origin;
      const referralUrl = `${baseUrl}/g/${id}?ref=${user.id}`;
      setReferralLink(referralUrl);
      
      // Generate QR code
      const qrUrl = await QRCode.toDataURL(referralUrl);
      setQrCodeUrl(qrUrl);
      
      setShowJoinForm(false);
      
      // Refresh data
      const updatedGiveaway = await getGiveaway(id);
      if (updatedGiveaway) {
        setGiveaway(updatedGiveaway);
        const updatedLeaderboard = await getLeaderboard(id);
        setLeaderboard(updatedLeaderboard);
      }
    } catch (error) {
      console.error('Error joining giveaway:', error);
      alert(error instanceof Error ? error.message : 'Failed to join giveaway. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `giveaway-${id}-qr.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleGiveawayEnd = async () => {
    if (id && giveaway?.isActive) {
      try {
        await endGiveaway(id);
        const updatedGiveaway = await getGiveaway(id);
        if (updatedGiveaway) {
          setGiveaway(updatedGiveaway);
        }
      } catch (error) {
        console.error('Error ending giveaway:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading giveaway...</p>
        </div>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giveaway Not Found</h2>
          <p className="text-gray-600 mb-8">The giveaway you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isActive = giveaway.isActive && new Date(giveaway.endDate) > new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Referral Notification */}
      {referrerId && hasTrackedReferral && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <Check className="text-white" size={20} />
            </div>
            <div>
              <p className="font-semibold text-green-800">Referral Tracked!</p>
              <p className="text-green-600 text-sm">You'll be redirected to the channel shortly.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Giveaway Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className={`p-8 ${isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
              <div className="flex items-start justify-between mb-4">
                <Trophy size={32} />
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  isActive ? 'bg-white/20' : 'bg-white/30'
                }`}>
                  {isActive ? 'Active' : 'Ended'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{giveaway.title}</h1>
              <p className="text-lg opacity-90 mb-4">Hosted by {giveaway.hostName}</p>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Users size={20} className="mr-2" />
                  <span>{giveaway.participants.length} participants</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2" />
                  <span>Ends {new Date(giveaway.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {isActive ? (
                <CountdownTimer endDate={giveaway.endDate} onExpire={handleGiveawayEnd} />
              ) : giveaway.winner ? (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl text-center">
                  <Crown className="mx-auto mb-3" size={32} />
                  <h3 className="text-xl font-bold mb-2">🎉 Winner Announced!</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <img
                      src={giveaway.winner.avatar}
                      alt={giveaway.winner.name}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <span className="text-lg font-semibold">{giveaway.winner.name}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 p-6 rounded-xl text-center">
                  <p className="text-gray-600">This giveaway has ended. Winner will be announced soon!</p>
                </div>
              )}

              {/* Join/Referral Section */}
              {isActive && (
                <div className="mt-8">
                  {!currentUser ? (
                    <div className="text-center">
                      <button
                        onClick={() => setShowJoinForm(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                      >
                        Join Giveaway
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-purple-50 p-6 rounded-xl">
                        <h3 className="font-semibold text-purple-900 mb-4">🎯 Your Referral Link</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={referralLink}
                              readOnly
                              className="flex-1 px-4 py-2 border border-purple-200 rounded-lg bg-white text-sm"
                            />
                            <button
                              onClick={handleCopyLink}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                copied
                                  ? 'bg-green-500 text-white'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                          
                          {qrCodeUrl && (
                            <div className="text-center">
                              <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto mb-2" />
                              <button
                                onClick={handleDownloadQR}
                                className="flex items-center space-x-2 mx-auto text-purple-600 hover:text-purple-700 text-sm"
                              >
                                <Download size={16} />
                                <span>Download QR Code</span>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 text-center">
                          <p className="text-purple-700 font-semibold">
                            Your Referrals: {currentUser.referrals}
                          </p>
                          <p className="text-purple-600 text-sm mt-1">
                            Share your link to get more referrals and increase your chances!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Channel Link */}
              <div className="mt-8 text-center">
                <a
                  href={giveaway.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  <ExternalLink size={20} />
                  <span>Visit Channel</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Leaderboard */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="mr-2 text-yellow-500" size={24} />
              Top Referrers
            </h3>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-yellow-100' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.referrals} referrals</p>
                    </div>
                    {index === 0 && <Crown className="text-yellow-500" size={20} />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No participants yet</p>
            )}
          </div>

          {/* Recent Participants */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2 text-blue-500" size={24} />
              Recent Participants
            </h3>
            
            {giveaway.participants.length > 0 ? (
              <div className="space-y-3">
                {giveaway.participants.slice(-5).reverse().map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No participants yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Join Form Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Join Giveaway
              </h2>
              
              <form onSubmit={handleJoinGiveaway} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your name..."
                  />
                </div>

                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for a random avatar
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isJoining || !formData.name.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoining ? 'Joining...' : 'Join Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiveawayPage;