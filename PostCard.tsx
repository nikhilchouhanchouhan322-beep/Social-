
import React, { useState, useEffect, useRef } from 'react';
import { Post, User } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onLike: () => void;
  onComment: (text: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment }) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const isLiked = post.likedBy.includes(currentUser.username);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setTimeout(() => {
              setIsGlowing(true);
            }, 3000);
            entry.target.setAttribute('data-timer', timer.toString());
          } else {
            const timer = entry.target.getAttribute('data-timer');
            if (timer) clearTimeout(parseInt(timer));
            setIsGlowing(false);
          }
        });
      },
      { threshold: 0.8 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`bg-[#121212] p-5 rounded-3xl border border-white/10 border-l-4 border-l-[#ffd700] transition-all duration-500 overflow-hidden ${
        isGlowing ? 'attention-glow scale-[1.03] z-10 shadow-[0_0_30px_rgba(255,215,0,0.1)]' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center font-bold text-black uppercase">
            {post.author[0]}
          </div>
          <div>
            <h4 className="font-bold text-[#ffd700]">@{post.author}</h4>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">{formatTime(post.timestamp)}</p>
          </div>
        </div>
        <button className="text-white/20 hover:text-[#ffd700]">
          <i className="fa-solid fa-ellipsis-h"></i>
        </button>
      </div>

      <p className="text-white/90 leading-relaxed mb-4">{post.text}</p>

      {post.image && (
        <img src={post.image} alt="Post content" className="w-full rounded-2xl mb-4 border border-white/5" />
      )}

      {post.likedBy.length > 0 && (
        <div className="text-[10px] text-white/40 mb-2 flex items-center gap-1">
          <i className="fa-solid fa-heart text-[#ffd700] scale-75"></i>
          Liked by {post.likedBy.slice(-2).join(', ')} {post.likedBy.length > 2 ? `and ${post.likedBy.length - 2} others` : ''}
        </div>
      )}

      <div className="flex gap-6 border-t border-white/5 pt-4">
        <button 
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-red-500'}`}
        >
          <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
          <span className="text-sm font-bold">{post.likes}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 transition-colors ${showComments ? 'text-[#ffd700]' : 'text-white/40 hover:text-[#ffd700]'}`}
        >
          <i className="fa-regular fa-comment"></i>
          <span className="text-sm font-bold">{post.comments.length}</span>
        </button>
        <button 
          className="flex items-center gap-2 text-white/40 hover:text-blue-400 transition-colors"
          onClick={() => alert('Feature coming soon: Private Messaging')}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4 border-t border-white/5 pt-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#ffd700]/50"
            />
            <button type="submit" className="text-[#ffd700] px-2 font-bold text-sm">Post</button>
          </form>
          
          <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full gold-gradient flex-shrink-0 flex items-center justify-center text-[10px] font-black text-black">{comment.author[0]}</div>
                <div className="flex-1">
                  <div className="text-xs">
                    <span className="font-bold text-[#ffd700]">@{comment.author}</span>
                    <span className="text-[10px] text-white/20 ml-2 uppercase">{formatTime(comment.timestamp)}</span>
                  </div>
                  <p className="text-xs text-white/70">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
