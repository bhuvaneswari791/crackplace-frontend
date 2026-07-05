import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingInput: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}> = ({ label, type = 'text', value, onChange, required = false, maxLength, placeholder = '' }) => {
  const [focused, setFocused] = useState(false);
  const showLabelFloating = focused || value.trim() !== '';

  return (
    <div className="relative w-full mb-4">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3.5 pt-5.5 pb-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-neon-purple focus:bg-neon-purple/[0.02] transition-all duration-300 placeholder-transparent focus:placeholder-gray-600"
      />
      <label
        className={`absolute left-3.5 pointer-events-none transition-all duration-300 font-bold uppercase tracking-wider ${
          showLabelFloating
            ? 'top-1.5 text-[8px] text-neon-purple font-black'
            : 'top-3.5 text-[10px] text-gray-500 font-semibold'
        }`}
      >
        {label} {required && <span className="text-neon-pink">*</span>}
      </label>
    </div>
  );
};

const FloatingTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  rows?: number;
}> = ({ label, value, onChange, maxLength, rows = 3 }) => {
  const [focused, setFocused] = useState(false);
  const showLabelFloating = focused || value.trim() !== '';

  return (
    <div className="relative w-full mb-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3.5 pt-5.5 pb-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-neon-purple focus:bg-neon-purple/[0.02] transition-all duration-300 resize-none"
      />
      <label
        className={`absolute left-3.5 pointer-events-none transition-all duration-300 font-bold uppercase tracking-wider ${
          showLabelFloating
            ? 'top-1.5 text-[8px] text-neon-purple font-black'
            : 'top-3.5 text-[10px] text-gray-500 font-semibold'
        }`}
      >
        {label}
      </label>
      {maxLength && (
        <span className="absolute bottom-1 right-2 text-[8px] text-gray-500 font-bold font-mono">
          {value.length} / {maxLength}
        </span>
      )}
    </div>
  );
};
import { FaArrowLeft, FaCoins, FaStar, FaMagnifyingGlass, FaCircleCheck } from 'react-icons/fa6';
import { COSMETICS_CATALOG, getRingClass, getBackgroundClass, getFrameClass, getRarityColor } from '../config/cosmetics';
import type { CosmeticItem } from '../config/cosmetics';
import type { UserProfile } from '../types';
import { motion } from 'framer-motion';

export const Personalization: React.FC = () => {
  const { userProfile, token } = useAuthStore();
  const navigate = useNavigate();
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [loadingFavoriteId, setLoadingFavoriteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const location = useLocation();
  const queryTab = useMemo(() => new URLSearchParams(location.search).get('tab'), [location.search]);

  // Customization Tabs
  const [selectedCategory, setSelectedCategory] = useState<string>(queryTab || 'edit_profile');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('favorites');

  // Preview state (defaults to currently equipped cosmetics)
  const [previewAvatar, setPreviewAvatar] = useState<string>(userProfile?.equippedAvatar || 'programmer');
  const [previewRing, setPreviewRing] = useState<string>(userProfile?.equippedRing || '');
  const [previewFrame, setPreviewFrame] = useState<string>(userProfile?.equippedFrame || '');
  const [previewBg, setPreviewBg] = useState<string>(userProfile?.equippedBackground || '');
  const [previewTitle, setPreviewTitle] = useState<string>(userProfile?.equippedTitle || '');

  // Edit Profile States
  const [editDisplayName, setEditDisplayName] = useState<string>(userProfile?.displayName || '');
  const [editUsername, setEditUsername] = useState<string>(userProfile?.username || '');
  const [editBio, setEditBio] = useState<string>(userProfile?.bio || '');
  const [editCollege, setEditCollege] = useState<string>(userProfile?.college || '');
  const [editDegree, setEditDegree] = useState<string>(userProfile?.degree || '');
  const [editDepartment, setEditDepartment] = useState<string>(userProfile?.department || '');
  const [editYear, setEditYear] = useState<number>(userProfile?.year || 1);
  const [editGraduationYear, setEditGraduationYear] = useState<string>(userProfile?.graduationYear || '');
  const [editSemester, setEditSemester] = useState<string>(userProfile?.semester || '');
  const [editCareerGoal, setEditCareerGoal] = useState<string>(userProfile?.careerGoal || '');
  const [editDreamCompany, setEditDreamCompany] = useState<string>(userProfile?.dreamCompany || '');
  const [editPreferredRole, setEditPreferredRole] = useState<string>(userProfile?.preferredRole || '');
  const [editCountry, setEditCountry] = useState<string>(userProfile?.country || '');
  const [editState, setEditState] = useState<string>(userProfile?.state || '');
  const [editCity, setEditCity] = useState<string>(userProfile?.city || '');
  const [editLinkedin, setEditLinkedin] = useState<string>(userProfile?.linkedin || '');
  const [editGithub, setEditGithub] = useState<string>(userProfile?.github || '');
  const [editPortfolio, setEditPortfolio] = useState<string>(userProfile?.portfolio || '');
  const [editLeetcode, setEditLeetcode] = useState<string>(userProfile?.leetcode || '');
  const [editHackerrank, setEditHackerrank] = useState<string>(userProfile?.hackerrank || '');
  const [editCodeforces, setEditCodeforces] = useState<string>(userProfile?.codeforces || '');

  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(true);

  // Collapsible cards state
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({
    personal: true,
    academic: false,
    career: false,
    socials: false
  });

  const toggleCard = (card: string) => {
    setExpandedCards(prev => ({ ...prev, [card]: !prev[card] }));
  };

  // Sync selected tab with query param changes
  useEffect(() => {
    if (queryTab) {
      setSelectedCategory(queryTab);
    }
  }, [queryTab]);

  // Sync edit states when userProfile updates (from Firestore real-time sync)
  useEffect(() => {
    if (userProfile) {
      setEditDisplayName(userProfile.displayName || '');
      setEditUsername(userProfile.username || '');
      setEditBio(userProfile.bio || '');
      setEditCollege(userProfile.college || '');
      setEditDegree(userProfile.degree || '');
      setEditDepartment(userProfile.department || '');
      setEditYear(userProfile.year || 1);
      setEditGraduationYear(userProfile.graduationYear || '');
      setEditSemester(userProfile.semester || '');
      setEditCareerGoal(userProfile.careerGoal || '');
      setEditDreamCompany(userProfile.dreamCompany || '');
      setEditPreferredRole(userProfile.preferredRole || '');
      setEditCountry(userProfile.country || '');
      setEditState(userProfile.state || '');
      setEditCity(userProfile.city || '');
      setEditLinkedin(userProfile.linkedin || '');
      setEditGithub(userProfile.github || '');
      setEditPortfolio(userProfile.portfolio || '');
      setEditLeetcode(userProfile.leetcode || '');
      setEditHackerrank(userProfile.hackerrank || '');
      setEditCodeforces(userProfile.codeforces || '');
    }
  }, [userProfile]);

  // Compute profile dirty state
  const isProfileDirty = useMemo(() => {
    if (!userProfile) return false;
    return (
      editDisplayName !== (userProfile.displayName || '') ||
      editUsername !== (userProfile.username || '') ||
      editBio !== (userProfile.bio || '') ||
      editCollege !== (userProfile.college || '') ||
      editDegree !== (userProfile.degree || '') ||
      editDepartment !== (userProfile.department || '') ||
      editYear !== (userProfile.year || 1) ||
      editGraduationYear !== (userProfile.graduationYear || '') ||
      editSemester !== (userProfile.semester || '') ||
      editCareerGoal !== (userProfile.careerGoal || '') ||
      editDreamCompany !== (userProfile.dreamCompany || '') ||
      editPreferredRole !== (userProfile.preferredRole || '') ||
      editCountry !== (userProfile.country || '') ||
      editState !== (userProfile.state || '') ||
      editCity !== (userProfile.city || '') ||
      editLinkedin !== (userProfile.linkedin || '') ||
      editGithub !== (userProfile.github || '') ||
      editPortfolio !== (userProfile.portfolio || '') ||
      editLeetcode !== (userProfile.leetcode || '') ||
      editHackerrank !== (userProfile.hackerrank || '') ||
      editCodeforces !== (userProfile.codeforces || '')
    );
  }, [
    editDisplayName, editUsername, editBio,
    editCollege, editDegree, editDepartment, editYear, editGraduationYear, editSemester,
    editCareerGoal, editDreamCompany, editPreferredRole,
    editCountry, editState, editCity,
    editLinkedin, editGithub, editPortfolio, editLeetcode, editHackerrank, editCodeforces,
    userProfile
  ]);

  // Block exit with browser alert if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProfileDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
        return 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isProfileDirty]);

  // Profile Completion logic
  const completionDetails = useMemo(() => {
    const fields = [
      { key: 'displayName', value: editDisplayName },
      { key: 'username', value: editUsername },
      { key: 'bio', value: editBio },
      { key: 'college', value: editCollege },
      { key: 'degree', value: editDegree },
      { key: 'department', value: editDepartment },
      { key: 'graduationYear', value: editGraduationYear },
      { key: 'semester', value: editSemester },
      { key: 'careerGoal', value: editCareerGoal },
      { key: 'dreamCompany', value: editDreamCompany },
      { key: 'preferredRole', value: editPreferredRole },
      { key: 'country', value: editCountry },
      { key: 'state', value: editState },
      { key: 'city', value: editCity },
      { key: 'github', value: editGithub },
      { key: 'linkedin', value: editLinkedin },
      { key: 'portfolio', value: editPortfolio }
    ];

    let completedCount = 0;
    const suggestionsList: string[] = [];

    // Check avatar
    const hasAvatar = previewAvatar || (userProfile?.photoURL && !userProfile.photoURL.includes('api.dicebear.com/7.x/adventurer/svg?seed='));
    if (hasAvatar) {
      completedCount++;
    } else {
      suggestionsList.push('Upload a profile picture.');
    }

    fields.forEach(field => {
      if (field.value !== undefined && field.value !== null && String(field.value).trim() !== '') {
        completedCount++;
      } else {
        if (field.key === 'github') suggestionsList.push('Add your GitHub profile.');
        else if (field.key === 'linkedin') suggestionsList.push('Add your LinkedIn URL.');
        else if (field.key === 'portfolio') suggestionsList.push('Add your Portfolio Website.');
        else if (['college', 'degree', 'department'].includes(field.key) && !suggestionsList.includes('Complete your academic details.')) {
          suggestionsList.push('Complete your academic details.');
        } else if (['careerGoal', 'dreamCompany', 'preferredRole'].includes(field.key) && !suggestionsList.includes('Complete your career details.')) {
          suggestionsList.push('Complete your career details.');
        }
      }
    });

    const percentage = Math.round((completedCount / (fields.length + 1)) * 100);
    return { percentage, suggestions: suggestionsList };
  }, [
    editDisplayName, editUsername, editBio,
    editCollege, editDegree, editDepartment, editGraduationYear, editSemester,
    editCareerGoal, editDreamCompany, editPreferredRole,
    editCountry, editState, editCity,
    editLinkedin, editGithub, editPortfolio, previewAvatar, userProfile
  ]);

  // Save profile changes action
  const handleSaveProfile = async (silent = false) => {
    if (!editDisplayName.trim() || editDisplayName.length < 2 || editDisplayName.length > 50) {
      if (!silent) setErrorMessage('Full Name is required and must be between 2 and 50 characters.');
      return;
    }

    if (editUsername.trim()) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(editUsername.trim())) {
        if (!silent) setErrorMessage('Username can only contain letters, numbers, and underscores.');
        return;
      }
    }

    if (editBio.length > 200) {
      if (!silent) setErrorMessage('Bio cannot exceed 200 characters.');
      return;
    }

    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

    if (editPortfolio.trim() && !urlRegex.test(editPortfolio.trim())) {
      if (!silent) setErrorMessage('Portfolio must be a valid URL.');
      return;
    }

    if (editGithub.trim()) {
      const githubUrlRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;
      const githubHandleRegex = /^[a-zA-Z0-9_-]+$/;
      if (!githubUrlRegex.test(editGithub.trim()) && !githubHandleRegex.test(editGithub.trim())) {
        if (!silent) setErrorMessage('GitHub must be a valid profile URL or account handle.');
        return;
      }
    }

    if (editLinkedin.trim()) {
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/i;
      if (!linkedinRegex.test(editLinkedin.trim())) {
        if (!silent) setErrorMessage('LinkedIn must be a valid profile URL.');
        return;
      }
    }

    if (editGraduationYear.trim()) {
      const gradYearNum = Number(editGraduationYear);
      if (isNaN(gradYearNum) || gradYearNum < 1900 || gradYearNum > 2100) {
        if (!silent) setErrorMessage('Graduation Year must be a valid year.');
        return;
      }
    }

    if (!silent) {
      setSavingProfile(true);
      setErrorMessage(null);
      setSuccessMessage(null);
    }

    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: editDisplayName,
          username: editUsername,
          bio: editBio,
          college: editCollege,
          degree: editDegree,
          department: editDepartment,
          year: editYear,
          graduationYear: editGraduationYear,
          semester: editSemester,
          careerGoal: editCareerGoal,
          dreamCompany: editDreamCompany,
          preferredRole: editPreferredRole,
          country: editCountry,
          state: editState,
          city: editCity,
          linkedin: editLinkedin,
          github: editGithub,
          portfolio: editPortfolio,
          leetcode: editLeetcode,
          hackerrank: editHackerrank,
          codeforces: editCodeforces
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save changes.');
      }

      const data = await res.json();
      
      // Update global authStore state
      useAuthStore.setState({ userProfile: data.profile });

      if (silent) {
        console.log('[AUTO-SAVE] Profile auto-saved successfully.');
      } else {
        let msg = 'Profile updated successfully.';
        if (data.xpRewardGranted) {
          msg += ` (+20 XP Profile Completion Reward Claimed! 🎉)`;
        }
        if (data.leveledUp) {
          msg += ` Leveled Up to Level ${data.newLevel}! 🚀`;
        }
        setSuccessMessage(msg);
      }
    } catch (err: any) {
      console.error(err);
      if (!silent) {
        setErrorMessage(err.message || 'Failed to save profile changes.');
        // Rollback states
        if (userProfile) {
          setEditDisplayName(userProfile.displayName || '');
          setEditUsername(userProfile.username || '');
          setEditBio(userProfile.bio || '');
          setEditCollege(userProfile.college || '');
          setEditDegree(userProfile.degree || '');
          setEditDepartment(userProfile.department || '');
          setEditYear(userProfile.year || 1);
          setEditGraduationYear(userProfile.graduationYear || '');
          setEditSemester(userProfile.semester || '');
          setEditCareerGoal(userProfile.careerGoal || '');
          setEditDreamCompany(userProfile.dreamCompany || '');
          setEditPreferredRole(userProfile.preferredRole || '');
          setEditCountry(userProfile.country || '');
          setEditState(userProfile.state || '');
          setEditCity(userProfile.city || '');
          setEditLinkedin(userProfile.linkedin || '');
          setEditGithub(userProfile.github || '');
          setEditPortfolio(userProfile.portfolio || '');
          setEditLeetcode(userProfile.leetcode || '');
          setEditHackerrank(userProfile.hackerrank || '');
          setEditCodeforces(userProfile.codeforces || '');
        }
      }
    } finally {
      if (!silent) {
        setSavingProfile(false);
      }
    }
  };

  // Auto save effect
  useEffect(() => {
    if (!isAutoSaveEnabled || !isProfileDirty || savingProfile) return;

    const timer = setInterval(() => {
      console.log('[AUTO-SAVE] Triggering auto-save...');
      handleSaveProfile(true);
    }, 30000);

    return () => clearInterval(timer);
  }, [
    isAutoSaveEnabled, isProfileDirty, savingProfile,
    editDisplayName, editUsername, editBio,
    editCollege, editDegree, editDepartment, editYear, editGraduationYear, editSemester,
    editCareerGoal, editDreamCompany, editPreferredRole,
    editCountry, editState, editCity,
    editLinkedin, editGithub, editPortfolio, editLeetcode, editHackerrank, editCodeforces
  ]);

  if (!userProfile) return null;

  // Dicebear Avatar generator
  const getAvatarUrl = (visual: string) => {
    if (!visual) return 'https://api.dicebear.com/7.x/adventurer/svg?seed=programmer';
    if (visual.startsWith('http')) return visual;
    if (visual === 'ai_robot' || visual === 'martian' || visual === 'robot_cat' || visual === 'cyber_dog') {
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${visual}`;
    }
    if (visual === 'pixel_hero' || visual === '8bit_knight') {
      return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${visual}`;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${visual}`;
  };

  // Check ownership
  const isOwned = (item: CosmeticItem) => {
    let ownedList: string[] = [];
    if (item.category === 'avatar') ownedList = userProfile.unlockedAvatars || [];
    else if (item.category === 'ring') ownedList = userProfile.unlockedRings || [];
    else if (item.category === 'frame') ownedList = userProfile.unlockedFrames || [];
    else if (item.category === 'background') ownedList = userProfile.unlockedBackgrounds || [];
    else if (item.category === 'title') ownedList = userProfile.unlockedTitles || [];
    else if (item.category === 'theme') ownedList = userProfile.unlockedThemes || [];
    else if (item.category === 'emote') ownedList = userProfile.unlockedEmotes || [];
    else if (item.category === 'sticker') ownedList = userProfile.unlockedStickers || [];
    return ownedList.includes(item.id);
  };

  // Check if item is active equipped loadout
  const isEquipped = (item: CosmeticItem) => {
    if (item.category === 'avatar') return userProfile.equippedAvatar === item.id;
    if (item.category === 'ring') return userProfile.equippedRing === item.id;
    if (item.category === 'frame') return userProfile.equippedFrame === item.id;
    if (item.category === 'background') return userProfile.equippedBackground === item.id;
    if (item.category === 'title') return userProfile.equippedTitle === item.id;
    if (item.category === 'theme') return userProfile.equippedTheme === item.id;
    return false;
  };

  // Preview an inventory item locally
  const handlePreviewItem = (item: CosmeticItem) => {
    if (item.category === 'avatar') setPreviewAvatar(item.id);
    else if (item.category === 'ring') setPreviewRing(item.id);
    else if (item.category === 'frame') setPreviewFrame(item.id);
    else if (item.category === 'background') setPreviewBg(item.id);
    else if (item.category === 'title') setPreviewTitle(item.id);
  };

  // Filter owned catalog items
  const ownedItems = useMemo(() => {
    // Only fetch items the user owns
    let items = COSMETICS_CATALOG.filter(item => item.category === selectedCategory && isOwned(item));

    // Apply name search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      items = items.filter(item => item.rarity === rarityFilter);
    }

    // Apply favorites filter
    if (favoriteOnly) {
      items = items.filter(item => {
        if (!userProfile.favoriteItems) return false;
        const key = `${item.category}s` as keyof typeof userProfile.favoriteItems;
        const list = userProfile.favoriteItems[key] || [];
        return list.includes(item.id);
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      if (sortBy === 'favorites') {
        const getFavVal = (x: CosmeticItem) => {
          if (!userProfile.favoriteItems) return 0;
          const k = `${x.category}s` as keyof typeof userProfile.favoriteItems;
          const l = userProfile.favoriteItems[k] || [];
          return l.includes(x.id) ? 1 : 0;
        };
        return getFavVal(b) - getFavVal(a);
      }
      if (sortBy === 'newest') {
        const idxA = COSMETICS_CATALOG.findIndex(x => x.id === a.id);
        const idxB = COSMETICS_CATALOG.findIndex(x => x.id === b.id);
        return idxB - idxA;
      }
      if (sortBy === 'oldest') {
        const idxA = COSMETICS_CATALOG.findIndex(x => x.id === a.id);
        const idxB = COSMETICS_CATALOG.findIndex(x => x.id === b.id);
        return idxA - idxB;
      }
      if (sortBy === 'rarity') {
        const weights = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, secret: 6 };
        return weights[b.rarity] - weights[a.rarity];
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return items;
  }, [selectedCategory, searchQuery, rarityFilter, favoriteOnly, sortBy, userProfile]);

  const handleEquipItem = async (item: CosmeticItem) => {
    if (!isOwned(item)) {
      setErrorMessage("You do not own this cosmetic item!");
      return;
    }

    setEquippingId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Save previous state for rollback
    const previousProfile = { ...userProfile };

    // Perform optimistic update
    const category = item.category;
    const targetField = `equipped${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof UserProfile;
    
    const updatedProfile = {
      ...userProfile,
      [targetField]: item.id
    };

    if (category === 'avatar') {
      updatedProfile.photoURL = getAvatarUrl(item.visual);
    }

    useAuthStore.setState({ userProfile: updatedProfile });

    try {
      const res = await fetch('/api/auth/profile/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category: item.category, itemId: item.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to equip cosmetic.');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(`${item.name} equipped successfully.`);
    } catch (err: any) {
      console.error(err);
      useAuthStore.setState({ userProfile: previousProfile });
      setErrorMessage(err.message || 'Equip operation failed.');
    } finally {
      setEquippingId(null);
    }
  };

  const handleUnequipItem = async (item: CosmeticItem) => {
    setEquippingId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Save previous state for rollback
    const previousProfile = { ...userProfile };

    // Perform optimistic update
    const category = item.category;
    const targetField = `equipped${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof UserProfile;
    
    const updatedProfile = {
      ...userProfile,
      [targetField]: null
    };

    if (category === 'avatar') {
      updatedProfile.photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile.uid}`;
    }

    useAuthStore.setState({ userProfile: updatedProfile });

    try {
      const res = await fetch('/api/auth/profile/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category: item.category, itemId: null })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to unequip cosmetic.');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(`${item.name} unequipped successfully.`);
    } catch (err: any) {
      console.error(err);
      useAuthStore.setState({ userProfile: previousProfile });
      setErrorMessage(err.message || 'Unequip operation failed.');
    } finally {
      setEquippingId(null);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, item: CosmeticItem) => {
    e.stopPropagation();
    if (!isOwned(item)) {
      setErrorMessage("You cannot favorite locked cosmetics!");
      return;
    }

    setLoadingFavoriteId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Save previous state for rollback
    const previousProfile = { ...userProfile };

    // Perform optimistic update
    const favoriteItems = { ...(userProfile.favoriteItems || {}) };
    const key = `${item.category}s` as keyof typeof favoriteItems;
    let list = [...(favoriteItems[key] || [])];

    let isAdding = false;
    if (list.includes(item.id)) {
      list = list.filter((id: string) => id !== item.id);
    } else {
      list.push(item.id);
      isAdding = true;
    }
    favoriteItems[key] = list;

    const updatedProfile = {
      ...userProfile,
      favoriteItems
    };

    useAuthStore.setState({ userProfile: updatedProfile });

    try {
      const res = await fetch('/api/auth/profile/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle favorite.');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(isAdding ? `${item.name} added to favorites.` : `${item.name} removed from favorites.`);
    } catch (err: any) {
      console.error(err);
      useAuthStore.setState({ userProfile: previousProfile });
      setErrorMessage(err.message || 'Favorite toggle failed.');
    } finally {
      setLoadingFavoriteId(null);
    }
  };

  // Resolve preview title text dynamically
  const previewTitleItem = COSMETICS_CATALOG.find(i => i.id === previewTitle);
  const displayTitle = previewTitleItem ? previewTitleItem.visual : '';

  // Resolve preview avatar seed dynamically
  const previewAvatarItem = COSMETICS_CATALOG.find(i => i.id === previewAvatar);
  const displayAvatarSeed = previewAvatarItem ? previewAvatarItem.visual : previewAvatar;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-4 animate-fade-in">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">Locker Personalization</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Customize your public avatar, rings, frames, titles, and active themes.</p>
          </div>
        </div>

        {/* Go to Armory shortcut button */}
        <button
          onClick={() => navigate('/store')}
          className="px-4 py-2 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink text-white font-display font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <FaCoins className="w-3.5 h-3.5" />
          <span>Go to Armory</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-neon-pink/20 bg-neon-pink/5 text-xs text-neon-pink font-bold">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-neon-green/20 bg-neon-green/5 text-xs text-neon-green font-bold">
          🎉 {successMessage}
        </div>
      )}

      {/* Main Locker Grid layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column (4/12): Live preview loadout frame */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/10 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">
              Locker Layout
            </div>
            
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400">Card Preview</h3>

            {/* Profile preview template with responsive styles */}
            <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${getBackgroundClass(previewBg)} ${getFrameClass(previewFrame)}`}>
              <div className="flex flex-col items-center text-center space-y-4">
                
                {/* Ring outline wrapper */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(previewRing)}`}>
                    <img 
                      src={getAvatarUrl(displayAvatarSeed)} 
                      alt="Preview Avatar" 
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-neon-purple text-white border-2 border-bg-dark flex items-center justify-center text-[10px] font-black leading-none">
                    {userProfile.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-black text-lg text-white drop-shadow-md">
                    {editDisplayName.trim() ? editDisplayName : userProfile.displayName}
                  </h4>
                  {displayTitle && (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] text-neon-cyan font-bold uppercase tracking-widest shadow">
                      {displayTitle}
                    </span>
                  )}
                </div>

                {/* Grid stats details */}
                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/5 text-left">
                  <div className="bg-black/25 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Elo</p>
                    <p className="text-xs text-neon-cyan font-bold font-display">{userProfile.battleRating} ELO</p>
                  </div>
                  <div className="bg-black/25 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Readiness</p>
                    <p className="text-xs text-neon-green font-bold font-display">{userProfile.placementReadinessScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Equip owned cosmetics from your locker to customize how other cadets view your profile on Leaderboards and Battle Arenas.
            </p>
          </div>

          {/* Live Bio/About & Socials preview below avatar card preview */}
          {selectedCategory === 'edit_profile' && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">
                Live Public Preview
              </h3>
              
              {/* Bio text */}
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">About Me</p>
                <p className="text-xs text-gray-300 leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap">
                  {editBio.trim() ? editBio : 'No bio written yet. Introduce yourself to other cadets...'}
                </p>
              </div>

              {/* Academic credentials preview */}
              <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Academic Credentials</p>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1 text-[11px] text-gray-300">
                  <p className="font-semibold text-white truncate">🏫 {editCollege || 'College not specified'}</p>
                  <p className="text-gray-400">🎓 {editDegree || 'Degree'} ({editDepartment || 'Branch'})</p>
                  <p className="text-gray-500">Year {editYear} • Sem {editSemester || 'N/A'} • Class of {editGraduationYear || 'N/A'}</p>
                </div>
              </div>

              {/* Career Goals preview */}
              <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Career Objectives</p>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1 text-[11px] text-gray-300">
                  <p className="font-semibold text-white">💼 Goal: <span className="text-neon-cyan font-bold">{editCareerGoal || 'Not specified'}</span></p>
                  <p className="text-gray-400">🏢 Target: <span className="text-neon-pink font-bold uppercase">{editDreamCompany || 'Any Tier-1'}</span></p>
                  <p className="text-gray-500">🏷️ Role: <span className="text-neon-purple font-semibold">{editPreferredRole || 'Developer'}</span></p>
                </div>
              </div>

              {/* Social icons preview */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Social Links</p>
                <div className="flex flex-wrap gap-2.5">
                  {editLinkedin.trim() && (
                    <a href={editLinkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-neon-cyan/20 border border-white/5 text-neon-cyan transition-colors" title="LinkedIn">
                      🔗 LinkedIn
                    </a>
                  )}
                  {editGithub.trim() && (
                    <a href={editGithub.startsWith('http') ? editGithub : `https://github.com/${editGithub}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 text-white transition-colors" title="GitHub">
                      💻 GitHub
                    </a>
                  )}
                  {editPortfolio.trim() && (
                    <a href={editPortfolio} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-neon-purple/20 border border-white/5 text-neon-purple transition-colors" title="Portfolio">
                      🌐 Website
                    </a>
                  )}
                  {editLeetcode.trim() && (
                    <a href={editLeetcode.startsWith('http') ? editLeetcode : `https://leetcode.com/${editLeetcode}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-neon-orange/20 border border-white/5 text-neon-orange transition-colors" title="LeetCode">
                      🏆 LeetCode
                    </a>
                  )}
                  {editHackerrank.trim() && (
                    <a href={editHackerrank.startsWith('http') ? editHackerrank : `https://hackerrank.com/${editHackerrank}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-neon-green/20 border border-white/5 text-neon-green transition-colors" title="HackerRank">
                      🎯 HackerRank
                    </a>
                  )}
                  {editCodeforces.trim() && (
                    <a href={editCodeforces.startsWith('http') ? editCodeforces : `https://codeforces.com/profile/${editCodeforces}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-neon-pink/20 border border-white/5 text-neon-pink transition-colors" title="Codeforces">
                      ⚔️ Codeforces
                    </a>
                  )}
                  {!editLinkedin.trim() && !editGithub.trim() && !editPortfolio.trim() && !editLeetcode.trim() && !editHackerrank.trim() && !editCodeforces.trim() && (
                    <p className="text-[10px] text-gray-500 italic">No social links configured yet.</p>
                  )}
                </div>
              </div>

              {/* Location badge */}
              {(editCity || editState || editCountry) && (
                <div className="text-[9px] text-gray-500 font-semibold font-mono text-right">
                  📍 {[editCity, editState, editCountry].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column (8/12): Tabs, inventory items, filters */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Locker filter container */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            
            {/* Tab scroll horizontal bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory border-b border-white/5">
              {[
                { id: 'edit_profile', label: '📝 Edit Profile' },
                { id: 'avatar', label: '🧑 Avatars' },
                { id: 'ring', label: '💍 Rings' },
                { id: 'frame', label: '🖼 Frames' },
                { id: 'background', label: '🎨 Backgrounds' },
                { id: 'title', label: '🏆 Titles' },
                { id: 'theme', label: '🌈 App Themes' },
                { id: 'emote', label: '😊 Emotes' },
                { id: 'sticker', label: '💬 Stickers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer snap-start shrink-0 ${
                    selectedCategory === tab.id
                      ? 'bg-white/10 text-white border border-white/10 shadow'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs: Search owned, rarity, favorites, sort */}
            {selectedCategory !== 'edit_profile' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                
                {/* Name search query */}
                <div className="relative">
                  <FaMagnifyingGlass className="absolute left-3 top-3.5 text-gray-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Filter owned items..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all duration-300"
                  />
                </div>

                {/* Rarity filter selection */}
                <div>
                  <select
                    value={rarityFilter}
                    onChange={e => setRarityFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                  >
                    <option value="all">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="mythic">Mythic</option>
                    <option value="secret">Secret</option>
                  </select>
                </div>

                {/* Sort Selection details */}
                <div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                  >
                    <option value="favorites">Favorites First</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="rarity">Rarity</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>

                {/* Favorites toggle toggle badge button */}
                <button
                  onClick={() => setFavoriteOnly(!favoriteOnly)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                    favoriteOnly
                      ? 'border-yellow-500/35 bg-yellow-500/10 text-yellow-400'
                      : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                  }`}
                >
                  <FaStar className={`w-3.5 h-3.5 ${favoriteOnly ? 'text-yellow-500' : 'text-gray-500'}`} />
                  <span>Favorites Only</span>
                </button>
              </div>
            )}
          </div>

          {selectedCategory === 'edit_profile' ? (
            /* Render Edit Profile Forms */
            <div className="space-y-6">
              
              {/* Profile Completion Card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5 flex-1 w-full">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                      <span>Profile Completion Quotient</span>
                      <span className="text-neon-cyan">{completionDetails.percentage}%</span>
                    </div>
                    {/* Linear Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan transition-all duration-500 rounded-full" 
                        style={{ width: `${completionDetails.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Auto-Save Toggle */}
                  <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2 rounded-xl border border-white/5 select-none shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAutoSaveEnabled} 
                        onChange={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neon-cyan peer-checked:after:bg-black"></div>
                    </label>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">30s Auto-Save</span>
                  </div>
                </div>

                {/* Completion Suggestions list */}
                {completionDetails.suggestions.length > 0 && (
                  <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <h5 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Suggestions for +20 XP Reward</h5>
                    <ul className="text-[11px] text-gray-500 space-y-1 font-medium list-disc pl-4">
                      {completionDetails.suggestions.slice(0, 3).map((s, idx) => (
                        <li key={idx} className="hover:text-gray-400 transition-colors">{s}</li>
                      ))}
                      {completionDetails.suggestions.length > 3 && (
                        <li>And {completionDetails.suggestions.length - 3} more suggestions...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Editable Cards Section */}
              <div className="space-y-4">
                
                {/* 1. Personal Info Card */}
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                  <button 
                    type="button"
                    onClick={() => toggleCard('personal')}
                    className="w-full flex justify-between items-center p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors border-b border-white/5 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">👤</span>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">Personal Information</h4>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">{expandedCards.personal ? '▲' : '▼'}</span>
                  </button>
                  {expandedCards.personal && (
                    <div className="p-5 bg-black/10 space-y-2.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingInput 
                          label="Full Name" 
                          value={editDisplayName} 
                          onChange={setEditDisplayName} 
                          required 
                          maxLength={50}
                        />
                        <FloatingInput 
                          label="Username" 
                          value={editUsername} 
                          onChange={setEditUsername} 
                          maxLength={30}
                        />
                      </div>
                      <FloatingTextarea 
                        label="Bio / About Me (Maximum 200 characters)" 
                        value={editBio} 
                        onChange={setEditBio} 
                        maxLength={200}
                        rows={3}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FloatingInput 
                          label="City" 
                          value={editCity} 
                          onChange={setEditCity} 
                          maxLength={50}
                        />
                        <FloatingInput 
                          label="State" 
                          value={editState} 
                          onChange={setEditState} 
                          maxLength={50}
                        />
                        <FloatingInput 
                          label="Country" 
                          value={editCountry} 
                          onChange={setEditCountry} 
                          maxLength={50}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Academic Info Card */}
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                  <button 
                    type="button"
                    onClick={() => toggleCard('academic')}
                    className="w-full flex justify-between items-center p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors border-b border-white/5 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">🎓</span>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">Academic Information</h4>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">{expandedCards.academic ? '▲' : '▼'}</span>
                  </button>
                  {expandedCards.academic && (
                    <div className="p-5 bg-black/10 space-y-4">
                      <FloatingInput 
                        label="College / University" 
                        value={editCollege} 
                        onChange={setEditCollege} 
                        maxLength={100}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingInput 
                          label="Degree" 
                          value={editDegree} 
                          onChange={setEditDegree} 
                          maxLength={50}
                          placeholder="e.g. B.Tech, B.E."
                        />
                        <FloatingInput 
                          label="Department / Branch" 
                          value={editDepartment} 
                          onChange={setEditDepartment} 
                          maxLength={50}
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Year of study select */}
                        <div className="relative w-full mb-4">
                          <select
                            value={editYear}
                            onChange={(e) => setEditYear(Number(e.target.value))}
                            className="w-full px-3.5 pt-5.5 pb-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-neon-purple transition-all duration-300 cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5].map(y => (
                              <option key={y} value={y} className="bg-bg-dark text-white">Year {y}</option>
                            ))}
                          </select>
                          <label className="absolute left-3.5 top-1.5 pointer-events-none text-[8px] text-neon-purple font-black uppercase tracking-wider">
                            Year of Study
                          </label>
                        </div>

                        <FloatingInput 
                          label="Current Semester" 
                          value={editSemester} 
                          onChange={setEditSemester} 
                          maxLength={10}
                          placeholder="e.g. 7th"
                        />
                        <FloatingInput 
                          label="Graduation Year" 
                          value={editGraduationYear} 
                          onChange={setEditGraduationYear} 
                          maxLength={4}
                          placeholder="e.g. 2026"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Career Information Card */}
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                  <button 
                    type="button"
                    onClick={() => toggleCard('career')}
                    className="w-full flex justify-between items-center p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors border-b border-white/5 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">💼</span>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">Career Information</h4>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">{expandedCards.career ? '▲' : '▼'}</span>
                  </button>
                  {expandedCards.career && (
                    <div className="p-5 bg-black/10 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FloatingInput 
                          label="Career Goal" 
                          value={editCareerGoal} 
                          onChange={setEditCareerGoal} 
                          maxLength={100}
                          placeholder="e.g. Software Engineer"
                        />
                        <FloatingInput 
                          label="Dream Company" 
                          value={editDreamCompany} 
                          onChange={setEditDreamCompany} 
                          maxLength={50}
                          placeholder="e.g. Google"
                        />
                        <FloatingInput 
                          label="Preferred Job Role" 
                          value={editPreferredRole} 
                          onChange={setEditPreferredRole} 
                          maxLength={50}
                          placeholder="e.g. Fullstack Engineer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Social Links Card */}
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                  <button 
                    type="button"
                    onClick={() => toggleCard('socials')}
                    className="w-full flex justify-between items-center p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors border-b border-white/5 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">🌐</span>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">Social Profiles</h4>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">{expandedCards.socials ? '▲' : '▼'}</span>
                  </button>
                  {expandedCards.socials && (
                    <div className="p-5 bg-black/10 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FloatingInput 
                          label="LinkedIn Profile URL" 
                          value={editLinkedin} 
                          onChange={setEditLinkedin} 
                          placeholder="https://linkedin.com/in/username"
                        />
                        <FloatingInput 
                          label="GitHub Username or URL" 
                          value={editGithub} 
                          onChange={setEditGithub} 
                          placeholder="https://github.com/username"
                        />
                        <FloatingInput 
                          label="Portfolio Website URL" 
                          value={editPortfolio} 
                          onChange={setEditPortfolio} 
                          placeholder="https://myportfolio.com"
                        />
                        <FloatingInput 
                          label="LeetCode Username" 
                          value={editLeetcode} 
                          onChange={setEditLeetcode} 
                          placeholder="Username only"
                        />
                        <FloatingInput 
                          label="HackerRank Username" 
                          value={editHackerrank} 
                          onChange={setEditHackerrank} 
                          placeholder="Username only"
                        />
                        <FloatingInput 
                          label="Codeforces Handle" 
                          value={editCodeforces} 
                          onChange={setEditCodeforces} 
                          placeholder="Handle only"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Form Action Controls */}
              <div className="flex justify-end gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isProfileDirty && !window.confirm('Are you sure you want to discard unsaved changes?')) {
                      return;
                    }
                    navigate('/profile');
                  }}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold font-display uppercase tracking-wider cursor-pointer transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => handleSaveProfile(false)}
                  className={`px-8 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all duration-300 flex items-center gap-2 ${
                    savingProfile 
                      ? 'bg-neon-purple/50 border border-neon-purple/50 text-white/50 cursor-not-allowed'
                      : 'bg-gradient-to-tr from-neon-purple to-neon-pink text-white hover:scale-105 active:scale-95 shadow-neon-purple/20'
                  }`}
                >
                  {savingProfile ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {ownedItems.map(item => {
                const active = isEquipped(item);
                const previewing = (item.category === 'avatar' && previewAvatar === item.id) ||
                                   (item.category === 'ring' && previewRing === item.id) ||
                                   (item.category === 'frame' && previewFrame === item.id) ||
                                   (item.category === 'background' && previewBg === item.id) ||
                                   (item.category === 'title' && previewTitle === item.id);

                const isFavorite = userProfile.favoriteItems &&
                                   userProfile.favoriteItems[`${item.category}s` as keyof typeof userProfile.favoriteItems]?.includes(item.id);

                const favoriteLoading = loadingFavoriteId === item.id;
                const equipLoading = equippingId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePreviewItem(item)}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      previewing
                        ? 'border-neon-purple bg-neon-purple/5 shadow-lg shadow-neon-purple/10'
                        : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Favorite star tag indicator */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, item)}
                      disabled={favoriteLoading}
                      className="absolute top-2.5 right-2.5 z-10 text-gray-500 hover:text-yellow-400 transition-colors p-1 disabled:opacity-50 cursor-pointer"
                    >
                      {favoriteLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin block"></span>
                      ) : (
                        <FaStar className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-400' : 'text-gray-600'}`} />
                      )}
                    </button>

                    <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
                      
                      {/* Visual box render depending on category */}
                      <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                        {item.category === 'avatar' && (
                          <img src={getAvatarUrl(item.visual)} alt={item.name} className="w-12 h-12 rounded-full" />
                        )}
                        {item.category === 'ring' && (
                          <div className={`w-12 h-12 rounded-full border bg-zinc-800 ${getRingClass(item.id)}`} />
                        )}
                        {item.category === 'background' && (
                          <div className={`w-12 h-12 rounded-lg border ${getBackgroundClass(item.id)}`} />
                        )}
                        {item.category === 'frame' && (
                          <div className={`w-12 h-12 border ${getFrameClass(item.id)}`} />
                        )}
                        {item.category === 'title' && (
                          <span className="text-[10px] text-neon-cyan font-bold tracking-wider uppercase border border-neon-cyan/20 px-1 py-0.5 rounded">T</span>
                        )}
                        {item.category === 'emote' && (
                          <span className="text-2xl font-bold font-display leading-none">{item.visual}</span>
                        )}
                        {item.category === 'sticker' && (
                          <span className="text-3xl font-display leading-none">{item.visual}</span>
                        )}
                        {item.category === 'theme' && (
                          <span className="text-xl font-display leading-none">🌈</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-display font-bold text-xs text-white truncate max-w-[130px]">{item.name}</h4>
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[7px] font-black uppercase tracking-wider ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Equip triggers */}
                    <div className="pt-2 border-t border-white/5">
                      {active ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnequipItem(item);
                          }}
                          disabled={equipLoading}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green hover:bg-neon-pink/10 hover:border-neon-pink/20 hover:text-neon-pink text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                        >
                          {equipLoading ? (
                            <span className="w-3 h-3 border-2 border-neon-pink/20 border-t-neon-pink rounded-full animate-spin"></span>
                          ) : (
                            <>
                              <FaCircleCheck className="w-3 h-3" />
                              <span>Equipped</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipItem(item);
                          }}
                          disabled={equipLoading}
                          className="w-full py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-display font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {equipLoading && (
                            <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                          )}
                          <span>{equipLoading ? 'Equipping...' : 'Equip'}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {ownedItems.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-3 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <p className="text-sm text-gray-400 font-medium">No owned cosmetics found in this locker category.</p>
                  <button
                    onClick={() => navigate('/store')}
                    className="px-4 py-2 rounded-xl border border-neon-purple/35 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    Browse Store for unlocks
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Personalization;
