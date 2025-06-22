# The Future University - Social Feed Project

A simple social media web application built with Next.js and Supabase. Users can sign up, create posts with text and images, and interact with content from others.

## Features

*   **User Authentication:** Sign up, log in, and manage your account.
*   **Create & View Posts:** Create text posts with an optional image. View all posts in a global feed.
*   **"Like" Posts:** Show appreciation for posts by "liking" them. You can like a post multiple times.
*   **User Profiles:** Customize your name, username, bio, and choose a profile avatar.
*   **Delete Your Content:** Users can delete their own posts.
*   **Light & Dark Mode:** Toggle between light and dark themes.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Backend & DB:** [Supabase](https://supabase.io/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   Node.js and npm (or yarn/pnpm)
*   A free [Supabase](https://supabase.io/) account

### 1. Set Up Supabase

*   Go to the [Supabase Dashboard](https://app.supabase.io) and create a new project.
*   Once your project is created, navigate to **Project Settings** > **API**.
*   Find your **Project URL** and your **`anon` public key**. You'll need these for the next step.

### 2. Configure Your Local Environment

*   Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```
*   Install the necessary dependencies:
    ```bash
    npm install
    ```
*   Create a new file named `.env.local` in the root of your project.
*   Add your Supabase API credentials to the `.env.local` file:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the values you copied from your Supabase project settings.

### 3. Set Up the Database

*   In your Supabase project dashboard, navigate to the **SQL Editor**.
*   Click **+ New query**.
*   Open the `supabase_setup/setup.sql` file from this repository, copy its entire content.
*   Paste the content into the Supabase SQL Editor and click **RUN**. This will create all the necessary tables, functions, and storage policies.

### 4. Run the Application

*   Start the development server:
    ```bash
    npm run dev
    ```
*   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

That's it! You should now have a fully functional version of the social feed app running locally.
