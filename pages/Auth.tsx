import React, { useState } from 'react';
import { useApp } from '../context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Hexagon } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login('Rahul Sain', formData.email); // Mocking name for login
    } else {
      register(formData.companyName, formData.name, formData.email);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
           <div className="bg-brand-500 p-3 rounded-xl shadow-lg shadow-brand-500/50">
             <Hexagon className="text-white fill-white" size={40} />
           </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {isLogin ? 'Welcome back' : 'Start managing better'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          {isLogin ? 'Sign in to your dashboard' : 'Create your company workspace'}
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-black/20 sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <>
                <Input 
                  label="Company Name"
                  name="companyName"
                  type="text" 
                  placeholder="Acme Inc."
                  required 
                  value={formData.companyName}
                  onChange={handleChange}
                />
                <Input 
                  label="Full Name"
                  name="name"
                  type="text" 
                  placeholder="John Doe"
                  required 
                  value={formData.name}
                  onChange={handleChange}
                />
              </>
            )}

            <Input 
              label="Email address"
              name="email"
              type="email" 
              placeholder="you@example.com"
              required 
              value={formData.email}
              onChange={handleChange}
            />

            <Input 
              label="Password"
              name="password"
              type="password" 
              required 
              value={formData.password}
              onChange={handleChange}
            />

            <Button type="submit" fullWidth size="lg" className="mt-2 shadow-lg shadow-brand-500/40">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to NexusTask?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="ghost" 
                fullWidth 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Register your company' : 'Sign in to existing account'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};