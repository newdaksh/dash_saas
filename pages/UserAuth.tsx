import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hexagon, ArrowRight, Mail, Lock, User, ArrowLeft } from 'lucide-react';

// --- Animated Background Component ---
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const particleCount = Math.min(Math.floor((width * height) / 10000), 100);
    const connectionDistance = 150;
    const mouseDistance = 200;
    let animationFrameId: number;

    let mouse = { x: 0, y: 0 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseDistance - distance) / mouseDistance;
          const directionX = forceDirectionX * force * 0.05;
          const directionY = forceDirectionY * force * 0.05;
          this.vx -= directionX;
          this.vy -= directionY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.5)'; // purple-300
        ctx.fill();
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((a, index) => {
        a.update();
        a.draw();

        for (let j = index; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, ${1 - distance / connectionDistance})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-slate-900" />;
};

// --- Main User Auth Component ---
export const UserAuth: React.FC = () => {
  const { userLogin, userRegister } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Parse email from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
      setIsLogin(true);
    }
  }, [location.search]);

  const toggleMode = () => {
    setIsAnimating(true);
    setError('');
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await userLogin(formData.email, formData.password);
      } else {
        await userRegister(formData.name, formData.email, formData.password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.detail || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/50 to-purple-900/30 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 ease-in-out">
          
          {/* Header Section */}
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
              <User className="text-white" size={32} />
            </div>
            
            <div className={`transition-all duration-500 ease-in-out transform ${isAnimating ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isLogin ? 'User Login' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isLogin ? 'Sign in to access your personal dashboard.' : 'Join and collaborate with companies.'}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 pt-6">
            <form onSubmit={handleSubmit} className={`space-y-5 transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center animate-fadeIn">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Toggle */}
          <div className="bg-slate-900/50 p-4 text-center border-t border-white/5 backdrop-blur-md space-y-3">
            <button
              onClick={toggleMode}
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              {isLogin ? (
                <>
                  Don't have an account? <span className="text-purple-400 group-hover:underline">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-purple-400 group-hover:underline">Sign in</span>
                </>
              )}
            </button>
            
            <div className="border-t border-white/5 pt-3">
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={14} />
                Company Admin? Login here
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-xs">© 2024 NexusTask Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
