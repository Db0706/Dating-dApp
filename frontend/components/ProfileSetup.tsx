'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { createUserProfile } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaHeart, FaRocket } from 'react-icons/fa';

export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const { address, setUserProfile } = useWalletStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    gender: '',
    lookingFor: '',
    bio: '',
    photoUrl: '',
    interests: [] as string[],
  });

  const [customInterest, setCustomInterest] = useState('');

  const interestOptions = [
    '🎮 Gaming',
    '💻 Coding',
    '🚀 Crypto',
    '🏃 Fitness',
    '🎨 Art',
    '🎵 Music',
    '📚 Reading',
    '✈️ Travel',
    '🍕 Food',
    '🎬 Movies',
    '📸 Photography',
    '🏔️ Hiking',
  ];

  function handleInterestToggle(interest: string) {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter((i) => i !== interest),
      });
    } else if (formData.interests.length < 5) {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    } else {
      toast.error('Maximum 5 interests');
    }
  }

  function addCustomInterest() {
    if (customInterest.trim() && formData.interests.length < 5) {
      setFormData({
        ...formData,
        interests: [...formData.interests, customInterest.trim()],
      });
      setCustomInterest('');
    }
  }

  async function handleSubmit() {
    if (!address) return;

    setLoading(true);

    try {
      const profile = {
        wallet: address.toLowerCase(),
        displayName: formData.displayName,
        age: parseInt(formData.age),
        bio: formData.bio,
        gender: formData.gender,
        lookingFor: formData.lookingFor,
        photos: formData.photoUrl ? [formData.photoUrl] : [],
        interests: formData.interests,
        lastSeen: Date.now(),
        boostedUntil: 0,
        createdAt: Date.now(),
      };

      await createUserProfile(profile);
      setUserProfile(profile);
      toast.success('Profile created! 🎉');
      onComplete();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (step === 1 && (!formData.displayName || !formData.age)) {
      toast.error('Please fill in all fields');
      return;
    }
    if (step === 2 && (!formData.gender || !formData.lookingFor)) {
      toast.error('Please select your preferences');
      return;
    }
    if (step === 3 && !formData.bio) {
      toast.error('Please write a short bio');
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-accent z-50 overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <FaHeart className="text-6xl text-white mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-white/80">Let's set up your profile</p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Info</h2>
                    <p className="text-gray-500">Tell us about yourself</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-800 transition"
                      placeholder="Your name"
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-800 transition"
                      placeholder="18"
                      min="18"
                      max="100"
                    />
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Continue <FaArrowRight />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Preferences</h2>
                    <p className="text-gray-500">Who are you looking for?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      I am a
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((gender) => (
                        <button
                          key={gender}
                          onClick={() => setFormData({ ...formData, gender })}
                          className={`py-3 px-4 rounded-xl font-semibold transition ${
                            formData.gender === gender
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Looking for
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((looking) => (
                        <button
                          key={looking}
                          onClick={() => setFormData({ ...formData, lookingFor: looking })}
                          className={`py-3 px-4 rounded-xl font-semibold transition ${
                            formData.lookingFor === looking
                              ? 'bg-secondary text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {looking.charAt(0).toUpperCase() + looking.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Continue <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">About You</h2>
                    <p className="text-gray-500">Write a catchy bio</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio ({formData.bio.length}/150)
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 150) })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-800 transition resize-none"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Photo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-800 transition"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use a placeholder or upload to Imgur
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Continue <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Interests</h2>
                    <p className="text-gray-500">Pick up to 5 interests</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                          formData.interests.includes(interest)
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                      className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-800 transition"
                      placeholder="Add custom interest"
                      maxLength={20}
                    />
                    <button
                      onClick={addCustomInterest}
                      className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? 'Creating...' : (
                        <>
                          <FaRocket /> Let's Go!
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
