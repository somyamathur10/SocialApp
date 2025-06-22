import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/navbar';
import Link from 'next/link';
import Head from 'next/head';
import Avatar from '../components/Avatar';

// Helper component to render post images
function PostImage({ imageUrl }) {
  const [fullUrl, setFullUrl] = useState(null);

  useEffect(() => {
    if (imageUrl) {
      const { data } = supabase.storage.from('post-images').getPublicUrl(imageUrl);
      setFullUrl(data.publicUrl);
    }
  }, [imageUrl]);

  if (!fullUrl) return null;

  return (
    <div className="mt-4 -mx-6 sm:-mx-6">
      <img src={fullUrl} alt="Post image" className="w-full object-cover" />
    </div>
  );
}

export default function Home({ initialPosts, serverError }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (serverError) {
      console.error("Error from server:", serverError);
      alert("Could not load posts. Please try again later.");
    }
  }, [serverError]);

  useEffect(() => {
    // This effect's job is to get the current user
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Initial user fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleClap = async (postId) => {
    if (!user) {
      alert('You must be logged in to clap for a post.');
      router.push('/login-signup');
      return;
    }

    // Optimistic UI Update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          like_count: p.like_count + 1,
          user_clap_count: (p.user_clap_count || 0) + 1,
        };
      }
      return p;
    }));

    const { error } = await supabase.rpc('add_clap', { post_id_input: postId });

    if (error) {
      console.error('Error clapping for post:', error);
      alert('Error: ' + error.message);
      fetchPosts(); // Revert on error
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const { error } = await supabase.rpc('delete_post', { post_id_input: postId });

    if (error) {
      console.error('Error deleting post:', error);
      alert('Error: ' + error.message);
    } else {
      // Remove the post from the local state to update the UI instantly
      setPosts(posts.filter(p => p.id !== postId));
      alert('Post deleted successfully.');
    }
  };

  // This derives the final posts to be rendered. It re-runs when user or initialPosts change.
  const processedPosts = posts.map(post => {
    const userLike = user ? post.likes.find(like => like.user_id === user.id) : null;
    return {
      ...post,
      user_clap_count: userLike ? userLike.clap_count : 0,
    };
  });

  return (
    <>
      <Head>
        <title>Home Feed | The Future University</title>
      </Head>
      <Navbar />
      <main className="max-w-4xl mx-auto mt-8 px-4">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800 dark:text-gray-200">
          🌍 Global Feed
        </h1>

        {processedPosts.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p className="text-2xl">No posts yet.</p>
            <p className="text-lg">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {processedPosts.map((post) => (
              <div
                key={post.id}
                className="relative bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                {user && user.id === post.user_id && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    title="Delete post"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <div className="flex items-center mb-4">
                  <Avatar url={post.profiles?.avatar_url} size={40} />
                  <div className="ml-4">
                    <Link href={`/profile/${post.user_id}`} className="hover:underline">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {post.profiles?.name || 'Anonymous'}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{post.profiles?.username || `user_${post.user_id.substring(0, 6)}`}{' '}
                      &middot; {new Date(post.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className="text-xl text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>
                <PostImage imageUrl={post.image_url} />
                <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-2">
                    <span className="text-xl">👏</span>
                    <span>{post.like_count}</span>
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => handleClap(post.id)}
                      className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-blue-600"
                    >
                      Clap
                    </button>
                    {post.user_clap_count > 0 && (
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        +{post.user_clap_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export async function getServerSideProps() {
  console.log("Fetching posts on server...");
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, content, like_count, created_at, user_id, image_url,
      profiles!left ( name, username, avatar_url ),
      likes ( user_id, clap_count )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error in getServerSideProps:', error.message);
    return { props: { initialPosts: [], serverError: error.message } };
  }
  
  console.log(`Successfully fetched ${posts.length} posts.`);
  
  return {
    props: {
      initialPosts: posts,
    },
  };
}