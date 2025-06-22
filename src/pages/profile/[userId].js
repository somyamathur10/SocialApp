import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/navbar';
import Avatar from '../../components/Avatar';

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = router.query;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('name, username, bio')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError('Could not find user profile.');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading profile... | The Future University</title>
        </Head>
        <Navbar />
        <div className="text-center mt-20"><p className="text-xl">Loading profile...</p></div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error | The Future University</title>
        </Head>
        <Navbar />
        <div className="text-center mt-20">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{profile.name ? `${profile.name}'s Profile` : 'User Profile'} | The Future University</title>
      </Head>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 p-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
              {profile.name ? `${profile.name}'s Profile` : 'User Profile'}
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                  {profile.name || 'N/A'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                  {profile.username ? `@${profile.username}` : 'N/A'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                  {profile.bio || 'This user has not set a bio yet.'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
} 