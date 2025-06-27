import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, MessageCircle, Gift } from 'lucide-react';
import { createGiveaway } from '../utils/database';

const CreateGiveaway: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    channelUrl: '',
    endDate: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (endDateTime <= new Date()) {
        alert('End date and time must be in the future');
        setIsSubmitting(false);
        return;
      }

      const giveaway = await createGiveaway(
        formData.title,
        formData.hostName,
        formData.channelUrl,
        endDateTime
      );

      // Redirect to the giveaway page
      navigate(`/g/${giveaway.id}`);
    } catch (error) {
      console.error('Error creating giveaway:', error);
      alert('Failed to create giveaway. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Giveaway
          </h1>
          <p className="text-gray-600">
            Set up your giveaway and start growing your community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Giveaway Title
            </label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter giveaway title..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="hostName" className="block text-sm font-medium text-gray-700 mb-2">
              Host Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="hostName"
                name="hostName"
                value={formData.hostName}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Your name or brand..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Channel URL (Telegram/WhatsApp)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                id="channelUrl"
                name="channelUrl"
                value={formData.channelUrl}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://t.me/yourchannel or https://whatsapp.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Giveaway...
              </div>
            ) : (
              'Create Giveaway'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-purple-50 rounded-xl">
          <h3 className="font-semibold text-purple-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Choose an engaging title that clearly describes your giveaway</li>
            <li>• Make sure your channel URL is accessible to everyone</li>
            <li>• Set a reasonable end date to build excitement</li>
            <li>• Promote your giveaway across multiple platforms for better reach</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateGiveaway;