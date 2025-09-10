export interface Job {
  _id?: string;
  title: string;
  companyName: string;
  companyURL: string;
  jobLocation: string;
  jobDuration: string;
  jobURL: string;
  keyword: string;
  location: string;
  source?: string;        // NEW: Platform source (Indeed, LinkedIn, Jobberman)
  jobType?: string;       // NEW: Full-time, Part-time, Contract, etc.
  salary?: string;        // NEW: Salary information if available
  scrapedAt: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  location?: string;
  category?: string;
  jobType?: string;
  search?: string;
  company?: string;
  dateRange?: string;
}

export interface JobResponse {
  jobs: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface JobStats {
  totalJobs: number;
  totalCompanies: number;
  topCategories: Array<{ _id: string; count: number }>;
  topLocations: Array<{ _id: string; count: number }>;
}