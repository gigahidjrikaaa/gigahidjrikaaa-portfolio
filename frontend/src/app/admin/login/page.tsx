"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiService } from '@/services/api';

const copy = {
  eyebrow: 'ADMIN PORTAL',
  title: 'Welcome back.',
  subtitle: 'Sign in to manage the portfolio experience.',
  usernameLabel: 'Username',
  passwordLabel: 'Password',
  usernamePlaceholder: 'Enter your username',
  passwordPlaceholder: 'Enter your password',
  cta: 'Sign In',
  error: 'Login failed. Please check your credentials.',
};

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiService.login(username, password);
      if (data.access_token) {
        router.replace('/admin');
      } else {
        setError('Login failed: No access token received.');
      }
    } catch (err) {
      setError(copy.error);
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt="Admin login background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {copy.eyebrow}
              </span>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-xl text-base text-white/80 sm:text-lg">
                {copy.subtitle}
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                    {error}
                  </p>
                )}
                <div>
                  <label className="block text-sm font-semibold text-white/90" htmlFor="username">
                    {copy.usernameLabel}
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder={copy.usernamePlaceholder}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90" htmlFor="password">
                    {copy.passwordLabel}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder={copy.passwordPlaceholder}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {copy.cta}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
