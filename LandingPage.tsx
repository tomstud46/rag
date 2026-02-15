
import React from 'react';
import { ArrowRight, Bot, Shield, Zap, CheckCircle, Smartphone, Database } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
              <Zap size={14} />
              Next-Gen AI Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              Empower your site with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Smart Knowledge.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
              Build a custom AI chatbot that knows your business inside and out. Upload documents, sync content, and delight users instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Get Started Free <ArrowRight size={20} />
              </button>
              <button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i + 10}/32/32`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" alt="user" />
                ))}
              </div>
              <span>Join 2,000+ companies using TechCorp AI</span>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="relative z-10 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-1 shadow-2xl overflow-hidden group">
              <img 
                src="https://picsum.photos/seed/tech/800/600" 
                className="rounded-[22px] w-full h-auto object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" 
                alt="Dashboard Preview" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-lg"><Bot className="text-white" size={20} /></div>
                    <div>
                      <div className="h-2 w-24 bg-white/30 rounded mb-1"></div>
                      <div className="h-2 w-16 bg-white/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-100 dark:border-slate-800 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to succeed</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Our RAG-powered technology ensures your AI never hallucinates and always provides factual data based on your specific documentation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-xl transition-all group">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Enterprise Security</h3>
              <p className="text-slate-600 dark:text-slate-400">Your data is encrypted at rest and in transit. We prioritize privacy and document ownership.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-xl transition-all group">
              <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Knowledge</h3>
              <p className="text-slate-600 dark:text-slate-400">Upload PDFs, Docs, or link your website. Our engine creates embeddings in seconds.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-xl transition-all group">
              <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Omnichannel Chat</h3>
              <p className="text-slate-600 dark:text-slate-400">Deploy your chatbot on your website, Slack, or mobile app with just one line of code.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all dark:text-white">
            <span className="text-2xl font-bold">GOOGLE</span>
            <span className="text-2xl font-bold">STRIPE</span>
            <span className="text-2xl font-bold">AIRBNB</span>
            <span className="text-2xl font-bold">NETFLIX</span>
            <span className="text-2xl font-bold">TESLA</span>
          </div>
        </div>
      </section>
    </div>
  );
};
