import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/navbar';
import { avatars } from '../components/predefinedAvatars';
import Avatar from '../components/Avatar';

// A new modal component for selecting a predefined avatar
function AvatarSelectorModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Choose your Avatar</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(avatars).map(([id, AvatarComponent]) => (
            <div
              key={id}
              onClick={() => onSelect(id)}
              className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <AvatarComponent className="w-24 h-24" />
            </div>
          ))}
        </div>
        <div className="text-right mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', bio: '', username: '', avatar_url: '' });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login-signup');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('name, bio, username, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) setProfile(data);
      else if (error) console.error('Error fetching profile:', error);
      setLoading(false);
    };
    fetchUserAndProfile();
  }, [router]);

  const handleUpdateAvatar = async (avatarIdentifier) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarIdentifier })
      .eq('id', user.id);
    if (error) {
      alert('Error updating avatar: ' + error.message);
    } else {
      setProfile({ ...profile, avatar_url: avatarIdentifier });
      setIsAvatarModalOpen(false);
    }
  };

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleSave = async () => {
    if (!user || !editingField) return;
    const { error } = await supabase
      .from('profiles')
      .update({ [editingField]: tempValue })
      .eq('id', user.id);
    if (error) {
      alert('Failed to update: ' + error.message);
    } else {
      setProfile({ ...profile, [editingField]: tempValue });
      setEditingField(null);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      await handleUpdateAvatar(fileName);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const renderField = (field, label) => {
    const isEditing = editingField === field;
    const value = profile[field] || 'Not set';
    return (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 flex text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
          {isEditing ? (
            <div className="flex-grow">
              <input type="text" value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
              <div className="mt-2 space-x-2">
                <button onClick={handleSave} className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                <button onClick={handleCancel} className="px-4 py-1 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex justify-between items-center">
              <span>{value}</span>
              <button onClick={() => handleEdit(field, profile[field])} className="font-medium text-blue-600 hover:text-blue-500">Edit</button>
            </div>
          )}
        </dd>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-20"><p className="text-xl">Loading profile...</p></div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Your Profile | The Future University</title>
      </Head>
      <Navbar />
      {isAvatarModalOpen && <AvatarSelectorModal onSelect={handleUpdateAvatar} onClose={() => setIsAvatarModalOpen(false)} />}
      <div className="max-w-4xl mx-auto mt-8 p-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex flex-col items-center text-center">
            <Avatar url={profile.avatar_url} size={150} />
            <div className="mt-4 flex space-x-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
              />
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700"
              >
                Choose from Library
              </button>
            </div>
            <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-100 mt-4">
              {profile.name || 'Your Profile'}
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                  {user?.email}
                </dd>
              </div>
              {renderField('name', 'Full Name')}
              {renderField('username', 'Username')}
              {renderField('bio', 'Bio')}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
