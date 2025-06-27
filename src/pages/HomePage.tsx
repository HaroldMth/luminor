import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Users, Trophy, Zap, Shield, Globe } from 'lucide-react';
import { getAllGiveaways } from '../utils/database';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({
    activeGiveaways: 0,
    totalParticipants: 0,
    totalReferrals: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const giveaways = await getAllGiveaways();
        const activeGiveaways = giveaways.filter(g => g.isActive).length;
        const totalParticipants = giveaways.reduce((sum, g) => sum + g.participants.length, 0);
        const totalReferrals = giveaways.reduce((sum, g) => 
          sum + g.participants.reduce((pSum, p) => pSum + p.referrals, 0), 0
        );

        setStats({
          activeGiveaways,
          totalParticipants,
          totalReferrals
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: Gift,
      title: 'Easy Giveaway Creation',
      description: 'Create stunning giveaways in minutes with our intuitive interface.'
    },
    {
      icon: Users,
      title: 'Referral System',
      description: 'Grow your audience with our powerful referral tracking system.'
    },
    {
      icon: Shield,
      title: 'Bot Protection',
      description: 'Advanced security measures to prevent fraud and ensure fairness.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Share your giveaways worldwide with unique referral links.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-20">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <Gift className="text-white" size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Luminora
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">by HANS TECH</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            The ultimate platform for creating viral giveaways with powerful referral tracking. 
            Grow your community and reward your most engaged followers.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Create Giveaway
          </Link>
          <Link
            to="/giveaways"
            className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 transform hover:scale-105"
          >
            View Giveaways
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.activeGiveaways}</div>
            <div className="text-gray-600">Active Giveaways</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-pink-600 mb-2">{stats.totalParticipants}</div>
            <div className="text-gray-600">Participants</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.totalReferrals}</div>
            <div className="text-gray-600">Referrals Made</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Luminora?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make your giveaways successful and engaging
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in just 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create</h3>
            <p className="text-gray-600">Set up your giveaway with prizes, rules, and end date</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Share</h3>
            <p className="text-gray-600">Participants get unique referral links to share with friends</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Win</h3>
            <p className="text-gray-600">Track referrals and automatically select winners</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Giveaway?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who trust Luminora for their giveaways
          </p>
          <Link
            to="/create"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Create Your First Giveaway
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;