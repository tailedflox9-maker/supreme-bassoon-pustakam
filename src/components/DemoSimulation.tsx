// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle } from 'lucide-react'; // Changed to PlayCircle for a nicer button icon

interface SimulationStep {
  id: number;
  target: string; // CSS selector
  action: 'move' | 'click' | 'type' | 'wait' | 'scroll' | 'check_ui';
  duration?: number;
  text?: string;
  description?: string; // This will be used for the floating caption
  scrollAmount?: number;
  checkSelector?: string; // For 'check_ui' action, waits for this selector to appear
}

// 🎬 UPDATED DEMO SCRIPT - Streamlined Flow: Open Existing Book, Generate Roadmap & Modules
const DEMO_SCRIPT: SimulationStep[] = [
  // 1. Initial wait & welcome
  { id: 1, target: 'body', action: 'wait', duration: 2000, description: 'Welcome to Pustakam AI! Let\'s explore an existing book.' },
  
  // 2. Open Library
  { id: 2, target: 'button[title="Library & Settings"]', action: 'move', duration: 1500, description: 'The library contains all your book projects.' },
  { id: 3, target: 'button[title="Library & Settings"]', action: 'click', duration: 500, description: 'Opening the library dropdown.' },
  { id: 4, target: '.model-dropdown', action: 'wait', duration: 500, description: 'Waiting for library dropdown to appear.' },
  
  // 3. Select an existing book (assuming at least one book exists, or we show 'no books yet' flow)
  // We'll target the first book card.
  { id: 5, target: '.model-dropdown .max-h-80 > div:first-child', action: 'move', duration: 2000, description: 'Let\'s open this book: "React.js and Modern Web Development".' },
  { id: 6, target: '.model-dropdown .max-h-80 > div:first-child', action: 'click', duration: 500, description: 'Opening the selected book.' },
  { id: 7, target: 'body', action: 'wait', duration: 1500, description: 'Loading book details.' },

  // 4. Check if roadmap needs generation, or if already exists
  // We'll assume for this demo that the book is in 'planning' or 'roadmap_completed' status
  // If it's already 'roadmap_completed' (or further), the "Generate Book Roadmap" button won't be there.
  // We'll need a way to detect the state of the first book when the demo starts.
  // For simplicity, let's assume it *needs* roadmap generation OR is ready for content generation.
  // The 'check_ui' action is crucial here to adapt.

  // Scenario 1: Book needs roadmap generation
  { id: 8, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 2000, description: 'This book needs a roadmap! The AI will structure it for us.', checkSelector: 'button:has-text("Generate Book Roadmap")' },
  { id: 9, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 500, description: 'Generating the book roadmap.' },
  { id: 10, target: 'body', action: 'wait', duration: 4000, description: 'AI is creating a detailed chapter structure based on our goal.' },
  { id: 11, target: '#main-scroll-area', action: 'scroll', scrollAmount: 500, duration: 1500, description: 'Here is the comprehensive learning roadmap with modules and objectives.' },
  
  // Scenario 2: Book is ready for content generation (either after roadmap gen or already was)
  { id: 12, target: 'button:has-text("Generate All Modules")', action: 'move', duration: 2000, description: 'Now, let\'s generate all the content for each chapter.', checkSelector: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")' },
  { id: 13, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'click', duration: 500, description: 'Starting the content generation process.' },
  
  // 5. Wait for content generation progress
  { id: 14, target: 'body', action: 'wait', duration: 6000, description: 'The AI is now writing the book, module by module, with live updates.' },
  { id: 15, target: 'body', action: 'wait', duration: 3000, description: 'Watch the content stream in real-time as the AI writes.' },

  // 6. Final message and cleanup
  { id: 16, target: 'body', action: 'wait', duration: 2000, description: 'The demo is complete. Thank you for watching! 🎉' },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 100, y: 100 });
  const [caption, setCaption] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(true); // Control visibility of initial play button
  
  const animationFrameId = useRef<number | null>(null);
  const timeoutId = useRef<number | null>(null);
  const simulationActive = useRef<boolean>(false); // Flag to control entire simulation flow
  const currentStepDescriptionTimeout = useRef<number | null>(null);

  // Store the original state of the body overflow
  const originalBodyOverflow = useRef<string>('');

  // Save original body overflow on mount and restore on unmount/close
  useEffect(() => {
    originalBodyOverflow.current = document.body.style.overflow;
    return () => {
      document.body.style.overflow = originalBodyOverflow.current;
    };
  }, []);


  // --- Helper Functions ---
  const findElement = (selector: string): HTMLElement | null => {
    try {
      let element = document.querySelector(selector) as HTMLElement;
      if (element) return element;
    } catch (e) {
      // Selector might be invalid for document.querySelector, try text matching
    }

    if (selector.includes(':has-text')) {
      const textMatch = selector.match(/has-text\("(.+?)"\)/);
      const text = textMatch ? textMatch[1] : '';
      if (text) {
        const elements = Array.from(document.querySelectorAll('button, a, label, h1, h2, h3, h4, p, span'));
        const foundElement = elements.find(el => el.textContent?.trim().includes(text));
        return foundElement as HTMLElement | null;
      }
    }
    return null;
  };

  const wait = (ms: number): Promise<void> => {
    if (!simulationActive.current) return Promise.reject("Simulation stopped");
    return new Promise(resolve => {
      timeoutId.current = window.setTimeout(resolve, ms);
    });
  };

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const setCaptionWithTimeout = useCallback((text: string, duration: number) => {
    if (currentStepDescriptionTimeout.current) {
        clearTimeout(currentStepDescriptionTimeout.current);
    }
    setCaption(text);
    if (duration > 0) {
        currentStepDescriptionTimeout.current = window.setTimeout(() => {
            if (simulationActive.current) {
                setCaption('');
            }
        }, duration);
    }
  }, []);

  const animateCursor = (startX: number, startY: number, endX: number, endY: number, duration: number) => {
    const startTime = Date.now();
    const animateFrame = () => {
      if (!simulationActive.current) {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      const x = startX + (endX - startX) * easeProgress;
      const y = startY + (endY - startY) * easeProgress;
      
      setCursorPos({ x, y });
      
      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animateFrame);
      }
    };
    animationFrameId.current = requestAnimationFrame(animateFrame);
  };

  const executeStep = useCallback(async (step: SimulationStep): Promise<void> => {
    if (!simulationActive.current) throw new Error("Simulation stopped");

    // Set caption for the step, clearing it after duration or when next step starts
    setCaptionWithTimeout(step.description || '', step.duration || 0);

    const element = step.target === 'body' ? null : findElement(step.target);

    // If element not found for an action step and checkSelector is present, wait for it
    if (element === null && step.action !== 'wait' && step.checkSelector) {
        let attempts = 0;
        const maxAttempts = 20; // Try for max 10 seconds (20 * 500ms)
        await setCaptionWithTimeout(`Waiting for UI element: ${step.description}`, 1000);
        while (findElement(step.checkSelector) === null && attempts < maxAttempts) {
            await wait(500);
            attempts++;
            if (!simulationActive.current) throw new Error("Simulation stopped");
        }
        if (findElement(step.checkSelector) === null) {
            console.warn(`Demo: Element for checkSelector "${step.checkSelector}" did not appear. Skipping step.`);
            return; // Skip this step if element never appears
        }
    } else if (element === null && step.action !== 'wait' && step.action !== 'check_ui') {
        console.warn(`Demo: Target element "${step.target}" not found. Skipping step.`);
        return; // Skip if element is crucial and not found without checkSelector
    }

    // Auto-scroll to element if needed, before performing action
    if (element && (step.action === 'move' || step.action === 'click' || step.action === 'type')) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await wait(500); // Allow scroll to complete
        if (!simulationActive.current) throw new Error("Simulation stopped");
    }

    switch (step.action) {
      case 'move':
        if (element) {
          const rect = element.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;
          await animateCursorTo(targetX, targetY, step.duration || 1000);
        }
        break;
      case 'click':
        if (element) {
          const rect = element.getBoundingClientRect();
          await animateCursorTo(rect.left + rect.width / 2, rect.top + rect.height / 2, step.duration ? step.duration / 2 : 250);
          // Visual click effect
          element.style.transform = 'scale(0.95)';
          element.style.transition = 'transform 0.1s ease-in-out';
          setTimeout(() => {
            element.style.transform = '';
            element.click();
          }, 150);
        }
        await wait(step.duration || 500);
        break;
      case 'type':
        if (element && step.text) {
          const input = element as HTMLInputElement | HTMLTextAreaElement;
          input.focus();
          const targetX = element.getBoundingClientRect().left + 10; // Start typing from left edge
          const targetY = element.getBoundingClientRect().top + (element.getBoundingClientRect().height / 2);
          await animateCursorTo(targetX, targetY, 500); // Move cursor to start of input
          
          let currentText = '';
          for (let i = 0; i < step.text.length; i++) {
            if (!simulationActive.current) throw new Error("Simulation stopped");
            currentText += step.text[i];
            input.value = currentText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await wait((step.duration || 2000) / step.text.length);
          }
        }
        break;
      case 'scroll':
        if (step.scrollAmount) {
          const scrollableElement = document.getElementById('main-scroll-area') || document.documentElement;
          const startScroll = scrollableElement.scrollTop;
          const endScroll = startScroll + step.scrollAmount;
          
          const scrollDuration = step.duration || 1000;
          const startTime = Date.now();
          
          const animateScroll = () => {
            if (!simulationActive.current) {
              if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
              return;
            }
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            const easeProgress = easeInOutCubic(progress);
            scrollableElement.scrollTop = startScroll + (endScroll - startScroll) * easeProgress;
            if (progress < 1) {
              animationFrameId.current = requestAnimationFrame(animateScroll);
            }
          };
          animationFrameId.current = requestAnimationFrame(animateScroll);
        }
        await wait(step.duration || 1000);
        break;
      case 'wait':
        await wait(step.duration || 1000);
        break;
      case 'check_ui':
        // This step primarily uses checkSelector to wait for an element.
        // The caption is already set. Just wait until element appears or timeout.
        if (step.checkSelector) {
            let attempts = 0;
            const maxAttempts = 40; // Wait for max 20 seconds
            while (findElement(step.checkSelector) === null && attempts < maxAttempts) {
                await wait(500);
                attempts++;
                if (!simulationActive.current) throw new Error("Simulation stopped");
            }
            if (findElement(step.checkSelector) === null) {
                console.warn(`Demo: Check_ui element "${step.checkSelector}" did not appear. Continuing without it.`);
            }
        }
        await wait(step.duration || 500); // Additional wait even if element appears quickly
        break;
    }
  }, [cursorPos.x, cursorPos.y, setCaptionWithTimeout]); // Include animateCursorTo in dependencies of useCallback

  const animateCursorTo = useCallback(async (targetX: number, targetY: number, duration: number = 1000) => {
    const startX = cursorPos.x;
    const startY = cursorPos.y;
    await new Promise<void>(resolve => {
      let currentAnimationFrame: number | null = null;
      const startTime = Date.now();

      const animateFrame = () => {
        if (!simulationActive.current) {
          if (currentAnimationFrame) cancelAnimationFrame(currentAnimationFrame);
          resolve(); // Resolve promise if simulation stops
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);
        
        const x = startX + (targetX - startX) * easeProgress;
        const y = startY + (targetY - startY) * easeProgress;
        
        setCursorPos({ x, y });
        
        if (progress < 1) {
          currentAnimationFrame = requestAnimationFrame(animateFrame);
        } else {
          resolve();
        }
      };
      currentAnimationFrame = requestAnimationFrame(animateFrame);
    });
  }, [cursorPos.x, cursorPos.y]); // Dependencies to ensure smooth transitions from latest position

  // --- Simulation Flow Control ---
  const startSimulation = useCallback(async () => {
    if (isPlaying) return; // Prevent double-start
    
    simulationActive.current = true;
    setIsPlaying(true);
    setShowPlayButton(false);
    document.body.style.overflow = 'hidden'; // Prevent user scrolling during demo

    // Initial cursor positioning
    setCursorPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    await animateCursorTo(window.innerWidth / 2, window.innerHeight / 2, 800);
    
    try {
      for (let i = 0; i < DEMO_SCRIPT.length; i++) {
        if (!simulationActive.current) break; // Check flag before each step
        setCurrentStepIndex(i);
        await executeStep(DEMO_SCRIPT[i]);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Simulation stopped") {
        console.log("Demo simulation gracefully stopped.");
      } else {
        console.error("Demo simulation error:", error);
      }
    } finally {
      // --- Cleanup ---
      if (simulationActive.current) { // Only run full cleanup if not explicitly stopped by closeDemo
          setCaptionWithTimeout("Demo complete! Feel free to explore. 👋", 3000);
          await wait(3000); // Final pause for the message
          await animateCursorTo(cursorPos.x, cursorPos.y, 500); // Ensure cursor is at latest position before hiding
      }
      
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (timeoutId.current) clearTimeout(timeoutId.current);
      
      simulationActive.current = false;
      setIsPlaying(false);
      setCurrentStepIndex(0);
      setCaption('');
      document.body.style.overflow = originalBodyOverflow.current; // Restore original body overflow
      setShowPlayButton(true); // Show play button again for next time
    }
  }, [isPlaying, executeStep, animateCursorTo, setCaptionWithTimeout, cursorPos.x, cursorPos.y]);

  const stopSimulation = useCallback(() => {
    simulationActive.current = false; // Set flag to stop all ongoing and future steps
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCaption('');
    document.body.style.overflow = originalBodyOverflow.current; // Restore original body overflow
    setShowPlayButton(true); // Show play button again
    console.log("Demo simulation stopped by user.");
  }, []);

  // Effect to clean up on unmount or if simulation is externally stopped
  useEffect(() => {
    return () => {
      if (simulationActive.current) {
          stopSimulation(); // Ensure everything is cleaned up if component unmounts
      }
      if (currentStepDescriptionTimeout.current) {
          clearTimeout(currentStepDescriptionTimeout.current);
      }
    };
  }, [stopSimulation]); // Depend on stopSimulation to ensure cleanup logic is correct


  // If the initial `DEMO_SCRIPT` needs to start with 'create new book' and there are no books,
  // we might want to adapt the script on the fly or provide a default existing book.
  // For this version, we assume there's at least one book in the library for step 5.
  // You might need to manually ensure a book exists for the demo to work flawlessly.

  return (
    <>
      {/* Play Button (only shown when not playing) */}
      {showPlayButton && (
        <button
          onClick={startSimulation}
          className="fixed bottom-6 right-6 z-[9999] pointer-events-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all group animate-fade-in-up"
          aria-label="Start Demo Simulation"
        >
          <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Play Demo</span>
        </button>
      )}

      {/* Cursor (only shown when playing) */}
      {isPlaying && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: 'translate(-50%, -50%)',
            transition: 'none', // Critical for smooth, non-jerky movement
          }}
        >
          <div className="relative">
            {/* Cursor pointer */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3L19 12L12 13L9 20L5 3Z"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Click ripple effect */}
            {DEMO_SCRIPT[currentStepIndex]?.action === 'click' && (
              <div className="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-full opacity-50 animate-ping" />
            )}
          </div>
        </div>
      )}
      
      {/* Floating Caption Box (only shown when playing and caption is set) */}
      {isPlaying && caption && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-blue-600/80 backdrop-blur-md text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-2xl border border-blue-400 max-w-md text-center animate-fade-in-up">
          {caption}
        </div>
      )}

      {/* Invisible overlay button to stop demo (for dev/debugging) */}
      {isPlaying && (
        <button
          onClick={stopSimulation}
          className="fixed top-4 right-4 z-[10000] p-2 bg-red-600 text-white rounded-full opacity-50 hover:opacity-100 transition-opacity"
          title="Stop Demo (Dev Only)"
        >
          <X size={16} />
        </button>
      )}
    </>
  );
}
