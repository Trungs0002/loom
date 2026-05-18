import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(name, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Failed to login');
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center px-gutter py-xxl relative overflow-hidden min-h-[calc(100vh-200px)]">
      {/* Decorative Background Element - Subtle Minimalist Blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
      
      {/* Login Container */}
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 p-xl relative z-10 shadow-[0_20px_40px_-15px_rgba(8,31,92,0.05)] rounded-lg">
        <div className="text-center mb-xl">
          <h1 className="font-headline-md text-headline-md text-primary mb-sm">Welcome Back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Sign in to continue to your LOOM account.</p>
        </div>
        
        {error && (
          <div className="bg-error/10 text-error p-sm mb-md text-center rounded">
            {error}
          </div>
        )}

        <form className="space-y-lg" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs" htmlFor="name">Username</label>
            <div className="relative">
              <input 
                className="block w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-sm font-body-md text-body-md text-on-surface placeholder:text-outline-variant/50 transition-colors rounded-none outline-none" 
                id="name" 
                name="name" 
                placeholder="Jane Doe" 
                required 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-xs">
              <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">Password</label>
              <a className="font-label-caps text-label-caps text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline" href="#">Forgot?</a>
            </div>
            <div className="relative">
              <input 
                className="block w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-sm font-body-md text-body-md text-on-surface placeholder:text-outline-variant/50 transition-colors rounded-none outline-none pr-10" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-md">
            <button className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-md px-lg hover:bg-primary-container transition-colors duration-300 rounded-DEFAULT flex items-center justify-center space-x-sm group" type="submit">
              <span>Login</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </form>
        
        <div className="mt-xl text-center border-t border-outline-variant/20 pt-lg">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link className="text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-secondary" to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
