// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string;
  action: 'move' | 'click' | 'type' | 'wait' | 'fake-refine';
  duration?: number;
  description?: string;
  text?: string;
}

// 🎬 FIXED DEMO SCRIPT - ~90 seconds
const DEMO_SCRIPT: SimulationStep[] = [
  // 1. Welcome
  { id: 1, target: 'body', action: 'wait', duration: 2500, description: "👋 Welcome to Pustakam AI - Let's turn an idea into a book." },
  
  // 2. Create New Book
  { id: 2, target: 'button:has-text("Create New Book")', action: 'move', duration: 1500, description: "First, let's start a new book project." },
  { id: 3, target: 'button:has-text("Create New Book")', action: 'click', duration: 1000, description: "Opening the creation form..." },
  { id: 4, target: 'body', action: 'wait', duration: 1500, description: "✨ Here we define the book's core idea." },

  // 3. Type Idea & Refine
  { id: 5, target: 'textarea#goal', action: 'move', duration: 1800, description: "You can start with a simple topic or a detailed paragraph." },
  { id: 6, target: 'textarea#goal', action: 'type', duration: 5000, text: 'A complete guide to Modern React Development with Hooks and State Management', description: "Let's use 'Modern React Development' as our topic." },
  { id: 7, target: 'button:has-text("Refine with AI")', action: 'move', duration: 1800, description: "Now, let AI enhance this idea into a structured plan." },
  { id: 8, target: 'button:has-text("Refine with AI")', action: 'fake-refine', duration: 4000, description: "🤖 AI is optimizing the goal, title, and target audience..." },
  { id: 9, target: 'body', action: 'wait', duration: 2000, description: "✅ The form is now auto-filled with a refined plan!" },

  // 4. Generate Roadmap (ACTION: This step now CLICKS the button)
  { id: 10, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 1800, description: "Next, we generate the book's chapter-by-chapter roadmap." },
  { id: 11, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 4000, description: "🔨 Creating a detailed learning path with 8-12 modules..." },
  
  // 5. Book Detail View - Show Generation Button
  { id: 12, target: 'body', action: 'wait', duration: 2500, description: "📖 Here's our book's dashboard and learning roadmap!" },
  { id: 13, target: 'button:has-text("Generate All Modules")', action: 'move', duration: 2000, description: "Ready to write! Clicking this starts the AI generation." },
  { id: 14, target: 'button:has-text("Generate All Modules")', action: 'wait', duration: 3500, description: "📝 It writes 2-4k words per chapter with live progress." },
  { id: 15, target: 'body', action: 'wait', duration: 3000, description: "Progress is auto-saved, so you can pause or resume anytime." },

  // 6. Switch AI Model
  { id: 16, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'move', duration: 1800, description: "You can switch AI models for different writing styles." },
  { id: 17, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'click', duration: 1000, description: "Opening model selector..." },
  { id: 18, target: 'body', action: 'wait', duration: 2000, description: "Supports Google, Mistral, ZhipuAI, and Groq models." },
  { id: 19, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'move', duration: 1800, description: "Let's switch to Mistral for this book..." },
  { id: 20, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'click', duration: 1500, description: "✅ Model switched successfully!" },
  { id: 21, target: 'body', action: 'wait', duration: 1000, description: "" },

  // 7. Navigate back to Library
  { id: 22, target: 'button:has-text("Back to My Books")', action: 'move', duration: 1800, description: "Now, let's go back to our library." },
  { id: 23, target: 'button:has-text("Back to My Books")', action: 'click', duration: 1500, description: "Navigating to the library view..." },
  
  // 8. Library View
  { id: 24, target: 'body', action: 'wait', duration: 2500, description: "📚 All your book projects are saved here." },
  { id: 25, target: 'div.grid > div:first-child', action: 'move', duration: 2000, description: "You can track progress, manage, and export books from here." },
  
  // 9. Navigate back to Home Screen
  { id: 26, target: 'button:has-text("Back")', action: 'move', duration: 1800, description: "Let's return to the home screen." },
  { id: 27, target: 'button:has-text("Back")', action: 'click', duration: 1500, description: "Going back to the main dashboard..." },

  // 10. Conclusion
  { id: 28, target: 'body', action: 'wait', duration: 3000, description: "🎉 From idea to a structured book in just a few clicks!" },
  { id: 29, target: 'body', action: 'wait', duration: 3000, description: "Thanks for watching the demo. Start creating now!" },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [caption, setCaption] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [clickEffect, setClickEffect] = useState(false);

  const simulationActive = useRef<boolean>(false);
  const stepTimeout = useRef<number | null>(null);
  const lastCursorPos = useRef({ x: -100, y: -100 }); // Track last position

  const findElement = (selector: string): HTMLElement | null => {
    try {
      let element = document.querySelector(selector) as HTMLElement;
      if (element) return element;
    } catch (e) { /* Invalid selector */ }

    if (selector.includes(':has-text')) {
      const textMatch = selector.match(/has-text\("(.+?)"\)/);
      const text = textMatch ? textMatch : '';
      if (text) {
        const elements = Array.from(document.querySelectorAll('button, a, input, textarea, div, span, h1, h2, h3'));
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
      const startX = lastCursorPos.current.x; // Use last position, not state
      const startY = lastCursorPos.current.y;
      const startTime = Date.now();

      const frame = () => {
        if (!simulationActive.current) return resolve();
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        const newX = startX + (targetX - startX) * eased;
        const newY = startY + (targetY - startY) * eased;

        setCursorPos({ x: newX, y: newY });
        lastCursorPos.current = { x: newX, y: newY }; // Update ref

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          lastCursorPos.current = { x: targetX, y: targetY }; // Set final position
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }, []);

  const executeStep = useCallback(async (step: SimulationStep) => {
    if (!simulationActive.current) return;

    setCaption(step.description || '');
    const element = findElement(step.target);

    // Scroll element into view with delay
    if (element && ['move', 'click', 'type', 'fake-refine'].includes(step.action)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(1200); // Increased wait for scroll
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

      case 'fake-refine':
        // Show cursor on button but don't actually click
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursor(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            800
          );
          
          // Fake click effect
          setClickEffect(true);
          await wait(200);
          setClickEffect(false);
          
          // Wait to simulate AI processing (but don't actually call the API)
          await wait(step.duration || 3000);
        } else {
          await wait(step.duration || 3000);
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
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    lastCursorPos.current = { x: centerX, y: centerY };
    setCursorPos({ x: centerX, y: centerY });
    
    await wait(500);

    // Execute all steps
    for (const step of DEMO_SCRIPT) {
      if (!simulationActive.current) break;
      await executeStep(step);
    }

    // End
    setCaption('Thanks for watching! 🎉');
    await wait(2500);
    await animateCursor(lastCursorPos.current.x, window.innerHeight + 100, 1500);

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
            className="fixed pointer-events-none z-[10000]"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: `translate(-12px, -12px) scale(${clickEffect ? 0.85 : 1})`,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
              transition: 'transform 0.1s ease-out'
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
