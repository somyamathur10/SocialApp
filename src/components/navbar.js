import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

// A simple sun icon for light mode
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// A simple moon icon for dark mode
const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login-signup');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              The Future University
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {user && (
                <Link href="/create-post" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Create Post
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              {user ? (
                <div className="ml-3 flex items-center">
                  <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login-signup" className="ml-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
          {/* Mobile menu button can be added here if needed */}
        </div>
      </div>
    </nav>
  );
}
