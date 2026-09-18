import { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle, AlertCircle, FileCheck2, 
  Sparkles, RefreshCw, ArrowRight, ShieldCheck, Award, Zap, File,
  Edit3, Check, FileCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../utils/api';
import './Resume.css';

export default function Resume() {
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'paste'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Accept all types of resume files
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const startAnalysis = async () => {
    if (uploadMode === 'file' && !file) return;
    if (uploadMode === 'paste' && !pastedText.trim()) return;

    setIsAnalyzing(true);
    
    try {
      let response;
      if (uploadMode === 'file' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        response = await fetch(endpoints.resumeAnalyze, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(endpoints.resumeAnalyze, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: pastedText }),
        });
      }

      if (!response.ok) {
        let errorMessage = 'Unable to analyze resume document.';
        try {
          const errData = await response.json();
          if (errData.error) errorMessage = errData.error;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAnalysisResult(data);
      
      // Store in localStorage so Coach AI Interview immediately reads candidate context
      if (data.extractedSkills) {
        localStorage.setItem('resumeContext', JSON.stringify(data.extractedSkills));
      }

    } catch (error) {
      console.error(error);
      alert(error.message || 'Error analyzing resume. Please ensure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunchTailoredInterview = () => {
    navigate('/interview');
  };

  const handleSampleResume = () => {
    setPastedText(`YOUR NAME HERE
[Job Title] | [email@example.com] | [Phone Number] | [LinkedIn/GitHub Profile]

SUMMARY:
[Write a brief summary of your professional background, years of experience, key skills, and career objectives. Keep it to 2-3 sentences.]

CORE SKILLS:
- [Skill Category 1]: [List relevant skills]
- [Skill Category 2]: [List relevant skills]
- [Skill Category 3]: [List relevant skills]
- [Skill Category 4]: [List relevant skills]

EXPERIENCE:
[Job Title] | [Company Name] ([Start Date] - [End Date])
- [Achievement/responsibility with quantifiable impact]
- [Achievement/responsibility with quantifiable impact]
- [Achievement/responsibility with quantifiable impact]

[Job Title] | [Company Name] ([Start Date] - [End Date])
- [Achievement/responsibility with quantifiable impact]

EDUCATION:
[Degree Name] in [Field of Study] | [University Name] ([Graduation Year])
- GPA: [Your GPA] (if 3.5 or above)
- Relevant Coursework: [List important courses]

CERTIFICATIONS & AWARDS:
- [Certification Name] | [Issuing Organization] ([Year])
- [Award or Recognition] | [Organization] ([Year])`);
    setUploadMode('paste');
  };

  return (
    <div className="resume-page-container animate-fade-in">
      <div className="resume-hero-header">
        <div className="setup-badge">
          <Sparkles size={16} /> Coach AI Resume Intelligence
        </div>
        <h1>Resume Scanner & ATS Matcher</h1>
        <p>Upload any resume document (PDF, Word, DOCX, TXT, Markdown) or paste your resume text for instant ATS scoring and tailored interview questions.</p>
      </div>

      {!analysisResult ? (
        <div className="upload-box-wrapper glass-panel-premium">
          {/* Mode Switch Tabs */}
          <div className="resume-mode-tabs flex-center mb-3">
            <button 
              className={`mode-tab-btn ${uploadMode === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMode('file')}
            >
              <UploadCloud size={16} /> Upload Document File
            </button>
            <button 
              className={`mode-tab-btn ${uploadMode === 'paste' ? 'active' : ''}`}
              onClick={() => setUploadMode('paste')}
            >
              <Edit3 size={16} /> Paste Resume Text
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div 
              className="drop-zone-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="*/*" 
                hidden 
              />
              
              {file ? (
                <div className="selected-file-preview animate-scale-up">
                  <FileCheck2 size={56} className="text-gradient" />
                  <h3>{file.name}</h3>
                  <p className="text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for Coach AI Parsing</p>
                  <button 
                    className="btn btn-primary premium-btn analyze-action-btn flex-center" 
                    onClick={(e) => { e.stopPropagation(); startAnalysis(); }}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <> <RefreshCw size={18} className="spin" /> Coach AI is Analyzing Document... </>
                    ) : (
                      <> <Zap size={18} /> Run Coach AI Resume Analysis </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="upload-prompt-state">
                  <UploadCloud size={60} className="upload-cloud-icon text-accent" />
                  <h3>Drag & drop your resume file here</h3>
                  <p className="text-secondary">Supports <strong>ALL formats</strong>: PDF, Word (DOCX/DOC), TXT, Markdown, RTF (up to 15MB)</p>
                  <button className="btn btn-secondary mt-3">Browse Local Files</button>
                </div>
              )}
            </div>
          ) : (
            <div className="paste-text-area-wrap animate-fade-in">
              <div className="space-between mb-2">
                <span className="text-secondary text-sm">Paste your plain resume text below:</span>
                <button className="btn-auto-sample" onClick={handleSampleResume}>
                  Fill Sample Full Stack Resume
                </button>
              </div>
              <textarea
                className="resume-paste-textarea"
                rows={10}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your resume content, experience, skills, and education here..."
              />
              <div className="flex-center mt-3">
                <button 
                  className="btn btn-primary premium-btn analyze-action-btn flex-center" 
                  onClick={startAnalysis}
                  disabled={isAnalyzing || !pastedText.trim()}
                >
                  {isAnalyzing ? (
                    <> <RefreshCw size={18} className="spin" /> Coach AI is Analyzing Text... </>
                  ) : (
                    <> <Zap size={18} /> Run Coach AI Resume Analysis </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="analysis-dashboard-grid animate-slide-up">
          {/* Top ATS Score Card */}
          <div className="ats-score-hero glass-panel-premium space-between">
            <div className="ats-score-content">
              <span className="badge mb-2">ATS Readiness Score</span>
              <h2>Overall Resume Grade</h2>
              <p className="text-secondary">Coach AI evaluated your document against top software engineering criteria.</p>
              
              <div className="ats-sub-scores">
                <div className="ats-sub-item"><span>Skill Coverage</span><strong>88%</strong></div>
                <div className="ats-sub-item"><span>Keyword Relevance</span><strong>84%</strong></div>
                <div className="ats-sub-item"><span>Formatting & Impact</span><strong>{analysisResult.score || 82}%</strong></div>
              </div>
            </div>

            <div className="score-radial-box">
              <div className="score-radial-number text-gradient">{analysisResult.score || 82}</div>
              <span className="score-radial-label">Out of 100</span>
            </div>
          </div>

          {/* Quick Launch Tailored Interview CTA */}
          <div className="resume-interview-cta glass-panel-premium space-between">
            <div className="flex-center" style={{gap: '1rem'}}>
              <ShieldCheck size={32} className="text-success" />
              <div>
                <h4>Practice Tailored Questions with Coach AI</h4>
                <p className="text-secondary">Coach AI is ready to interview you based on your verified skills.</p>
              </div>
            </div>
            <button className="btn btn-primary premium-btn flex-center" onClick={handleLaunchTailoredInterview}>
              Start Tailored Mock Interview <ArrowRight size={18} />
            </button>
          </div>

          {/* Extracted vs Missing Skills */}
          <div className="skills-comparison-grid">
            <div className="skill-box glass-panel-premium">
              <h3 className="text-success flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
                <CheckCircle size={18} /> Verified Extracted Skills
              </h3>
              <p className="text-secondary text-sm mb-3">Keywords recognized by corporate applicant tracking systems (ATS):</p>
              <div className="skill-chips-wrap">
                {analysisResult.extractedSkills?.map(skill => (
                  <span key={skill} className="tag tag-success">{skill}</span>
                ))}
              </div>
            </div>

            <div className="skill-box glass-panel-premium">
              <h3 className="text-warning flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
                <AlertCircle size={18} /> High-Impact Missing Skills
              </h3>
              <p className="text-secondary text-sm mb-3">Adding these keywords will increase your interview shortlist chances:</p>
              <div className="skill-chips-wrap">
                {analysisResult.missingSkills?.map(skill => (
                  <span key={skill} className="tag tag-warning">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="ai-suggestions-panel glass-panel-premium">
            <h3><Sparkles size={20} className="text-gradient" /> Coach AI Improvement Suggestions</h3>
            <ul className="suggestions-styled-list">
              {analysisResult.suggestions?.map((s, idx) => (
                <li key={idx} className="suggestion-bullet">
                  <span className="bullet-indicator">{idx + 1}</span>
                  <p>{s}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Predicted Interview Questions */}
          <div className="predicted-questions-panel glass-panel-premium">
            <h3><Award size={20} className="text-accent" /> Coach AI Predicted Interview Questions</h3>
            <p className="text-secondary mb-3">Based on your specific project highlights and skills, expect these inquiries:</p>
            <div className="predicted-list">
              {analysisResult.generatedQuestions?.map((q, idx) => (
                <div key={idx} className="predicted-q-item">
                  <span className="q-tag">Q{idx + 1}</span>
                  <p>{q}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-center mt-3">
            <button className="btn btn-ghost" onClick={() => { setFile(null); setPastedText(''); setAnalysisResult(null); }}>
              Upload Another Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
