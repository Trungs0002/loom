/* eslint-disable */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImgUrl } from './AdminCategories';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, headerLogo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const res = await register(name, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Failed to register');
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center px-gutter py-24 relative overflow-hidden min-h-[calc(100vh-100px)]">
      {/* Decorative Background Element - Subtle Minimalist Blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
      
      {/* Register Container */}
      <div className="w-full max-w-md bg-white border border-outline-variant/20 p-8 sm:p-12 relative z-10 shadow-[0_32px_64px_-16px_rgba(8,31,92,0.1)] rounded-2xl flex flex-col items-center">
        {/* Logo Section */}
        {headerLogo && (
          <div className="mb-10 w-full flex justify-center">
            <Link to="/" className="block h-10 sm:h-12">
              <img src={getImgUrl(headerLogo)} alt="LOOM" className="h-full w-auto object-contain" />
            </Link>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Create account</h1>
          <p className="font-body-md text-sm text-on-surface-variant opacity-70">Join LOOM to start shopping sustainably</p>
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
                className="block w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/5 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/50 transition-all rounded-xl outline-none" 
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
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs" htmlFor="password">Password</label>
            <div className="relative">
              <input 
                className="block w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/5 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/50 transition-all rounded-xl outline-none pr-10" 
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

          {/* Confirm Password Field */}
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input 
                className="block w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/5 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline-variant/50 transition-all rounded-xl outline-none pr-10" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                required 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-md">
            <button className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-md px-lg hover:bg-primary-container transition-colors duration-300 rounded-[99px] flex items-center justify-center space-x-sm group" type="submit">
              <span>Register</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </form>
        
        <div className="mt-xl text-center border-t border-outline-variant/20 pt-lg">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link className="text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-secondary" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;


