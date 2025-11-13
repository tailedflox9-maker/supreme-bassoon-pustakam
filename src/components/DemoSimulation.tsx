// src/components/DemoSimulation.tsx - CLEAN VERSION FOR RECORDING
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string;
  action: 'move' | 'click' | 'wait' | 'scroll';
  duration?: number;
  description?: string;
  scrollAmount?: number;
}

// 🎬 COMPREHENSIVE DEMO SCRIPT - Shows All Features
const DEMO_SCRIPT: SimulationStep[] = [
  // === INTRODUCTION ===
  { id: 1, target: 'body', action: 'wait', duration: 2500, description: "" },
  
  // === CREATE NEW BOOK ===
  { id: 2, target: 'button:has-text("Create New Book")', action: 'move', duration: 2500, description: '' },
  { id: 3, target: 'button:has-text("Create New Book")', action: 'click', duration: 1500, description: '' },
  
  // === ENTER PROMPT ===
  { id: 4, target: 'textarea#goal', action: 'move', duration: 2000, description: '' },
  { id: 5, target: 'textarea#goal', action: 'click', duration: 3000, description: 'type: Learn Python for Data Science' },
  { id: 6, target: 'body', action: 'wait', duration: 2000, description: '' },
  
  // === USE AI REFINER ===
  { id: 7, target: 'button:has-text("Refine with AI")', action: 'move', duration: 2500, description: '' },
  { id: 8, target: 'button:has-text("Refine with AI")', action: 'click', duration: 1500, description: '' },
  { id: 9, target: 'body', action: 'wait', duration: 4000, description: '' },
  
  // === GENERATE ROADMAP ===
  { id: 10, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 2500, description: '' },
  { id: 11, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 1500, description: '' },
  { id: 12, target: 'body', action: 'wait', duration: 3500, description: '' },
  
  // === OPEN LIBRARY ===
  { id: 13, target: 'button[title="Library & Settings"]', action: 'move', duration: 2500, description: '' },
  { id: 14, target: 'button[title="Library & Settings"]', action: 'click', duration: 1500, description: '' },
  { id: 15, target: 'body', action: 'wait', duration: 2500, description: '' },
  
  // === SELECT A BOOK ===
  { id: 16, target: '.model-dropdown .max-h-80 > div:first-child', action: 'move', duration: 2500, description: '' },
  { id: 17, target: '.model-dropdown .max-h-80 > div:first-child', action: 'click', duration: 1500, description: '' },
  { id: 18, target: 'body', action: 'wait', duration: 2000, description: '' },
  
  // === START GENERATION ===
  { id: 19, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'move', duration: 2500, description: '' },
  { id: 20, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'click', duration: 1500, description: '' },
  { id: 21, target: 'body', action: 'wait', duration: 5000, description: '' },
  
  // === LET IT RUN ===
  { id: 22, target: 'body', action: 'wait', duration: 4000, description: '' },
  { id: 23, target: 'body', action: 'wait', duration: 4000, description: '' },
  { id: 24, target: 'body', action: 'wait', duration: 4000, description: '' },
  
  // === CONCLUSION ===
  { id: 25, target: 'body', action: 'wait', duration: 3500, description: '' },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 }); // Start off-screen
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
            // Try buttons first, then other elements
            const buttons = Array.from(document.querySelectorAll('button'));
            let foundElement = buttons.find(el => el.textContent?.trim().includes(text));
            
            if (!foundElement) {
                const allElements = Array.from(document.querySelectorAll('a, span, h3, div, label'));
                foundElement = allElements.find(el => el.textContent?.trim().includes(text));
            }
            
            return foundElement as HTMLElement | null;
        }
    }
    
    // Handle ID selectors like textarea#goal
    if (selector.includes('#')) {
        const id = selector.split('#')[1];
        const element = document.getElementById(id);
        if (element) return element as HTMLElement;
    }
    
    return null;
  };

  const wait = (ms: number): Promise<void> => new Promise(resolve => {
    stepTimeout.current = window.setTimeout(resolve, ms);
  });
  
  const typeText = async (element: HTMLTextAreaElement, text: string): Promise<void> => {
    element.focus();
    element.value = '';
    
    for (let i = 0; i < text.length; i++) {
      if (!simulationActive.current) break;
      element.value += text[i];
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(50); // 50ms per character for realistic typing
    }
  };
  
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
          setCursorPos({ x: targetX, y: targetY });
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }, [cursorPos.x, cursorPos.y]);

  const executeStep = useCallback(async (step: SimulationStep) => {
    if (!simulationActive.current) return;

    const element = findElement(step.target);

    if (element && ['move', 'click', 'type'].includes(step.action)) {
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
          await animateCursor(rect.left + rect.width / 2, rect.top + rect.height / 2, (step.duration || 1000) * 0.7);
          setClickEffect(true);
          setTimeout(() => setClickEffect(false), 200);
          
          // Special handling for typing simulation
          if (element.tagName === 'TEXTAREA' && step.description?.includes('type:')) {
            const textToType = step.description.split('type:')[1].trim();
            await typeText(element as HTMLTextAreaElement, textToType);
          } else {
            element.click();
          }
          
          await wait((step.duration || 1000) * 0.3);
        } else {
            await wait(step.duration || 1000);
        }
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

    // Grand entrance for the cursor from off-screen
    await wait(500);
    await animateCursor(window.innerWidth / 2, window.innerHeight / 2, 1500);
    
    for (const step of DEMO_SCRIPT) {
      if (!simulationActive.current) break;
      await executeStep(step);
    }

    // Cleanup sequence
    await wait(3000);
    await animateCursor(cursorPos.x, window.innerHeight + 100, 1500);
    
    simulationActive.current = false;
    setIsPlaying(false);
    setShowPlayButton(true);

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
          className="fixed bottom-6 right-6 z-[10001] pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all group animate-fade-in-up border border-white/20"
          aria-label="Start Demo Simulation"
        >
          <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-start">
            <span className="font-bold text-base">Play Interactive Demo</span>
            <span className="text-xs text-white/80">See how Pustakam works</span>
          </div>
        </button>
      )}

      {isPlaying && (
        <div
          className="fixed pointer-events-none z-[10000] transition-transform duration-100"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: `translate(-4px, -4px) scale(${clickEffect ? 0.8 : 1})`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
          }}
        >
          {/* Custom SVG Pointer */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.233 3.233a1 1 0 0 1 1.534-.848l12 7a1 1 0 0 1 0 1.73l-12 7a1 1 0 0 1-1.534-.848V3.233Z" fill="white" stroke="#1D4ED8" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </>
  );
}
