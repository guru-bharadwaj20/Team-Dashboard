const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
            About Team Dashboard
          </h1>
          <p className="text-2xl text-gray-300">
            Collaborative Decision Making Made Simple
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* What is Team Dashboard */}
          <section className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Team Dashboard?</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Team Dashboard is a collaborative platform that empowers teams to make better decisions together 
              through collaborative feedback on proposals and real-time team collaboration. Our mission is to simplify 
              teamwork by providing a centralized hub where ideas flourish, decisions are made democratically, 
              and every team member's voice is heard and valued.
            </p>
          </section>

          {/* Key Features */}
          <section className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create & Manage Teams</h3>
                <p className="text-gray-700">Build teams effortlessly and manage members with ease</p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Proposals</h3>
                <p className="text-gray-700">Share your ideas and get feedback from the team</p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborative Feedback</h3>
                <p className="text-gray-700">Provide feedback on proposals and make decisions together</p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-700">See live updates as decisions are made</p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-4xl mb-3">🔔</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Notifications</h3>
                <p className="text-gray-700">Stay informed about team activities instantly</p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Share & Collaborate</h3>
                <p className="text-gray-700">Share public boards with stakeholders easily</p>
              </div>
            </div>
          </section>

          {/* Our Vision */}
          <section className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              We believe that great decisions come from great collaboration. By combining transparency, 
              accessibility, and real-time communication, Team Dashboard helps teams work smarter and 
              achieve their goals faster. Whether you're a startup, a department, or an entire organization, 
              our platform adapts to your needs and scales with your growth.
            </p>
          </section>

          {/* Get Started Today */}
          <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Get Started Today</h2>
            <p className="text-primary-100 text-lg leading-relaxed mb-6">
              Ready to transform the way your team makes decisions? Sign up today and experience the 
              power of collaborative decision-making. It's free, easy, and designed to make teamwork enjoyable.
            </p>
            <a
              href="/register"
              className="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Join Now
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
