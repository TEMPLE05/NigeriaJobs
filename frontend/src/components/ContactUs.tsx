import React, { useEffect } from 'react';

const ContactUs: React.FC = () => {
  // Update page title
  useEffect(() => {
    document.title = 'About - JobVista.NG';
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-cyan-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-cyan-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="text-center mb-12 relative z-10">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
          <div className="relative">
            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-6 shadow-lg">
              <span className="text-6xl">👨‍💻</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              About Me
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the developer behind JobVista.NG and my AI-enhanced development journey
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>
                🚀 Full-Stack Developer
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>
                🤖 AI Enthusiast
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>
                🌍 Nigeria Focused
              </span>
            </div>
          </div>
        </div>

        {/* About Me Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* My Story Section */}
          <div className="rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-4 shadow-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold" style={{ color: 'var(--card-text-color)' }}>
                My Story
              </h3>
            </div>
              <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--card-secondary-text-color)' }}>
                I'm a <strong className="text-blue-600 dark:text-blue-400">Junior Full-Stack Developer</strong> with a strong passion for building modern, user-friendly, and interactive web applications. I enjoy combining clean design with efficient backend logic to create solutions that not only work — but feel great to use.
              </p>
              <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--card-secondary-text-color)' }}>
                I'm extremely <strong className="text-blue-600 dark:text-blue-400">versatile</strong> and leverage <strong className="text-blue-600 dark:text-blue-400">AI extensively</strong> to enhance my workflow and push the boundaries of what's possible. Whether it's generating code, debugging complex issues, or optimizing performance, AI is an integral part of my development process.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--card-secondary-text-color)' }}>
                This website you're currently using — <strong className="text-blue-600 dark:text-blue-400">JobVista.NG</strong> — is one of my proudest creations. It's a comprehensive job aggregation platform that scrapes multiple Nigerian job sites, providing users with real-time job opportunities in one convenient location.
              </p>
            </div>

            {/* NigeriaJobs Project Section */}
            <div className="rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-4 shadow-lg">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--card-text-color)' }}>
                  JobVista.NG - My Featured Project
                </h3>
              </div>
              <div className="rounded-xl p-6 mb-6 border" style={{ backgroundColor: 'var(--badge-bg-color)', borderColor: 'var(--badge-border-color)' }}>
                <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--card-secondary-text-color)' }}>
                  <strong className="text-blue-600 dark:text-blue-400">JobVista.NG</strong> is a comprehensive job aggregation platform I built from the ground up. This application scrapes multiple Nigerian job websites in real-time, consolidating thousands of job opportunities into a single, user-friendly interface.
                </p>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--card-secondary-text-color)' }}>
                  The platform features advanced search capabilities, real-time updates, and a responsive design that works seamlessly across all devices. I utilized AI extensively throughout the development process — from code generation and debugging to performance optimization and feature ideation.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border-color)' }}>
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--card-text-color)' }}>AI-Powered Development</h4>
                  <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>Extensive use of AI tools for code generation, debugging, and optimization</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border-color)' }}>
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--card-text-color)' }}>Real-time Scraping</h4>
                  <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>Automated job data collection from multiple sources</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border-color)' }}>
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--card-text-color)' }}>Modern UI/UX</h4>
                  <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>Responsive design with dark mode and smooth animations</p>
                </div>
              </div>
            </div>

            {/* Technologies Section */}
            <div className="rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-4 shadow-lg">
                  <span className="text-2xl">🛠️</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--card-text-color)' }}>
                  Technologies I Use
                </h3>
              </div>

              {/* Languages */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>Languages</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>JavaScript (Node.js, React)</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>TypeScript</span>
                </div>
              </div>

              {/* Frameworks & Libraries */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>Frameworks & Libraries</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>React</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Express.js</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Axios</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Framer Motion</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Tailwind CSS</span>
                </div>
              </div>

              {/* Databases */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>Databases</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>MongoDB</span>
                </div>
              </div>

              {/* Web Scraping & Automation */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>Web Scraping & Automation</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Puppeteer</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Node-Cron</span>
                </div>
              </div>

              {/* Hosting & Deployment */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>Hosting & Deployment</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Vercel</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Render</span>
                </div>
              </div>

              {/* Developer Tools */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>Developer Tools</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>Git & GitHub</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>dotenv</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>compression</span>
                  <span className="px-4 py-2 rounded-lg font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>CORS</span>
                </div>
              </div>

              {/* AI Workflow Section */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--card-text-color)' }}>🤖 AI Workflow Integration</h4>
                <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--badge-bg-color)', borderColor: 'var(--badge-border-color)' }}>
                  <p className="leading-relaxed mb-4" style={{ color: 'var(--card-secondary-text-color)' }}>
                    I extensively integrate AI throughout my development workflow to enhance productivity and innovation:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong style={{ color: 'var(--card-text-color)' }}>Code Generation</strong>
                        <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>AI-assisted coding for rapid prototyping and feature development</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong style={{ color: 'var(--card-text-color)' }}>Debugging & Optimization</strong>
                        <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>AI-powered debugging and performance optimization</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong style={{ color: 'var(--card-text-color)' }}>Problem Solving</strong>
                        <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>Complex problem analysis and solution ideation</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong style={{ color: 'var(--card-text-color)' }}>Documentation</strong>
                        <p className="text-sm" style={{ color: 'var(--card-secondary-text-color)' }}>Automated documentation and code commenting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Let's Connect Section */}
            <div className="rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-4 shadow-lg">
                  <span className="text-2xl">📩</span>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--card-text-color)' }}>
                  Let's Connect
                </h3>
              </div>
              <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--badge-bg-color)', borderColor: 'var(--badge-border-color)' }}>
                <div className="flex items-center justify-center">
                  <a
                    href="https://github.com/TEMPLE05"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="mr-2">🔗</span>
                    GitHub Profile
                  </a>
                </div>
                <div className="mt-4 text-center">
                  <p style={{ color: 'var(--card-secondary-text-color)' }}>
                    Email: <a href="mailto:ogbonnatemple0@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">ogbonnatemple0@gmail.com</a>
                  </p>
                  <p style={{ color: 'var(--card-secondary-text-color)' }}>
                    WhatsApp: <a href="https://wa.me/2348137155469" className="text-blue-600 dark:text-blue-400 hover:underline">08137155469</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ContactUs;
