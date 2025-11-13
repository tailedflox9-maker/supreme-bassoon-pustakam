// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string;
  action: 'move' | 'click' | 'type' | 'wait' | 'scroll';
  duration?: number;
  description?: string;
  text?: string;
  scrollAmount?: number;
}

// 🎬 ENHANCED WALKTHROUGH DEMO SCRIPT - ~120 seconds
const DEMO_SCRIPT: SimulationStep[] = [
  // === PHASE 1: WELCOME & INTRODUCTION (0-15s) ===
  { id: 1, target: 'body', action: 'wait', duration: 3000, description: "👋 Welcome to Pustakam AI - Your Personal Book Generation Engine" },
  { id: 2, target: 'body', action: 'wait', duration: 3500, description: "Transform any idea into a complete, structured book in minutes..." },
  
  // === PHASE 2: CREATE NEW BOOK (15-30s) ===
  { id: 3, target: 'button:has-text("Create New Book")', action: 'move', duration: 2500, description: "Let's start by creating a new book from scratch" },
  { id: 4, target: 'button:has-text("Create New Book")', action: 'wait', duration: 1500, description: "Click here to begin your book generation journey..." },
  { id: 5, target: 'button:has-text("Create New Book")', action: 'click', duration: 800, description: "Opening the creation wizard..." },
  { id: 6, target: 'body', action: 'wait', duration: 2000, description: "✨ The creation form is now ready" },

  // === PHASE 3: ENTER IDEA & AI REFINEMENT (30-55s) ===
  { id: 7, target: 'textarea#goal', action: 'move', duration: 2000, description: "Start with any idea - even a single sentence works!" },
  { id: 8, target: 'textarea#goal', action: 'wait', duration: 1500, description: "Let me type a simple topic..." },
  { id: 9, target: 'textarea#goal', action: 'type', duration: 6000, text: 'Modern Web Development with React and TypeScript', description: "We'll create a comprehensive guide to React & TypeScript" },
  { id: 10, target: 'textarea#goal', action: 'wait', duration: 2500, description: "That's all we need to start! Now let's enhance it with AI..." },
  
  { id: 11, target: 'button:has-text("Refine with AI")', action: 'move', duration: 2500, description: "The AI Refiner will optimize your idea and auto-fill details" },
  { id: 12, target: 'button:has-text("Refine with AI")', action: 'wait', duration: 1000, description: "Analyzing and structuring your book concept..." },
  { id: 13, target: 'button:has-text("Refine with AI")', action: 'click', duration: 800, description: "🤖 AI is refining your idea..." },
  { id: 14, target: 'body', action: 'wait', duration: 4500, description: "✅ Perfect! Target audience, complexity, and preferences auto-filled" },

  // === PHASE 4: SCROLL TO SEE AUTO-FILLED FORM (55-65s) ===
  { id: 15, target: 'body', action: 'scroll', duration: 2500, scrollAmount: 200, description: "See how the form is now intelligently completed..." },
  { id: 16, target: 'input#audience', action: 'move', duration: 2000, description: "Target audience identified automatically" },
  { id: 17, target: 'body', action: 'scroll', duration: 2000, scrollAmount: -200, description: "Scrolling back up to generate the roadmap..." },

  // === PHASE 5: GENERATE ROADMAP (65-80s) ===
  { id: 18, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 2500, description: "Now let's create a complete chapter-by-chapter structure" },
  { id: 19, target: 'button:has-text("Generate Book Roadmap")', action: 'wait', duration: 1500, description: "The AI will design a learning path with modules and objectives..." },
  { id: 20, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 800, description: "🔨 Building your book roadmap..." },
  { id: 21, target: 'body', action: 'wait', duration: 7000, description: "The AI is creating 8-12 structured chapters with learning objectives" },

  // === PHASE 6: EXPLORE MODEL SELECTOR (80-95s) ===
  { id: 22, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'move', duration: 2500, description: "You can switch between multiple AI models anytime" },
  { id: 23, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'wait', duration: 1500, description: "Pustakam supports Google, Mistral, Groq, and ZhipuAI..." },
  { id: 24, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'click', duration: 800, description: "Opening model selector..." },
  { id: 25, target: 'body', action: 'wait', duration: 2500, description: "Choose the AI that works best for your content" },
  { id: 26, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'move', duration: 2000, description: "Let's try Mistral AI for faster generation..." },
  { id: 27, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'click', duration: 800, description: "Switched to Mistral Small!" },
  { id: 28, target: 'body', action: 'wait', duration: 2000, description: "✅ Model changed successfully" },

  // === PHASE 7: GENERATE CONTENT (95-110s) ===
  { id: 29, target: 'button:has-text("Generate All Modules")', action: 'move', duration: 2500, description: "Now let's write the actual content for all chapters" },
  { id: 30, target: 'button:has-text("Generate All Modules")', action: 'wait', duration: 1500, description: "This will generate 2000-4000 words per chapter..." },
  { id: 31, target: 'button:has-text("Generate All Modules")', action: 'click', duration: 800, description: "🚀 Starting content generation..." },
  { id: 32, target: 'body', action: 'wait', duration: 8000, description: "📝 Live progress tracking: word counts, streaming content, and checkpoints" },

  // === PHASE 8: CHECK LIBRARY (110-120s) ===
  { id: 33, target: 'button[title="Library & Settings"]', action: 'move', duration: 2500, description: "Your books are always saved and resumable" },
  { id: 34, target: 'button[title="Library & Settings"]', action: 'click', duration: 800, description: "Opening your library..." },
  { id: 35, target: 'body', action: 'wait', duration: 3000, description: "📚 All your books in one place - pause, resume, or export anytime" },
  
  // === PHASE 9: CONCLUSION (120-130s) ===
  { id: 36, target: 'body', action: 'wait', duration: 3500, description: "🎉 That's Pustakam AI - From Idea to Book in Minutes!" },
  { id: 37, target: 'body', action: 'wait', duration: 3500, description: "✨ Try it now and create your first AI-powered book!" },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [caption, setCaption] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [clickEffect, setClickEffect] = useState(false);
  const [typingCursor, setTypingCursor] = useState(false);

  const simulationActive = useRef<boolean>(false);
  const stepTimeout = useRef<number | null>(null);

  const findElement = (selector: string): HTMLElement | null => {
    try {
      let element = document.querySelector(selector) as HTMLElement;
      if (element) return element;
    } catch (e) { /* Invalid selector */ }

    if (selector.includes(':has-text')) {
      const textMatch = selector.match(/has-text\("(.+?)"\)/);
      const text = textMatch ? textMatch[1] : '';
      if (text) {
        const elements = Array.from(document.querySelectorAll('button, a, span, h3, div, input, textarea'));
        const foundElement = elements.find(el => el.textContent?.trim().includes(text));
        return foundElement as HTMLElement | null;
      }
    }
    return null;
  };

  const wait = (ms: number): Promise<void> => new Promise(resolve => {
    stepTimeout.current = window.setTimeout(resolve, ms);
  });

  // Smooth easing function
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animateCursor = useCallback(async (targetX: number, targetY: number, duration: number) => {
    return new Promise<void>(resolve => {
      const startX = cursorPos.x;
      const startY = cursorPos.y;
      const startTime = Date.now();

      const frame = () => {
        if (!simulationActive.current) return resolve();
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        setCursorPos({
          x: startX + (targetX - startX) * eased,
          y: startY + (targetY - startY) * eased,
        });

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }, [cursorPos.x, cursorPos.y]);

  const executeStep = useCallback(async (step: SimulationStep) => {
    if (!simulationActive.current) return;

    setCaption(step.description || '');
    const element = findElement(step.target);

    if (element && ['move', 'click', 'type'].includes(step.action)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(800); // Wait for scroll
    }

    switch (step.action) {
      case 'move':
        setTypingCursor(false);
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, step.duration || 1500);
        } else {
          await wait(step.duration || 1500);
        }
        break;

      case 'click':
        setTypingCursor(false);
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, 800);
          setClickEffect(true);
          setTimeout(() => setClickEffect(false), 300);
          await wait(200);
          element.click();
          await wait((step.duration || 1000) - 200);
        } else {
          await wait(step.duration || 1000);
        }
        break;

      case 'type':
        if (element && step.text) {
          setTypingCursor(true);
          const input = element as HTMLInputElement | HTMLTextAreaElement;
          input.focus();
          const rect = element.getBoundingClientRect();
          await animateCursor(rect.left + 30, rect.top + rect.height / 2, 1000);

          const charDelay = (step.duration || 3000) / step.text.length;
          for (let i = 0; i < step.text.length; i++) {
            if (!simulationActive.current) break;
            input.value = step.text.substring(0, i + 1);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await wait(charDelay);
          }
          setTypingCursor(false);
        }
        break;

      case 'scroll':
        setTypingCursor(false);
        const scrollAmount = step.scrollAmount || 0;
        const scrollElement = document.getElementById('main-scroll-area') || document.documentElement;
        const startScroll = scrollElement.scrollTop;
        const targetScroll = startScroll + scrollAmount;
        const scrollDuration = step.duration || 1500;
        const scrollStart = Date.now();

        const scrollFrame = () => {
          if (!simulationActive.current) return;
          const elapsed = Date.now() - scrollStart;
          const progress = Math.min(elapsed / scrollDuration, 1);
          const eased = easeInOutCubic(progress);
          
          scrollElement.scrollTop = startScroll + (scrollAmount * eased);

          if (progress < 1) {
            requestAnimationFrame(scrollFrame);
          }
        };
        requestAnimationFrame(scrollFrame);
        await wait(scrollDuration);
        break;

      default:
        setTypingCursor(false);
        await wait(step.duration || 1500);
        break;
    }
  }, [animateCursor]);

  const startSimulation = useCallback(async () => {
    if (isPlaying) return;
    simulationActive.current = true;
    setIsPlaying(true);
    setShowPlayButton(false);

    // Start from center
    await wait(500);
    await animateCursor(window.innerWidth / 2, window.innerHeight / 2, 1000);

    for (const step of DEMO_SCRIPT) {
      if (!simulationActive.current) break;
      await executeStep(step);
    }

    // End animation
    setCaption('Thanks for watching! 🎉');
    await wait(2500);
    await animateCursor(window.innerWidth / 2, window.innerHeight + 100, 1500);

    simulationActive.current = false;
    setIsPlaying(false);
    setShowPlayButton(true);
    setCaption('');
  }, [isPlaying, executeStep, animateCursor]);

  useEffect(() => {
    return () => {
      simulationActive.current = false;
      if (stepTimeout.current) clearTimeout(stepTimeout.current);
    };
  }, []);

  return (
    <>
      {showPlayButton && (
        <button
          onClick={startSimulation}
          className="fixed bottom-6 right-6 z-[10001] pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all group animate-fade-in-up border border-white/20"
          aria-label="Start Demo Simulation"
        >
          <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm">Watch Demo</span>
            <span className="text-xs opacity-90">~2 min walkthrough</span>
          </div>
        </button>
      )}

      {isPlaying && (
        <>
          {/* Enhanced Cursor */}
          <div
            className="fixed pointer-events-none z-[10000] transition-all duration-100"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: `translate(-12px, -12px) scale(${clickEffect ? 0.85 : 1})`,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
            }}
          >
            {typingCursor ? (
              // Text cursor
              <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="0" width="4" height="32" fill="white" stroke="#1E40AF" strokeWidth="2"/>
                <rect x="6" y="0" width="12" height="4" fill="white" stroke="#1E40AF" strokeWidth="2"/>
                <rect x="6" y="28" width="12" height="4" fill="white" stroke="#1E40AF" strokeWidth="2"/>
              </svg>
            ) : (
              // Pointer cursor
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M6 2L22 14L14 16L10 24L6 2Z" 
                  fill="white" 
                  stroke="#1E40AF" 
                  strokeWidth="2" 
                  strokeLinejoin="round"
                />
                <circle cx="14" cy="14" r="2" fill="#3B82F6" className="animate-pulse"/>
              </svg>
            )}
          </div>

          {/* Click ripple effect */}
          {clickEffect && (
            <div
              className="fixed pointer-events-none z-[9999]"
              style={{
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 rounded-full border-4 border-blue-400 animate-ping" />
              </div>
            </div>
          )}

          {/* Caption Box */}
          {caption && (
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 z-[9999] animate-fade-in-up">
              <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400 mt-2 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-base font-semibold leading-relaxed">
                      {caption}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-slide-in-out" />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
