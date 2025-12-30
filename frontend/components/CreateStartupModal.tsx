import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash,
  Building2,
  DollarSign,
  MapPin,
  Users,
  Rocket,
  Zap,
  Heart,
  Globe,
  Star,
  Trophy,
  Briefcase,
  Code,
  Paintbrush,
  Megaphone,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStartups } from '../hooks/useFirestore';

interface CreateStartupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const CreateStartupModal: React.FC<CreateStartupModalProps> = ({ isOpen, onClose, onSuccess, initialData, isEditing = false }) => {
  const { currentUser } = useAuth();
  const { createStartup, updateStartup } = useStartups(); // You'll need to add updateStartup to your hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    slug: '', // Custom URL
    industry: '',
    stage: 'pre-seed',
    location: '',
    funding: '',
    equity: '',
    requirements: [] as string[],
    roles: [] as any[],
    contact: {
      email: '',
      website: '',
      linkedin: ''
    },
    additionalInfo: ''
  });

  // Populate form on open/edit
  React.useEffect(() => {
    if (isOpen && isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        logo: initialData.logo || initialData.image || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        industry: initialData.industry || '',
        stage: initialData.stage || 'pre-seed',
        location: initialData.location || '',
        funding: initialData.funding || '',
        equity: initialData.equity || '',
        requirements: initialData.requirements || [],
        roles: initialData.roles || [],
        contact: {
          email: initialData.contact?.email || '',
          website: initialData.contact?.website || '',
          linkedin: initialData.contact?.linkedin || ''
        },
        additionalInfo: initialData.additionalInfo || ''
      });
    } else if (isOpen && !isEditing) {
      // Reset if opening in create mode
      setFormData({
        name: '',
        logo: '',
        slug: '',
        description: '',
        industry: '',
        stage: 'pre-seed',
        location: '',
        funding: '',
        equity: '',
        requirements: [],
        roles: [],
        contact: {
          email: '',
          website: '',
          linkedin: ''
        },
        additionalInfo: ''
      });
    }
  }, [isOpen, isEditing, initialData]);

  // ... (State hooks for newRequirement, newRole, newRoleRequirement remain same)
  const [newRequirement, setNewRequirement] = useState('');
  const [newRole, setNewRole] = useState({
    title: '',
    description: '',
    requirements: [] as string[],
    salary: '',
    equity: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    location: 'remote' as 'remote' | 'hybrid' | 'onsite'
  });
  const [newRoleRequirement, setNewRoleRequirement] = useState('');

  // ... (Constants industries, stages remain same)
  const industries = [
    { id: 'healthcare', name: 'Healthcare', icon: Heart },
    { id: 'fintech', name: 'FinTech', icon: DollarSign },
    { id: 'education', name: 'EdTech', icon: Users },
    { id: 'climate', name: 'Climate Tech', icon: Zap },
    { id: 'ai', name: 'AI/ML', icon: Code },
    { id: 'design', name: 'Design', icon: Paintbrush },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'other', name: 'Other', icon: Building2 }
  ];

  const stages = [
    { id: 'pre-seed', name: 'Pre-Seed' },
    { id: 'seed', name: 'Seed' },
    { id: 'series-a', name: 'Series A' },
    { id: 'series-b', name: 'Series B+' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ... (Helper functions handleNestedChange through validateStep remain same)
  const handleNestedChange = (parent: string, field: string, value: any) => {
    if (parent === 'contact') {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const addRoleRequirement = () => {
    if (newRoleRequirement.trim() && !newRole.requirements.includes(newRoleRequirement.trim())) {
      setNewRole(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRoleRequirement.trim()]
      }));
      setNewRoleRequirement('');
    }
  };

  const removeRoleRequirement = (requirementToRemove: string) => {
    setNewRole(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const addRole = () => {
    if (newRole.title && newRole.description && newRole.requirements.length > 0) {
      const roleData = {
        title: newRole.title,
        description: newRole.description,
        requirements: newRole.requirements,
        salary: newRole.salary,
        equity: newRole.equity,
        type: newRole.type,
        location: newRole.location,
        id: Date.now().toString(), // Simple ID generation
        applicants: []
      };

      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, roleData]
      }));

      // Reset new role form
      setNewRole({
        title: '',
        description: '',
        requirements: [],
        salary: '',
        equity: '',
        type: 'full-time',
        location: 'remote'
      });
    }
  };

  const removeRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== roleId)
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.description && formData.industry);
      case 2:
        return !!(formData.location && formData.funding && formData.equity);
      case 3:
        return formData.roles.length > 0 && !!formData.contact.email;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      setIsSubmitting(true);

      const startupData = {
        name: formData.name,
        slug: formData.slug || undefined, // Send undefined if empty to avoid unique index conflict with empty string? Or backend checks sparse? Sparse handles null/undefined usually. Empty string is a unique value. I should send undefined if empty.
        description: formData.description,
        industry: formData.industry,
        stage: formData.stage,
        location: formData.location,
        funding: formData.funding,
        equity: formData.equity,
        requirements: formData.requirements,
        roles: formData.roles,
        contact: formData.contact,
        additionalInfo: formData.additionalInfo,
        founderId: currentUser.uid,
        founderName: currentUser.displayName || 'Anonymous',
        founderAvatar: currentUser.photoURL || '',
        totalApplicants: initialData?.totalApplicants || 0,
        logo: formData.logo,
        image: formData.logo // Redundant but safe for systems expecting image field
      };

      // console.log('Submitting Startup Data:', startupData);

      if (isEditing && initialData && (initialData.id || initialData._id)) {
        await updateStartup(initialData.id || initialData._id, startupData);
      } else {
        await createStartup(startupData);
      }

      onSuccess();
      onClose();

      // Reset form handled by useEffect on next reopen
      setCurrentStep(1);
    } catch (error) {
      console.error('Error saving startup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

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
            className="flex flex-col bg-white border-4 border-slate-900 w-full max-w-2xl max-h-[85vh] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-none px-4 md:px-8 py-4 md:py-6 border-b-4 border-slate-900 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{isEditing ? 'Edit Opportunity' : 'List Your Startup'}</h2>
                  <p className="text-slate-500 font-bold">Step {currentStep} of 3</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 border-2 border-transparent hover:border-slate-900 transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-4 border-2 border-slate-900">
                <motion.div
                  className="bg-green-500 h-full border-r-2 border-slate-900"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wide">Basic Information</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-slate-900 uppercase mb-2">
                        Startup Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="Enter your startup name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-900 uppercase mb-2">
                        Logo / Image
                      </label>
                      <div className="flex items-center gap-4">
                        {formData.logo && (
                          <img src={formData.logo} alt="Logo Preview" className="w-16 h-16 object-cover border-2 border-slate-900 bg-slate-100" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 uppercase mb-2">
                        Custom Link ID (Optional)
                      </label>
                      <div className="flex items-center">
                        <span className="bg-slate-100 border-2 border-r-0 border-slate-900 px-3 py-3 text-slate-500 font-mono text-sm">/startups/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                          className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                          placeholder="my-startup"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-900 uppercase mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 resize-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="Describe your startup, mission, and what you're building..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-900 uppercase mb-2">
                        Industry *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {industries.map((industry) => {
                          const Icon = industry.icon;
                          return (
                            <motion.button
                              key={industry.id}
                              type="button"
                              onClick={() => handleInputChange('industry', industry.name)}
                              className={`p-4 border-2 transition-all duration-200 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] ${formData.industry === industry.name
                                ? 'border-slate-900 bg-green-200'
                                : 'border-slate-900 hover:bg-slate-50 bg-white'
                                }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className={`w-6 h-6 ${formData.industry === industry.name ? 'text-slate-900' : 'text-slate-500'}`} />
                              <span className={`text-sm font-bold ${formData.industry === industry.name ? 'text-slate-900' : 'text-slate-700'}`}>
                                {industry.name}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-900 uppercase mb-2">
                        Stage
                      </label>
                      <select
                        value={formData.stage}
                        onChange={(e) => handleInputChange('stage', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold appearance-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                      >
                        {stages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Funding & Location */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Funding & Location</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Funding Status *
                      </label>
                      <input
                        type="text"
                        value={formData.funding}
                        onChange={(e) => handleInputChange('funding', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="e.g., $500K raised, Seeking $250K, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Equity Offered *
                      </label>
                      <input
                        type="text"
                        value={formData.equity}
                        onChange={(e) => handleInputChange('equity', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="e.g., 2-5%, 5-10%, etc."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Roles & Contact */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Open Positions & Contact</h3>

                  <div className="space-y-6">
                    {/* Add New Role */}
                    <div className="bg-slate-50 border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Add New Position</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Position Title *
                          </label>
                          <input
                            type="text"
                            value={newRole.title}
                            onChange={(e) => setNewRole(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                            placeholder="e.g., Senior Frontend Developer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Position Type
                          </label>
                          <select
                            value={newRole.type}
                            onChange={(e) => setNewRole(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                          >
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Location Type
                          </label>
                          <select
                            value={newRole.location}
                            onChange={(e) => setNewRole(prev => ({ ...prev, location: e.target.value as any }))}
                            className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                          >
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">On-site</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Salary (optional)
                          </label>
                          <input
                            type="text"
                            value={newRole.salary}
                            onChange={(e) => setNewRole(prev => ({ ...prev, salary: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                            placeholder="e.g., $80K-120K"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Position Description *
                        </label>
                        <textarea
                          value={newRole.description}
                          onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold resize-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                          placeholder="Describe the role responsibilities..."
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Requirements *
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newRoleRequirement}
                            onChange={(e) => setNewRoleRequirement(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addRoleRequirement()}
                            className="flex-1 px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                            placeholder="Add a requirement"
                          />
                          <motion.button
                            type="button"
                            onClick={addRoleRequirement}
                            className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="w-5 h-5" />
                          </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newRole.requirements.map((req, index) => (
                            <motion.span
                              key={index}
                              className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium flex items-center gap-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              {req}
                              <button
                                onClick={() => removeRoleRequirement(req)}
                                className="hover:text-green-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Equity (optional)
                        </label>
                        <input
                          type="text"
                          value={newRole.equity}
                          onChange={(e) => setNewRole(prev => ({ ...prev, equity: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                          placeholder="e.g., 0.5-1%"
                        />
                      </div>

                      <motion.button
                        type="button"
                        onClick={addRole}
                        disabled={!newRole.title || !newRole.description || newRole.requirements.length === 0}
                        className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 ${!newRole.title || !newRole.description || newRole.requirements.length === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                          }`}
                        whileHover={{ scale: !newRole.title || !newRole.description || newRole.requirements.length === 0 ? 1 : 1.02 }}
                        whileTap={{ scale: !newRole.title || !newRole.description || newRole.requirements.length === 0 ? 1 : 0.98 }}
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Add Position
                      </motion.button>
                    </div>

                    {/* Existing Roles */}
                    {formData.roles.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-4">Added Positions ({formData.roles.length})</h4>
                        <div className="space-y-3">
                          {formData.roles.map((role) => (
                            <div key={role.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-slate-900">{role.title}</h5>
                                <button
                                  onClick={() => removeRole(role.id)}
                                  className="p-1 hover:bg-red-50 rounded-lg transition-colors group"
                                >
                                  <Trash className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                                </button>
                              </div>
                              <p className="text-sm text-slate-600 mb-2 font-medium">{role.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                                  {role.type}
                                </span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold">
                                  {role.location}
                                </span>
                                {role.salary && (
                                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold">
                                    {role.salary}
                                  </span>
                                )}
                                {role.equity && (
                                  <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold">
                                    {role.equity} equity
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={formData.contact.email}
                        onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.contact.website}
                        onChange={(e) => handleNestedChange('contact', 'website', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="https://yourstartup.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.contact.linkedin}
                        onChange={(e) => handleNestedChange('contact', 'linkedin', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="https://linkedin.com/company/yourstartup"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Additional Information
                      </label>
                      <textarea
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold resize-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                        placeholder="Any additional information about your startup..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="flex-none px-4 md:px-8 py-4 md:py-6 border-t-4 border-slate-900 bg-slate-50 flex justify-between items-center">
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 font-black uppercase tracking-wide border-2 transition-all duration-300 ${currentStep === 1
                  ? 'border-transparent text-slate-300 cursor-not-allowed'
                  : 'border-slate-900 text-slate-900 hover:bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  }`}
                whileHover={{ scale: currentStep === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentStep === 1 ? 1 : 0.95 }}
              >
                Back
              </motion.button>

              {currentStep < 3 ? (
                <motion.button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-8 py-3 font-black uppercase tracking-wide border-2 border-slate-900 transition-all duration-300 ${validateStep(currentStep)
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  whileHover={{ scale: validateStep(currentStep) ? 1.02 : 1 }}
                  whileTap={{ scale: validateStep(currentStep) ? 0.98 : 1 }}
                >
                  Next Step
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(currentStep)}
                  className={`px-8 py-3 font-black uppercase tracking-wide border-2 border-slate-900 transition-all duration-300 ${isSubmitting || !validateStep(currentStep)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
                  whileHover={{ scale: isSubmitting || !validateStep(currentStep) ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting || !validateStep(currentStep) ? 1 : 0.98 }}
                >
                  {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Opportunity' : 'Launch Startup')}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateStartupModal;