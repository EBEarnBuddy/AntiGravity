import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db as firebaseDb, storage as firebaseStorage } from './firebase';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const db = firebaseDb as Firestore;
const storage = firebaseStorage as FirebaseStorage;

// Data Types
export interface Pod {
  id?: string;
  name: string;
  description: string;
  slug: string;
  theme: string;
  icon: string;
  tags: string[];
  category?: string;
  memberCount?: number;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isPrivate?: boolean;
  lastActivity?: Timestamp;
  messageCount?: number;
  onlineMembers?: string[];
  pinnedMessages?: string[];
  moderators?: string[];
}

export interface PodPost {
  id?: string;
  podId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  imageUrl?: string;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: string;
  };
  likes: string[];
  comments: PodComment[];
  bookmarks: string[];
  reactions?: { [emoji: string]: string[] };
  isPinned?: boolean;
  isReported?: boolean;
  reportedBy?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  editedAt?: Timestamp;
  isEdited?: boolean;
}

export interface PodComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Timestamp;
  likes: string[];
}

export interface Gig {
  id?: string;
  type?: 'project';
  title: string;
  description: string;
  company: string;
  companyLogo?: string;
  industry: string;
  projectType: 'startup' | 'enterprise' | 'agency' | 'nonprofit';
  totalBudget: string;
  duration: string;
  location: string;
  remote: boolean;
  equity?: string;
  benefits: string[];
  roles: ProjectRole[];
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  totalApplicants: number;
  postedBy: string;
  postedByName: string;
  postedByAvatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  urgency: 'low' | 'medium' | 'high';
  featured: boolean;
  tags: string[];
}

export interface ProjectRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  budget: string;
  equity?: string;
  timeCommitment: string;
  applicants: RoleApplication[];
  filled: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface RoleApplication {
  userId: string;
  userName: string;
  userAvatar?: string;
  roleId: string;
  coverLetter: string;
  portfolio?: string;
  expectedSalary?: string;
  availability: string;
  appliedAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
  notes?: string;
}

export interface GigApplication {
  userId: string;
  userName: string;
  userAvatar?: string;
  coverLetter: string;
  proposedBudget?: string;
  proposedTimeline?: string;
  portfolio?: string;
  appliedAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Startup {
  id?: string;
  type?: 'startup';
  name: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  funding: string;
  equity: string;
  requirements: string[];
  founderId: string;
  founderName: string;
  founderAvatar?: string;
  status: 'active' | 'paused' | 'closed';
  roles: StartupRole[]; // Changed from applicants to roles
  totalApplicants?: number; // Total across all roles
  createdAt: Timestamp;
  updatedAt: Timestamp;
  website?: string;
  logo?: string;
  teamSize?: number;
  matchScore?: number;
  verified?: boolean;
  foundedDate?: string;
  postedBy?: string | {
    _id: string;
    firebaseUid: string;
    displayName: string;
    photoURL?: string;
  };
}

export interface StartupRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salary?: string;
  equity?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  location: 'remote' | 'hybrid' | 'onsite';
  applicants: StartupApplication[];
}

export interface StartupApplication {
  userId: string;
  userName: string;
  userAvatar?: string;
  roleId: string; // Added to track which role was applied for
  coverLetter: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  experience?: string;
  whyInterested?: string;
  availability: string;
  appliedAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
}

export interface Application {
  _id: string;
  opportunityId: string | { _id: string; name: string; description: string; type: string; postedBy: string };
  applicantId: string | {
    _id: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
  roleId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
  message: string;
  details?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  category?: string;
  members: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  isPrivate: boolean;
  avatar?: string;
  hasWhiteboard?: boolean;
  hasVideoCall?: boolean;
  lastMessage?: {
    content: string;
    senderName: string;
    timestamp: Timestamp;
  };
  pendingMembers?: string[];
  memberCount?: number;
}

export interface ChatMessage {
  id?: string;
  _id?: string; // Backend ID
  senderId?: string; // Legacy
  sender?: {
    _id: string;
    displayName: string;
    photoURL?: string;
    firebaseUid?: string;
  } | string; // Populated or ID
  senderName?: string; // Legacy
  senderPhotoURL?: string; // Legacy
  content: string;
  type?: 'text' | 'image' | 'system' | 'file';
  reactions?: { [emoji: string]: string[] };
  readBy?: { user: string | { _id: string, displayName?: string }; readAt: string | Date }[];
  timestamp?: Timestamp;
  createdAt?: string; // ISO string from REST
  updatedAt?: string;
  edited?: boolean;
  editedAt?: Timestamp;
  roomId?: string;
  pending?: boolean; // For optimistic UI
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'project' | 'payment' | 'system' | 'social';
  title: string;
  message: string;
  isRead: boolean;
  seen: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
}

export interface CollaborationRequest {
  id?: string;
  fromCircleId: string;
  toCircleId: string;
  fromCircleName?: string;
  toCircleName?: string;
  requestedBy: string; // UserId
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  username?: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  location?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  availability?: 'open' | 'busy';
  // Legacy or flat fields (keep for compatibility if needed)
  github?: string;
  linkedin?: string;
  twitter?: string;
  onboardingCompleted: boolean;
  productTourCompleted?: boolean;
  hasCompletedTour?: boolean;
  isNewUser?: boolean;
  hasSkippedOnboarding?: boolean;
  hasCompletedOnboarding?: boolean;
  onboardingData?: OnboardingData;
  joinedPods: string[];
  joinedRooms: string[];
  postedStartups: string[];
  postedGigs: string[];
  appliedGigs: string[];
  appliedStartups: string[];
  bookmarkedGigs: string[];
  bookmarkedStartups: string[];
  bookmarks: string[];
  activityLog: any[];
  rating: number;
  completedProjects: number;
  totalEarnings: string;
  badges?: string[];
  isOnline?: boolean;
  lastSeen?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OnboardingData {
  role: 'freelancer' | 'founder' | 'builder' | 'investor';
  experience: 'beginner' | 'intermediate' | 'expert';
  interests: string[];
  skills: string[];
  goals: string[];
  availability: 'full-time' | 'part-time' | 'weekends' | 'flexible';
  budget?: string;
  location?: string;
  remote: boolean;
}

export interface UserAnalytics {
  userId: string;
  profileViews: number;
  postsCreated: number;
  messagesPosted: number;
  podsJoined: number;
  gigsApplied: number;
  startupsApplied: number;
  completedProjects: number;
  earnings: number;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Recommendation {
  userId: string;
  recommendedGigs: Gig[];
  recommendedStartups: Startup[];
  recommendedPods: Pod[];
  recommendedUsers: UserProfile[];
  lastUpdated: Timestamp;
}

// Firestore Service Class
export class FirestoreService {
  // ---------- Applications ----------
  static async getUserApplications(userId: string): Promise<any[]> {
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) return [];

    const applications: any[] = [];

    // Startups
    if (userProfile.appliedStartups && userProfile.appliedStartups.length > 0) {
      for (const startupId of userProfile.appliedStartups) {
        const startup = await this.getOpportunityById(startupId);
        if (startup && startup.type === 'startup') {
          // Find application status
          let status = 'pending';
          const s = startup as Startup;
          if (s.roles) {
            for (const role of s.roles) {
              const app = role.applicants.find(a => a.userId === userId);
              if (app) {
                status = app.status;
                break;
              }
            }
          }
          applications.push({
            _id: startup.id,
            opportunityId: { title: s.name, name: s.name, description: s.description, type: 'startup' },
            status,
            type: 'startup'
          });
        }
      }
    }

    // Add Gigs logic if needed

    return applications;
  }

  // ---------- Notifications ----------
  private static formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async uploadRoomAttachment(roomId: string, file: File): Promise<{ url: string; name: string; type: string; size: string; }> {
    if (!storage) throw new Error('Firebase storage is not initialized');
    const safeName = `${Date.now()}_${file.name}`.replace(/\s+/g, '_');
    const objectRef = ref(storage, `rooms/${roomId}/attachments/${safeName}`);
    await uploadBytes(objectRef, file);
    const url = await getDownloadURL(objectRef);
    return {
      url,
      name: file.name,
      type: file.type,
      size: this.formatBytes(file.size)
    };
  }

  static async uploadStartupLogo(file: File): Promise<string> {
    if (!storage) throw new Error('Firebase storage is not initialized');
    const safeName = `${Date.now()}_${file.name}`.replace(/\s+/g, '_');
    const objectRef = ref(storage, `startups/logos/${safeName}`);
    await uploadBytes(objectRef, file);
    return await getDownloadURL(objectRef);
  }

  static async uploadUserAvatar(userId: string, file: File): Promise<string> {
    if (!storage) throw new Error('Firebase storage is not initialized');
    const safeName = `${Date.now()}_avatar`.replace(/\s+/g, '_');
    const objectRef = ref(storage, `users/${userId}/avatar/${safeName}`);
    await uploadBytes(objectRef, file);
    return await getDownloadURL(objectRef);
  }
  // User Profiles
  static async createUserProfile(profileData: Omit<UserProfile, 'id' | 'joinDate'>): Promise<void> {
    await setDoc(doc(db, 'users', profileData.uid), {
      ...profileData,
      joinDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as unknown as UserProfile : null;
  }

  static async getUserByUsername(username: string): Promise<UserProfile | null> {
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as unknown as UserProfile;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      isOnline,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // Pods
  static async createPod(podData: Omit<Pod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'pods'), {
      ...podData,
      memberCount: podData.members?.length || 0,
      messageCount: 0,
      onlineMembers: [],
      pinnedMessages: [],
      moderators: [podData.createdBy],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    return docRef.id;
  }

  static async getPods(): Promise<Pod[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'pods'), orderBy('updatedAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pod));
  }

  static async joinPod(podId: string, userId: string): Promise<void> {
    const batch = writeBatch(db);

    // Update pod
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });

    // Update user profile
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      joinedPods: arrayUnion(podId),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  }

  static async leavePod(podId: string, userId: string): Promise<void> {
    const batch = writeBatch(db);

    // Update pod
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    // Update user profile
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      joinedPods: arrayRemove(podId),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  }

  static async updatePodOnlineMembers(podId: string, onlineMembers: string[]): Promise<void> {
    const podRef = doc(db, 'pods', podId);
    await updateDoc(podRef, {
      onlineMembers,
      updatedAt: serverTimestamp()
    });
  }

  // Collaborations
  static async createCollaborationRequest(data: Omit<CollaborationRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'collaborationRequests'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getCollaborationRequests(circleId: string): Promise<CollaborationRequest[]> {
    // Incoming requests
    const q = query(
      collection(db, 'collaborationRequests'),
      where('toCircleId', '==', circleId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollaborationRequest));
  }

  static async updateCollaborationRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<void> {
    await updateDoc(doc(db, 'collaborationRequests', requestId), {
      status,
      updatedAt: serverTimestamp()
    });
  }

  // Pod Posts
  static async createPodPost(podId: string, userId: string, content: string, imageUrl?: string): Promise<string> {
    // Get user profile for name and avatar
    const userProfile = await this.getUserProfile(userId);

    const postData = {
      podId,
      userId,
      userName: userProfile?.displayName || 'Anonymous User',
      userAvatar: userProfile?.photoURL || '',
      content: content.trim(),
      type: imageUrl ? 'image' : 'text',
      imageUrl,
      likes: [],
      comments: [],
      bookmarks: [],
      reactions: {},
      isPinned: false,
      isReported: false,
      reportedBy: [],
      isEdited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const batch = writeBatch(db);

    // Create post
    const postRef = doc(collection(db, 'podPosts'));
    batch.set(postRef, postData);

    // Update pod activity
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      messageCount: increment(1),
      lastActivity: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return postRef.id;
  }

  static async createCommunityPost(postData: {
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    selectedPod?: string;
    images?: string[];
    documents?: Array<{
      url: string;
      name: string;
      type: string;
      size: string;
    }>;
    emoji?: string;
    tags?: string[];
  }): Promise<string> {
    try {
      const post = {
        userId: postData.userId,
        userName: postData.userName,
        userAvatar: postData.userAvatar,
        content: postData.content,
        podId: postData.selectedPod || 'community',
        type: 'text' as const,
        imageUrl: postData.images?.[0],
        images: postData.images || [],
        documents: postData.documents || [],
        emoji: postData.emoji,
        tags: postData.tags || [],
        likes: [],
        comments: [],
        bookmarks: [],
        reactions: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'podPosts'), post);

      // If posting to a specific pod, update pod's post count
      if (postData.selectedPod) {
        const podRef = doc(db, 'pods', postData.selectedPod);
        await updateDoc(podRef, {
          messageCount: increment(1),
          lastActivity: serverTimestamp()
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  }

  static async getCommunityPosts(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'podPosts'),
          orderBy('createdAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting community posts:', error);
      return [];
    }
  }

  static async createPost(postData: Omit<PodPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getPodPosts(podId: string): Promise<PodPost[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'podPosts'),
        where('podId', '==', podId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PodPost));
  }

  static async likePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async unlikePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async bookmarkPost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      bookmarks: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async addReactionToPost(postId: string, emoji: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const data = postDoc.data() as PodPost;
      const reactions = data.reactions || {};

      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      } else {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      await updateDoc(postRef, {
        reactions,
        timestamp: serverTimestamp()
      });
    }
  }

  static async addCommentToPost(postId: string, userId: string, content: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    const userProfile = await this.getUserProfile(userId);
    const newComment: PodComment = {
      id: doc(collection(db, 'podPosts', postId, 'comments')).id,
      userId,
      userName: userProfile?.displayName || 'Anonymous',
      userAvatar: userProfile?.photoURL || '',
      content: content.trim(),
      createdAt: serverTimestamp() as unknown as Timestamp,
      likes: []
    } as any;

    // Append comment to embedded array and update updatedAt
    await updateDoc(postRef, {
      comments: arrayUnion(newComment as any),
      updatedAt: serverTimestamp()
    });
  }

  static async pinPost(postId: string, podId: string): Promise<void> {
    const batch = writeBatch(db);

    // Update post
    const postRef = doc(db, 'podPosts', postId);
    batch.update(postRef, {
      isPinned: true,
      updatedAt: serverTimestamp()
    });

    // Update pod
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      pinnedMessages: arrayUnion(postId),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  }

  static async reportPost(postId: string, userId: string, reason: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      isReported: true,
      reportedBy: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });

    // Create report record
    await addDoc(collection(db, 'reports'), {
      postId,
      reportedBy: userId,
      reason,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  // Real-time subscriptions
  static subscribeToPodPosts(
    podId: string,
    callback: (posts: PodPost[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'podPosts'),
        where('podId', '==', podId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PodPost));
        callback(posts);
      }, (error) => {
        console.error('Error in pod posts subscription:', error);
        if (error.code === 'failed-precondition') {
          // Fallback without orderBy
          const simpleQ = query(
            collection(db, 'podPosts'),
            where('podId', '==', podId),
            limit(50)
          );

          return onSnapshot(simpleQ, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as PodPost));
            posts.sort((a, b) => {
              const aTime = a.createdAt?.seconds || 0;
              const bTime = b.createdAt?.seconds || 0;
              return bTime - aTime;
            });
            callback(posts);
          });
        }
        throw error;
      });
    } catch (error) {
      console.error('Error setting up pod posts subscription:', error);
      throw error;
    }
  }

  static subscribeToUserNotifications(
    userId: string,
    callback: (notifications: any[]) => void
  ): () => void {
    const orderedQ = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const simpleQ = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      limit(20)
    );

    // Try ordered first; if Firestore demands an index, fallback
    return onSnapshot(
      orderedQ,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications);
      },
      () => {
        // Fallback without orderBy
        onSnapshot(simpleQ, (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          notifications.sort((a: any, b: any) => {
            const at = a.createdAt?.seconds || 0;
            const bt = b.createdAt?.seconds || 0;
            return bt - at;
          });
          callback(notifications);
        });
      }
    );
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      seen: true,
      readAt: serverTimestamp()
    });
  }

  // Rooms
  static async createRoom(roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'lastActivity'>): Promise<string> {
    const roomRef = doc(collection(db, 'rooms'));
    const batch = writeBatch(db);
    batch.set(roomRef, {
      ...roomData,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });

    // Also reflect membership in user profile
    const userRef = doc(db, 'users', roomData.createdBy);
    batch.set(
      userRef,
      {
        joinedRooms: arrayUnion(roomRef.id),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    await batch.commit();
    return roomRef.id;
  }

  static async getRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'rooms'),
          where('members', 'array-contains', userId),
          orderBy('lastActivity', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
    } catch (err: any) {
      // Fallback if composite index is missing
      if (err?.code === 'failed-precondition') {
        const qSnap = await getDocs(
          query(
            collection(db, 'rooms'),
            where('members', 'array-contains', userId)
          )
        );
        const rooms = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
        // Sort client-side by lastActivity desc
        rooms.sort((a: any, b: any) => {
          const at = a.lastActivity?.seconds || 0;
          const bt = b.lastActivity?.seconds || 0;
          return bt - at;
        });
        return rooms;
      }
      throw err;
    }
  }

  static async getPublicRooms(limitCount = 30): Promise<ChatRoom[]> {
    try {
      const qSnap = await getDocs(
        query(
          collection(db, 'rooms'),
          where('isPrivate', '==', false),
          orderBy('lastActivity', 'desc'),
          limit(limitCount)
        )
      );
      return qSnap.docs.map(d => ({ id: d.id, ...d.data() } as ChatRoom));
    } catch (err: any) {
      if (err?.code === 'failed-precondition') {
        const qSnap = await getDocs(
          query(
            collection(db, 'rooms'),
            where('isPrivate', '==', false),
            limit(limitCount)
          )
        );
        const rooms = qSnap.docs.map(d => ({ id: d.id, ...d.data() } as ChatRoom));
        rooms.sort((a: any, b: any) => {
          const at = a.lastActivity?.seconds || 0;
          const bt = b.lastActivity?.seconds || 0;
          return bt - at;
        });
        return rooms;
      }
      throw err;
    }
  }

  static async joinRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    const userRef = doc(db, 'users', userId);
    const batch = writeBatch(db);
    batch.update(roomRef, {
      members: arrayUnion(userId),
      lastActivity: serverTimestamp()
    });
    batch.update(userRef, {
      joinedRooms: arrayUnion(roomId),
      updatedAt: serverTimestamp()
    });
    await batch.commit();
  }

  static async requestJoinRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      pendingMembers: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    const userRef = doc(db, 'users', userId);
    const batch = writeBatch(db);
    batch.update(roomRef, {
      members: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
    batch.update(userRef, {
      joinedRooms: arrayRemove(roomId),
      updatedAt: serverTimestamp()
    });
    await batch.commit();
  }

  static async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    // No-op for now
  }

  static async getOnlineMembers(roomId: string): Promise<any[]> {
    const room = await getDoc(doc(db, 'rooms', roomId));
    if (!room.exists()) return [];
    const memberIds = room.data().members || [];
    const members = [];
    for (const uid of memberIds) {
      const p = await this.getUserProfile(uid);
      if (p) members.push({ userId: uid, userName: p.displayName, userAvatar: p.photoURL });
    }
    return members;
  }

  static async getRoomMessages(roomId: string, limitCount = 50): Promise<ChatMessage[]> {
    const q = query(
      collection(db, 'chatMessages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
  }

  static async getPendingMemberProfiles(roomId: string): Promise<any[]> {
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    if (!roomDoc.exists()) return [];
    const pendingIds = roomDoc.data().pendingMembers || [];
    const profiles = [];
    for (const uid of pendingIds) {
      const p = await this.getUserProfile(uid);
      if (p) profiles.push({ userId: uid, ...p });
    }
    return profiles;
  }

  static async approveMembership(roomId: string, userId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    const userRef = doc(db, 'users', userId);
    const batch = writeBatch(db);

    if (status === 'accepted') {
      batch.update(roomRef, {
        pendingMembers: arrayRemove(userId),
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      batch.update(userRef, {
        joinedRooms: arrayUnion(roomId),
        updatedAt: serverTimestamp()
      });
    } else {
      batch.update(roomRef, {
        pendingMembers: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    }
    await batch.commit();
  }

  static async deleteMessage(roomId: string, messageId: string): Promise<void> {
    // In real backend, we might just mark as deleted
    await deleteDoc(doc(db, 'chatMessages', messageId));
  }

  static async updateMessage(roomId: string, messageId: string, content: string): Promise<void> {
    await updateDoc(doc(db, 'chatMessages', messageId), {
      content,
      edited: true,
      updatedAt: serverTimestamp()
    });
  }

  static async updateRoom(roomId: string, data: Partial<ChatRoom>): Promise<void> {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteRoom(roomId: string): Promise<void> {
    await deleteDoc(doc(db, 'rooms', roomId));
  }

  // Messages
  static async sendChatMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  }

  static subscribeToRoomMessages(
    roomId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const orderedQ = query(
      collection(db, 'chatMessages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const simpleQ = query(
      collection(db, 'chatMessages'),
      where('roomId', '==', roomId),
      limit(100)
    );

    return onSnapshot(
      orderedQ,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        callback(messages);
      },
      () => {
        onSnapshot(simpleQ, (snapshot) => {
          const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          messages.sort((a: any, b: any) => {
            const at = a.timestamp?.seconds || 0;
            const bt = b.timestamp?.seconds || 0;
            return at - bt;
          });
          callback(messages as any);
        });
      }
    );
  }

  static async addReactionToChatMessage(messageId: string, emoji: string, userId: string): Promise<void> {
    const messageRef = doc(db, 'chatMessages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (messageDoc.exists()) {
      const data = messageDoc.data() as ChatMessage;
      const reactions = data.reactions || {};

      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      } else {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      await updateDoc(messageRef, { reactions });
    }
  }

  // Gigs
  static async createProject(projectData: Omit<Gig, 'id' | 'createdAt' | 'updatedAt' | 'totalApplicants'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'gigs'), {
      ...projectData,
      totalApplicants: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getProjects(): Promise<Gig[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'gigs'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gig));
  }

  static async applyToRole(projectId: string, roleId: string, userId: string, applicationData: {
    coverLetter: string;
    portfolio?: string;
    expectedSalary?: string;
    availability: string;
  }): Promise<void> {
    const projectRef = doc(db, 'gigs', projectId);
    const userProfile = await this.getUserProfile(userId);

    const application: RoleApplication = {
      userId,
      userName: userProfile?.displayName || 'Anonymous User',
      userAvatar: userProfile?.photoURL || '',
      roleId,
      coverLetter: applicationData.coverLetter,
      portfolio: applicationData.portfolio || '',
      expectedSalary: applicationData.expectedSalary || '',
      availability: applicationData.availability,
      appliedAt: serverTimestamp() as any,
      status: 'pending'
    };

    // Get current project data
    const projectDoc = await getDoc(projectRef);
    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Gig;
      const updatedRoles = projectData.roles.map(role => {
        if (role.id === roleId) {
          return {
            ...role,
            applicants: [...role.applicants, application]
          };
        }
        return role;
      });

      await updateDoc(projectRef, {
        roles: updatedRoles,
        totalApplicants: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  }

  static async bookmarkProject(projectId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedGigs: arrayUnion(projectId),
      updatedAt: serverTimestamp()
    });
  }

  static async unbookmarkProject(projectId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedGigs: arrayRemove(projectId),
      updatedAt: serverTimestamp()
    });
  }

  static async updateRoleApplicationStatus(projectId: string, roleId: string, applicationUserId: string, status: 'accepted' | 'rejected' | 'interviewing'): Promise<void> {
    const projectRef = doc(db, 'gigs', projectId);
    const projectDoc = await getDoc(projectRef);

    if (projectDoc.exists()) {
      const projectData = projectDoc.data() as Gig;
      const updatedRoles = projectData.roles.map(role => {
        if (role.id === roleId) {
          const updatedApplicants = role.applicants.map(app => {
            if (app.userId === applicationUserId) {
              return { ...app, status };
            }
            return app;
          });
          return { ...role, applicants: updatedApplicants };
        }
        return role;
      });

      await updateDoc(projectRef, {
        roles: updatedRoles,
        updatedAt: serverTimestamp()
      });
    }
  }

  static async applyToGig(gigId: string, userId: string, applicationData?: { coverLetter?: string; portfolio?: string }): Promise<void> {
    const gigRef = doc(db, 'gigs', gigId);
    const userProfile = await this.getUserProfile(userId);

    await updateDoc(gigRef, {
      applicants: arrayUnion({
        userId,
        userName: userProfile?.displayName || 'Anonymous User',
        userAvatar: userProfile?.photoURL || '',
        coverLetter: applicationData?.coverLetter || '',
        portfolio: applicationData?.portfolio || '',
        appliedAt: serverTimestamp(),
        status: 'pending'
      }),
      updatedAt: serverTimestamp()
    });
  }

  static async bookmarkGig(gigId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedGigs: arrayUnion(gigId),
      updatedAt: serverTimestamp()
    });
  }

  static async unbookmarkGig(gigId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedGigs: arrayRemove(gigId),
      updatedAt: serverTimestamp()
    });
  }

  // Startups
  static async createStartup(startupData: Omit<Startup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'startups'), {
      ...startupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getStartups(): Promise<Startup[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'startups'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Startup));
  }

  static async getOpportunityById(id: string): Promise<(Startup | Gig) | null> {
    // Try startup first
    const startupDoc = await getDoc(doc(db, 'startups', id));
    if (startupDoc.exists()) {
      return { id: startupDoc.id, ...startupDoc.data(), type: 'startup' } as unknown as Startup;
    }
    // Try project (gig)
    const gigDoc = await getDoc(doc(db, 'gigs', id));
    if (gigDoc.exists()) {
      return { id: gigDoc.id, ...gigDoc.data(), type: 'project' } as unknown as Gig;
    }
    return null;
  }

  static async applyToStartup(startupId: string, roleId: string, userId: string, applicationData: {
    coverLetter: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
    experience?: string;
    whyInterested?: string;
    availability: string;
  }): Promise<void> {
    const startupRef = doc(db, 'startups', startupId);
    const userProfile = await this.getUserProfile(userId);

    const application: StartupApplication = {
      userId,
      userName: userProfile?.displayName || 'Anonymous User',
      userAvatar: userProfile?.photoURL || '',
      roleId,
      coverLetter: applicationData.coverLetter,
      portfolio: applicationData.portfolio || '',
      linkedin: applicationData.linkedin || '',
      github: applicationData.github || '',
      experience: applicationData.experience || '',
      whyInterested: applicationData.whyInterested || '',
      availability: applicationData.availability,
      appliedAt: serverTimestamp() as any,
      status: 'pending'
    };

    // Get current startup data
    const startupDoc = await getDoc(startupRef);
    if (startupDoc.exists()) {
      const startupData = startupDoc.data() as Startup;
      const updatedRoles = startupData.roles.map(role => {
        if (role.id === roleId) {
          return {
            ...role,
            applicants: [...role.applicants, application]
          };
        }
        return role;
      });

      await updateDoc(startupRef, {
        roles: updatedRoles,
        totalApplicants: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  }

  static async bookmarkStartup(startupId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedStartups: arrayUnion(startupId),
      updatedAt: serverTimestamp()
    });
  }

  static async unbookmarkStartup(startupId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedStartups: arrayRemove(startupId),
      updatedAt: serverTimestamp()
    });
  }

  static async updateStartupRoleApplicationStatus(startupId: string, roleId: string, applicationUserId: string, status: 'accepted' | 'rejected' | 'interviewing'): Promise<void> {
    const startupRef = doc(db, 'startups', startupId);
    const startupDoc = await getDoc(startupRef);

    if (startupDoc.exists()) {
      const startupData = startupDoc.data() as Startup;
      const updatedRoles = startupData.roles.map(role => {
        if (role.id === roleId) {
          const updatedApplicants = role.applicants.map(app => {
            if (app.userId === applicationUserId) {
              return { ...app, status };
            }
            return app;
          });
          return { ...role, applicants: updatedApplicants };
        }
        return role;
      });

      await updateDoc(startupRef, {
        roles: updatedRoles,
        updatedAt: serverTimestamp()
      });
    }
  }

  static async updateStartupStatus(startupId: string, status: string): Promise<void> {
    await updateDoc(doc(db, 'startups', startupId), {
      status,
      updatedAt: serverTimestamp()
    });
  }

  // Onboarding
  static async saveOnboardingResponse(onboardingData: any): Promise<void> {
    await updateDoc(doc(db, 'users', onboardingData.userId), {
      onboardingData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    });
  }

  static async getOnboardingResponse(userId: string): Promise<any | null> {
    const userProfile = await this.getUserProfile(userId);
    return userProfile?.onboardingData || null;
  }

  // Analytics
  static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const docSnap = await getDoc(doc(db, 'userAnalytics', userId));
    return docSnap.exists() ? { ...docSnap.data() } as UserAnalytics : null;
  }

  // Recommendations
  static async getPersonalizedRecommendations(userId: string): Promise<Recommendation | null> {
    const docSnap = await getDoc(doc(db, 'recommendations', userId));
    return docSnap.exists() ? { ...docSnap.data() } as Recommendation : null;
  }

  static async getEvents(limitCount = 20): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'events'),
        orderBy('date', 'asc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Failed to get events', e);
      return [];
    }
  }

  static async toggleBookmark(opportunityId: string, userId: string): Promise<void> {
    const opp = await this.getOpportunityById(opportunityId);
    if (!opp) return;
    const user = await this.getUserProfile(userId);
    if (!user) return;

    if ((opp as any).type === 'startup') {
      if (user.bookmarkedStartups?.includes(opportunityId)) {
        await this.unbookmarkStartup(opportunityId, userId);
      } else {
        await this.bookmarkStartup(opportunityId, userId);
      }
    } else {
      if (user.bookmarkedGigs?.includes(opportunityId)) {
        await this.unbookmarkProject(opportunityId, userId);
      } else {
        await this.bookmarkProject(opportunityId, userId);
      }
    }
  }

  // Notifications
  static async getNotifications(userId: string, limitCount = 20): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      readAt: serverTimestamp()
    });
  }

  static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      callback(notifications);
    });
  }
}