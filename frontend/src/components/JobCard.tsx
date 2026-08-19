import React, { memo } from "react";
import { Job } from "../types/Job";
import { MapPin, Calendar, ExternalLink, Clock, Star, Wifi } from "lucide-react";

interface JobCardProps {
  job: Job;
}

const AVATAR_GRADIENTS = [
  'icon-bg-blue-cyan',
  'icon-bg-green-emerald',
  'icon-bg-purple-pink',
  'icon-bg-orange-red',
];

// Deterministic so the same company always gets the same color across cards/renders.
const avatarGradientFor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

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

  // Helper function to capitalize job titles
  const capitalizeTitle = (title: string) => {
    return title
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Skip common words that should remain lowercase
        const skipWords = ['and', 'or', 'but', 'nor', 'for', 'so', 'yet', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'with', 'as', 'a', 'an', 'the'];
        if (skipWords.includes(word)) {
          return word;
        }
        // Capitalize first letter, handle special cases
        if (word.includes('/')) {
          return word.split('/').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('/');
        }
        if (word.includes('-')) {
          return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // Only returns a level when the title actually signals one — an
  // unconditional "Not specified" badge on nearly every card (most scraped
  // titles don't literally say "senior"/"junior") was pure noise.
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
    return null;
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

    return skills.slice(0, 3); // Limit to 3 skills for a lighter footprint
  };

  const jobLevel = getJobLevel(job?.title || '');
  const skills = extractSkills(job?.title || '', job?.keyword);
  const companyName = job?.companyName || 'Unknown Company';
  const isRemote = job?.jobLocation?.toLowerCase().includes('remote');

  return (
    <div
      className="rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group border flex flex-col cursor-pointer"
      style={{
        backgroundColor: 'var(--card-bg-color)',
        borderColor: 'var(--card-border-color)',
        minHeight: '260px'
      }}
      onClick={() => window.open(job?.jobURL, '_blank')}
      role="button"
      tabIndex={0}
    >
      {/* Company row */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${avatarGradientFor(companyName)}`}>
          {companyName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate" style={{ color: 'var(--card-text-color)' }}>
            {companyName}
          </div>
          {job?.source && (
            <div className="text-xs" style={{ color: 'var(--card-secondary-text-color)' }}>
              via {job.source}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-lg md:text-xl font-extrabold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight"
        style={{ color: 'var(--card-text-color)' }}
      >
        {job?.title ? capitalizeTitle(job.title) : "Untitled Job"}
      </h3>

      {/* Location + posted date */}
      <div className="flex items-center gap-3 text-xs mb-2" style={{ color: 'var(--card-secondary-text-color)' }}>
        <span className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{job?.jobLocation || "Location not specified"}</span>
        </span>
        <span className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5" />
          {job?.scrapedAt ? formatDate(job.scrapedAt) : "N/A"}
        </span>
      </div>

      {/* Salary — the one thing worth calling out loudly */}
      {job?.salary && (
        <div className="mb-2">
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-900 text-yellow-200 border border-yellow-700">
            💰 {job.salary}
          </span>
        </div>
      )}

      {/* Compact metadata row — level, type, remote, duration, all same low-key style */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {jobLevel && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${jobLevel.color}`}>
            {jobLevel.level}
          </span>
        )}
        {isRemote && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>
            <Wifi className="w-3 h-3" /> Remote
          </span>
        )}
        {job?.jobType && job.jobType !== 'Full-time' && (
          <span className="px-2 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>
            {job.jobType}
          </span>
        )}
        {job?.jobDuration && job.jobDuration !== 'N/A' && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)' }}>
            <Clock className="w-3 h-3" /> {job.jobDuration}
          </span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 mb-3">
          <Star className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--card-secondary-text-color)' }} />
          {skills.map((skill, index) => (
            <span key={index} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-200 border border-gray-500">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Apply CTA — pushed to the bottom of the card so the footer lines up
          across cards regardless of how much content is above it */}
      <div className="mt-auto pt-2.5 flex items-center justify-between text-xs font-medium" style={{ color: 'var(--card-secondary-text-color)', borderTop: '1px solid var(--card-border-color)' }}>
        <span>Apply on {job?.source || 'Platform'}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </div>
  );
});
