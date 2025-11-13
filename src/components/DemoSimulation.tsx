// src/components/DemoSimulation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface SimulationStep {
  id: number;
  target: string; // CSS selector
  action: 'move' | 'click' | 'type' | 'wait' | 'scroll';
  duration?: number;
  text?: string;
  description?: string;
  scrollAmount?: number;
}

// 🎬 DEMO SCRIPT - Easy to modify!
const DEMO_SCRIPT: SimulationStep[] = [
  // 1. Start at home
  { id: 1, target: 'body', action: 'wait', duration: 1000, description: 'Welcome to Pustakam AI' },
  
  // 2. Hover over "Create New Book" button
  { id: 2, target: 'button:has(svg)', action: 'move', duration: 2000, description: 'Let\'s create a new book' },
  
  // 3. Click "Create New Book"
  { id: 3, target: 'button:has(svg)', action: 'click', duration: 500 },
  
  // 4. Wait for form to load
  { id: 4, target: 'body', action: 'wait', duration: 1000 },
  
  // 5. Move to goal input
  { id: 5, target: 'textarea#goal, textarea[placeholder*="e.g."]', action: 'move', duration: 1500, description: 'Enter your learning goal' },
  
  // 6. Type in the goal field
  { id: 6, target: 'textarea#goal, textarea[placeholder*="e.g."]', action: 'type', text: 'A comprehensive guide to React.js and modern web development', duration: 3000 },
  
  // 7. Move to "Refine with AI" button
  { id: 7, target: 'button:has-text("Refine with AI")', action: 'move', duration: 1500, description: 'Use AI to refine the idea' },
  
  // 8. Click "Refine with AI"
  { id: 8, target: 'button:has-text("Refine with AI")', action: 'click', duration: 500 },
  
  // 9. Wait for AI processing
  { id: 9, target: 'body', action: 'wait', duration: 2000, description: 'AI is enhancing your input...' },
  
  // 10. Scroll down to see auto-filled fields
  { id: 10, target: 'body', action: 'scroll', scrollAmount: 200, duration: 1000 },
  
  // 11. Move to "Generate Book Roadmap" button
  { id: 11, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 1500, description: 'Generate the book structure' },
  
  // 12. Click "Generate Book Roadmap"
  { id: 12, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 500 },
  
  // 13. Wait for roadmap generation
  { id: 13, target: 'body', action: 'wait', duration: 3000, description: 'Creating your book roadmap...' },
  
  // 14. Scroll to see roadmap
  { id: 14, target: 'body', action: 'scroll', scrollAmount: 300, duration: 1500 },
  
  // 15. Hover over "Generate All Modules" button
  { id: 15, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'move', duration: 1500, description: 'Start generating chapters' },
  
  // 16. Click to start generation
  { id: 16, target: 'button:has-text("Generate All Modules"), button:has-text("Resume Generation")', action: 'click', duration: 500 },
  
  // 17. Wait to see generation progress
  { id: 17, target: 'body', action: 'wait', duration: 4000, description: 'AI is writing your book...' },
  
  // 18. Hover over model selector
  { id: 18, target: 'button:has(img[alt*="AI"])', action: 'move', duration: 1500, description: 'You can switch AI models anytime' },
  
  // 19. Final wait
  { id: 19, target: 'body', action: 'wait', duration: 2000, description: 'Demo complete! 🎉' },
];

export function DemoSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 100, y: 100 });
  const [isVisible, setIsVisible] = useState(true);
  
  const animationRef = useRef<number>();
  const timeoutRef = useRef<number>();
  
  // 🎯 Find element by selector with fallback
  const findElement = (selector: string): HTMLElement | null => {
    // Try exact selector first
    let element = document.querySelector(selector) as HTMLElement;
    
    // Fallback: Try to find by text content
    if (!element && selector.includes(':has-text')) {
      const text = selector.match(/has-text\("(.+?)"\)/)?.[1];
      if (text) {
        const buttons = Array.from(document.querySelectorAll('button'));
        element = buttons.find(btn => btn.textContent?.includes(text)) as HTMLElement;
      }
    }
    
    return element;
  };
  
  // 🎬 Execute a single step
  const executeStep = async (step: SimulationStep) => {
    const element = findElement(step.target);
    
    switch (step.action) {
      case 'move':
        if (element) {
          const rect = element.getBoundingClientRect();
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;
          
          animateCursor(cursorPos.x, cursorPos.y, targetX, targetY, step.duration || 1000);
        }
        break;
        
      case 'click':
        if (element) {
          // Visual click effect
          element.style.transform = 'scale(0.95)';
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
          let currentText = '';
          
          for (let i = 0; i < step.text.length; i++) {
            if (!isPlaying) break;
            
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
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            const currentScroll = startScroll + (endScroll - startScroll) * easeProgress;
            
            if (mainScroll instanceof Window) {
              window.scrollTo(0, currentScroll);
            } else {
              mainScroll.scrollTop = currentScroll;
            }
            
            if (progress < 1 && isPlaying) {
              requestAnimationFrame(animateScroll);
            }
          };
          
          animateScroll();
        }
        await wait(step.duration || 1000);
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
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = easeInOutCubic(progress);
      
      const x = startX + (endX - startX) * easeProgress;
      const y = startY + (endY - startY) * easeProgress;
      
      setCursorPos({ x, y });
      
      if (progress < 1 && isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };
  
  // ⏱️ Helper functions
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  
  // 🎮 Playback controls
  const startSimulation = async () => {
    setIsPlaying(true);
    setIsPaused(false);
    
    for (let i = currentStep; i < DEMO_SCRIPT.length; i++) {
      if (!isPlaying) break;
      
      setCurrentStep(i);
      await executeStep(DEMO_SCRIPT[i]);
      
      // Check if paused between steps
      while (isPaused) {
        await wait(100);
      }
    }
    
    setIsPlaying(false);
    setCurrentStep(0);
  };
  
  const pauseSimulation = () => {
    setIsPaused(true);
  };
  
  const resumeSimulation = () => {
    setIsPaused(false);
  };
  
  const resetSimulation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setCursorPos({ x: 100, y: 100 });
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  const closeDemo = () => {
    resetSimulation();
    setIsVisible(false);
  };
  
  // 🧹 Cleanup
  useEffect(() => {
    return () => {
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
          
          {/* Current Step Description */}
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
            {!isPlaying ? (
              <button
                onClick={startSimulation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all"
              >
                <Play className="w-4 h-4" />
                {currentStep > 0 ? 'Resume' : 'Start Demo'}
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
              💡 <strong className="text-white">Tip:</strong> Use OBS or screen recorder to capture this demo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
