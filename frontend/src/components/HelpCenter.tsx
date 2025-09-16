import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Monitor } from 'lucide-react';

const HelpCenter: React.FC = () => {
  // Theme management (simplified for this page)
  const theme = 'system'; // Default to system

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getThemeIcon = () => {
    return <Monitor className="w-5 h-5 text-gray-400" />;
  };

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
      <main className="overflow-y-auto">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
          <div className="relative">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
              Help Center
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions and get the support you need
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 md:p-12" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
            <div className="text-center">
              <div className="text-6xl mb-6">🚧</div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Help Center Coming Soon
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                We're working on building a comprehensive help center with FAQs, tutorials, and support resources.
                In the meantime, feel free to contact us directly for assistance.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  About Me
                </Link>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-6">
                Check back soon for updates!
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
              © 2025 JobVista.NG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenter;