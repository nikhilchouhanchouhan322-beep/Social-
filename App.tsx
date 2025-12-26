
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Feed from './components/Feed';
import Navigation from './components/Navigation';
import Portal from './components/Portal';
import { User, Post, Comment } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize data
  useEffect(() => {
    const savedUser = localStorage.getItem('golden_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    const savedPosts = localStorage.getItem('golden_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // Seed initial posts
      const initialPosts: Post[] = [
        {
          id: '1',
          author: 'Founder',
          text: 'Welcome to the Golden Universe. Here, every thought is worth its weight in gold.',
          timestamp: Date.now(),
          likes: 7,
          likedBy: ['AI_Guide', 'Zara_Universe'],
          comments: []
        },
        {
          id: '2',
          author: 'AI_Guide',
          text: 'Use the Universe Search in the top right to explore souls across the globe.',
          timestamp: Date.now() - 10000,
          likes: 12,
          likedBy: ['Founder'],
          comments: []
        }
      ];
      setPosts(initialPosts);
      localStorage.setItem('golden_posts', JSON.stringify(initialPosts));
    }
  }, []);

  const handleLogin = (username: string) => {
    const newUser = { username, joinedAt: Date.now() };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('golden_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('golden_user');
  };

  const addPost = (text: string, image?: string) => {
    if (!user) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: user.username,
      text,
      image,
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
      comments: []
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('golden_posts', JSON.stringify(updatedPosts));
  };

  const toggleLike = (postId: string) => {
    if (!user) return;
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likedBy.includes(user.username);
        const newLikedBy = isLiked 
          ? p.likedBy.filter(u => u !== user.username)
          : [...p.likedBy, user.username];
        return { ...p, likedBy: newLikedBy, likes: newLikedBy.length };
      }
      return p;
    });
    setPosts(updatedPosts);
    localStorage.setItem('golden_posts', JSON.stringify(updatedPosts));
  };

  const addComment = (postId: string, text: string) => {
    if (!user || !text.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: user.username,
      text,
      timestamp: Date.now()
    };
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    setPosts(updatedPosts);
    localStorage.setItem('golden_posts', JSON.stringify(updatedPosts));
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full max-w-lg sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-black italic gold-text tracking-tighter">GOLDEN</h1>
        <button 
          onClick={() => setIsPortalOpen(true)}
          className="w-12 h-12 rounded-full border-2 border-[#ffd700] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:scale-110 transition-transform cursor-pointer bg-black/50"
        >
          🌍
        </button>
      </header>

      {/* Main Feed Container */}
      <main className="w-full max-w-lg px-4 pb-24 pt-4">
        <Feed 
          user={user!} 
          posts={posts} 
          onAddPost={addPost} 
          onToggleLike={toggleLike}
          onAddComment={addComment}
        />
      </main>

      {/* Navigation */}
      <Navigation onLogout={handleLogout} />

      {/* Universe Search Portal */}
      {isPortalOpen && <Portal onClose={() => setIsPortalOpen(false)} activePosts={posts} currentUser={user!} />}
    </div>
  );
};

export default App;
