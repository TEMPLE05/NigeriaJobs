import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Briefcase, Sun, Moon, Monitor } from 'lucide-react';

const ContactUs: React.FC = () => {
  // Update page title
  useEffect(() => {
    document.title = 'About Me - NigeriaJobs';
  }, []);
  return (
    <div className="min-h-screen flex flex-col transition-all duration-500" style={{backgroundColor: 'var(--bg-color)'}}>
      {/* Header */}
      <header className="flex-shrink-0 border-b shadow-sm" style={{backgroundColor: 'var(--header-bg-color)', borderColor: 'var(--header-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="header-icon-gradient p-3 rounded-xl shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  NigeriaJobs
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Find your dream job
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
          <div className="relative">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
              About Me
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the developer behind NigeriaJobs and my AI-enhanced development journey
            </p>
          </div>
        </div>

        {/* About Me Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 md:p-12" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
            {/* About Me Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">🚀</div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  About Me
                </h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                I'm a <strong className="text-blue-600 dark:text-blue-400">Junior Full-Stack Developer</strong> with a strong passion for building modern, user-friendly, and interactive web applications. I enjoy combining clean design with efficient backend logic to create solutions that not only work — but feel great to use.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                I'm extremely <strong className="text-purple-600 dark:text-purple-400">versatile</strong> and leverage <strong className="text-green-600 dark:text-green-400">AI extensively</strong> to enhance my workflow and push the boundaries of what's possible. Whether it's generating code, debugging complex issues, or optimizing performance, AI is an integral part of my development process.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                This website you're currently using — <strong className="text-orange-600 dark:text-orange-400">NigeriaJobs</strong> — is one of my proudest creations. It's a comprehensive job aggregation platform that scrapes multiple Nigerian job sites, providing users with real-time job opportunities in one convenient location.
              </p>
            </div>

            {/* NigeriaJobs Project Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">💼</div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  NigeriaJobs - My Featured Project
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  <strong className="text-blue-600 dark:text-blue-400">NigeriaJobs</strong> is a comprehensive job aggregation platform I built from the ground up. This application scrapes multiple Nigerian job websites in real-time, consolidating thousands of job opportunities into a single, user-friendly interface.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  The platform features advanced search capabilities, real-time updates, and a responsive design that works seamlessly across all devices. I utilized AI extensively throughout the development process — from code generation and debugging to performance optimization and feature ideation.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Development</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Extensive use of AI tools for code generation, debugging, and optimization</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Scraping</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automated job data collection from multiple sources</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Modern UI/UX</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Responsive design with dark mode and smooth animations</p>
                </div>
              </div>
            </div>

            {/* Technologies Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">🛠️</div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Technologies I Use
                </h3>
              </div>

              {/* Languages */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Languages</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium">JavaScript (Node.js, React)</span>
                  <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium">TypeScript</span>
                </div>
              </div>

              {/* Frameworks & Libraries */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Frameworks & Libraries</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">React & Next.js</span>
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">Express.js</span>
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">Axios</span>
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">Framer Motion</span>
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium">Tailwind CSS</span>
                </div>
              </div>

              {/* Databases */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Databases</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg font-medium">MongoDB</span>
                  <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg font-medium">Supabase</span>
                </div>
              </div>

              {/* Web Scraping & Automation */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Web Scraping & Automation</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg font-medium">Puppeteer</span>
                  <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg font-medium">Node-Cron</span>
                </div>
              </div>

              {/* Hosting & Deployment */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Hosting & Deployment</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg font-medium">Vercel</span>
                  <span className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg font-medium">Render</span>
                </div>
              </div>

              {/* Developer Tools */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Developer Tools</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium">Git & GitHub</span>
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium">dotenv</span>
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium">compression</span>
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium">CORS</span>
                </div>
              </div>

              {/* AI Workflow Section */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Workflow Integration</h4>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    I extensively integrate AI throughout my development workflow to enhance productivity and innovation:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong className="text-gray-900 dark:text-white">Code Generation</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AI-assisted coding for rapid prototyping and feature development</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong className="text-gray-900 dark:text-white">Debugging & Optimization</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered debugging and performance optimization</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong className="text-gray-900 dark:text-white">Problem Solving</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Complex problem analysis and solution ideation</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">•</div>
                      <div>
                        <strong className="text-gray-900 dark:text-white">Documentation</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Automated documentation and code commenting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Let's Connect Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">📩</div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Let's Connect
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
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
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t" style={{backgroundColor: 'var(--footer-bg-color)', borderColor: 'var(--footer-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="footer-icon-gradient p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  NigeriaJobs
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Job aggregation platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Browse Jobs
              </Link>
              <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Help
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-3 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110" title="Light mode">
                <Sun className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110" title="Dark mode">
                <Moon className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110" title="System mode">
                <Monitor className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4" style={{borderColor: 'var(--footer-border-color)'}}>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © 2025 NigeriaJobs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;