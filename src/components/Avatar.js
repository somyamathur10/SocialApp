import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { avatars } from './predefinedAvatars';

export default function Avatar({ url, size = 40 }) {
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Check if the URL is a predefined avatar ID (e.g., 'avatar1')
  const isPredefined = url && avatars[url];
  const PredefinedAvatarComponent = isPredefined ? avatars[url] : null;

  useEffect(() => {
    // If it's not a predefined avatar and a URL is provided, treat it as an uploaded file path.
    if (!isPredefined && url) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(url);
      setAvatarUrl(data.publicUrl);
    }
  }, [url, isPredefined]);

  // Render the predefined SVG if it matches
  if (isPredefined) {
    return <PredefinedAvatarComponent style={{ height: size, width: size }} className="rounded-full" />;
  }
  
  // Render the uploaded image if a URL is constructed
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="User Avatar"
        className="rounded-full"
        style={{ height: size, width: size, objectFit: 'cover' }}
      />
    );
  }

  // Render a default placeholder if no avatar is set
  return <div className="rounded-full bg-gray-300 dark:bg-gray-600" style={{ height: size, width: size }} />;
} 