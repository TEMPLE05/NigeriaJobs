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