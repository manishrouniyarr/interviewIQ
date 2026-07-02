import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Zap, ArrowRight, CheckCircle2, Sun, Moon, X } from 'lucide-react';
import Footer from '../components/Footer';

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
      title="Toggle theme"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing</a>
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition">Sign in</Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <button className="bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-lg transition">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {/* Hero — big rounded card like Shielder */}
<section className="px-4 pt-4 pb-0">
  <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden">
    <div className="container mx-auto px-8 py-16 md:py-20">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-12">

        {/* Left: text */}
        <div className="flex-1 max-w-xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5 text-slate-900 dark:text-white">
            Automate your interview prep and{' '}
            <span className="text-blue-600 dark:text-blue-400">land the job faster</span>
          </h1>

          <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Upload your resume, get role-specific questions, and receive instant AI feedback so you walk into every interview confident.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
            <Link to="/login">
              <button className="group flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm px-6 py-3 rounded-lg transition">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-semibold text-sm px-6 py-3 rounded-lg transition shadow-sm">
                Go to dashboard
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            {['No credit card required', 'Free to start', 'Setup in 3 minutes'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right: UI mockup */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-slate-400 font-mono">InterviewIQ — Mock Interview</span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Question 3 of 10</span>
                <span>30% complete</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                <div className="h-1.5 bg-blue-500 rounded-full w-[30%]" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Tell me about a time you resolved a conflict within your team.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                <p className="text-xs text-blue-500 font-medium mb-2">Your answer</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">In my previous internship, I noticed two team members had conflicting approaches to a feature rollout...</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 px-2.5 py-0.5 rounded-full font-medium">✓ Strong opening</span>
                  <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">+ Add outcome</span>
                </div>
              </div>

              {/* AI score card */}
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-0.5">AI Feedback Score</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Good structure, needs a clear result</p>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7.2<span className="text-sm font-normal text-slate-400">/10</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

      {/* Stats */}
      <section className="border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-colors">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
            {[
              { value: '10k+', label: 'Interviews practiced' },
              { value: '95%',  label: 'Users felt more confident' },
              { value: '3 min', label: 'Average setup time' },
              { value: '500+', label: 'Question types' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Features</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">The only features you need at the right time</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            title="Role-specific questions"
            description="Questions tailored to your resume and the exact role you're targeting — not generic lists."
            checks={['Resume-aware prompts', 'Role & seniority matched', 'Covers behavioral + technical']}
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            title="Instant AI feedback"
            description="Know what you got right, what was vague, and what to say better before your real interview."
            checks={['Scored on clarity & depth', 'Specific improvement tips', 'STAR method guidance']}
          />
          <FeatureCard
            icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            title="Progress tracking"
            description="See your improvement session over session with clear scores and topic-level insights."
            checks={['Session history', 'Topic-level breakdown', 'Confidence score over time']}
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="text-center mb-14">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Pricing</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Simple, transparent pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-400 text-sm mb-1">/month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Perfect for getting started</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                '5 mock interviews/month',
                'Basic AI feedback',
                '3 question categories',
                'Session history (7 days)',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
              {['Resume upload', 'Analytics dashboard'].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400 dark:text-slate-600">
                  <X className="w-4 h-4 text-slate-300 dark:text-slate-700 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/login">
              <button className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-lg transition">
                Get started free
              </button>
            </Link>
          </div>

          {/* Pro — highlighted */}
          <div className="bg-slate-900 dark:bg-white border border-slate-900 dark:border-white rounded-2xl p-7 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-1">Pro</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-white dark:text-slate-900">$12</span>
                <span className="text-slate-400 dark:text-slate-500 text-sm mb-1">/month</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">For serious job seekers</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Unlimited mock interviews',
                'Deep AI feedback & scoring',
                'All question categories',
                'Resume upload & analysis',
                'Full analytics dashboard',
                'Session history (unlimited)',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300 dark:text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 dark:text-blue-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/login">
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-lg transition">
                Start Pro free for 7 days
              </button>
            </Link>
          </div>

          {/* Team */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Team</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">$49</span>
                <span className="text-slate-400 text-sm mb-1">/month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">For bootcamps & companies</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {[
                'Everything in Pro',
                'Up to 10 team members',
                'Admin dashboard',
                'Team progress reports',
                'Custom question sets',
                'Priority support',
              ].map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/login">
              <button className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-lg transition">
                Contact us
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="bg-slate-900 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to ace your next interview?</h2>
          <p className="text-slate-400 mb-8 text-sm">Free to start. No credit card required.</p>
          <Link to="/login">
            <button className="bg-white text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-slate-100 transition text-sm">
              Create free account →
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
        <span className="text-white dark:text-slate-900 text-xs font-black tracking-tight">IQ</span>
      </div>
      <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">InterviewIQ</span>
    </div>
  );
}

function FeatureCard({ icon, title, description, checks }: {
  icon: React.ReactNode; title: string; description: string; checks: string[];
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-7 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{description}</p>
      <ul className="space-y-2">
        {checks.map(c => (
          <li key={c} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

// import { Link } from 'react-router-dom';
// import { Target, TrendingUp, Award } from 'lucide-react';
// import Footer from '../components/Footer';

// export default function Landing() {
//   return (
//     <div className="min-h-screen bg-slate-900 flex flex-col">
//       {/* Navbar */}
//       <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <rect width="28" height="28" rx="8" fill="#6366f1"/>
//   <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
//   <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
// </svg>
//           <span className="text-2xl font-bold text-white">InterviewIQ</span>
//         </div>
//         <Link to="/dashboard">
//           <button className="bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
//             Get Started
//           </button>
//         </Link>
//       </nav>

//       {/* Hero Section */}
//       <div className="container mx-auto px-6 py-20 text-center">
//         <h1 className="text-6xl font-bold text-white mb-6">
//           Practice. Improve. Get Hired.
//         </h1>
//         <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
//           Last-minute interview prep. No hassle. No distractions. Upload your resume, practice real questions, get instant feedback, and get hired.
//         </p>
//         <Link to="/login">
//           <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-2xl">
//             Start Free Trial →
//           </button>
//         </Link>
//       </div>

//       {/* Features */}
//       <div className="container mx-auto px-6 py-20">
//         <div className="grid md:grid-cols-3 gap-8">
//           <FeatureCard
//             icon={<Target className="w-12 h-12" />}
//             title="Personalized Questions"
//             description="Questions based on your resume and target role"
//           />
//           <FeatureCard
//             icon={<TrendingUp className="w-12 h-12" />}
//             title="Track Progress"
//             description="Track your improvement with clear insights over time"
//           />
//           <FeatureCard
//             icon={<Award className="w-12 h-12" />}
//             title="Smart Feedback"
//             description="Get instant feedback to improve your answers"
//           />
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }

// function FeatureCard({ icon, title, description }: any) {
//   return (
//     <div className="bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl p-8  hover:bg-white/20 transition">
//       <div className="mb-4">{icon}</div>
//       <h3 className="text-2xl font-bold mb-2">{title}</h3>
//       <p className="text-white/80">{description}</p>
//     </div>
//   );
// }