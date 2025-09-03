export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  category: string;
  applicationUrl: string;
  source: string;
  datePosted: string;
  scrapedAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  location?: string;
  category?: string;
  jobType?: string;
  search?: string;
  company?: string;
}

export interface JobResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface JobStats {
  totalJobs: number;
  totalCompanies: number;
  topCategories: Array<{ _id: string; count: number }>;
  topLocations: Array<{ _id: string; count: number }>;
}