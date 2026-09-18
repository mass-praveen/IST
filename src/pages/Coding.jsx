import { useState, useEffect, useRef } from 'react';
import {
  Play, Code2, CheckCircle2, XCircle, Sparkles, Lightbulb,
  Terminal, Clock, HardDrive, RotateCcw, Cpu, ChevronDown,
  BookOpen, Hash, Layers, Maximize2, Minimize2, AlertCircle,
  Trophy, Zap, BrainCircuit, Send, History, Edit3
} from 'lucide-react';
import { endpoints } from '../utils/api';
import './Coding.css';
import Editor from '@monaco-editor/react';

const LANG_META = {
  javascript: { label: 'JavaScript', color: '#f7df1e', ext: 'js' },
  python:     { label: 'Python 3',   color: '#3776ab', ext: 'py' },
  java:       { label: 'Java 17',    color: '#ed8b00', ext: 'java' },
  cpp:        { label: 'C++ 20',     color: '#00599c', ext: 'cpp' },
};

export default function Coding() {
  const [problems, setProblems] = useState([]);
  const [activeProblem, setActiveProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  
  const [aiMentorLoading, setAiMentorLoading] = useState(false);
  const [aiMentorFeedback, setAiMentorFeedback] = useState(null);
  
  const [activeTab, setActiveTab] = useState('public'); // public, custom, ai
  const [customInput, setCustomInput] = useState('');
  
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [problemListOpen, setProblemListOpen] = useState(false);
  
  // Template Hint
  const [showTemplateHint, setShowTemplateHint] = useState(false);
  
  // Generation Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('Arrays');
  const [genDiff, setGenDiff] = useState('Easy');
  const [isGenerating, setIsGenerating] = useState(false);

  // History
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Timer
  const [timer, setTimer] = useState(0);

  const editorRef = useRef(null);

  useEffect(() => {
    fetchProblems();
    fetchHistory();
  }, []);

  useEffect(() => {
    let interval;
    if (activeProblem && !isSubmitting && !runResults?.status?.includes('Accepted')) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeProblem, isSubmitting, runResults]);

  const fetchProblems = async () => {
    try {
      const res = await fetch(endpoints.codingProblems);
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
        if (data.length > 0) loadProblemDetails(data[0].id, data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(endpoints.codingHistory);
      if (res.ok) setHistory(await res.json());
    } catch (err) {}
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Auto-save code on change
    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();
      setCode(currentCode);
      if (activeProblem && selectedLanguage) {
        localStorage.setItem(`coding_save_${activeProblem.id}_${selectedLanguage}`, currentCode);
      }
    });
  };

  const loadProblemDetails = async (id, list = problems) => {
    try {
      const res = await fetch(endpoints.codingProblemDetails(id));
      if (!res.ok) return;
      const problem = await res.json();
      setActiveProblem(problem);
      
      // Generate helpful starting code with function signature hint
      const functionNameHint = problem.title
        .toLowerCase()
        .split(' ')
        .map((word, idx) => idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      const emptyPrompt = `// TODO: Implement the solution\n// Function name hint: ${functionNameHint}\n// \n// Write your solution below:\n\n`;
      const savedCode = localStorage.getItem(`coding_save_${problem.id}_javascript`);
      const initialCode = savedCode || emptyPrompt;
      
      setCode(initialCode);
      if (editorRef.current) editorRef.current.setValue(initialCode);
      
      setSelectedLanguage('javascript');
      setRunResults(null);
      setAiMentorFeedback(null);
      setProblemListOpen(false);
      setTimer(0);
      setActiveTab('public');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateProblem = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(endpoints.codingGenerate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage, difficulty: genDiff, topic: genTopic })
      });
      if (res.ok) {
        const newProb = await res.json();
        setProblems([newProb, ...problems]);
        setShowGenModal(false);
        setActiveProblem(newProb);
        
        const initialCode = '// Start writing your solution here...\n\n';
        setCode(initialCode);
        if (editorRef.current) editorRef.current.setValue(initialCode);
        
        setRunResults(null);
        setAiMentorFeedback(null);
        setTimer(0);
        setActiveTab('public');
      }
    } catch (err) {
      console.error(err);
    }
    setIsGenerating(false);
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    const functionNameHint = activeProblem?.title
      ?.toLowerCase()
      .split(' ')
      .map((word, idx) => idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('') || 'solve';
    const emptyPrompt = `// TODO: Implement the solution\n// Function name hint: ${functionNameHint}\n// \n// Write your solution below:\n\n`;
    const savedCode = localStorage.getItem(`coding_save_${activeProblem?.id}_${newLang}`);
    const newCode = savedCode || emptyPrompt;
    
    setCode(newCode);
    if (editorRef.current) editorRef.current.setValue(newCode);
    setRunResults(null);
  };

  const handleResetCode = () => {
    let newCode = '// Start writing your solution here...\n\n';
    if (activeProblem && selectedLanguage) {
      localStorage.removeItem(`coding_save_${activeProblem.id}_${selectedLanguage}`);
    }
    setCode(newCode);
    if (editorRef.current) editorRef.current.setValue(newCode);
    setRunResults(null);
  };

  const executeCode = async (endpoint, payload, isSub) => {
    if (isSub) setIsSubmitting(true);
    else setIsRunning(true);
    setRunResults(null);
    setAiMentorFeedback(null);
    
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, code: currentCode })
      });
      const results = await res.json();
      setRunResults(results);
      if (isSub) {
        fetchHistory();
        setActiveTab('public');
        if (results.status === 'Accepted') {
          handleAiAssist('review', currentCode);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isSub) setIsSubmitting(false);
      else setIsRunning(false);
    }
  };

  const handleRunCode = () => {
    if (!activeProblem) return;
    setActiveTab('public');
    executeCode(endpoints.codingRun, { problemId: activeProblem.id, language: selectedLanguage }, false);
  };

  const handleSubmitCode = () => {
    if (!activeProblem) return;
    executeCode(endpoints.codingSubmit, { problemId: activeProblem.id, language: selectedLanguage }, true);
  };

  const handleRunCustom = () => {
    if (!activeProblem || !customInput) return;
    setActiveTab('custom');
    executeCode(endpoints.codingRunCustom, { problemId: activeProblem.id, language: selectedLanguage, customInput }, false);
  };

  const handleAiAssist = async (action, overrideCode = null) => {
    if (!activeProblem) return;
    setAiMentorLoading(true);
    setActiveTab('ai');
    
    const currentCode = overrideCode || (editorRef.current ? editorRef.current.getValue() : code);
    try {
      const res = await fetch(endpoints.codingAiAssist, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemTitle: activeProblem.title, code: currentCode, action })
      });
      if (res.ok) setAiMentorFeedback(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setAiMentorLoading(false);
    }
  };

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const difficultyClass = activeProblem?.difficulty === 'Easy' ? 'diff-easy' : activeProblem?.difficulty === 'Medium' ? 'diff-medium' : 'diff-hard';

  if (!activeProblem) {
    return (
      <div className="coding-loading glass-panel-premium">
        <Sparkles size={32} className="spin text-accent" />
        <p>Loading Coding Workspace...</p>
      </div>
    );
  }

  return (
    <div className={`coding-arena-root animate-fade-in ${editorFullscreen ? 'editor-fullscreen' : ''}`}>

      {/* TOP NAV BAR */}
      <div className="coding-top-bar glass-panel-premium space-between">
        <div className="flex-center" style={{gap:'0.75rem'}}>
          <button className="btn btn-ghost btn-sm flex-center prob-nav-btn" onClick={() => setProblemListOpen(v => !v)}>
            <Layers size={15} /> Problems <ChevronDown size={13} />
          </button>
          <button className="btn btn-ghost btn-sm flex-center prob-nav-btn" onClick={() => setShowHistory(v => !v)}>
            <History size={15} /> History
          </button>
          <div className="prob-breadcrumb">
            <span className={`difficulty-pill ${difficultyClass}`}>{activeProblem.difficulty}</span>
            <span className="prob-breadcrumb-title">{activeProblem.title}</span>
          </div>
        </div>

        <div className="flex-center" style={{gap:'0.75rem'}}>
          <div className="coding-timer flex-center"><Clock size={14} className="text-warning" /> {formatTimer(timer)}</div>
          
          <div className="lang-picker-enhanced">
            {Object.entries(LANG_META).map(([key, meta]) => (
              <button
                key={key}
                className={`lang-tab-btn ${selectedLanguage === key ? 'lang-active' : ''}`}
                onClick={() => handleLanguageChange(key)}
                style={selectedLanguage === key ? {borderColor: meta.color, color: meta.color} : {}}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <button className="btn btn-ghost btn-sm flex-center" onClick={handleResetCode} title="Reset code"><RotateCcw size={14} /> Reset</button>
          
          <button className="btn btn-secondary flex-center run-btn" onClick={handleRunCode} disabled={isRunning || isSubmitting}>
            {isRunning ? <Cpu size={15} className="spin" /> : <Play size={15} />} Run Code
          </button>
          <button className="btn btn-primary premium-btn flex-center submit-btn" onClick={handleSubmitCode} disabled={isRunning || isSubmitting}>
            {isSubmitting ? <Cpu size={15} className="spin" /> : <Send size={15} />} Submit
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="coding-main-layout">
        {/* LEFT: PROBLEM */}
        <div className="problem-pane glass-panel-premium">
          <div className="problem-scroll-content">
            <h1 className="problem-title">{activeProblem.title}</h1>
            <div className="problem-meta-row" style={{marginBottom: '1rem', display:'flex', gap:'0.5rem', alignItems:'center'}}>
              <span className={`difficulty-pill ${difficultyClass}`}>{activeProblem.difficulty}</span>
              <span className="problem-category-badge flex-center" style={{gap:'0.2rem', background:'rgba(255,255,255,0.05)', padding:'0.2rem 0.5rem', borderRadius:'6px', fontSize:'0.75rem'}}><Hash size={11} /> {activeProblem.category}</span>
            </div>
            
            <div className="problem-description-text">{activeProblem.description}</div>
            
            <div className="example-section" style={{marginTop:'1.5rem'}}>
              <h4 style={{marginBottom:'0.5rem'}}>Example</h4>
              <div className="example-box">
                <div className="ex-line"><span className="ex-key">Input:</span><code>{activeProblem.inputFormat}</code></div>
                <div className="ex-line"><span className="ex-key">Output:</span><code>{activeProblem.outputFormat}</code></div>
              </div>
            </div>

            {activeProblem.constraints && (
              <div className="constraints-section" style={{marginTop:'1.5rem'}}>
                <h4 style={{marginBottom:'0.5rem'}}>Constraints</h4>
                <ul className="constraints-list" style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'0.4rem'}}>
                  {activeProblem.constraints?.split('\n').map((c, i) => (
                    <li key={i} className="constraint-item"><code>{c}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: EDITOR + CONSOLE */}
        <div className="editor-console-stack">
          <div className="editor-pane glass-panel-premium">
            <div className="editor-header space-between">
              <div className="editor-file-tab">
                <Code2 size={13} style={{color: LANG_META[selectedLanguage].color}} /> solution.{LANG_META[selectedLanguage].ext}
              </div>
              <div className="flex-center" style={{gap: '0.5rem'}}>
                <button 
                  className="btn btn-ghost btn-sm flex-center" 
                  onClick={() => setShowTemplateHint(true)}
                  title="View Template Hint"
                >
                  <Lightbulb size={14} /> Template
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditorFullscreen(v => !v)}>
                  {editorFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>
            <div className="editor-body">
              <Editor
                height="100%"
                width="100%"
                language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                theme="vs-dark"
                defaultValue={code}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                  lineHeight: 24,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth"
                }}
                loading={<div className="flex-center" style={{height:'100%'}}><Sparkles className="spin text-accent" /> Loading Editor...</div>}
              />
            </div>
          </div>

          {/* CONSOLE */}
          <div className="console-pane glass-panel-premium">
            <div className="console-tabs">
              <button className={`c-tab ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>Test Cases</button>
              <button className={`c-tab ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>Custom Input</button>
              <button className={`c-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}><BrainCircuit size={14} className="text-gradient" /> AI Review</button>
            </div>
            
            <div className="console-content" style={{flex:1, overflowY:'auto'}}>
              {activeTab === 'public' && (
                <div className="console-body">
                  {runResults ? (
                    <div className="results-content">
                      <h4 className={`verdict-title ${runResults.status === 'Accepted' ? 'text-success' : 'text-danger'}`}>
                        {runResults.status === 'Accepted' ? '✓' : '✗'} {runResults.status} ({runResults.passedTests}/{runResults.totalTests} Passed)
                      </h4>
                      {runResults.status === 'System Error' && (
                        <div style={{background:'rgba(244,63,94,0.15)', padding:'0.8rem', borderRadius:'6px', marginBottom:'1rem', color:'#fb7185', fontSize:'0.9rem', borderLeft:'3px solid #fb7185'}}>
                          {runResults.testCaseResults?.[0]?.actual || 'System error occurred'}
                        </div>
                      )}
                      <div className="metrics-row">
                        <span className="metric-chip"><Clock size={12} /> {runResults.runtime}</span>
                        <span className="metric-chip"><HardDrive size={12} /> {runResults.memory}</span>
                      </div>
                      <div className="test-case-list">
                        {runResults.testCaseResults?.map((tc, idx) => (
                          <div key={idx} className={`tc-card ${tc.passed ? 'tc-pass' : 'tc-fail'}`}>
                            <div className="tc-header space-between">
                              <span className="tc-name">{tc.passed ? '✓' : '✗'} Case {tc.testCase} {tc.isHidden && '(Hidden)'}</span>
                              <span className={tc.passed ? 'text-success' : 'text-danger'}>{tc.passed ? 'Passed' : 'Failed'}</span>
                            </div>
                            <div className="tc-details">
                              <div className="tc-row"><span className="tc-key">Input:</span><code style={{wordBreak:'break-all'}}>{tc.input}</code></div>
                              {!tc.isHidden && <div className="tc-row"><span className="tc-key">Expected:</span><code style={{wordBreak:'break-all'}}>{tc.expected}</code></div>}
                              {!tc.passed && (
                                <div className="tc-row tc-row-fail">
                                  <span className="tc-key">Got:</span>
                                  <code style={{wordBreak:'break-all', color:'#fb7185'}}>{tc.actual}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="console-empty text-muted flex-center" style={{flexDirection:'column', gap:'1rem', marginTop:'2rem', padding:'2rem', textAlign:'center'}}>
                      <div>
                        <Terminal size={32} style={{opacity: 0.5}} />
                      </div>
                      <div style={{maxWidth:'300px'}}>
                        <p style={{fontSize:'0.95rem', marginBottom:'0.8rem', fontWeight:500}}>Ready to test your solution!</p>
                        <p style={{fontSize:'0.85rem', lineHeight:'1.5'}}>
                          1. Write your function in the editor<br/>
                          2. Click <strong>"Run Code"</strong> to test with public cases<br/>
                          3. Click <strong>"Submit"</strong> to run hidden test cases
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="console-body">
                  <p className="text-muted" style={{fontSize:'0.85rem', marginBottom:'0.5rem'}}>Enter custom input variables (e.g. <code>nums = [1,2], target = 3</code>)</p>
                  <textarea 
                    className="custom-input-box" 
                    value={customInput} 
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="nums = [1,2,3]\ntarget = 4"
                  />
                  <button className="btn btn-secondary btn-sm mt-2" onClick={handleRunCustom} disabled={!customInput || isRunning}>Run Custom Input</button>
                  {runResults?.status === 'Custom Test Executed' && (
                    <div className="custom-output mt-3">
                      <h4>Output</h4>
                      <code>{runResults.testCaseResults?.[0]?.actual}</code>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="console-body">
                  <div className="ai-actions mb-3 flex-center" style={{justifyContent:'flex-start', gap:'0.5rem'}}>
                    <button className="btn btn-secondary btn-sm flex-center" onClick={() => handleAiAssist('hint')} disabled={aiMentorLoading}><Lightbulb size={13} className="text-warning"/> Get Hint</button>
                    <button className="btn btn-secondary btn-sm flex-center" onClick={() => handleAiAssist('review')} disabled={aiMentorLoading}><Sparkles size={13} className="text-gradient"/> Review Code</button>
                  </div>
                  {aiMentorLoading ? (
                    <div className="ai-loading flex-center" style={{padding:'2rem'}}><Sparkles size={16} className="spin text-accent" /> AI is thinking...</div>
                  ) : aiMentorFeedback ? (
                    <div className="ai-feedback-card">
                      <h4 className="ai-feedback-title">{aiMentorFeedback.title}</h4>
                      <p className="ai-feedback-text">{aiMentorFeedback.feedback}</p>
                      {aiMentorFeedback.timeComplexity && (
                        <div className="complexity-row mt-2" style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
                          <span className="tag tag-accent">Time: {aiMentorFeedback.timeComplexity}</span>
                          <span className="tag tag-warning">Space: {aiMentorFeedback.spaceComplexity}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="console-empty text-muted flex-center" style={{flexDirection:'column', gap:'0.5rem', marginTop:'2rem'}}>
                      <BrainCircuit size={24} /> Request a hint or submit code for review!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      {problemListOpen && (
        <div className="problem-list-panel glass-panel-premium panel-open">
          <div className="panel-list-header space-between" style={{padding:'1rem', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <h3>Problem Set</h3>
            <div className="flex-center" style={{gap:'0.5rem'}}>
              <button className="btn btn-primary premium-btn btn-sm flex-center" onClick={() => setShowGenModal(true)}><Edit3 size={13} /> AI Generate</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setProblemListOpen(false)}>✕</button>
            </div>
          </div>
          <div className="problem-list-items">
            {problems.map((p) => (
              <button key={p.id} className={`problem-list-item ${activeProblem.id === p.id ? 'active' : ''}`} onClick={() => loadProblemDetails(p.id)}>
                <span className="prob-item-title">{p.title}</span>
                <span className={`prob-item-diff diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showHistory && (
        <div className="history-panel glass-panel-premium">
          <div className="history-header space-between">
            <h3>Submission History</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className="history-list">
            {history.length === 0 ? <p className="text-muted p-3">No submissions yet.</p> : history.map(h => (
              <div key={h.id} className="history-item">
                <div>
                  <strong>{h.problem_title}</strong> <span className="text-muted text-sm">({h.language})</span>
                </div>
                <div className={`history-status ${h.status === 'Accepted' ? 'text-success' : 'text-danger'}`}>
                  {h.status} • {h.tests_passed}/{h.total_tests}
                </div>
                <div className="text-muted text-xs">{new Date(h.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGenModal && (
        <div className="modal-backdrop flex-center">
          <div className="glass-modal animate-slide-up" style={{width:'400px'}}>
            <h3 className="mb-3">Generate Coding Problem</h3>
            <p className="text-muted text-sm mb-4">Use AI to generate a custom coding challenge tailored to your needs.</p>
            
            <div className="form-group mb-3" style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              <label>Topic</label>
              <select className="form-input" style={{padding:'0.5rem', borderRadius:'6px', background:'rgba(0,0,0,0.3)', color:'white', border:'1px solid rgba(255,255,255,0.1)'}} value={genTopic} onChange={e => setGenTopic(e.target.value)}>
                <option>Arrays</option><option>Strings</option><option>Linked List</option>
                <option>Stack</option><option>Dynamic Programming</option>
              </select>
            </div>
            
            <div className="form-group mb-4" style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.5rem'}}>
              <label>Difficulty</label>
              <select className="form-input" style={{padding:'0.5rem', borderRadius:'6px', background:'rgba(0,0,0,0.3)', color:'white', border:'1px solid rgba(255,255,255,0.1)'}} value={genDiff} onChange={e => setGenDiff(e.target.value)}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            
            <div className="flex-center space-between">
              <button className="btn btn-ghost" onClick={() => setShowGenModal(false)} disabled={isGenerating}>Cancel</button>
              <button className="btn btn-primary premium-btn flex-center" onClick={handleGenerateProblem} disabled={isGenerating}>
                {isGenerating ? <Sparkles size={15} className="spin" /> : <Sparkles size={15} />} Generate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateHint && (
        <div className="modal-backdrop flex-center">
          <div className="glass-modal animate-slide-up" style={{width:'650px', maxHeight:'85vh', overflowY:'auto'}}>
            <div className="space-between mb-3" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3><Lightbulb size={20} className="text-warning" /> Function Signature & Template</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTemplateHint(false)}>✕</button>
            </div>
            
            <div style={{background:'rgba(99,102,241,0.1)', padding:'1rem', borderRadius:'8px', marginBottom:'1rem', border:'1px solid rgba(99,102,241,0.3)'}}>
              <p className="text-sm text-muted mb-2"><strong>Input Format:</strong></p>
              <code style={{fontSize:'0.9rem', color:'#e0e0e0'}}>{activeProblem?.inputFormat}</code>
              <p className="text-sm text-muted mt-3 mb-2"><strong>Expected Output Format:</strong></p>
              <code style={{fontSize:'0.9rem', color:'#e0e0e0'}}>{activeProblem?.outputFormat}</code>
            </div>
            
            <p className="text-muted text-sm mb-3"><strong>Starter Template:</strong></p>
            <div style={{background:'rgba(0,0,0,0.5)', padding:'1rem', borderRadius:'8px', marginBottom:'1.5rem', border:'1px solid rgba(255,255,255,0.1)', fontFamily:"'Fira Code', monospace", fontSize:'0.85rem', lineHeight:'1.8', color:'#e0e0e0', overflowX:'auto'}}>
              <code>{activeProblem?.templates?.[selectedLanguage] || '// Template not available'}</code>
            </div>
            
            <div className="flex-center space-between">
              <button 
                className="btn btn-secondary btn-sm flex-center" 
                onClick={() => {
                  const template = activeProblem?.templates?.[selectedLanguage] || '';
                  navigator.clipboard.writeText(template);
                }}
              >
                Copy Template
              </button>
              <button 
                className="btn btn-primary premium-btn btn-sm flex-center" 
                onClick={() => {
                  const template = activeProblem?.templates?.[selectedLanguage] || '';
                  setCode(template);
                  if (editorRef.current) editorRef.current.setValue(template);
                  setShowTemplateHint(false);
                }}
              >
                Load into Editor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
