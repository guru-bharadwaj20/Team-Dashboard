import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from '../utils/helpers.js';

const FEATURES = [
  {
    icon: '🗳️',
    title: 'Democratic Voting',
    desc: 'Every team member votes Agree, Disagree, or Neutral on proposals. One user, one vote — with the ability to change your mind.',
  },
  {
    icon: '📊',
    title: 'Live Vote Results',
    desc: 'Animated progress bars update in real-time via WebSocket so everyone sees results the moment votes come in.',
  },
  {
    icon: '💬',
    title: 'Threaded Discussion',
    desc: 'Comment on proposals to share context, surface concerns, and build consensus before the vote closes.',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    desc: 'Get notified instantly when someone joins your team, creates a proposal, or comments on your thread.',
  },
  {
    icon: '🔗',
    title: 'Public Share Links',
    desc: 'Share a read-only board link so stakeholders can follow vote results without needing an account.',
  },
  {
    icon: '🔐',
    title: 'Secure by Default',
    desc: 'JWT authentication, bcrypt-hashed passwords, and protected API routes keep team data private.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create a Team', desc: 'Invite your colleagues and build your decision-making circle.' },
  { step: '02', title: 'Post a Proposal', desc: 'Describe what needs a decision — list options, set a deadline.' },
  { step: '03', title: 'Vote & Discuss', desc: 'Members cast Agree / Neutral / Disagree and discuss in real time.' },
  { step: '04', title: 'See the Outcome', desc: 'Live results surface consensus so your team can move forward.' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600 opacity-10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary-700 bg-primary-900 bg-opacity-50 text-primary-300 text-sm font-semibold mb-6 tracking-wide">
            Real-time · Collaborative · Democratic
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-blue-400 bg-clip-text text-transparent">
              Team Decision
            </span>
            <br />
            <span className="text-white">Board</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn lengthy email chains into structured votes. Your team proposes, discusses, and decides — all in one place, in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white text-lg font-bold rounded-xl transform hover:-translate-y-1 transition-all duration-200 shadow-2xl hover:shadow-primary-500/30"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 text-white text-lg font-semibold rounded-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Mini preview */}
          <div className="mt-16 max-w-lg mx-auto bg-gray-800 bg-opacity-70 backdrop-blur border border-gray-700 rounded-2xl p-6 text-left shadow-2xl">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">Live vote example</div>
            <div className="font-semibold text-white mb-4">Should we migrate to microservices?</div>
            {[
              { label: 'Agree', pct: 62, color: 'bg-green-500', textColor: 'text-green-400' },
              { label: 'Neutral', pct: 23, color: 'bg-yellow-400', textColor: 'text-yellow-400' },
              { label: 'Disagree', pct: 15, color: 'bg-red-500', textColor: 'text-red-400' },
            ].map(({ label, pct, color, textColor }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{label}</span>
                  <span className={`font-bold ${textColor}`}>{pct}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-3">13 votes · Updates live</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-900 border border-primary-700 text-primary-400 text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            Built for Real Teams
          </h2>
          <p className="text-center text-gray-400 mb-14 max-w-xl mx-auto">
            Everything your team needs to make decisions transparently and efficiently.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 hover:border-primary-600 rounded-2xl p-7 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to make better decisions?
          </h2>
          <p className="text-gray-400 mb-8">
            Create your team board in seconds — free, no credit card required.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-lg font-bold rounded-xl transform hover:-translate-y-1 transition-all duration-200 shadow-2xl hover:shadow-primary-500/30"
          >
            Create Your Free Board →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
