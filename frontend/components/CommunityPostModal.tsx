import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image, FileText, Smile, Paperclip, Video, Music, MapPin, Calendar, Hash, Globe, Users, Zap, Heart, Star, ThumbsUp, Rocket, Code, Paintbrush, DollarSign, Sparkles, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods } from '../hooks/useFirestore';
import { FirestoreService } from '../lib/firestore';

import { BrutalistSpinner } from '@/components/ui/BrutalistSpinner';

interface CommunityPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PostData {
  content: string;
  selectedPod?: string;
  images: File[];
  documents: File[];
  emoji?: string;
  tags: string[];
}

const CommunityPostModal: React.FC<CommunityPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { pods } = usePods();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState<PostData>({
    content: '',
    images: [],
    documents: [],
    tags: []
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPodSelector, setShowPodSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const emojis = [
    { emoji: '❤️', name: 'heart' },
    { emoji: '🚀', name: 'rocket' },
    { emoji: '💡', name: 'bulb' },
    { emoji: '🔥', name: 'fire' },
    { emoji: '⭐', name: 'star' },
    { emoji: '👍', name: 'thumbsup' },
    { emoji: '🎉', name: 'party' },
    { emoji: '💪', name: 'muscle' },
    { emoji: '🎯', name: 'target' },
    { emoji: '⚡', name: 'zap' },
    { emoji: '💻', name: 'computer' },
    { emoji: '🎨', name: 'art' },
    { emoji: '💰', name: 'money' },
    { emoji: '🌱', name: 'plant' },
    { emoji: '🤖', name: 'robot' },
    { emoji: '🌐', name: 'globe' }
  ];

  const handleContentChange = (value: string) => {
    setPostData(prev => ({ ...prev, content: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length + postData.images.length > 4) {
      alert('You can only upload up to 4 images');
      return;
    }

    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const documentFiles = files.filter(file =>
      file.type.includes('pdf') ||
      file.type.includes('doc') ||
      file.type.includes('txt') ||
      file.type.includes('md')
    );

    if (documentFiles.length + postData.documents.length > 3) {
      alert('You can only upload up to 3 documents');
      return;
    }

    setPostData(prev => ({
      ...prev,
      documents: [...prev.documents, ...documentFiles]
    }));
  };

  const removeImage = (index: number) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeDocument = (index: number) => {
    setPostData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const addEmoji = (emoji: string) => {
    setPostData(prev => ({ ...prev, emoji: emoji }));
    setShowEmojiPicker(false);
  };

  const addTag = (tag: string) => {
    if (!postData.tags.includes(tag)) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser || !postData.content.trim()) return;

    try {
      setIsSubmitting(true);

      // Upload images and documents to storage (simplified for now)
      const imageUrls: string[] = [];
      const documents: Array<{
        url: string;
        name: string;
        type: string;
        size: string;
      }> = [];

      // TODO: Implement actual file upload to Firebase Storage
      // For now, we'll simulate the upload process
      for (const image of postData.images) {
        // Simulate image upload
        const imageUrl = URL.createObjectURL(image);
        imageUrls.push(imageUrl);
      }

      for (const doc of postData.documents) {
        // Simulate document upload
        documents.push({
          url: URL.createObjectURL(doc),
          name: doc.name,
          type: doc.type,
          size: `${(doc.size / 1024).toFixed(1)} KB`
        });
      }

      // Create the post - use localStorage directly for now to ensure it works
      const localPost = {
        id: `local_${Date.now()}`,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userAvatar: currentUser.photoURL || undefined,
        content: postData.content,
        podId: postData.selectedPod || 'community',
        type: 'text',
        imageUrl: imageUrls[0],
        images: imageUrls,
        documents: documents,
        emoji: postData.emoji,
        tags: postData.tags || [],
        likes: [],
        comments: [],
        bookmarks: [],
        reactions: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to localStorage
      const existingPosts = JSON.parse(localStorage.getItem('localCommunityPosts') || '[]');
      existingPosts.unshift(localPost);
      localStorage.setItem('localCommunityPosts', JSON.stringify(existingPosts));

      // console.log('Post saved to localStorage successfully');

      // Try backend API as well (but don't fail if it doesn't work)
      try {
        await FirestoreService.createCommunityPost({
          content: postData.content,
          selectedPod: postData.selectedPod,
          images: imageUrls,
          documents: documents,
          emoji: postData.emoji,
          tags: postData.tags,
          // Send user info from frontend
          userName: currentUser?.displayName || 'Anonymous User',
          userAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          userId: currentUser?.uid || 'anonymous'
        });
        // console.log('Post also saved to backend API');
      } catch (apiError) {
        console.warn('Backend API not available, but post was saved to localStorage');
      }

      onSuccess();
      onClose();

      // Reset form
      setPostData({
        content: '',
        images: [],
        documents: [],
        tags: []
      });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = postData.content.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-none border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b-4 border-slate-900 pb-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Create Post</h2>
                <p className="text-slate-600 font-bold">Share with the builder community</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 border-2 border-transparent hover:border-slate-900 transition-all hover:bg-slate-100"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 border-2 border-slate-900">
              <img
                src={currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                alt="Your avatar"
                className="w-12 h-12 rounded-none border-2 border-slate-900 object-cover shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
              />
              <div>
                <p className="font-black text-lg text-slate-900 uppercase">
                  {currentUser?.displayName || 'Anonymous User'}
                </p>
                <p className="text-sm font-bold text-slate-500">
                  {postData.selectedPod ? `Posting to ${postData.selectedPod}` : 'Posting to community'}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-4">
              <div>
                <textarea
                  value={postData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="What's happening in the builder community?"
                  className="w-full p-4 border-2 border-slate-900 rounded-none bg-white text-slate-900 resize-none focus:ring-0 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all font-medium text-lg min-h-[120px]"
                />
              </div>

              {/* Emoji Display */}
              {postData.emoji && (
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{postData.emoji}</span>
                  <button
                    onClick={() => setPostData(prev => ({ ...prev, emoji: undefined }))}
                    className="text-slate-400 hover:text-red-500 border-2 border-transparent hover:border-red-500 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tags Display */}
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 border-2 border-slate-900 text-green-800 text-sm font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Images Preview */}
              {postData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {postData.images.map((image, index) => (
                    <div key={index} className="relative group border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white border-2 border-slate-900 w-8 h-8 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents Preview */}
              {postData.documents.length > 0 && (
                <div className="space-y-2">
                  {postData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-slate-700" />
                        <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t-4 border-slate-900">
                <div className="flex items-center gap-3">
                  {/* Image Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 border-2 border-slate-900 hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all"
                    title="Add image"
                  >
                    <Image className="w-5 h-5 text-slate-900" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Document Upload */}
                  <button
                    onClick={() => documentInputRef.current?.click()}
                    className="p-3 border-2 border-slate-900 hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all"
                    title="Add document"
                  >
                    <FileText className="w-5 h-5 text-slate-900" />
                  </button>
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />

                  {/* Emoji Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-3 border-2 border-slate-900 hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5 text-slate-900" />
                    </button>

                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-4 p-4 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] grid grid-cols-8 gap-2 z-10 w-80"
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        >
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => addEmoji(emoji.emoji)}
                              className="p-2 hover:bg-slate-100 border border-transparent hover:border-slate-900 text-xl transition-all"
                              title={emoji.name}
                            >
                              {emoji.emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pod Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPodSelector(!showPodSelector)}
                      className="p-3 border-2 border-slate-900 hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all"
                      title="Select pod"
                    >
                      <Hash className="w-5 h-5 text-slate-900" />
                    </button>

                    <AnimatePresence>
                      {showPodSelector && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-4 p-2 bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-h-48 overflow-y-auto z-10 w-48"
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        >
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                setPostData(prev => ({ ...prev, selectedPod: undefined }));
                                setShowPodSelector(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 border-2 border-transparent hover:border-slate-900 font-bold text-sm transition-all"
                            >
                              Community
                            </button>
                            {pods.map((pod) => (
                              <button
                                key={pod.id}
                                onClick={() => {
                                  setPostData(prev => ({ ...prev, selectedPod: pod.name }));
                                  setShowPodSelector(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 border-2 border-transparent hover:border-slate-900 font-bold text-sm transition-all"
                              >
                                {pod.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-500">
                    {postData.content.length}/500
                  </span>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className={`px-6 py-3 border-2 border-slate-900 font-black uppercase tracking-wider flex items-center gap-2 transition-all ${canSubmit && !isSubmitting
                      ? 'bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300'
                      }`}
                    whileHover={canSubmit && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={canSubmit && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <BrutalistSpinner size={16} className="text-white border-white" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[3]" />
                        Post
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPostModal;