import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Wand2, Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { CVData, Education, WorkExperience, Skill, PersonalInfo } from '../types/CV';
import { cvApi } from '../services/api';
import { usePDF } from 'react-to-pdf';
import CVPDFTemplate from './CVPDFTemplate';

const CVGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'enhance'>('create');
  const [currentStep, setCurrentStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: '',
      summary: ''
    },
    education: [],
    workExperience: [],
    skills: []
  });

  const [targetJob, setTargetJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [enhanceContent, setEnhanceContent] = useState(true);
  const [optimizeKeywords, setOptimizeKeywords] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<CVData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // PDF generation
  const pdfRef = useRef<HTMLDivElement>(null);
  const { toPDF, targetRef } = usePDF({
    filename: `${generatedCV?.personalInfo.fullName || cvData.personalInfo.fullName || 'CV'}.pdf`,
    page: { margin: 20 }
  });

  const steps = [
    { title: 'Personal Info', description: 'Basic information about yourself' },
    { title: 'Education', description: 'Your educational background' },
    { title: 'Experience', description: 'Your work experience' },
    { title: 'Skills', description: 'Your skills and expertise' },
    { title: 'Job Description', description: 'Paste the job description you want to apply for' },
    { title: 'Review', description: 'Review and generate your CV' }
  ];

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'create' && currentStep < 5) {
        localStorage.setItem('cvDraft', JSON.stringify(cvData));
      }
    }, 30000); // Save every 30 seconds

    return () => clearTimeout(timer);
  }, [cvData, activeTab, currentStep]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('cvDraft');
    if (draft) {
      try {
        setCvData(JSON.parse(draft));
      } catch (e) {
        console.error('Failed to load CV draft');
      }
    }
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Personal Info
        return !!cvData.personalInfo.fullName && !!cvData.personalInfo.email;
      case 1: // Education
        return true; // Optional
      case 2: // Experience
        return true; // Optional
      case 3: // Skills
        return cvData.skills.length > 0;
      case 4: // Job Description
        return true; // Optional
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addWorkExperience = () => {
    setCvData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        description: ''
      }]
    }));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        name: '',
        level: 'Intermediate',
        category: ''
      }]
    }));
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const generateCV = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cvApi.generateCV({
        cvData,
        targetJob: targetJob || undefined,
        enhanceContent,
        optimizeKeywords
      });

      setGeneratedCV(response.cvData || null);
      setPdfUrl(response.pdfUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  const enhanceCV = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cvFile', uploadedFile);
      formData.append('targetJob', targetJob);
      formData.append('enhanceContent', enhanceContent.toString());
      formData.append('optimizeKeywords', optimizeKeywords.toString());

      const response = await cvApi.enhanceCV(formData);

      setGeneratedCV(response.cvData || null);
      setPdfUrl(response.pdfUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance CV');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!pdfUrl) return;

    try {
      const filename = pdfUrl.split('/').pop() || 'cv.pdf';
      const blob = await cvApi.downloadCV(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced_cv_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download PDF');
    }
  };

  const downloadClientPDF = async () => {
    if (!generatedCV) return;

    try {
      await toPDF();
    } catch (err) {
      setError('Failed to generate PDF');
    }
  };

  const analyzeJobFit = async () => {
    if (!jobDescription.trim()) {
      setAnalysisError('Please enter a job description first.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResults(null);

    try {
      const cvDataString = JSON.stringify(cvData);
      const results = await cvApi.analyzeJob(jobDescription, cvDataString);
      setAnalysisResults(results);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze job fit');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          CV Generator
        </h1>
        <p className="text-xl" style={{color: 'var(--card-secondary-text-color)'}}>
          Create professional resumes with smart enhancements
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="p-1 rounded-2xl shadow-lg border border-gray-200 dark:border-white" style={{ backgroundColor: 'var(--bg-color)' }}>
          <button
            onClick={() => {
              setActiveTab('create');
              setCurrentStep(0);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
            }`}
          >
            Create New CV
          </button>
          <button
            onClick={() => {
              setActiveTab('enhance');
              setCurrentStep(0);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'enhance'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
            }`}
          >
            Enhance Existing CV
          </button>
        </div>
      </div>

      {/* Progress Bar for Create Tab */}
      {activeTab === 'create' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                    index < currentStep ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {activeTab === 'create' ? (
            <>
              {/* Step Content */}
              {currentStep === 0 && (
                /* Personal Information */
                <div className="rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-white" style={{ backgroundColor: 'var(--bg-color)' }}>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="filter-label">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cvData.personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                        className="filter-select"
                        required
                      />
                    </div>
                    <div>
                      <label className="filter-label">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={cvData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        className="filter-select"
                        required
                      />
                    </div>
                    <div>
                      <label className="filter-label">
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={cvData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        className="filter-select"
                      />
                    </div>
                    <div>
                      <label className="filter-label">
                        Address
                      </label>
                      <input
                        type="text"
                        placeholder="City, State, Country"
                        value={cvData.personalInfo.address}
                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                        className="filter-select"
                      />
                    </div>
                    <div>
                      <label className="filter-label">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/johndoe"
                        value={cvData.personalInfo.linkedin}
                        onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                        className="filter-select"
                      />
                    </div>
                    <div>
                      <label className="filter-label">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/johndoe"
                        value={cvData.personalInfo.github}
                        onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                        className="filter-select"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="filter-label">
                      Professional Summary
                    </label>
                    <textarea
                      placeholder="Brief summary of your professional background and career goals..."
                      value={cvData.personalInfo.summary}
                      onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                      rows={4}
                      className="filter-select resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                /* Education */
                <div className="rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-white" style={{ backgroundColor: 'var(--bg-color)' }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">2</span>
                      </div>
                      Education
                    </h2>
                    <button
                      onClick={addEducation}
                      className="clear-filters-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </button>
                  </div>
                  {cvData.education.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-lg mb-4">No education added yet</p>
                      <p className="text-sm">Click "Add Education" to get started</p>
                    </div>
                  ) : (
                    cvData.education.map((edu, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Institution
                            </label>
                            <input
                              type="text"
                              placeholder="University of Example"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="filter-select"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Degree
                            </label>
                            <input
                              type="text"
                              placeholder="Bachelor of Science"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="filter-select"
                            />
                          </div>
                          <div>
                            <label className="filter-label">
                              Field of Study
                            </label>
                            <input
                              type="text"
                              placeholder="Computer Science"
                              value={edu.field}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                              className="filter-select"
                            />
                          </div>
                          <div>
                            <label className="filter-label">
                              GPA (optional)
                            </label>
                            <input
                              type="text"
                              placeholder="3.8"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                              className="filter-select"
                            />
                          </div>
                          <div>
                            <label className="filter-label">
                              Start Date
                            </label>
                            <input
                              type="text"
                              placeholder="September 2018"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                              className="filter-select"
                            />
                          </div>
                          <div>
                            <label className="filter-label">
                              End Date
                            </label>
                            <input
                              type="text"
                              placeholder="May 2022"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                              className="filter-select"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="filter-label">
                            Description (optional)
                          </label>
                          <textarea
                            placeholder="Relevant coursework, achievements, or activities..."
                            value={edu.description}
                            onChange={(e) => updateEducation(index, 'description', e.target.value)}
                            rows={3}
                            className="filter-select resize-none"
                          />
                        </div>
                        <button
                          onClick={() => removeEducation(index)}
                          className="clear-filters-btn"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {currentStep === 2 && (
                /* Work Experience */
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">3</span>
                      </div>
                      Work Experience
                    </h2>
                    <button
                      onClick={addWorkExperience}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Experience</span>
                    </button>
                  </div>
                  {cvData.workExperience.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-lg mb-4">No work experience added yet</p>
                      <p className="text-sm">Click "Add Experience" to get started</p>
                    </div>
                  ) : (
                    cvData.workExperience.map((exp, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Company
                            </label>
                            <input
                              type="text"
                              placeholder="Tech Corp Inc."
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Position
                            </label>
                            <input
                              type="text"
                              placeholder="Software Engineer"
                              value={exp.position}
                              onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              placeholder="San Francisco, CA"
                              value={exp.location}
                              onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Start Date
                            </label>
                            <input
                              type="text"
                              placeholder="January 2020"
                              value={exp.startDate}
                              onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              End Date
                            </label>
                            <input
                              type="text"
                              placeholder="Present"
                              value={exp.endDate}
                              onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                              className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Job Description
                          </label>
                          <textarea
                            placeholder="Describe your key responsibilities, achievements, and impact..."
                            value={exp.description}
                            onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                        </div>
                        <button
                          onClick={() => removeWorkExperience(index)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {currentStep === 3 && (
                /* Skills */
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">4</span>
                      </div>
                      Skills & Expertise
                    </h2>
                    <button
                      onClick={addSkill}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Skill</span>
                    </button>
                  </div>
                  {cvData.skills.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-lg mb-4">No skills added yet</p>
                      <p className="text-sm">Click "Add Skill" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cvData.skills.map((skill, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Skill Name *
                              </label>
                              <input
                                type="text"
                                placeholder="JavaScript, Python, Project Management..."
                                value={skill.name}
                                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                              />
                            </div>
                            <div className="md:w-48">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Proficiency Level
                              </label>
                              <select
                                value={skill.level}
                                onChange={(e) => updateSkill(index, 'level', e.target.value as Skill['level'])}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                title={`Skill level for ${skill.name}`}
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => removeSkill(index)}
                                className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                                title={`Remove ${skill.name} skill`}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                /* Job Description */
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">5</span>
                    </div>
                    Job Description
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Paste the full job description from the position you want to apply for. This will help tailor your CV to match the job requirements.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Description (optional)
                    </label>
                    <textarea
                      placeholder="Paste the job description here... Include requirements, responsibilities, and qualifications."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={analyzeJobFit}
                      disabled={analysisLoading || !jobDescription.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      {analysisLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Wand2 className="w-5 h-5" />
                      )}
                      <span>{analysisLoading ? 'Analyzing...' : 'Analyze Job Fit'}</span>
                    </button>
                  </div>
                  {analysisError && (
                    <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {analysisError}
                    </div>
                  )}
                  {analysisResults && (
                    <div className="mt-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4 text-green-800 dark:text-green-200">Job Fit Analysis & Suggestions</h3>
                      <div className="text-green-700 dark:text-green-300 whitespace-pre-wrap">
                        {analysisResults}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                /* Review & Generate */
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">5</span>
                    </div>
                    Review & Generate
                  </h2>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                      <div className="text-2xl font-bold">{cvData.personalInfo.fullName ? '✓' : '✗'}</div>
                      <div className="text-sm opacity-90">Personal Info</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                      <div className="text-2xl font-bold">{cvData.education.length}</div>
                      <div className="text-sm opacity-90">Education</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white">
                      <div className="text-2xl font-bold">{cvData.workExperience.length}</div>
                      <div className="text-sm opacity-90">Experience</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
                      <div className="text-2xl font-bold">{cvData.skills.length}</div>
                      <div className="text-sm opacity-90">Skills</div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-4 text-white">
                      <div className="text-2xl font-bold">{jobDescription ? '✓' : '—'}</div>
                      <div className="text-sm opacity-90">Job Description</div>
                    </div>
                  </div>

                  {/* Enhancement Options */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border-2 border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Enhancement Options</h3>
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ <strong>No API keys required!</strong> CV enhancement works with local processing algorithms.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target Job Position (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Software Engineer, Product Manager..."
                          value={targetJob}
                          onChange={(e) => setTargetJob(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="enhance-content"
                          checked={enhanceContent}
                          onChange={(e) => setEnhanceContent(e.target.checked)}
                          className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                        />
                        <label htmlFor="enhance-content" className="text-gray-700 dark:text-gray-300">
                          Enhance content and descriptions
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="optimize-keywords"
                          checked={optimizeKeywords}
                          onChange={(e) => setOptimizeKeywords(e.target.checked)}
                          className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                        />
                        <label htmlFor="optimize-keywords" className="text-gray-700 dark:text-gray-300">
                          Optimize keywords for ATS systems
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Preview</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {cvData.personalInfo.fullName.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {cvData.personalInfo.fullName || 'Name not provided'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {cvData.personalInfo.email || 'Email not provided'}
                          </div>
                        </div>
                      </div>
                      {cvData.workExperience.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Latest: {cvData.workExperience[0].position} at {cvData.workExperience[0].company}
                        </div>
                      )}
                      {cvData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cvData.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                              {skill.name}
                            </span>
                          ))}
                          {cvData.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                              +{cvData.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Download Button */}
                  {generatedCV && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-700">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Download Options</h3>
                      <div className="flex gap-4">
                        <button
                          onClick={downloadClientPDF}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                        >
                          <Download className="w-5 h-5" />
                          <span>Download PDF</span>
                        </button>
                        {pdfUrl && (
                          <button
                            onClick={downloadPDF}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
                          >
                            <Download className="w-5 h-5" />
                            <span>Download Enhanced PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              {activeTab === 'create' && (
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={generateCV}
                      disabled={loading || !validateStep(currentStep)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Wand2 className="w-5 h-5" />
                      )}
                      <span>{loading ? 'Generating...' : 'Generate CV'}</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Enhance Existing CV Tab */
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Upload Your CV
              </h2>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your existing CV (PDF or Word document)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </label>
                {uploadedFile && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'enhance' && (
            <>
              {/* Enhancement Options for Enhance Tab */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Enhancement Options
                </h2>
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ <strong>No API keys required!</strong> CV enhancement works with local processing algorithms.
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Target Job Position (optional)"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enhance-content"
                      checked={enhanceContent}
                      onChange={(e) => setEnhanceContent(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="enhance-content" className="text-gray-700 dark:text-gray-300">
                      Enhance content and descriptions
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="optimize-keywords"
                      checked={optimizeKeywords}
                      onChange={(e) => setOptimizeKeywords(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="optimize-keywords" className="text-gray-700 dark:text-gray-300">
                      Optimize keywords for ATS systems
                    </label>
                  </div>
                </div>
              </div>

              {/* Generate Button for Enhance Tab */}
              <button
                onClick={enhanceCV}
                disabled={loading || !uploadedFile}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                <span>{loading ? 'Processing...' : 'Enhance CV'}</span>
              </button>
            </>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Hidden PDF Template */}
          <div ref={targetRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            {generatedCV && <CVPDFTemplate cvData={generatedCV} />}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                CV Preview
              </h2>
              {pdfUrl && (
                <button
                  onClick={downloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>

            {generatedCV ? (
              <div className="border rounded-lg p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {generatedCV.personalInfo.fullName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {generatedCV.personalInfo.email} | {generatedCV.personalInfo.phone}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {generatedCV.personalInfo.address}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold text-lg mb-2">Professional Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {generatedCV.personalInfo.summary}
                  </p>
                </div>

                {generatedCV.workExperience.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-lg mb-2">Work Experience</h4>
                    {generatedCV.workExperience.map((exp, index) => (
                      <div key={index} className="mb-3">
                        <div className="font-semibold">{exp.position} at {exp.company}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                          {exp.startDate} - {exp.endDate} | {exp.location}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {generatedCV.education.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-lg mb-2">Education</h4>
                    {generatedCV.education.map((edu, index) => (
                      <div key={index} className="mb-3">
                        <div className="font-semibold">
                          {edu.degree} in {edu.field}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {edu.institution} | {edu.startDate} - {edu.endDate}
                        </div>
                        {edu.gpa && (
                          <div className="text-gray-600 dark:text-gray-400 text-sm">
                            GPA: {edu.gpa}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {generatedCV.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-lg mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedCV.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {skill.name} ({skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <p>Your enhanced CV will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVGenerator;