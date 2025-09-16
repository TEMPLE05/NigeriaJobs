import React, { memo } from "react";
import { Job } from "../types/Job";
import { Building, MapPin, Calendar, ExternalLink, Briefcase, Users, Award, Clock, Star, Zap, Target, TrendingUp } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = memo(({ job }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get display source (Indeed shows as LinkedIn)
  const getDisplaySource = (source: string) => {
    if (source === 'Indeed') return 'LinkedIn';
    return source;
  };

  // Helper function to determine job level
  const getJobLevel = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('head')) {
      return { level: 'Senior', color: 'bg-red-900 text-red-200 border-red-700' };
    }
    if (lowerTitle.includes('mid') || lowerTitle.includes('intermediate') || lowerTitle.includes('experienced')) {
      return { level: 'Mid-level', color: 'bg-blue-900 text-blue-200 border-blue-700' };
    }
    if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('graduate') || lowerTitle.includes('trainee')) {
      return { level: 'Entry', color: 'bg-green-900 text-green-200 border-green-700' };
    }
    return { level: 'Not specified', color: 'bg-gray-700 text-gray-300 border-gray-600' };
  };

  // Helper function to determine industry
  const getIndustry = (companyName: string, title: string) => {
    const combined = (companyName + ' ' + title).toLowerCase();

    if (combined.includes('tech') || combined.includes('software') || combined.includes('digital') || combined.includes('it')) {
      return { industry: 'Technology', icon: '💻' };
    }
    if (combined.includes('finance') || combined.includes('bank') || combined.includes('financial') || combined.includes('investment')) {
      return { industry: 'Finance', icon: '💰' };
    }
    if (combined.includes('health') || combined.includes('medical') || combined.includes('hospital') || combined.includes('clinic')) {
      return { industry: 'Healthcare', icon: '🏥' };
    }
    if (combined.includes('education') || combined.includes('school') || combined.includes('university') || combined.includes('academy')) {
      return { industry: 'Education', icon: '🎓' };
    }
    if (combined.includes('marketing') || combined.includes('advertising') || combined.includes('media') || combined.includes('creative')) {
      return { industry: 'Marketing', icon: '📢' };
    }
    return { industry: 'General', icon: '🏢' };
  };

  // Helper function to extract skills from job title and keyword
  const extractSkills = (title: string, keyword?: string) => {
    const skills = [];
    const combinedText = (title + ' ' + (keyword || '')).toLowerCase();

    // Technology Stack Skills
    if (combinedText.includes('react') && !combinedText.includes('acting')) skills.push('React');
    if (combinedText.includes('angular')) skills.push('Angular');
    if (combinedText.includes('vue')) skills.push('Vue.js');
    if (combinedText.includes('javascript') || combinedText.includes('js ')) skills.push('JavaScript');
    if (combinedText.includes('typescript') || combinedText.includes('ts ')) skills.push('TypeScript');
    if (combinedText.includes('node') || combinedText.includes('nodejs')) skills.push('Node.js');
    if (combinedText.includes('python')) skills.push('Python');
    if (combinedText.includes('java ') && !combinedText.includes('javascript')) skills.push('Java');
    if (combinedText.includes('c#') || combinedText.includes('csharp')) skills.push('C#');
    if (combinedText.includes('php')) skills.push('PHP');
    if (combinedText.includes('ruby')) skills.push('Ruby');
    if (combinedText.includes('go ') || combinedText.includes('golang')) skills.push('Go');

    // Framework & Library Skills
    if (combinedText.includes('django')) skills.push('Django');
    if (combinedText.includes('flask')) skills.push('Flask');
    if (combinedText.includes('spring')) skills.push('Spring');
    if (combinedText.includes('laravel')) skills.push('Laravel');
    if (combinedText.includes('express')) skills.push('Express.js');

    // Database Skills
    if (combinedText.includes('mongodb') || combinedText.includes('mongo')) skills.push('MongoDB');
    if (combinedText.includes('postgresql') || combinedText.includes('postgres')) skills.push('PostgreSQL');
    if (combinedText.includes('mysql')) skills.push('MySQL');
    if (combinedText.includes('redis')) skills.push('Redis');

    // Cloud & DevOps Skills
    if (combinedText.includes('aws')) skills.push('AWS');
    if (combinedText.includes('azure')) skills.push('Azure');
    if (combinedText.includes('gcp') || combinedText.includes('google cloud')) skills.push('GCP');
    if (combinedText.includes('docker')) skills.push('Docker');
    if (combinedText.includes('kubernetes') || combinedText.includes('k8s')) skills.push('Kubernetes');
    if (combinedText.includes('jenkins')) skills.push('Jenkins');
    if (combinedText.includes('github actions')) skills.push('GitHub Actions');

    // Development Skills
    if (combinedText.includes('frontend') && !combinedText.includes('backend')) skills.push('Frontend');
    if (combinedText.includes('backend') && !combinedText.includes('frontend')) skills.push('Backend');
    if (combinedText.includes('fullstack') || combinedText.includes('full stack')) skills.push('Full Stack');
    if (combinedText.includes('devops')) skills.push('DevOps');
    if (combinedText.includes('mobile') || combinedText.includes('ios') || combinedText.includes('android')) skills.push('Mobile Dev');

    // Data Science & Analytics
    if (combinedText.includes('machine learning') || combinedText.includes('ml ')) skills.push('Machine Learning');
    if (combinedText.includes('data science')) skills.push('Data Science');
    if (combinedText.includes('data analyst')) skills.push('Data Analysis');
    if (combinedText.includes('business intelligence') || combinedText.includes('bi ')) skills.push('Business Intelligence');
    if (combinedText.includes('tableau')) skills.push('Tableau');
    if (combinedText.includes('power bi')) skills.push('Power BI');

    // Design Skills
    if (combinedText.includes('ui') && combinedText.includes('ux')) skills.push('UI/UX Design');
    if (combinedText.includes('graphic design')) skills.push('Graphic Design');
    if (combinedText.includes('figma')) skills.push('Figma');
    if (combinedText.includes('sketch')) skills.push('Sketch');
    if (combinedText.includes('adobe') || combinedText.includes('photoshop')) skills.push('Adobe Creative');

    // Marketing & Business Skills
    if (combinedText.includes('digital marketing')) skills.push('Digital Marketing');
    if (combinedText.includes('seo')) skills.push('SEO');
    if (combinedText.includes('sem')) skills.push('SEM');
    if (combinedText.includes('social media')) skills.push('Social Media');
    if (combinedText.includes('content marketing')) skills.push('Content Marketing');
    if (combinedText.includes('sales')) skills.push('Sales');
    if (combinedText.includes('marketing')) skills.push('Marketing');

    // If no specific skills found, try to extract from keywords
    if (skills.length === 0 && keyword) {
      const keywordSkills = keyword.toLowerCase().split(/[\s,]+/).filter(k =>
        k.length > 2 && !['and', 'the', 'for', 'with', 'job', 'jobs'].includes(k)
      );
      skills.push(...keywordSkills.slice(0, 3));
    }

    return skills.slice(0, 4); // Limit to 4 skills for better display
  };

  const jobLevel = getJobLevel(job?.title || '');
  const industry = getIndustry(job?.companyName || '', job?.title || '');
  const skills = extractSkills(job?.title || '', job?.keyword);

  return (
    <div
      className="rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group border flex flex-col justify-between cursor-pointer"
      style={{
        backgroundColor: 'var(--card-bg-color)',
        borderColor: 'var(--card-border-color)',
        minHeight: '520px'
      }}
      onClick={() => window.open(job?.jobURL, '_blank')}
      role="button"
      tabIndex={0}
    >
      {/* Header Section */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight" style={{color: 'var(--card-text-color)'}}>
              {job?.title || "Untitled Job"}
            </h3>

            {job?.jobDuration && job.jobDuration !== 'N/A' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap border mb-2 block" style={{backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)'}}>
                <Clock className="w-3 h-3 inline mr-1" />
                {job.jobDuration}
              </span>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${jobLevel.color}`}>
                {jobLevel.level}
              </span>
              <span className="text-sm" style={{color: 'var(--card-secondary-text-color)'}}>
                {industry.icon} {industry.industry}
              </span>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{color: 'var(--card-secondary-text-color)'}}>
              <div className="p-2 rounded-lg mr-3 bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0">
                <Building className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <a
                href={job?.companyURL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-blue-600 transition-colors truncate text-lg md:text-xl"
              >
                {job?.companyName || "Unknown Company"}
              </a>
            </div>
          </div>

          {/* Location and Date */}
          <div className="flex items-center text-sm md:text-base" style={{color: 'var(--card-secondary-text-color)'}}>
            <div className="p-1.5 rounded-lg mr-2 bg-gradient-to-r from-green-500 to-emerald-500 flex-shrink-0">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="truncate mr-3">{job?.jobLocation || "Location not specified"}</span>
            <div className="p-1.5 rounded-lg mr-2 bg-gradient-to-r from-orange-500 to-red-500 flex-shrink-0">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="whitespace-nowrap">{job?.scrapedAt ? formatDate(job.scrapedAt) : "Date not available"}</span>
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" style={{color: 'var(--card-secondary-text-color)'}} />
                <span className="text-sm font-medium" style={{color: 'var(--card-secondary-text-color)'}}>Key Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-200 border border-gray-500">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Tags Section */}
          <div className="flex flex-wrap gap-2">
            {job?.jobLocation?.toLowerCase().includes('remote') && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-800 text-green-100 border border-green-600">
                🏠 Remote
              </span>
            )}
            {job?.jobLocation?.toLowerCase().includes('onsite') && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-800 text-blue-100 border border-blue-600">
                🏢 On-site
              </span>
            )}
            {job?.jobType && job.jobType !== 'Full-time' && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-800 text-orange-100 border border-orange-600">
                ⏰ {job.jobType}
              </span>
            )}
            {job?.source && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-800 text-purple-100 border border-purple-600">
                📊 {getDisplaySource(job.source)}
              </span>
            )}
          </div>

          {/* Salary Information */}
          {job?.salary && (
            <div className="mt-3">
              <span className="inline-block px-3 py-2 rounded-lg text-sm font-semibold bg-yellow-900 text-yellow-200 border border-yellow-700">
                💰 {job.salary}
              </span>
            </div>
          )}

          {/* Keyword Badge */}
          {job?.keyword && (
            <div className="mt-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border" style={{backgroundColor: 'var(--keyword-badge-bg-color)', color: 'var(--keyword-badge-text-color)', borderColor: 'var(--keyword-badge-border-color)'}}>
                <Target className="w-3 h-3 inline mr-1" />
                {job.keyword}
              </span>
            </div>
          )}

          {/* Application Info */}
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-200">Apply on {getDisplaySource(job?.source || 'Platform')}</span>
              </div>
              <span className="text-xs text-gray-400">External Link</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
});
