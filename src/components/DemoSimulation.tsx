// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string; // CSS selector
  action: 'move' | 'click' | 'type' | 'wait' | 'scroll';
  duration?: number;
  text?: string;
  description?: string; // This will now be used for the floating caption
  scrollAmount?: number;
}

// 🎬 DEMO SCRIPT - TRANSLATED FROM YOUR EXAMPLE
const DEMO_SCRIPT: SimulationStep[] = [
  // 1. Start at home
  { id: 1, target: 'body', action: 'wait', duration: 1500, description: 'Welcome to Pustakam AI! Let\'s create a new book.' },
  
  // 2. Move to and Click "Create New Book"
  { id: 2, target: 'button:has-text("Create New Book")', action: 'move', duration: 2000, description: 'First, we start a new book project.' },
  { id: 3, target: 'button:has-text("Create New Book")', action: 'click', duration: 500, description: 'Clicking to create a new book.' },
  
  // 4. Wait for form to load
  { id: 4, target: 'body', action: 'wait', duration: 1000, description: 'Loading the book creation form.' },
  
  // 5. Move to goal input and type
  { id: 5, target: 'textarea#goal', action: 'move', duration: 1500, description: 'We provide a high-level goal for the book.' },
  { id: 6, target: 'textarea#goal', action: 'type', text: 'A comprehensive guide to React.js and modern web development', duration: 4000, description: 'Typing the book\'s core learning goal.' },
  
  // 7. Move to and Click "Refine with AI" button
  { id: 7, target: 'button:has-text("Refine with AI")', action: 'move', duration: 1500, description: 'Next, we use AI to refine the idea and auto-fill the details.' },
  { id: 8, target: 'button:has-text("Refine with AI")', action: 'click', duration: 500, description: 'Initiating AI refinement.' },
  
  // 9. Wait for AI processing and scroll
  { id: 9, target: 'body', action: 'wait', duration: 2500, description: 'AI is enhancing the input, structuring it for optimal generation.' },
  { id: 10, target: '#main-scroll-area', action: 'scroll', scrollAmount: 200, duration: 1000, description: 'The target audience and complexity level are now intelligently filled in.' },
  
  // 11. Move to and Click "Generate Book Roadmap" button
  { id: 11, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 1500, description: 'Now, let\'s generate the book\'s comprehensive structure.' },
  { id: 12, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 500, description: 'Generating the modular roadmap.' },
  
  // 13. Wait for roadmap generation and scroll
  { id: 13, target: 'body', action: 'wait', duration: 3500, description: 'The AI is creating a detailed, chapter-by-chapter learning roadmap.' },
  { id: 14, target: '#main-scroll-area', action: 'scroll', scrollAmount: 500, duration: 1500, description: 'Here is the complete learning roadmap, broken into clear modules.' },
  
  // 15. Move to and Click "Generate All Modules"
  { id: 15, target: 'button:has-text("Generate All Modules")', action: 'move', duration: 2000, description: 'Finally, we instruct the AI to generate the content for all chapters.' },
  { id: 16, target: 'button:has-text("Generate All Modules")', action: 'click', duration: 500, description: 'Starting the content generation for all modules.' },
  
  // 17. Wait to see generation progress
  { id: 17, target: 'body', action: 'wait', duration: 4000, description: 'The AI is now writing the book, chapter by chapter, with live progress updates.' },
  
  // 18. Final message
  { id: 18, target: 'body', action: 'wait', duration: 3000, description: 'The demo is complete. Thank you for watching! 🎉' },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 100, y: 100 });
  const [isVisible, setIsVisible] = useState(true);
  const [caption, setCaption] = useState(''); // New state for floating caption
  
  const animationRef = useRef<number>();
  const timeoutRef = useRef<number>();
  const simulationRef = useRef<boolean>(false); // Used to signal if simulation should continue

  // 🎯 Find element by selector with fallback
  const findElement = (selector: string): HTMLElement | null => {
    try {
        let element = document.querySelector(selector) as HTMLElement;
        if (element) return element;
    } catch (e) {
        // Fallback for complex selectors like :has-text
    }

    if (selector.includes(':has-text')) {
        const textMatch = selector.match(/has-text\("(.+?)"\)/);
        const text = textMatch ? textMatch[1] : '';
        if (text) {
            // Search buttons and general elements for text content
            const elements = Array.from(document.querySelectorAll('button, a, label, h1, h2, h3, h4, p, span'));
            const foundElement = elements.find(el => el.textContent?.trim().includes(text));
            return foundElement as HTMLElement | null;
        }
    }
    return null;
  };
  
  // 🎬 Execute a single step
  const executeStep = async (step: SimulationStep) => {
    if (!simulationRef.current) return; // Stop if simulation is halted
    
    // Set caption before executing action
    setCaption(step.description || '');

    const element = findElement(step.target);
    
    // Auto-scroll to element if it's not in view for 'move' or 'click' actions
    if (element && (step.action === 'move' || step.action === 'click' || step.action === 'type')) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await wait(500); // Give time for scroll to complete
    }

    switch (step.action) {
      case 'move':
        if (element) {
          const rect = element.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;
          
          animateCursor(cursorPos.x, cursorPos.y, targetX, targetY, step.duration || 1000);
        }
        await wait(step.duration || 1000);
        break;
        
      case 'click':
        if (element) {
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
          let currentText = '';
          
          for (let i = 0; i < step.text.length; i++) {
            if (!simulationRef.current) break; // Check again inside loop
            // If paused, wait until resumed
            while(isPaused) {
                if (!simulationRef.current) break;
                await wait(100);
            }
            if (!simulationRef.current) break;

            currentText += step.text[i];
            input.value = currentText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            
            await wait((step.duration || 2000) / step.text.length);
          }
        }
        break;
        
      case 'scroll':
        if (step.scrollAmount) {
          const mainScroll = document.getElementById('main-scroll-area') || window;
          const startScroll = mainScroll instanceof Window 
            ? window.scrollY 
            : mainScroll.scrollTop;
          const endScroll = startScroll + step.scrollAmount;
          
          const scrollDuration = step.duration || 1000;
          const startTime = Date.now();
          
          const animateScroll = () => {
            if (!simulationRef.current) return; // Check again inside animation frame
            if (isPaused) { // Pause scrolling if demo is paused
                animationRef.current = requestAnimationFrame(animateScroll);
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            const currentScrollVal = startScroll + (endScroll - startScroll) * easeProgress;
            
            if (mainScroll instanceof Window) {
              window.scrollTo(0, currentScrollVal);
            } else {
              mainScroll.scrollTop = currentScrollVal;
            }
            
            if (progress < 1) {
              animationRef.current = requestAnimationFrame(animateScroll);
            }
          };
          
          animateScroll();
        }
        await wait(step.duration || 1000); // Wait for scroll duration
        break;
        
      case 'wait':
        await wait(step.duration || 1000);
        break;
    }
  };
  
  // 🎨 Animate cursor movement
  const animateCursor = (startX: number, startY: number, endX: number, endY: number, duration: number) => {
    const startTime = Date.now();
    
    const animate = () => {
      if (!simulationRef.current) return; // Check if simulation is still active
      if (isPaused) { // Pause cursor movement if demo is paused
          animationRef.current = requestAnimationFrame(animate);
          return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = easeInOutCubic(progress);
      
      const x = startX + (endX - startX) * easeProgress;
      const y = startY + (endY - startY) * easeProgress;
      
      setCursorPos({ x, y });
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };
  
  // ⏱️ Helper functions
  const wait = (ms: number) => new Promise(resolve => {
    timeoutRef.current = window.setTimeout(resolve, ms)
  });
  
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  
  // 🎮 Playback controls
  const startSimulation = async () => {
    simulationRef.current = true; // Set flag to true when starting
    setIsPlaying(true);
    setIsPaused(false);
    
    for (let i = currentStep; i < DEMO_SCRIPT.length; i++) {
        if (!simulationRef.current) break; // Break if simulation was stopped
        
        setCurrentStep(i);
        await executeStep(DEMO_SCRIPT[i]);
      
        // Check if paused between steps
        while (isPaused) {
            if (!simulationRef.current) break;
            await wait(100);
        }
    }

    if (simulationRef.current) { // Only reset if not explicitly stopped
        setIsPlaying(false);
        setCurrentStep(0);
        simulationRef.current = false;
        setCaption(''); // Clear caption at the end
    }
  };
  
  const pauseSimulation = () => {
    setIsPaused(true);
    setIsPlaying(false);
    if(animationRef.current) cancelAnimationFrame(animationRef.current);
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
  };
  
  const resumeSimulation = () => {
    setIsPaused(false);
    setIsPlaying(true);
    startSimulation(); // Restart the loop from current step
  };
  
  const resetSimulation = () => {
    simulationRef.current = false; // Stop current simulation loop
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setCursorPos({ x: 100, y: 100 }); // Reset cursor position
    setCaption(''); // Clear caption
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Give it a moment before restarting from scratch
    setTimeout(() => {
        startSimulation();
    }, 500);
  };
  
  const closeDemo = () => {
    simulationRef.current = false; // Ensure simulation loop is stopped
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };
  
  // 🧹 Cleanup on component unmount
  useEffect(() => {
    return () => {
      simulationRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startSimulation();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  const currentStepData = DEMO_SCRIPT[currentStep];
  
  return (
    <>
      {/* 🖱️ Custom Cursor */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'none',
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
          {isPlaying && currentStepData?.action === 'click' && (
            <div className="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-full opacity-50 animate-ping" />
          )}
        </div>
      </div>
      
      {/* 🎛️ Control Panel */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9998] animate-fade-in-up">
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 min-w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Demo Walkthrough</h3>
                <p className="text-gray-400 text-xs">
                  Step {currentStep + 1} of {DEMO_SCRIPT.length}
                </p>
              </div>
            </div>
            
            <button
              onClick={closeDemo}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close Demo"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
          
          {/* Current Step Description (still in control panel) */}
          {currentStepData?.description && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">{currentStepData.description}</p>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / DEMO_SCRIPT.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {!isPlaying && !isPaused ? (
              <button
                onClick={startSimulation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all"
              >
                <Play className="w-4 h-4" />
                Start Demo
              </button>
            ) : isPaused ? (
              <button
                onClick={resumeSimulation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-semibold transition-all"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            
            <button
              onClick={resetSimulation}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
              title="Reset Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Recording Tip */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              💡 <strong className="text-white">Tip:</strong> Use OBS or a screen recorder to capture this demo.
            </p>
          </div>
        </div>
      </div>

      {/* FLOATING CAPTION BOX */}
      {caption && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-amber-500/80 backdrop-blur-md text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-2xl border border-amber-400 max-w-md text-center animate-fade-in-up">
          {caption}
        </div>
      )}
    </>
  );
}
