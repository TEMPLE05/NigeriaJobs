import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Monitor } from 'lucide-react';

const ContactUs: React.FC = () => {
  // Update page title
  useEffect(() => {
    document.title = 'Contact Us - JobVista.NG';
  }, []);

  // Theme management with system preference detection
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const systemPrefersDark = mediaQuery.matches;

      console.log('Theme updated:', theme, 'systemPrefersDark:', systemPrefersDark);

      if (theme === 'dark') {
        document.documentElement.classList.remove('system-dark');
        document.documentElement.classList.add('dark', 'manual-dark');
      } else if (theme === 'system') {
        document.documentElement.classList.remove('manual-dark');
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark', 'system-dark');
        } else {
          document.documentElement.classList.remove('dark', 'system-dark');
        }
      } else {
        document.documentElement.classList.remove('dark', 'manual-dark', 'system-dark');
      }
    };

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Initial theme application
    updateTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  // Theme set functions
  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
  };

  const setSystemTheme = () => {
    setTheme('system');
    localStorage.setItem('theme', 'system');
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen flex flex-col transition-all duration-500" style={{backgroundColor: 'var(--bg-color)'}}>
      {/* Header */}
      <header className="flex-shrink-0 border-b shadow-sm" style={{backgroundColor: 'var(--header-bg-color)', borderColor: 'var(--header-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  JobVista.NG
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-purple-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="text-center mb-12 relative z-10">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
          <div className="relative">
            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6 shadow-lg">
              <span className="text-6xl">👨‍💻</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About Me
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the developer behind JobVista.NG and my AI-enhanced development journey
            </p>
            <div className="flex justify-center space-x-4">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium animate-pulse">
                🚀 Full-Stack Developer
              </div>
              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium animate-pulse" style={{animationDelay: '0.5s'}}>
                🤖 AI Enthusiast
              </div>
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium animate-pulse" style={{animationDelay: '1s'}}>
                🌍 Nigeria Focused
              </div>
            </div>
          </div>
        </div>

        {/* About Me Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* About Me Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-4 shadow-lg animate-pulse">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
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
                This website you're currently using — <strong className="text-orange-600 dark:text-orange-400">JobVista.NG</strong> — is one of my proudest creations. It's a comprehensive job aggregation platform that scrapes multiple Nigerian job sites, providing users with real-time job opportunities in one convenient location.
              </p>
            </div>

            {/* NigeriaJobs Project Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mr-4 shadow-lg animate-pulse">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  JobVista.NG - My Featured Project
                </h3>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  <strong className="text-blue-600 dark:text-blue-400">JobVista.NG</strong> is a comprehensive job aggregation platform I built from the ground up. This application scrapes multiple Nigerian job websites in real-time, consolidating thousands of job opportunities into a single, user-friendly interface.
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mr-4 shadow-lg animate-pulse">
                  <span className="text-2xl">🛠️</span>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mr-4 shadow-lg animate-pulse">
                  <span className="text-2xl">📩</span>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
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
                <div className="mt-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Email: <a href="mailto:ogbonnatemple0@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">ogbonnatemple0@gmail.com</a>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    WhatsApp: <a href="https://wa.me/08137155469" className="text-blue-600 dark:text-blue-400 hover:underline">08137155469</a>
                  </p>
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
              <div className="p-1.5">
                <img src="/logo.app/in-site.png" alt="Logo" className="h-7 w-auto" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  JobVista.NG
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
              <button
                onClick={setLightTheme}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'light' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow-md' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Light mode"
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={setDarkTheme}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'dark' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow-md' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Dark mode"
              >
                <Moon className="w-5 h-5" />
              </button>
              <button
                onClick={setSystemTheme}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'system' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow-md' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="System mode"
              >
                <Monitor className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4" style={{borderColor: 'var(--footer-border-color)'}}>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © 2025 JobVista.NG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;