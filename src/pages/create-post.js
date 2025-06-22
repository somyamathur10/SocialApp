import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/navbar';
import { v4 as uuidv4 } from 'uuid';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Protect route: only logged-in usersnpm 
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login-signup');
      } else {
        setUser(user);
      }
    };

    checkUser();
  }, []);

  const handleImageSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !user) return;

    setUploading(true);
    let imageUrl = null;

    // 1. Upload image if one is selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('post_images')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        setUploading(false);
        return;
      }
      imageUrl = data.path;
    }

    // 2. Create the post with the optional image URL
    const { error: postError } = await supabase.from('posts').insert({
      content,
      user_id: user.id,
      like_count: 0,
      image_url: imageUrl,
    });

    setUploading(false);

    if (postError) {
      alert('Error creating post: ' + postError.message);
    } else {
      alert('Post created!');
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      router.push('/');
    }
  };

  return (
    <>
      <Head>
        <title>Create Post | The Future University</title>
      </Head>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Create a New Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            rows="5"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 text-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Image preview" className="rounded-lg w-full object-cover" />
            </div>
          )}

          <div>
            <label htmlFor="image-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
              Select Image
            </label>
            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
