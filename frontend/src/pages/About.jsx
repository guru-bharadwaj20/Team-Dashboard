import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Team Dashboard</h1>
        <p className="about-subtitle">Collaborative Decision Making Made Simple</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>What is Team Dashboard?</h2>
          <p className="about-text">
            Team Dashboard is a collaborative platform that empowers teams to make better decisions together 
            through collaborative feedback on proposals and real-time team collaboration. Our mission is to simplify 
            teamwork by providing a centralized hub where ideas flourish, decisions are made democratically, 
            and every team member's voice is heard and valued.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Create & Manage Teams</h3>
              <p>Build teams effortlessly and manage members with ease</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Submit Proposals</h3>
              <p>Share your ideas and get feedback from the team</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Collaborative Feedback</h3>
              <p>Provide feedback on proposals and make decisions together</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Updates</h3>
              <p>See live updates as decisions are made</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Stay informed about team activities instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Share & Collaborate</h3>
              <p>Share public boards with stakeholders easily</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Vision</h2>
          <p className="about-text">
            We believe that great decisions come from great collaboration. By combining transparency, 
            accessibility, and real-time communication, Team Dashboard helps teams work smarter and 
            achieve their goals faster. Whether you're a startup, a department, or an entire organization, 
            our platform adapts to your needs and scales with your growth.
          </p>
        </section>

        <section className="about-section">
          <h2>Get Started Today</h2>
          <p className="about-text">
            Ready to transform the way your team makes decisions? Sign up today and experience the 
            power of collaborative decision-making. It's free, easy, and designed to make teamwork enjoyable.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
