import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { getAllGiveaways } from '../utils/database';
import { Giveaway } from '../types';

const GiveawayList: React.FC = () => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiveaways = async () => {
      try {
        const allGiveaways = await getAllGiveaways();
        setGiveaways(allGiveaways.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error('Error fetching giveaways:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiveaways();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isGiveawayActive = (endDate: Date) => {
    return new Date(endDate) > new Date();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading giveaways...</p>
        </div>
      </div>
    );
  }

  if (giveaways.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Giveaways Yet</h2>
          <p className="text-gray-600 mb-8">Be the first to create an amazing giveaway!</p>
          <Link
            to="/create"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Create First Giveaway
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Active Giveaways
        </h1>
        <p className="text-xl text-gray-600">
          Join amazing giveaways and win fantastic prizes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {giveaways.map((giveaway) => {
          const isActive = isGiveawayActive(giveaway.endDate);
          
          return (
            <div
              key={giveaway.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className={`p-6 ${isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <Trophy size={24} />
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/20' : 'bg-white/30'
                  }`}>
                    {isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  {giveaway.title}
                </h3>
                <p className="text-sm opacity-90">
                  by {giveaway.hostName}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">
                      Ends: {formatDate(giveaway.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">
                      {giveaway.participants.length} participants
                    </span>
                  </div>
                  {!isActive && giveaway.winner && (
                    <div className="flex items-center text-green-600">
                      <Trophy size={16} className="mr-2" />
                      <span className="text-sm font-semibold">
                        Winner: {giveaway.winner.name}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/g/${giveaway.id}`}
                  className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {isActive ? 'Join Giveaway' : 'View Results'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/create"
          className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
        >
          Create Your Own Giveaway
        </Link>
      </div>
    </div>
  );
};

export default GiveawayList;