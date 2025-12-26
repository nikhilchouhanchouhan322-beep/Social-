
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-black gold-text tracking-widest animate-pulse">
            GOLDEN SOCIAL
          </h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-sm">Universal Connect V4.0</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#121212] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 outline-none focus:border-[#ffd700] transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 outline-none focus:border-[#ffd700] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full gold-gradient py-4 rounded-xl text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,215,0,0.3)]"
          >
            ENTER UNIVERSE
          </button>

          <p className="text-white/30 text-xs">
            By entering, you agree to the Golden Standard of interactions.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
