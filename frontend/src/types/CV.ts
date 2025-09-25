export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  achievements?: string[];
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  certifications?: string[];
  languages?: string[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }[];
}

export interface CVGenerationRequest {
  cvData: CVData;
  targetJob?: string;
  enhanceContent: boolean;
  optimizeKeywords: boolean;
}

export interface CVEnhancementRequest {
  existingCV: File;
  targetJob?: string;
  enhanceContent: boolean;
  optimizeKeywords: boolean;
}

export interface CVResponse {
  success: boolean;
  cvData?: CVData;
  pdfUrl?: string;
  message?: string;
}