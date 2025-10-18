import React from 'react';
import { CVData } from '../types/CV';

interface CVPDFTemplateProps {
  cvData: CVData;
}

const CVPDFTemplate: React.FC<CVPDFTemplateProps> = ({ cvData }) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '20mm',
      backgroundColor: 'white',
      color: 'black',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#333' }}>
          {cvData.personalInfo.fullName}
        </h1>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
          {cvData.personalInfo.phone && <span> | {cvData.personalInfo.phone}</span>}
          {cvData.personalInfo.address && <span> | {cvData.personalInfo.address}</span>}
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
          {cvData.personalInfo.linkedin && <span>LinkedIn: {cvData.personalInfo.linkedin}</span>}
          {cvData.personalInfo.github && <span> | GitHub: {cvData.personalInfo.github}</span>}
          {cvData.personalInfo.website && <span> | Website: {cvData.personalInfo.website}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {cvData.personalInfo.summary && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ fontSize: '14px', color: '#333', margin: '0' }}>
            {cvData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {cvData.workExperience.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            WORK EXPERIENCE
          </h2>
          {cvData.workExperience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0' }}>
                  {exp.position}
                </h3>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>
                {exp.company}
                {exp.location && <span> | {exp.location}</span>}
              </div>
              {exp.description && (
                <p style={{ fontSize: '14px', color: '#333', margin: '0', whiteSpace: 'pre-wrap' }}>
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {cvData.education.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            EDUCATION
          </h2>
          {cvData.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0' }}>
                  {edu.degree}
                  {edu.field && <span> in {edu.field}</span>}
                </h3>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>
                {edu.institution}
              </div>
              {edu.gpa && (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  GPA: {edu.gpa}
                </div>
              )}
              {edu.description && (
                <p style={{ fontSize: '14px', color: '#333', margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {cvData.skills.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            SKILLS
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {cvData.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  padding: '5px 12px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#333'
                }}
              >
                {skill.name}
                {skill.level && <span> ({skill.level})</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVPDFTemplate;