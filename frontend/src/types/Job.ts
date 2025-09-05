export interface Job {
  _id: string;
  title: string;
<<<<<<< HEAD
  companyName: string;
  companyURL: string;
  jobLocation: string;
  jobDuration: string;
  jobURL: string;
  keyword: string;
  location: string;
  scrapedAt: string;
=======
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
>>>>>>> 89eb64c6d6785a31b0aad1ae8cef44224dc9c6d3
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