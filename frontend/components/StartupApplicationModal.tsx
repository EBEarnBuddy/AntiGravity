import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, FileText, Globe, Mail, AlertCircle, CheckCircle } from 'lucide-react';
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

  // Update selected role if prop changes
  React.useEffect(() => {
    if (selectedRole) {
      setSelectedRoleId(selectedRole.id);
    }
  }, [selectedRole]);

  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: '',
    linkedin: '',
    github: '',
    experience: '',
    whyInterested: '',
    availability: 'full-time'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!selectedRoleId) { newErrors.role = 'Please select a role'; isValid = false; }
    if (!formData.coverLetter.trim()) { newErrors.coverLetter = 'Cover letter is required'; isValid = false; }
    if (!formData.experience.trim()) { newErrors.experience = 'Experience details are required'; isValid = false; }
    if (!formData.whyInterested.trim()) { newErrors.whyInterested = 'Please explain your interest'; isValid = false; }

    const isValidUrl = (url: string) => {
      if (!url) return true;
      try { new URL(url); return true; } catch { return false; }
    };

    if (formData.portfolio && !isValidUrl(formData.portfolio)) { newErrors.portfolio = 'Invalid URL'; isValid = false; }
    if (formData.linkedin && !isValidUrl(formData.linkedin)) { newErrors.linkedin = 'Invalid URL'; isValid = false; }
    if (formData.github && !isValidUrl(formData.github)) { newErrors.github = 'Invalid URL'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !startup) return;
    if (!validate()) return;

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
        coverLetter: '', portfolio: '', linkedin: '', github: '', experience: '', whyInterested: '', availability: 'full-time'
      });
      setSelectedRoleId('');
    } catch (error) {
      console.error('Error applying to startup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!startup) return null;

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border-2 rounded-none transition-all outline-none font-bold placeholder:text-slate-400 text-slate-900 ${hasError
      ? 'border-red-500 bg-red-50 focus:border-red-600'
      : 'border-slate-900 bg-white focus:bg-green-50 focus:border-green-600 focus:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]'
    }`;

  const labelClass = "block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide";
  const errorClass = "text-xs font-bold text-red-500 mt-1 flex items-center gap-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex flex-col bg-white border-4 border-slate-900 w-full max-w-2xl max-h-[90vh] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-none px-8 py-6 border-b-4 border-slate-900 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Apply to {startup.name}</h2>
                <p className="text-slate-500 font-bold mt-1 text-sm">Make your move.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 border-2 border-transparent hover:border-slate-900 hover:bg-red-100 hover:text-red-600 transition-all rounded-none"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-slate-50">
              {/* Role Selection */}
              <div className="mb-8 p-6 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)]">
                <label className={labelClass}>Select Role *</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className={inputClass(!!errors.role)}
                >
                  <option value="">-- Choose a Role --</option>
                  {startup.roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title} ({role.type})
                    </option>
                  ))}
                </select>
                {errors.role && <p className={errorClass}><AlertCircle className="w-3 h-3" /> {errors.role}</p>}

                {/* Role Details Preview */}
                {selectedRoleId && (
                  <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    {(() => {
                      const role = startup.roles?.find(r => r.id === selectedRoleId);
                      if (!role) return null;
                      return (
                        <div className="text-sm">
                          <p className="font-bold text-slate-900 mb-1">{role.location} • {role.salary || 'No Salary Info'}</p>
                          <p className="text-slate-600">{role.description.substring(0, 100)}...</p>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Why You? (Cover Letter) *</label>
                  <textarea
                    value={formData.coverLetter}
                    onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                    rows={4}
                    className={inputClass(!!errors.coverLetter)}
                    placeholder="Don't be boring."
                  />
                  {errors.coverLetter && <p className={errorClass}><AlertCircle className="w-3 h-3" /> {errors.coverLetter}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>LinkedIn URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className={`${inputClass(!!errors.linkedin)} pl-10`}
                        placeholder="https://linkedin.com/..."
                      />
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.linkedin && <p className={errorClass}><AlertCircle className="w-3 h-3" /> {errors.linkedin}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Portfolio URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) => handleInputChange('portfolio', e.target.value)}
                        className={`${inputClass(!!errors.portfolio)} pl-10`}
                        placeholder="https://mywork.com"
                      />
                      <Globe className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.portfolio && <p className={errorClass}><AlertCircle className="w-3 h-3" /> {errors.portfolio}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Relevant Experience *</label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={3}
                    className={inputClass(!!errors.experience)}
                    placeholder="What have you built?"
                  />
                  {errors.experience && <p className={errorClass}><AlertCircle className="w-3 h-3" /> {errors.experience}</p>}
                </div>

                <div>
                  <label className={labelClass}>Why Us? *</label>
                  <textarea
                    value={formData.whyInterested}
                    onChange={(e) => handleInputChange('whyInterested', e.target.value)}
                    rows={2}
                    className={inputClass(!!errors.whyInterested)}
                    placeholder="Flattery helps, but specifics are better."
                  />
                  {errors.whyInterested && <p className={errorClass}><AlertCircle className="w-3 h-3" /> {errors.whyInterested}</p>}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-none px-8 py-6 border-t-4 border-slate-900 bg-slate-50 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 font-bold uppercase text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white font-black uppercase tracking-widest border-2 border-green-700 hover:bg-green-500 hover:shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-[2px_2px_0px_0px_rgba(21,128,61,1)]"
              >
                {isSubmitting ? 'Sending...' : <><Send className="w-4 h-4" /> Submit Application</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartupApplicationModal;