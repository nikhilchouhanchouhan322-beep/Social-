
import React, { useState, useRef } from 'react';
import { Post, User } from '../types';
import PostCard from './PostCard';
import GeminiService from '../services/geminiService';

interface FeedProps {
  user: User;
  posts: Post[];
  onAddPost: (text: string, image?: string) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

const Feed: React.FC<FeedProps> = ({ user, posts, onAddPost, onToggleLike, onAddComment }) => {
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!inputText.trim() && !previewImage) return;
    onAddPost(inputText, previewImage || undefined);
    setInputText('');
    setPreviewImage(null);
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const thought = await GeminiService.generateGoldThought();
      setInputText(thought);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="overflow-hidden bg-[#ffd700]/10 border border-[#ffd700]/20 rounded-xl py-2 px-4 whitespace-nowrap">
        <div className="inline-block animate-[scroll_20s_linear_infinite] text-[#ffd700] font-bold">
          ✨ Welcome @{user.username} | Share your brilliance with the world | Explore the Golden Universe Search feature! ✨
        </div>
      </div>

      {/* Post Creator */}
      <div className="bg-[#121212] p-4 rounded-2xl border-l-4 border-[#ffd700] border-t border-b border-r border-white/5 space-y-4 shadow-xl">
        <textarea
          placeholder="What gold thoughts are you weighing today?"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 min-h-[100px] outline-none focus:border-[#ffd700]/50 transition-colors resize-none"
        />

        {previewImage && (
          <div className="relative group">
            <img src={previewImage} alt="Preview" className="w-full rounded-xl border border-[#ffd700]" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-black/70 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500 transition-colors"
            >
              <i className="fa-solid fa-times text-sm"></i>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-2xl hover:scale-125 transition-transform cursor-pointer"
            >
              🖼️
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={handleAIGenerate}
              disabled={isGeneratingAI}
              className={`text-2xl hover:scale-125 transition-transform cursor-pointer ${isGeneratingAI ? 'opacity-50' : ''}`}
              title="Generate AI Thought"
            >
              🪄
            </button>
          </div>
          <button
            onClick={handleSubmit}
            className="gold-gradient px-8 py-2 rounded-xl text-black font-bold hover:scale-105 active:scale-95 transition-all"
          >
            POST ✨
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={user} 
            onLike={() => onToggleLike(post.id)}
            onComment={(text) => onAddComment(post.id, text)}
          />
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default Feed;
