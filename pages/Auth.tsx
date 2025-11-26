
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Button } from '../components/Button';
import { Hexagon, ArrowRight, Mail, Lock, User, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
    const particleCount = Math.min(Math.floor((width * height) / 10000), 100); // Responsive count
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

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
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
        ctx.fillStyle = 'rgba(147, 197, 253, 0.5)'; // blue-300
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
      
      // Draw connections first
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
            ctx.strokeStyle = `rgba(147, 197, 253, ${1 - distance / connectionDistance})`;
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

// --- Main Auth Component ---
export const Auth: React.FC = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: ''
  });

  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 400); // Match transition duration
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.companyName, formData.name, formData.email, formData.password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Error is already handled in context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      <ParticleBackground />
      
      {/* Overlay Gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/50 to-brand-900/30 pointer-events-none z-0" />

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 ease-in-out">
          
          {/* Header Section */}
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-2xl shadow-lg shadow-brand-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
              <Hexagon className="text-white fill-white" size={32} />
            </div>
            
            <div className={`transition-all duration-500 ease-in-out transform ${isAnimating ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isLogin ? 'Enter your credentials to access your workspace.' : 'Create your company workspace in seconds.'}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 pt-6">
            <form onSubmit={handleSubmit} className={`space-y-5 transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              
              {!isLogin && (
                <>
                  <div className="space-y-1.5 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="text-xs font-semibold text-slate-300 ml-1">Company Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                        <Building size={18} />
                      </div>
                      <input
                        name="companyName"
                        type="text"
                        required
                        placeholder="Acme Inc."
                        value={formData.companyName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <label className="text-xs font-semibold text-slate-300 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5 animate-fadeIn" style={{ animationDelay: isLogin ? '0s' : '0.3s' }}>
                <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 animate-fadeIn" style={{ animationDelay: isLogin ? '0.1s' : '0.4s' }}>
                <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Footer Toggle */}
          <div className="bg-slate-900/50 p-4 text-center border-t border-white/5 backdrop-blur-md">
            <button
              onClick={toggleMode}
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              {isLogin ? (
                <>
                  New to NexusTask? <span className="text-brand-400 group-hover:underline">Create an account</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-brand-400 group-hover:underline">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Simple footer branding */}
        <div className="mt-8 text-center">
            <p className="text-slate-600 text-xs">© 2024 NexusTask Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
