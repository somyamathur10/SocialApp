-- This script is now IDEMPOTENT, meaning it can be run multiple times without causing errors.

-- 1. PROFILES TABLE
-- This table stores public user data. Users can read all profiles, but only edit their own.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT id_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
CREATE POLICY "Public can read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. POSTS TABLE
-- This table stores all posts. Users can read all posts, but only create/delete their own.
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read posts" ON public.posts;
CREATE POLICY "Public can read posts" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 3. LIKES TABLE
-- This table tracks likes from each user on each post.
CREATE TABLE IF NOT EXISTS public.likes (
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT likes_pkey PRIMARY KEY (post_id, user_id),
  CONSTRAINT post_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT user_id_fk_likes FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read like data" ON public.likes;
CREATE POLICY "Public can read like data" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.likes;
CREATE POLICY "Users can manage their own likes" ON public.likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. STORAGE BUCKETS
-- Create a bucket for Avatars and one for Post Images. (This is already idempotent)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post_images', 'post_images', true) ON CONFLICT (id) DO NOTHING;
-- Set up RLS policies for Avatars bucket
DROP POLICY IF EXISTS "Public read for avatars" ON storage.objects;
CREATE POLICY "Public read for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
DROP POLICY IF EXISTS "Users can manage their own avatar" ON storage.objects;
CREATE POLICY "Users can manage their own avatar" ON storage.objects FOR ALL TO authenticated USING (auth.uid() = owner_id::uuid);
-- Set up RLS policies for Post Images bucket
DROP POLICY IF EXISTS "Public read for post images" ON storage.objects;
CREATE POLICY "Public read for post images" ON storage.objects FOR SELECT USING (bucket_id = 'post_images');
DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
CREATE POLICY "Authenticated users can upload post images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
DROP POLICY IF EXISTS "Users can manage their own post images" ON storage.objects;
CREATE POLICY "Users can manage their own post images" ON storage.objects FOR ALL TO authenticated USING (auth.uid() = owner_id::uuid);


-- 5. DATABASE FUNCTIONS (These are already idempotent via CREATE OR REPLACE)
-- Function to create a profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (new.id, new.raw_user_meta_data->>'name', 'user_' || substr(new.id::text, 1, 6));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to add a like to a post
CREATE OR REPLACE FUNCTION public.add_like(post_id_input uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.likes (post_id, user_id, count)
  VALUES (post_id_input, auth.uid(), 1)
  ON CONFLICT (post_id, user_id)
  DO UPDATE SET count = likes.count + 1, updated_at = NOW();
  UPDATE public.posts SET like_count = like_count + 1 WHERE id = post_id_input;
END;
$$;
-- Function to securely delete a post
CREATE OR REPLACE FUNCTION public.delete_post(post_id_input uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.posts WHERE id = post_id_input AND user_id = auth.uid()) THEN
    DELETE FROM public.posts WHERE id = post_id_input;
  ELSE
    RAISE EXCEPTION 'You are not authorized to delete this post.';
  END IF;
END;
$$;

-- 6. TRIGGERS & PERMISSIONS
-- Trigger to execute `handle_new_user` on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.add_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_post(uuid) TO authenticated;