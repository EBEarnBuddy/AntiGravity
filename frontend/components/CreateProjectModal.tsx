import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  BoltIcon,
  HeartIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  MegaphoneIcon,
  ChartBarIcon,
  StarIcon,
  CpuChipIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useFirestore';

interface Role {
  title: string;
  description: string;
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  skills: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  equity?: string;
  benefits: string[];
  priority: 'low' | 'medium' | 'high';
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    industry: '',
    projectType: 'startup',
    totalBudget: { min: 0, max: 0, currency: 'USD' },
    duration: '',
    location: '',
    remote: false,
    equity: '',
    tags: [] as string[],
    urgency: 'medium' as 'low' | 'medium' | 'high',
    roles: [] as Role[],
    benefits: [] as string[],
    requirements: {
      teamSize: 1,
      startDate: '',
      endDate: '',
      timezone: 'UTC'
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    additionalInfo: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const industries = [
    { id: 'fintech', name: 'FinTech', icon: CurrencyDollarIcon },
    { id: 'e-commerce', name: 'E-commerce', icon: BriefcaseIcon },
    { id: 'climate-tech', name: 'Climate Tech', icon: BoltIcon },
    { id: 'healthcare', name: 'HealthTech', icon: HeartIcon },
    { id: 'ai', name: 'AI/ML', icon: CodeBracketIcon },
    { id: 'design', name: 'Design', icon: PaintBrushIcon },
    { id: 'marketing', name: 'Marketing', icon: MegaphoneIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'other', name: 'Other', icon: BuildingOfficeIcon }
  ];

  const projectTypes = [
    { id: 'startup', name: 'Startup' },
    { id: 'enterprise', name: 'Enterprise' },
    { id: 'agency', name: 'Agency' },
    { id: 'nonprofit', name: 'Non-Profit' }
  ];

  const experienceLevels = [
    { id: 'entry', name: 'Entry Level' },
    { id: 'mid', name: 'Mid Level' },
    { id: 'senior', name: 'Senior' },
    { id: 'lead', name: 'Lead/Principal' }
  ];

  const commonSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis',
    'GraphQL', 'REST API', 'Machine Learning', 'AI', 'Data Science', 'DevOps',
    'UI/UX Design', 'Product Management', 'Marketing', 'Sales', 'Customer Success'
  ];

  const commonBenefits = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k) Matching',
    'Stock Options', 'Equity', 'Flexible Hours', 'Remote Work', 'Learning Budget',
    'Conference Budget', 'Home Office Setup', 'Gym Membership', 'Mental Health Support',
    'Unlimited PTO', 'Parental Leave', 'Professional Development'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const addRole = () => {
    const newRole: Role = {
      title: '',
      description: '',
      experience: 'entry',
      skills: [],
      salary: { min: 0, max: 0, currency: 'USD' },
      benefits: [],
      priority: 'medium'
    };
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, newRole]
    }));
  };

  const updateRole = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) =>
        i === index ? { ...role, [field]: value } : role
      )
    }));
  };

  const updateRoleNested = (index: number, parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) =>
        i === index ? {
          ...role,
          [parent]: { ...(role[parent as keyof Role] as any), [field]: value }
        } : role
      )
    }));
  };

  const removeRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }));
  };

  const addSkillToRole = (roleIndex: number) => {
    if (newSkill.trim() && !formData.roles[roleIndex].skills.includes(newSkill.trim())) {
      updateRole(roleIndex, 'skills', [...formData.roles[roleIndex].skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkillFromRole = (roleIndex: number, skillToRemove: string) => {
    updateRole(roleIndex, 'skills', formData.roles[roleIndex].skills.filter(skill => skill !== skillToRemove));
  };

  const addBenefitToRole = (roleIndex: number, benefit: string) => {
    if (!formData.roles[roleIndex].benefits.includes(benefit)) {
      updateRole(roleIndex, 'benefits', [...formData.roles[roleIndex].benefits, benefit]);
    }
  };

  const removeBenefitFromRole = (roleIndex: number, benefitToRemove: string) => {
    updateRole(roleIndex, 'benefits', formData.roles[roleIndex].benefits.filter(benefit => benefit !== benefitToRemove));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.company && formData.industry;
      case 2:
        return formData.totalBudget.min > 0 && formData.totalBudget.max > 0 && formData.duration && formData.location;
      case 3:
        return formData.roles.length > 0 && formData.roles.every(role =>
          role.title && role.description && role.salary.min > 0 && role.salary.max > 0
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const projectPayload = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        industry: formData.industry,
        projectType: formData.projectType,
        totalBudget: `${formData.totalBudget.currency} ${formData.totalBudget.min} - ${formData.totalBudget.max}`,
        duration: formData.duration,
        location: formData.location,
        remote: formData.remote,
        equity: formData.equity,
        tags: formData.tags,
        urgency: formData.urgency,
        benefits: formData.benefits,
        roles: formData.roles,
        requirements: formData.requirements,
        contact: formData.contact,
        additionalInfo: formData.additionalInfo,
      };

      await createProject(projectPayload);

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        company: '',
        industry: '',
        projectType: 'startup',
        totalBudget: { min: 0, max: 0, currency: 'USD' },
        duration: '',
        location: '',
        remote: false,
        equity: '',
        tags: [],
        urgency: 'medium',
        roles: [],
        benefits: [],
        requirements: {
          teamSize: 1,
          startDate: '',
          endDate: '',
          timezone: 'UTC'
        },
        contact: {
          email: '',
          phone: '',
          website: ''
        },
        additionalInfo: ''
      });
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project Details', description: 'Basic information about your project' },
    { number: 2, title: 'Project Requirements', description: 'Budget, timeline, and location' },
    { number: 3, title: 'Team Roles', description: 'Define the roles you need to fill' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex flex-col bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-none px-8 py-6 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Post Team Project
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    Create a new project to find talented team members
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-2 px-4">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex items-center relative">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 z-10 ${currentStep >= step.number
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                        {currentStep > step.number ? (
                          <TrophyIcon className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-bold">{step.number}</span>
                        )}
                      </div>
                      <div className="ml-3 min-w-[120px]">
                        <p className={`text-sm font-bold ${currentStep >= step.number
                          ? 'text-slate-900'
                          : 'text-slate-500'
                          }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4 h-0.5 bg-slate-100">
                        <div
                          className="h-full bg-green-600 transition-all duration-300"
                          style={{ width: currentStep > step.number ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                    transition={{ duration: 0.3 }}
                  >
                    {/* Project Title */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium placeholder:text-slate-400"
                        placeholder="e.g., AI-Powered E-commerce Platform"
                        required
                      />
                    </div>

                    {/* Project Description */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium placeholder:text-slate-400 resize-none"
                        rows={4}
                        placeholder="Describe your project, goals, and what you're building..."
                        required
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Company/Organization *
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium placeholder:text-slate-400"
                        placeholder="Your company name"
                        required
                      />
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Industry *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {industries.map((industry) => {
                          const Icon = industry.icon;
                          return (
                            <button
                              key={industry.id}
                              type="button"
                              onClick={() => handleInputChange('industry', industry.id)}
                              className={`p-4 border-2 rounded-xl text-left transition-all duration-200 group ${formData.industry === industry.id
                                ? 'border-green-600 bg-green-50'
                                : 'border-slate-200 hover:border-green-300 bg-white'
                                }`}
                            >
                              <Icon className={`w-6 h-6 mb-2 ${formData.industry === industry.id ? 'text-green-600' : 'text-slate-400 group-hover:text-green-500'}`} />
                              <p className={`font-bold ${formData.industry === industry.id ? 'text-green-700' : 'text-slate-600'}`}>{industry.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Type */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {projectTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleInputChange('projectType', type.id)}
                            className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${formData.projectType === type.id
                              ? 'border-green-600 bg-green-50'
                              : 'border-slate-200 hover:border-green-300 bg-white'
                              }`}
                          >
                            <p className={`font-bold ${formData.projectType === type.id ? 'text-green-700' : 'text-slate-600'}`}>{type.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-green-900"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                          placeholder="Add a tag..."
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                    transition={{ duration: 0.3 }}
                  >
                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Total Project Budget *
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1 font-medium">Min Amount</label>
                          <input
                            type="number"
                            value={formData.totalBudget.min}
                            onChange={(e) => handleNestedChange('totalBudget', 'min', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1 font-medium">Max Amount</label>
                          <input
                            type="number"
                            value={formData.totalBudget.max}
                            onChange={(e) => handleNestedChange('totalBudget', 'max', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1 font-medium">Currency</label>
                          <select
                            value={formData.totalBudget.currency}
                            onChange={(e) => handleNestedChange('totalBudget', 'currency', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="CAD">CAD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Duration *
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                        placeholder="e.g., 2-3 months, 6 weeks, Ongoing"
                        required
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Location *
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                          placeholder="e.g., San Francisco, CA or Remote"
                          required
                        />
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.remote}
                            onChange={(e) => handleInputChange('remote', e.target.checked)}
                            className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm text-slate-700 font-medium">
                            Remote work is available
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Equity */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Equity (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.equity}
                        onChange={(e) => handleInputChange('equity', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                        placeholder="e.g., 0.5% - 2% equity"
                      />
                    </div>

                    {/* Urgency */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Urgency
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700 border-green-300' },
                          { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                          { id: 'high', name: 'High', color: 'bg-red-100 text-red-700 border-red-300' }
                        ].map((urgency) => (
                          <button
                            key={urgency.id}
                            type="button"
                            onClick={() => handleInputChange('urgency', urgency.id)}
                            className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${formData.urgency === urgency.id
                              ? `border-green-600 ${urgency.color}`
                              : 'border-slate-200 hover:border-green-300 bg-white'
                              }`}
                          >
                            <p className="font-bold">{urgency.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Project Benefits
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {benefit}
                            <button
                              type="button"
                              onClick={() => removeBenefit(benefit)}
                              className="hover:text-blue-900"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                          placeholder="Add a benefit..."
                        />
                        <button
                          type="button"
                          onClick={addBenefit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-2 font-medium">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                          {commonBenefits.slice(0, 6).map((benefit) => (
                            <button
                              key={benefit}
                              type="button"
                              onClick={() => addBenefit()}
                              className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                            >
                              {benefit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                    transition={{ duration: 0.3 }}
                  >
                    {/* Roles Section */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">
                        Team Roles ({formData.roles.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addRole}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Role
                      </button>
                    </div>

                    {formData.roles.length === 0 && (
                      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                        <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="font-medium">No roles added yet. Add at least one role to continue.</p>
                      </div>
                    )}

                    {formData.roles.map((role, roleIndex) => (
                      <div
                        key={roleIndex}
                        className="border border-slate-200 rounded-xl p-6 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-slate-900">
                            Role {roleIndex + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeRole(roleIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Role Title */}
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              Role Title *
                            </label>
                            <input
                              type="text"
                              value={role.title}
                              onChange={(e) => updateRole(roleIndex, 'title', e.target.value)}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                              placeholder="e.g., Senior Frontend Developer"
                              required
                            />
                          </div>

                          {/* Experience Level */}
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              Experience Level *
                            </label>
                            <select
                              value={role.experience}
                              onChange={(e) => updateRole(roleIndex, 'experience', e.target.value)}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                              required
                            >
                              {experienceLevels.map((level) => (
                                <option key={level.id} value={level.id}>
                                  {level.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Role Description */}
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Role Description *
                          </label>
                          <textarea
                            value={role.description}
                            onChange={(e) => updateRole(roleIndex, 'description', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium resize-none"
                            rows={3}
                            placeholder="Describe the responsibilities and requirements for this role..."
                            required
                          />
                        </div>

                        {/* Salary Range */}
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Salary Range *
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-slate-500 mb-1 font-medium">Min Salary</label>
                              <input
                                type="number"
                                value={role.salary.min}
                                onChange={(e) => updateRoleNested(roleIndex, 'salary', 'min', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                                placeholder="0"
                                min="0"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1 font-medium">Max Salary</label>
                              <input
                                type="number"
                                value={role.salary.max}
                                onChange={(e) => updateRoleNested(roleIndex, 'salary', 'max', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                                placeholder="0"
                                min="0"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1 font-medium">Currency</label>
                              <select
                                value={role.salary.currency}
                                onChange={(e) => updateRoleNested(roleIndex, 'salary', 'currency', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                              >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="CAD">CAD</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Required Skills
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {role.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium flex items-center gap-2"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromRole(roleIndex, skill)}
                                  className="hover:text-green-900"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToRole(roleIndex))}
                              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium"
                              placeholder="Add a skill..."
                            />
                            <button
                              type="button"
                              onClick={() => addSkillToRole(roleIndex)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-sm"
                            >
                              Add
                            </button>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-2 font-medium">Quick add:</p>
                            <div className="flex flex-wrap gap-2">
                              {commonSkills.slice(0, 8).map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => addSkillToRole(roleIndex)}
                                  className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Role Benefits */}
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Role-Specific Benefits
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {role.benefits.map((benefit, benefitIndex) => (
                              <span
                                key={benefitIndex}
                                className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium flex items-center gap-2"
                              >
                                {benefit}
                                <button
                                  type="button"
                                  onClick={() => removeBenefitFromRole(roleIndex, benefit)}
                                  className="hover:text-blue-900"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {commonBenefits.slice(0, 6).map((benefit) => (
                              <button
                                key={benefit}
                                type="button"
                                onClick={() => addBenefitToRole(roleIndex, benefit)}
                                className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                              >
                                {benefit}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="mt-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Role Priority
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700' },
                              { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                              { id: 'high', name: 'High', color: 'bg-red-100 text-red-700' }
                            ].map((priority) => (
                              <button
                                key={priority.id}
                                type="button"
                                onClick={() => updateRole(roleIndex, 'priority', priority.id)}
                                className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${role.priority === priority.id
                                  ? `border-green-600 ${priority.color}`
                                  : 'border-slate-200 hover:border-green-300 bg-white'
                                  }`}
                              >
                                <p className="font-bold">{priority.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-none px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl">
              <button
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-300"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
                className="px-8 py-3 bg-green-600 text-white font-bold uppercase tracking-wide rounded-xl hover:bg-green-700 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <StarIcon className="w-5 h-5" />
                    Create Project
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;