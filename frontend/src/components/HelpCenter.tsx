import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
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
        <div className="rounded-2xl shadow-lg border p-8 md:p-12" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)'}}>
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
  );
};

export default HelpCenter;
