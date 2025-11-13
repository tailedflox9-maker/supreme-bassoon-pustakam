// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string;
  action: 'move' | 'click' | 'type' | 'wait' | 'scroll';
  duration?: number;
  text?: string;
  description?: string;
  scrollAmount?: number;
}

// 🎬 UPDATED DEMO SCRIPT - Over 1 Minute, Smooth Flow
const DEMO_SCRIPT: SimulationStep[] = [
  // 1. Initial wait & welcome
  { id: 1, target: 'body', action: 'wait', duration: 2000, description: "Welcome to Pustakam AI! Let's see how it works." },
  
  // 2. Open Library
  { id: 2, target: 'button[title="Library & Settings"]', action: 'move', duration: 2000, description: 'All your book projects are stored in the Library.' },
  { id: 3, target: 'button[title="Library & Settings"]', action: 'click', duration: 1000, description: 'Opening the library...' },
  
  // 3. Select an existing book
  { id: 4, target: '.model-dropdown .max-h-80 > div:first-child', action: 'move', duration: 2500, description: 'Let\'s open an existing project to continue our work.' },
  { id: 5, target: '.model-dropdown .max-h-80 > div:first-child', action: 'click', duration: 1000, description: 'Loading book details...' },
  { id: 6, target: 'body', action: 'wait', duration: 2000, description: 'The book is ready to have its content generated.' },

  // 4. Generate the Roadmap
  { id: 7, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 2500, description: 'First, the AI creates a detailed chapter-by-chapter roadmap.' },
  { id: 8, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 1000, description: 'Generating the book\'s structure...' },
  { id: 9, target: 'body', action: 'wait', duration: 6000, description: 'The AI analyzes the goal to build a comprehensive learning path...' }, // Longer wait for AI
  
  // 5. Scroll to view the new Roadmap
  { id: 10, target: '#main-scroll-area', action: 'scroll', scrollAmount: 500, duration: 2000, description: 'Here is the complete roadmap, ready for content generation.' },
  { id: 11, target: 'body', action: 'wait', duration: 2000, description: 'Each module has specific objectives and time estimates.' },

  // 6. Generate All Modules
  { id: 12, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'move', duration: 2500, description: 'Now, let\'s generate the content for all chapters.' },
  { id: 13, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'click', duration: 1000, description: 'Starting the AI writing process...' },
  
  // 7. Watch content generation progress
  { id: 14, target: 'body', action: 'wait', duration: 8000, description: 'The AI writes the book live, with real-time progress and word counts.' }, // Longer wait
  { id: 15, target: 'body', action: 'wait', duration: 5000, description: 'You can pause, resume, or even switch AI models if something fails.' },
  
  // 8. Final message
  { id: 16, target: 'body', action: 'wait', duration: 4000, description: 'The demo is complete. Thank you for watching! 🎉' },
];


export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 }); // Start off-screen
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
            const elements = Array.from(document.querySelectorAll('button, a, span, h3, div'));
            const foundElement = elements.find(el => el.textContent?.trim().includes(text));
            return foundElement as HTMLElement | null;
        }
    }
    return null;
  };

  const wait = (ms: number): Promise<void> => new Promise(resolve => {
    stepTimeout.current = window.setTimeout(resolve, ms);
  });
  
  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

    if (element && (step.action === 'move' || step.action === 'click' || step.action === 'type')) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(500);
    }
    
    switch (step.action) {
      case 'move':
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, step.duration || 1000);
        } else {
          await wait(step.duration || 1000);
        }
        break;
      case 'click':
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, step.duration ? step.duration / 2 : 500);
          setClickEffect(true);
          setTimeout(() => setClickEffect(false), 200);
          element.click();
        }
        await wait(step.duration || 1000);
        break;
      default:
        await wait(step.duration || 1000);
        break;
    }
  }, [animateCursor]);

  const startSimulation = useCallback(async () => {
    if (isPlaying) return;
    simulationActive.current = true;
    setIsPlaying(true);
    setShowPlayButton(false);

    // Grand entrance for the cursor
    await wait(500);
    await animateCursor(window.innerWidth / 2, window.innerHeight / 2, 1200);
    
    for (const step of DEMO_SCRIPT) {
      if (!simulationActive.current) break;
      await executeStep(step);
    }

    // Cleanup
    setCaption('Demo Complete! Thanks for watching. 🎉');
    await wait(3000);
    await animateCursor(cursorPos.x, window.innerHeight + 50, 1000); // Animate cursor off-screen
    
    simulationActive.current = false;
    setIsPlaying(false);
    setShowPlayButton(true);
    setCaption('');

  }, [isPlaying, executeStep, animateCursor, cursorPos.x]);

  // Cleanup on unmount
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
          aria-label="Start Demo Simulation"
        >
          <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Play Demo</span>
        </button>
      )}

      {isPlaying && (
        <>
          <div
            className="fixed pointer-events-none z-[10000] transition-transform duration-100"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: `translate(-4px, -4px) scale(${clickEffect ? 0.8 : 1})`,
            }}
          >
            <PlayCircle 
                size={28} 
                className="text-blue-500" 
                style={{ 
                    filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))',
                    strokeWidth: 2,
                    fill: 'rgba(255, 255, 255, 0.8)'
                }}
            />
          </div>

          {caption && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md text-white text-base font-semibold px-6 py-3 rounded-xl shadow-2xl border border-white/20 max-w-lg text-center animate-fade-in-up z-[9999]">
              {caption}
            </div>
          )}
        </>
      )}
    </>
  );
}
