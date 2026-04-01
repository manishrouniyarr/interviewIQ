import { Link } from 'react-router-dom';
import { Target, TrendingUp, Award } from 'lucide-react';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="28" height="28" rx="8" fill="#6366f1"/>
  <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
  <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
</svg>
          <span className="text-2xl font-bold text-white">InterviewIQ</span>
        </div>
        <Link to="/dashboard">
          <button className="bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Get Started
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Practice. Improve. Get Hired.
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Last-minute interview prep. No hassle. No distractions. Upload your resume, practice real questions, get instant feedback, and get hired.
        </p>
        <Link to="/login">
          <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-2xl">
            Start Free Trial →
          </button>
        </Link>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Target className="w-12 h-12" />}
            title="Personalized Questions"
            description="Questions based on your resume and target role"
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12" />}
            title="Track Progress"
            description="Track your improvement with clear insights over time"
          />
          <FeatureCard
            icon={<Award className="w-12 h-12" />}
            title="Smart Feedback"
            description="Get instant feedback to improve your answers"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl p-8  hover:bg-white/20 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
}