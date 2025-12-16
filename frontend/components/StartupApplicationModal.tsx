import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, FileText, Globe, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStartups } from '../hooks/useFirestore';

interface StartupRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salary?: string;
  equity?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  location: 'remote' | 'hybrid' | 'onsite';
}

interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  funding: string;
  equity: string;
  requirements: string[];
  roles: StartupRole[];
}

interface StartupApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup: Startup | null;
  selectedRole?: StartupRole | null;
  onSuccess: () => void;
}

const StartupApplicationModal: React.FC<StartupApplicationModalProps> = ({
  isOpen,
  onClose,
  startup,
  selectedRole,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { applyToStartup } = useStartups();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(selectedRole?.id || '');
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: '',
    linkedin: '',
    github: '',
    experience: '',
    whyInterested: '',
    availability: 'full-time'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser || !startup || !selectedRoleId) return;

    try {
      setIsSubmitting(true);

      await applyToStartup(startup.id, selectedRoleId, currentUser.uid, {
        coverLetter: formData.coverLetter,
        portfolio: formData.portfolio,
        linkedin: formData.linkedin,
        github: formData.github,
        experience: formData.experience,
        whyInterested: formData.whyInterested,
        availability: formData.availability
      });

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        coverLetter: '',
        portfolio: '',
        linkedin: '',
        github: '',
        experience: '',
        whyInterested: '',
        availability: 'full-time'
      });
      setSelectedRoleId('');
    } catch (error) {
      console.error('Error applying to startup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!startup) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex flex-col bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-none px-8 py-6 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Apply to {startup.name}</h2>
                  <p className="text-slate-500 font-medium mt-1">Join this exciting startup team</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              {/* Startup Info */}
              <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{startup.name}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{startup.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    {startup.industry}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                    {startup.stage}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                    {startup.equity} equity
                  </span>
                </div>
              </div>

              {/* Role Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Role *
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none"
                >
                  <option value="">Choose a role...</option>
                  {startup.roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title} - {role.type} ({role.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Role Details */}
              {selectedRoleId && (
                <div className="bg-blue-50/50 rounded-xl p-6 mb-8 border border-blue-100">
                  {(() => {
                    const role = startup.roles?.find(r => r.id === selectedRoleId);
                    if (!role) return null;

                    return (
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">{role.title}</h4>
                        <p className="text-slate-600 mb-4">{role.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                            {role.type}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                            {role.location}
                          </span>
                          {role.salary && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                              {role.salary}
                            </span>
                          )}
                          {role.equity && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                              {role.equity} equity
                            </span>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-700 mb-2">Requirements:</h5>
                          <ul className="space-y-2">
                            {role.requirements?.map((req, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="text-green-500 mt-1.5">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Application Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    value={formData.coverLetter}
                    onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none placeholder:text-slate-400"
                    placeholder="Tell us why you're interested in joining this startup and what you can bring to the team..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Portfolio/Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none placeholder:text-slate-400"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none placeholder:text-slate-400"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="url"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none placeholder:text-slate-400"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Relevant Experience *
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none placeholder:text-slate-400"
                    placeholder="Describe your relevant experience, skills, and achievements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Why are you interested in this startup? *
                  </label>
                  <textarea
                    value={formData.whyInterested}
                    onChange={(e) => handleInputChange('whyInterested', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none placeholder:text-slate-400"
                    placeholder="What excites you about this startup and its mission?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 font-medium outline-none"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="consulting">Consulting</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-none px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 rounded-b-2xl">
              <motion.button
                onClick={onClose}
                className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedRoleId || !formData.coverLetter || !formData.experience || !formData.whyInterested}
                className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 flex items-center gap-2 ${isSubmitting || !selectedRoleId || !formData.coverLetter || !formData.experience || !formData.whyInterested
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  }`}
                whileHover={{ scale: isSubmitting || !selectedRoleId || !formData.coverLetter || !formData.experience || !formData.whyInterested ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || !selectedRoleId || !formData.coverLetter || !formData.experience || !formData.whyInterested ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartupApplicationModal;