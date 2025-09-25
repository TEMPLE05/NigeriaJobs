import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Wand2, FileText, Upload, Download, Plus, Trash2, ChevronLeft, ChevronRight, Check, Minimize2, Maximize2 } from 'lucide-react';
import { CVData, Education, WorkExperience, Skill, PersonalInfo } from '../types/CV';
import { cvApi } from '../services/api';

const CVChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'enhance'>('create');
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chatbotRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const currentPositionRef = useRef({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
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
  const [enhanceContent, setEnhanceContent] = useState(true);
  const [optimizeKeywords, setOptimizeKeywords] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<CVData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { title: 'Personal Info', description: 'Basic information about yourself' },
    { title: 'Education', description: 'Your educational background' },
    { title: 'Experience', description: 'Your work experience' },
    { title: 'Skills', description: 'Your skills and expertise' },
    { title: 'Review', description: 'Review and generate your CV' }
  ];

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'create' && currentStep < 4) {
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

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Drag functionality - Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOpen && buttonRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      currentPositionRef.current = { ...position };
      // Optimize for GPU during drag
      buttonRef.current.style.willChange = 'left, top, transform';
    }
  };

  // Drag functionality - Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOpen && buttonRef.current) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      currentPositionRef.current = { ...position };
      // Optimize for GPU during drag
      buttonRef.current.style.willChange = 'left, top, transform';
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isOpen && buttonRef.current) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newX = currentPositionRef.current.x + deltaX;
      let newY = currentPositionRef.current.y + deltaY;

      // Keep button within viewport bounds
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      // Update position directly on DOM for immediate response
      buttonRef.current.style.left = `${newX}px`;
      buttonRef.current.style.top = `${newY}px`;
      buttonRef.current.style.transform = 'none'; // Remove any existing transform

      // Update ref
      currentPositionRef.current = { x: newX, y: newY };
    }
  }, [isDragging, isOpen, dragStart.x, dragStart.y]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && !isOpen && buttonRef.current) {
      const touch = e.touches[0];
      if (touch) {
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;

        let newX = currentPositionRef.current.x + deltaX;
        let newY = currentPositionRef.current.y + deltaY;

        // Keep button within viewport bounds
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // Update position directly on DOM for immediate response
        buttonRef.current.style.left = `${newX}px`;
        buttonRef.current.style.top = `${newY}px`;
        buttonRef.current.style.transform = 'none'; // Remove any existing transform

        // Update ref
        currentPositionRef.current = { x: newX, y: newY };
      }
    }
  }, [isDragging, isOpen, dragStart.x, dragStart.y]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && buttonRef.current) {
      setIsDragging(false);
      // Clean up GPU optimization
      buttonRef.current.style.willChange = 'auto';
      // Sync the final position back to state
      setPosition(currentPositionRef.current);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging && buttonRef.current) {
      setIsDragging(false);
      // Clean up GPU optimization
      buttonRef.current.style.willChange = 'auto';
      // Sync the final position back to state
      setPosition(currentPositionRef.current);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp, handleTouchEnd]);

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
      case 4: // Review
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

  const resetChatbot = () => {
    setCurrentStep(0);
    setCvData({
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
    setTargetJob('');
    setUploadedFile(null);
    setGeneratedCV(null);
    setPdfUrl(null);
    setError(null);
  };

  if (!isOpen) {
    return (
      <div
        className="fixed z-50 cursor-move select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }}
        ref={buttonRef}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => setIsOpen(true)}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 select-none"
          title="Open CV Generator (Drag to move)"
          style={{ touchAction: 'none' }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Drag to move
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatbotRef}>
      <div className={`rounded-2xl shadow-2xl border transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`} style={{
        backgroundColor: 'var(--card-bg-color)',
        borderColor: 'var(--badge-border-color)',
        boxShadow: 'var(--filter-shadow)'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{borderColor: 'var(--badge-border-color)'}}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{color: 'var(--card-text-color)'}}>CV Generator</h3>
              {!isMinimized && (
                <p className="text-xs" style={{color: 'var(--card-secondary-text-color)'}}>AI-powered resume enhancement</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{color: 'var(--card-text-color)'}}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{color: 'var(--card-text-color)'}}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col h-[calc(100%-64px)]">
            {/* Tab Navigation */}
            <div className="flex justify-center p-3 border-b" style={{borderColor: 'var(--badge-border-color)'}}>
              <div className="p-1 rounded-lg" style={{backgroundColor: 'var(--filter-bg-color)'}}>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setCurrentStep(0);
                    resetChatbot();
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'create'
                      ? 'shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'create' ? 'var(--card-bg-color)' : 'transparent',
                    color: 'var(--card-text-color)'
                  }}
                >
                  Create CV
                </button>
                <button
                  onClick={() => {
                    setActiveTab('enhance');
                    resetChatbot();
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'enhance'
                      ? 'shadow-sm'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'enhance' ? 'var(--card-bg-color)' : 'transparent',
                    color: 'var(--card-text-color)'
                  }}
                >
                  Enhance CV
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'create' ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                            index <= currentStep
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          }`}>
                            {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-8 h-0.5 mx-1 rounded transition-all ${
                              index < currentStep ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {steps[currentStep].title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {steps[currentStep].description}
                      </p>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-3">
                    {currentStep === 0 && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={cvData.personalInfo.fullName}
                          onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          value={cvData.personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={cvData.personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <textarea
                          placeholder="Professional Summary"
                          value={cvData.personalInfo.summary}
                          onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-3">
                        {cvData.education.map((edu, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <input
                              type="text"
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addEducation}
                          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-3">
                        {cvData.workExperience.map((exp, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <input
                              type="text"
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Position"
                              value={exp.position}
                              onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <textarea
                              placeholder="Description"
                              value={exp.description}
                              onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <button
                              onClick={() => removeWorkExperience(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addWorkExperience}
                          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-3">
                        {cvData.skills.map((skill, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Skill"
                              value={skill.name}
                              onChange={(e) => updateSkill(index, 'name', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <select
                              value={skill.level}
                              onChange={(e) => updateSkill(index, 'level', e.target.value as Skill['level'])}
                              className="px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Expert">Expert</option>
                            </select>
                            <button
                              onClick={() => removeSkill(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addSkill}
                          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Target Job Position (optional)"
                          value={targetJob}
                          onChange={(e) => setTargetJob(e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="enhance-content"
                            checked={enhanceContent}
                            onChange={(e) => setEnhanceContent(e.target.checked)}
                          />
                          <label htmlFor="enhance-content" className="text-xs">Enhance content</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="optimize-keywords"
                            checked={optimizeKeywords}
                            onChange={(e) => setOptimizeKeywords(e.target.checked)}
                          />
                          <label htmlFor="optimize-keywords" className="text-xs">Optimize keywords</label>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Enhance Tab */
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload your existing CV
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="cv-upload-chatbot"
                    />
                    <label
                      htmlFor="cv-upload-chatbot"
                      className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Choose File</span>
                    </label>
                    {uploadedFile && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Selected: {uploadedFile.name}
                      </p>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Target Job Position (optional)"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enhance-content-chatbot"
                      checked={enhanceContent}
                      onChange={(e) => setEnhanceContent(e.target.checked)}
                    />
                    <label htmlFor="enhance-content-chatbot" className="text-xs">Enhance content</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="optimize-keywords-chatbot"
                      checked={optimizeKeywords}
                      onChange={(e) => setOptimizeKeywords(e.target.checked)}
                    />
                    <label htmlFor="optimize-keywords-chatbot" className="text-xs">Optimize keywords</label>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {generatedCV && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                  <div className="text-center mb-3">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {generatedCV.personalInfo.fullName}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      CV Generated Successfully!
                    </p>
                  </div>
                  {pdfUrl && (
                    <button
                      onClick={downloadPDF}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3" style={{borderColor: 'var(--badge-border-color)'}}>
              {activeTab === 'create' ? (
                <div className="flex justify-between items-center">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-1 px-3 py-1 rounded text-sm disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--filter-bg-color)',
                      color: 'var(--card-text-color)'
                    }}
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span>Prev</span>
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={generateCV}
                      disabled={loading}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      <span>{loading ? 'Generating...' : 'Generate'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={enhanceCV}
                  disabled={loading || !uploadedFile}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  <span>{loading ? 'Processing...' : 'Enhance CV'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVChatbot;