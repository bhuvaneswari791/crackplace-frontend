import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import Editor from '@monaco-editor/react';
import { 
  FaTerminal, 
  FaPlay, 
  FaRobot, 
  FaCircleCheck, 
  FaCircleXmark, 
  FaTriangleExclamation,
  FaArrowRotateLeft,
  FaAward
} from 'react-icons/fa6';

const CATEGORIES = ['Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Dynamic Programming', 'SQL'];
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface CodingProblem {
  problemId: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  sampleCases: TestCase[];
  starterCode: {
    python: string;
    java: string;
    javascript: string;
    cpp: string;
  };
}

interface TestResult {
  passed: boolean;
  output: string;
  error: string | null;
  testCaseResults?: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
  rewards?: {
    xp: number;
    coins: number;
  };
}

interface AIReview {
  timeComplexity: string;
  spaceComplexity: string;
  qualityScore: number;
  readabilityComments: string;
  optimizationComments: string;
  optimalSolutionExplanation: string;
  editorialCode: string;
}

export const Coding: React.FC = () => {
  const { token, updateProfile } = useAuthStore();
  
  const editorRef = useRef<any>(null);
  
  // Setup parameters
  const [selectedCategory, setSelectedCategory] = useState('Arrays');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [language, setLanguage] = useState<'python' | 'java' | 'javascript' | 'cpp'>('python');

  // Work states
  const [status, setStatus] = useState<'idle' | 'generating' | 'active'>('idle');
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Run/Review Results states
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<TestResult | null>(null);
  
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AIReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Panel resizing states
  const [leftWidth, setLeftWidth] = useState<number>(45); // Left side width in percentage
  const [consoleHeight, setConsoleHeight] = useState<number>(200); // Console height in pixels
  const [isResizingWidth, setIsResizingWidth] = useState<boolean>(false);
  const [isResizingHeight, setIsResizingHeight] = useState<boolean>(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  
  // Mobile layout active tab
  const [activeMobileTab, setActiveMobileTab] = useState<'problem' | 'editor' | 'testcases' | 'output' | 'console'>('problem');

  // Resizing mouse/touch drag listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingWidth) {
        const newPercentage = (e.clientX / window.innerWidth) * 100;
        if (newPercentage > 20 && newPercentage < 80) {
          setLeftWidth(newPercentage);
        }
      }
      if (isResizingHeight) {
        const container = document.getElementById('coding-workspace-grid');
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = rect.bottom - e.clientY;
          // Maintain at least 500px for editor container (from container height)
          const maxConsoleHeight = rect.height - 520;
          if (newHeight > 60 && newHeight < Math.max(80, maxConsoleHeight)) {
            setConsoleHeight(newHeight);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      setIsResizingHeight(false);
    };

    if (isResizingWidth || isResizingHeight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingWidth, isResizingHeight]);

  // Sync starter code when language changes or problem loads
  useEffect(() => {
    if (problem) {
      const rawCode = problem.starterCode[language] || '';
      setCode(cleanAndFormatCode(rawCode, language, problem.title));
      setRunResult(null);
    }
  }, [language, problem]);

  // Trigger layout recalculation on viewport/device/keyboard adjustments
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    window.addEventListener('resize', handleResize);
    // Watch keyboard display via visualViewport if available
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleResize);
      vv.addEventListener('scroll', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (vv) {
        vv.removeEventListener('resize', handleResize);
        vv.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  // Trigger layout when switching tabs
  useEffect(() => {
    if (activeMobileTab === 'editor' && editorRef.current) {
      const timer = setTimeout(() => {
        editorRef.current.layout();
      }, 200); // delay to let tab display settle
      return () => clearTimeout(timer);
    }
  }, [activeMobileTab]);

  const handleLaunchChallenge = async () => {
    setStatus('generating');
    setErrorMessage(null);
    setProblem(null);
    setRunResult(null);
    setReviewResult(null);
    try {
      const response = await fetch('/api/coding/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: selectedDifficulty
        })
      });

      if (!response.ok) {
        throw new Error('AI failed to compile problem parameters.');
      }

      const problemData = await response.json();
      setProblem(problemData);
      setStatus('active');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to start coding challenge. Try again.');
      setStatus('idle');
    }
  };

  const handleRunCode = async (isSubmit: boolean = false) => {
    if (!problem) return;
    setRunning(true);
    setRunResult(null);
    try {
      const response = await fetch('/api/coding/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.problemId,
          code,
          language,
          submit: isSubmit
        })
      });

      if (!response.ok) {
        throw new Error('Code execution simulation failed.');
      }

      const result = await response.json();
      setRunResult(result);

      // If user successfully solved the problem (submitted and passed), trigger local stats update
      if (result.passed && isSubmit) {
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.profile) updateProfile(data.profile);
          });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Execution error occurred.');
    } finally {
      setRunning(false);
    }
  };

  const handleTriggerReview = async () => {
    if (!problem) return;
    setReviewing(true);
    setReviewResult(null);
    setShowReviewModal(true);
    try {
      const response = await fetch('/api/coding/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.problemId,
          code,
          language
        })
      });

      if (!response.ok) {
        throw new Error('AI Code Review failed.');
      }

      const review = await response.json();
      setReviewResult(review);
    } catch (err: any) {
      console.error(err);
      setReviewResult(null);
      setShowReviewModal(false);
      alert(err.message || 'Review failed.');
    } finally {
      setReviewing(false);
    }
  };

  // State 1: Idle Setup
  if (status === 'idle') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-wide">AI Coding Arena</h1>
          <p className="text-gray-400 text-sm">Challenge yourself with custom algorithmic coding problems evaluated by Kimi K2.6.</p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm">
            {errorMessage}
          </div>
        )}

        <div className="max-w-2xl glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
            Arena Setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Topic</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none bg-bg-dark"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-bg-dark">{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm appearance-none bg-bg-dark"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff} className="bg-bg-dark capitalize">{diff}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleLaunchChallenge}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan font-display font-bold text-sm tracking-widest text-white shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300 cursor-pointer"
          >
            LAUNCH ARENA CHALLENGE
          </button>
        </div>
      </div>
    );
  }

  // State 2: Generating Loading View
  if (status === 'generating') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-purple border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <h2 className="font-display font-black text-xl text-white tracking-widest uppercase">Generating Challenge</h2>
        <p className="text-xs text-cyan-300 animate-pulse text-center max-w-sm">
          Interfacing with AI workspace modules... Formulating custom constraints and test suites...
        </p>
      </div>
    );
  }

  // State 3: Active Workspace
  return (
    <div className="h-[calc(100vh-190px)] md:h-[calc(100vh-160px)] lg:h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in pb-24 md:pb-16 lg:pb-0 relative overflow-hidden" id="coding-workspace">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 select-none shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">{problem?.category} • {problem?.difficulty}</span>
          <h1 className="font-display font-black text-xl text-white tracking-wide mt-0.5">{problem?.title}</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="glass-input px-4 py-2.5 rounded-xl text-xs appearance-none bg-bg-dark font-display font-bold cursor-pointer border-neon-purple/30 focus:outline-none"
          >
            <option value="python" className="bg-bg-dark">Python 3</option>
            <option value="javascript" className="bg-bg-dark">JavaScript (ES6)</option>
            <option value="java" className="bg-bg-dark">Java 17</option>
            <option value="cpp" className="bg-bg-dark">C++ (GCC)</option>
          </select>
          <button
            onClick={() => setStatus('idle')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <FaArrowRotateLeft className="w-3.5 h-3.5" />
            <span>Abandon</span>
          </button>
        </div>
      </div>

      {/* Mobile active tabs (Mobile only) */}
      <div className="flex md:hidden border-b border-white/5 bg-white/[0.01] p-1 rounded-xl overflow-x-auto scrollbar-none gap-1 shrink-0">
        {(['problem', 'editor', 'testcases', 'output', 'console'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMobileTab(tab)}
            className={`flex-1 min-w-[70px] text-center py-2 px-1 rounded-lg font-display font-bold text-[9px] uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap
              ${activeMobileTab === tab
                ? 'bg-neon-purple/20 text-white border border-neon-purple/40 shadow-glow'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
          >
            {tab === 'testcases' ? 'Test Cases' : tab}
          </button>
        ))}
      </div>

      {/* Workspace content grid */}
      <div 
        id="coding-workspace-grid" 
        className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 relative select-text"
      >
        {/* LEFT COLUMN: Problem Details */}
        <div 
          style={{ width: window.innerWidth >= 1024 ? `${leftWidth}%` : undefined }}
          className={`flex-col min-h-0 shrink-0
            ${window.innerWidth >= 1024 ? 'flex' : ''}
            ${activeMobileTab === 'problem' ? 'flex md:flex' : 'hidden md:flex'}
            ${window.innerWidth < 1024 ? 'w-full lg:w-auto' : ''}
          `}
        >
          <div className="glass-panel p-6 rounded-3xl overflow-y-auto space-y-6 flex-1 min-h-[300px] lg:min-h-0">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-neon-purple border-b border-white/5 pb-2">
                Problem Description
              </h3>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {problem?.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/50">Constraints</h3>
              <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                {problem?.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <strong className="text-white block font-display">Input Format:</strong>
                <span className="text-gray-400">{problem?.inputFormat}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                <strong className="text-white block font-display">Output Format:</strong>
                <span className="text-gray-400">{problem?.outputFormat}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/50">Sample Test Cases</h3>
              <div className="space-y-3">
                {problem?.sampleCases.map((tc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong className="text-neon-cyan block font-mono mb-1">Input:</strong>
                        <pre className="bg-bg-dark/40 p-2.5 rounded-lg font-mono text-gray-300 overflow-x-auto">{tc.input}</pre>
                      </div>
                      <div>
                        <strong className="text-neon-purple block font-mono mb-1">Output:</strong>
                        <pre className="bg-bg-dark/40 p-2.5 rounded-lg font-mono text-gray-300 overflow-x-auto">{tc.output}</pre>
                      </div>
                    </div>
                    {tc.explanation && (
                      <p className="text-gray-500 italic text-[11px] pt-1">
                        <strong>Explanation:</strong> {tc.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop vertical resize drag bar */}
        <div 
          onMouseDown={() => setIsResizingWidth(true)} 
          className="hidden lg:block w-1.5 cursor-col-resize hover:bg-neon-purple/40 bg-white/5 self-stretch transition-all select-none z-10"
        />

        {/* RIGHT COLUMN: Code Editor, Resizer, and Console Output */}
        <div 
          className={`flex-1 flex flex-col gap-4 min-h-0 min-w-0
            ${window.innerWidth >= 1024 ? 'flex' : ''}
            ${activeMobileTab === 'editor' || activeMobileTab === 'testcases' || activeMobileTab === 'output' || activeMobileTab === 'console' ? 'flex md:flex' : 'hidden md:flex'}
          `}
        >
          {/* Editor Container */}
          <div 
            className={`glass-panel rounded-3xl flex flex-col relative editor-container overflow-y-auto md:overflow-hidden
              ${activeMobileTab === 'editor' ? 'flex h-full min-h-[450px]' : 'hidden md:flex md:h-full md:min-h-[450px]'}
              ${window.innerWidth >= 1024 ? 'min-h-[500px]' : 'min-h-[450px]'}
            `}
            style={{ height: window.innerWidth >= 1024 ? `calc(100% - ${consoleHeight}px - 16px)` : undefined }}
          >
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex justify-between items-center text-xs text-gray-400 font-mono select-none">
              <span>editor.workspace.{language}</span>
              <span className="text-neon-cyan uppercase font-bold tracking-widest">Active Coding session</span>
            </div>
            
            <div className="flex-1 min-h-[450px] relative w-full h-full flex flex-col">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={(editor) => {
                  editorRef.current = editor;
                  // Initial layout recalculation
                  setTimeout(() => {
                    editor.layout();
                  }, 100);
                }}
                loading={<div className="flex items-center justify-center h-full text-neon-cyan animate-pulse">Initializing Cyber IDE...</div>}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: 'on',
                  renderWhitespace: 'selection',
                  autoIndent: 'advanced',
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  formatOnPaste: true,
                  formatOnType: true,
                  padding: { top: 16, bottom: 16 },
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  mouseWheel: true,
                  smoothScrolling: true,
                  fixedOverflowWidgets: true,
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    verticalScrollbarSize: 12,
                    horizontalScrollbarSize: 12,
                    alwaysConsumeMouseWheel: true
                  }
                } as any}
              />
            </div>

            {/* Desktop & Tablet Actions Bar */}
            <div className="hidden md:flex px-6 py-4 border-t border-white/5 bg-white/[0.01] justify-end gap-3 select-none">
              <button
                onClick={handleTriggerReview}
                disabled={running || reviewing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-neon-purple/5 hover:border-neon-purple/20 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer text-neon-purple disabled:opacity-50"
              >
                <FaRobot className="w-3.5 h-3.5" />
                <span>AI Review</span>
              </button>

              <button
                onClick={() => handleRunCode(false)}
                disabled={running || reviewing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <FaPlay className="w-3.5 h-3.5 text-gray-400" />
                <span>Run Code</span>
              </button>

              <button
                onClick={() => handleRunCode(true)}
                disabled={running || reviewing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-lg shadow-neon-cyan/15 hover:shadow-neon-cyan/35 active:scale-98 transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <FaAward className="w-3.5 h-3.5" />
                <span>{running ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Desktop horizontal height drag bar */}
          <div 
            onMouseDown={() => setIsResizingHeight(true)} 
            className="hidden lg:block h-1.5 cursor-row-resize hover:bg-neon-cyan/40 bg-white/5 transition-all select-none z-10"
          />

          {/* Console / Testcases / Output Panel */}
          <div 
            style={{ 
              height: window.innerWidth >= 1024 
                ? (isConsoleCollapsed ? '48px' : `${consoleHeight}px`) 
                : (isConsoleCollapsed ? '48px' : 'auto')
            }}
            className={`glass-panel p-4 rounded-3xl flex flex-col min-h-0 overflow-hidden relative transition-all duration-200
              ${activeMobileTab === 'testcases' || activeMobileTab === 'output' || activeMobileTab === 'console' ? 'flex' : 'hidden md:flex'}
            `}
          >
            {/* Header / Collapse Trigger */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 select-none shrink-0">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-neon-cyan flex items-center gap-2">
                <FaTerminal className="w-3.5 h-3.5" />
                <span>Console & Test Suite</span>
              </h4>
              <button 
                onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                className="hidden md:block text-[10px] uppercase font-bold text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
              >
                {isConsoleCollapsed ? 'Expand ⛶' : 'Collapse ✕'}
              </button>
            </div>
            
            {/* Panel Body */}
            {!isConsoleCollapsed && (
              <div className="flex-1 overflow-y-auto font-mono text-xs pr-1 space-y-4">
                {/* Test Cases display */}
                {(activeMobileTab === 'testcases' || window.innerWidth >= 768) && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/50">Sample Cases Input Format:</p>
                    <div className="space-y-2">
                      {problem?.sampleCases.map((tc, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                          <span className="text-gray-500 font-bold block text-[10px]">Test Case #{idx+1}</span>
                          <span className="text-gray-300 block">Input: <code className="text-neon-cyan">{tc.input}</code></span>
                          <span className="text-gray-400 block">Expected: <code className="text-neon-purple">{tc.output}</code></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution outputs standard error */}
                {(activeMobileTab === 'output' || window.innerWidth >= 768) && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/50">Execution Standard Output / Error:</p>
                    {!runResult && !running && (
                      <p className="text-gray-600 italic">No execution logs. Run or Submit code to compile.</p>
                    )}
                    {running && (
                      <p className="text-neon-cyan animate-pulse">Waiting for compiler logs...</p>
                    )}
                    {runResult && (
                      <div className="space-y-2">
                        {runResult.error && (
                          <div className="p-3 rounded-xl bg-neon-pink/5 border border-neon-pink/20 text-neon-pink whitespace-pre-wrap leading-relaxed">
                            {runResult.error}
                          </div>
                        )}
                        {runResult.output && (
                          <pre className="bg-bg-dark/50 p-3 rounded-xl text-gray-400 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                            {runResult.output}
                          </pre>
                        )}
                        {!runResult.error && !runResult.output && (
                          <p className="text-gray-500 italic">No stdout generated. Code completed without print logs.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Compilation console pass/fail badges */}
                {(activeMobileTab === 'console' || window.innerWidth >= 768) && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-white/50">Verification Results:</p>
                    {!runResult && !running && (
                      <p className="text-gray-600 italic">No execution data. Submissions check suite logs will display here.</p>
                    )}
                    {running && (
                      <p className="text-neon-cyan animate-pulse">Running compilation checks against all test suites...</p>
                    )}
                    {runResult && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {runResult.passed ? (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-green/10 text-neon-green font-bold text-[10px] uppercase border border-neon-green/20 shadow-glow">
                                <FaCircleCheck className="w-3 h-3" /> PASSED ALL CASES
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-pink/10 text-neon-pink font-bold text-[10px] uppercase border border-neon-pink/20">
                                <FaTriangleExclamation className="w-3 h-3" /> TEST SUITE FAILED
                              </span>
                            )}
                          </div>
                          {runResult.passed && runResult.rewards && runResult.rewards.xp > 0 && (
                            <div className="flex items-center gap-2 text-yellow-400 font-bold text-[11px] animate-bounce">
                              <FaAward className="w-3.5 h-3.5 text-neon-purple" />
                              <span>+{runResult.rewards.xp} XP</span>
                              <span>•</span>
                              <span>+{runResult.rewards.coins} Coins</span>
                            </div>
                          )}
                        </div>

                        {runResult.testCaseResults && (
                          <div className="space-y-1.5">
                            {runResult.testCaseResults.map((tcr, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                                <span className="text-gray-400 truncate max-w-xs font-mono">Case #{idx+1} (Input: {tcr.input})</span>
                                <div className="flex items-center gap-3 text-[10px]">
                                  <span className="text-gray-500 font-mono hidden sm:inline">Expected: {tcr.expected} | Actual: {tcr.actual}</span>
                                  {tcr.passed ? (
                                    <FaCircleCheck className="w-4 h-4 text-neon-green shrink-0" />
                                  ) : (
                                    <FaCircleXmark className="w-4 h-4 text-neon-pink shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar (Mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-dark/95 border-t border-white/5 p-4 flex gap-3 md:hidden select-none pb-safe">
        <button
          onClick={handleTriggerReview}
          disabled={running || reviewing}
          className="flex-1 py-3 px-1 rounded-xl border border-white/5 bg-white/[0.02] active:scale-95 transition-all text-[10px] font-display font-black uppercase tracking-wider text-neon-purple disabled:opacity-50 h-12 flex items-center justify-center gap-1.5"
        >
          <FaRobot className="w-3.5 h-3.5" />
          <span>Review</span>
        </button>

        <button
          onClick={() => handleRunCode(false)}
          disabled={running || reviewing}
          className="flex-1 py-3 px-1 rounded-xl border border-white/10 bg-white/5 active:scale-95 transition-all text-[10px] font-display font-black uppercase tracking-wider text-white disabled:opacity-50 h-12 flex items-center justify-center gap-1.5"
        >
          <FaPlay className="w-3.5 h-3.5 text-gray-400" />
          <span>Run</span>
        </button>

        <button
          onClick={() => handleRunCode(true)}
          disabled={running || reviewing}
          className="flex-1 py-3 px-1 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-display font-black text-[10px] tracking-widest uppercase shadow-lg shadow-neon-cyan/25 active:scale-95 transition-all disabled:opacity-50 h-12 flex items-center justify-center gap-1.5"
        >
          <FaAward className="w-3.5 h-3.5" />
          <span>{running ? 'Submitting...' : 'Submit'}</span>
        </button>
      </div>

      {/* AI Code Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/80 backdrop-blur-md px-4 py-8">
          <div className="w-full max-w-3xl glass-panel p-8 rounded-3xl max-h-[85vh] overflow-y-auto relative animate-scale-up space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                <FaRobot className="text-neon-purple w-5 h-5" />
                <span>AI Engineering Code Review</span>
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-white font-semibold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            {reviewing && (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <p className="text-xs text-purple-300 animate-pulse uppercase tracking-wider">AI reviewing complex structures...</p>
              </div>
            )}

            {reviewResult && (
              <div className="space-y-6 text-sm">
                {/* Score and Complexity Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quality Score</span>
                    <span className="font-display font-black text-3xl text-neon-green">{reviewResult.qualityScore}%</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Time Complexity</span>
                    <span className="font-mono font-bold text-lg text-neon-cyan">{reviewResult.timeComplexity}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Space Complexity</span>
                    <span className="font-mono font-bold text-lg text-neon-pink">{reviewResult.spaceComplexity}</span>
                  </div>
                </div>

                {/* Details Comments */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-neon-purple mb-1">Readability & Naming</h5>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{reviewResult.readabilityComments}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-neon-cyan mb-1">Efficiency & Optimization</h5>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{reviewResult.optimizationComments}</p>
                  </div>
                </div>

                {/* Optimal solution explanation and optimal code */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-white/50 mb-1.5">Optimal Solution Breakdown</h5>
                    <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{reviewResult.optimalSolutionExplanation}</p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-neon-green px-1">Editorial Solution Code</h5>
                    <pre className="bg-bg-dark/80 p-5 rounded-2xl font-mono text-xs text-gray-300 overflow-x-auto border border-white/5 leading-relaxed">
                      {reviewResult.editorialCode}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Utility to clean, deduplicate, validate, and format starter code templates.
 * Enforces strict LeetCode-style templates and eliminates syntax errors/duplicates.
 */
export function cleanAndFormatCode(code: string, lang: string, title: string = 'solve'): string {
  if (!code || typeof code !== 'string') {
    return generateFallbackTemplate(lang, title);
  }

  let lines = code.split('\n').map(line => line.trimEnd());
  
  if (lang === 'python') {
    let cleanedLines: string[] = [];
    let seenSolutionClass = false;
    let seenMethods = new Set<string>();
    
    // Auto-inject standard imports for Python
    let imports = [
      "from typing import List, Dict, Set, Tuple, Optional, Union",
      ""
    ];
    
    for (let i = 0; i < lines.length; i++) {
      let trimmed = lines[i].trim();
      
      // Filter out duplicate or conflicting typing imports
      if (trimmed.startsWith('from typing import') || trimmed.startsWith('import typing')) {
        continue;
      }
      
      if (trimmed.startsWith('class Solution')) {
        if (seenSolutionClass) continue;
        seenSolutionClass = true;
        cleanedLines.push('class Solution:');
        continue;
      }
      
      if (trimmed.startsWith('def ')) {
        let match = trimmed.match(/def\s+(\w+)/);
        if (match) {
          let methodName = match[1];
          if (seenMethods.has(methodName)) continue;
          seenMethods.add(methodName);
        }
      }
      
      // Filter out stray standalone assignment lines that are duplicates of method vars
      if (!seenSolutionClass && (trimmed.startsWith('ans =') || trimmed.startsWith('return '))) {
        continue;
      }
      
      cleanedLines.push(lines[i]);
    }
    
    // Re-verify class Solution wrap
    if (!seenSolutionClass) {
      cleanedLines = ['class Solution:', ...cleanedLines.map(l => '    ' + l)];
    }
    
    // Format indentation level-by-level
    let formattedLines: string[] = [...imports];
    let currentIndent = 0;
    
    for (let line of cleanedLines) {
      let trimmed = line.trim();
      if (!trimmed) {
        if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
          formattedLines.push('');
        }
        continue;
      }
      
      if (trimmed.startsWith('class Solution:')) {
        formattedLines.push('class Solution:');
        currentIndent = 4;
        continue;
      }
      
      if (trimmed.startsWith('def ')) {
        // Enforce exactly 4 spaces indent for method declaration inside Solution class
        formattedLines.push(' '.repeat(4) + trimmed);
        currentIndent = 8;
        continue;
      }
      
      // Inside method body: enforce standard 8-space indentation
      if (trimmed === 'pass') {
        formattedLines.push(' '.repeat(8) + 'pass');
        continue;
      }
      
      // Auto-correct statements outside loops or bad indent blocks
      formattedLines.push(' '.repeat(currentIndent) + trimmed);
      
      // Adjust indentation dynamically for nested control flows
      if (trimmed.endsWith(':')) {
        currentIndent = Math.min(16, currentIndent + 4);
      } else if (trimmed.startsWith('return ') || trimmed.startsWith('raise ')) {
        // Reset to method indent on return statement
        currentIndent = 8;
      }
    }
    
    // Fallback if no methods are generated
    if (seenMethods.size === 0) {
      return generateFallbackTemplate('python', title);
    }
    
    return formattedLines.join('\n').trim() + '\n';
  }
  
  if (lang === 'java' || lang === 'cpp') {
    let cleanedLines: string[] = [];
    let seenSolutionClass = false;
    
    for (let i = 0; i < lines.length; i++) {
      let trimmed = lines[i].trim();
      
      if (trimmed.startsWith('class Solution')) {
        if (seenSolutionClass) {
          // skip the duplicate class body
          let localBraces = 0;
          for (let j = i; j < lines.length; j++) {
            if (lines[j].includes('{')) localBraces++;
            if (lines[j].includes('}')) localBraces--;
            if (localBraces === 0 && j > i) {
              i = j;
              break;
            }
          }
          continue;
        }
        seenSolutionClass = true;
      }
      cleanedLines.push(lines[i]);
    }
    
    if (!seenSolutionClass) {
      return generateFallbackTemplate(lang, title);
    }
    
    // Formatting curly braces & indents
    let formattedLines: string[] = [];
    let indentLevel = 0;
    
    for (let line of cleanedLines) {
      let trimmed = line.trim();
      if (!trimmed) {
        if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
          formattedLines.push('');
        }
        continue;
      }
      
      if (trimmed.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formattedLines.push(' '.repeat(indentLevel * 4) + trimmed);
      
      if (trimmed.endsWith('{') || trimmed.includes('{')) {
        indentLevel++;
      }
    }
    
    let output = formattedLines.join('\n');
    
    // Semicolon correction on C++ class
    if (lang === 'cpp' && !output.includes('};') && output.includes('class Solution')) {
      let lastBraceIdx = output.lastIndexOf('}');
      if (lastBraceIdx !== -1) {
        output = output.substring(0, lastBraceIdx) + '};' + output.substring(lastBraceIdx + 1);
      }
    }
    
    return output.trim() + '\n';
  }
  
  if (lang === 'javascript') {
    let formattedLines: string[] = [];
    let indentLevel = 0;
    let seenFunctions = new Set<string>();
    
    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) {
        if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
          formattedLines.push('');
        }
        continue;
      }
      
      // Deduplicate function signatures
      if (trimmed.startsWith('function ')) {
        let match = trimmed.match(/function\s+(\w+)/);
        if (match) {
          let funcName = match[1];
          if (seenFunctions.has(funcName)) {
            continue;
          }
          seenFunctions.add(funcName);
        }
      }
      
      if (trimmed.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formattedLines.push(' '.repeat(indentLevel * 4) + trimmed);
      
      if (trimmed.endsWith('{') || trimmed.includes('{')) {
        indentLevel++;
      }
    }
    
    return formattedLines.join('\n').trim() + '\n';
  }
  
  return code;
}

/**
 * Automatically creates clean standard LeetCode/HackerRank starter code
 * fallback templates if AI results are empty, invalid, or fail checks.
 */
function generateFallbackTemplate(lang: string, title: string): string {
  // Convert title to camelCase method name (e.g. "Single Number" -> "singleNumber")
  let methodName = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, idx) => idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
    
  if (!methodName) methodName = 'solve';

  switch (lang) {
    case 'python':
      return `from typing import List

class Solution:
    def ${methodName}(self, nums: List[int]) -> int:
        pass
`;
    case 'java':
      return `class Solution {
    public int ${methodName}(int[] nums) {
        return 0;
    }
}
`;
    case 'cpp':
      return `class Solution {
public:
    int ${methodName}(vector<int>& nums) {
        return 0;
    }
};
`;
    case 'javascript':
    default:
      return `/**
 * @param {number[]} nums
 * @return {number}
 */
function ${methodName}(nums) {
    return 0;
}
`;
  }
}

export default Coding;
