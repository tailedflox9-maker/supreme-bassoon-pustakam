// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string;
  action: 'move' | 'click' | 'type' | 'wait';
  duration?: number;
  description?: string;
  text?: string;
}

// 🎬 SIMPLE DEMO SCRIPT - ~90 seconds
const DEMO_SCRIPT: SimulationStep[] = [
  // Welcome
  { id: 1, target: 'body', action: 'wait', duration: 2000, description: "👋 Welcome to Pustakam AI - Transform ideas into books" },
  
  // Create New Book
  { id: 2, target: 'button:has-text("Create New Book")', action: 'move', duration: 2000, description: "Let's create a new book from scratch" },
  { id: 3, target: 'button:has-text("Create New Book")', action: 'click', duration: 1000, description: "Opening the creation form..." },
  { id: 4, target: 'body', action: 'wait', duration: 1500, description: "✨ Ready to start!" },

  // Type Idea
  { id: 5, target: 'textarea#goal', action: 'move', duration: 1500, description: "Start with any idea - even a single sentence" },
  { id: 6, target: 'textarea#goal', action: 'type', duration: 4000, text: 'Complete guide to Modern React Development', description: "Let me type a topic..." },
  { id: 7, target: 'body', action: 'wait', duration: 2000, description: "Perfect! Now let's enhance it with AI..." },
  
  // AI Refinement
  { id: 8, target: 'button:has-text("Refine with AI")', action: 'move', duration: 1500, description: "AI will optimize your idea and auto-fill details" },
  { id: 9, target: 'button:has-text("Refine with AI")', action: 'click', duration: 1000, description: "🤖 AI is refining..." },
  { id: 10, target: 'body', action: 'wait', duration: 4000, description: "✅ Form auto-filled with target audience and complexity!" },

  // Generate Roadmap
  { id: 11, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 1500, description: "Now let's create the book structure" },
  { id: 12, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 1000, description: "🔨 Building chapter-by-chapter roadmap..." },
  { id: 13, target: 'body', action: 'wait', duration: 6000, description: "Creating 8-12 structured chapters with objectives" },

  // Switch Model
  { id: 14, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'move', duration: 1500, description: "You can switch AI models anytime" },
  { id: 15, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'click', duration: 800, description: "Opening model selector..." },
  { id: 16, target: 'body', action: 'wait', duration: 2000, description: "Supports Google, Mistral, Groq, and ZhipuAI" },
  { id: 17, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'move', duration: 1500, description: "Let's try Mistral AI..." },
  { id: 18, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'click', duration: 800, description: "✅ Model switched!" },

  // Generate Content
  { id: 19, target: 'button:has-text("Generate All Modules")', action: 'move', duration: 1500, description: "Now let's write the actual content" },
  { id: 20, target: 'button:has-text("Generate All Modules")', action: 'click', duration: 1000, description: "🚀 Generating 2000-4000 words per chapter..." },
  { id: 21, target: 'body', action: 'wait', duration: 6000, description: "📝 Live progress: word counts, streaming content, checkpoints" },

  // Library
  { id: 22, target: 'button[title="Library & Settings"]', action: 'move', duration: 1500, description: "All your books are saved and resumable" },
  { id: 23, target: 'button[title="Library & Settings"]', action: 'click', duration: 800, description: "Opening library..." },
  { id: 24, target: 'body', action: 'wait', duration: 3000, description: "📚 Pause, resume, or export anytime" },
  
  // Conclusion
  { id: 25, target: 'body', action: 'wait', duration: 3000, description: "🎉 From Idea to Book in Minutes - Try it now!" },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [caption, setCaption] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [clickEffect, setClickEffect] = useState(false);

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
        const elements = Array.from(document.querySelectorAll('button, a, input, textarea'));
        const foundElement = elements.find(el => {
          const textContent = el.textContent?.trim() || '';
          return textContent.includes(text);
        });
        return foundElement as HTMLElement | null;
      }
    }
    return null;
  };

  const wait = (ms: number): Promise<void> => new Promise(resolve => {
    stepTimeout.current = window.setTimeout(resolve, ms);
  });

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

    // Scroll element into view with delay
    if (element && ['move', 'click', 'type'].includes(step.action)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(1000);
    }

    switch (step.action) {
      case 'move':
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            step.duration || 1500
          );
        } else {
          await wait(step.duration || 1500);
        }
        break;

      case 'click':
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            800
          );
          
          // Click effect
          setClickEffect(true);
          await wait(200);
          setClickEffect(false);
          
          // Actually click the element
          element.click();
          await wait((step.duration || 1000) - 200);
        } else {
          await wait(step.duration || 1000);
        }
        break;

      case 'type':
        if (element && step.text) {
          const input = element as HTMLInputElement | HTMLTextAreaElement;
          input.focus();
          const rect = element.getBoundingClientRect();
          await animateCursor(rect.left + 30, rect.top + rect.height / 2, 1000);

          // Type character by character
          const charDelay = (step.duration || 3000) / step.text.length;
          for (let i = 0; i < step.text.length; i++) {
            if (!simulationActive.current) break;
            input.value = step.text.substring(0, i + 1);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await wait(charDelay);
          }
        }
        break;

      default:
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

    // Execute all steps
    for (const step of DEMO_SCRIPT) {
      if (!simulationActive.current) break;
      await executeStep(step);
    }

    // End
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
          className="fixed bottom-6 right-6 z-[10001] pointer-events-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 hover:bg-blue-700 transition-all group animate-fade-in-up"
          aria-label="Start Demo"
        >
          <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Play Demo</span>
        </button>
      )}

      {isPlaying && (
        <>
          {/* Simple Cursor */}
          <div
            className="fixed pointer-events-none z-[10000] transition-transform duration-100"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: `translate(-12px, -12px) scale(${clickEffect ? 0.85 : 1})`,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M6 2L22 14L14 16L10 24L6 2Z" 
                fill="white" 
                stroke="#1E40AF" 
                strokeWidth="2" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Click Effect */}
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

          {/* Caption */}
          {caption && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white text-base font-semibold px-6 py-3 rounded-xl shadow-2xl border border-white/20 max-w-lg text-center animate-fade-in-up z-[9999]">
              {caption}
            </div>
          )}
        </>
      )}
    </>
  );
}
