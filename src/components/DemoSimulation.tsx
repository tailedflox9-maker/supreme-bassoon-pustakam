// src/components/DemoSimulation.tsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { PlayCircle, MousePointer2 } from 'lucide-react';

// Helper function for delays
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 🎬 FINAL SCRIPT with Corrected Navigation, API Guide, and Better Captions
const DEMO_SCRIPT = [
    { id: 1,  description: "👋 Welcome to Pustakam AI! Let's see how to create a book from an idea.", duration: 3000 },
    { id: 2,  target: 'button:has-text("Create New Book")', description: "First, we'll start a new book project." },
    { id: 3,  target: 'button:has-text("Create New Book")', action: 'click', duration: 1500 },
    { id: 4,  target: 'textarea#goal', description: "You can start with a simple topic." },
    { id: 5,  target: 'textarea#goal', action: 'type', text: 'The Principles of Quantum Computing Explained Simply', duration: 4000, description: "Let's use 'Quantum Computing' as our topic." },
    { id: 6,  target: 'button:has-text("Refine with AI")', description: "The AI can enhance this into a structured plan." },
    { id: 7,  target: 'button:has-text("Refine with AI")', action: 'fake-click', duration: 3000, description: "🤖 The AI would now optimize the goal, title, and target audience..." },
    { id: 8,  target: 'button:has-text("Generate Book Roadmap")', description: "Then, it would generate a chapter-by-chapter roadmap." },
    { id: 9,  target: 'button:has-text("Generate Book Roadmap")', action: 'fake-click', duration: 3000, description: "🔨 This creates a detailed learning path automatically." },
    { id: 10, target: 'button:has-text("Back")', description: "Now, let's explore the app's other features." },
    { id: 11, target: 'button:has-text("Back")', action: 'click', duration: 2000 },
    { id: 12, target: 'button:has-text("View My Books")', description: "Your library is accessible right from the home screen." },
    { id: 13, target: 'button:has-text("View My Books")', action: 'click', duration: 2000 },
    { id: 14, target: 'div.grid > div:first-child', description: "Let's open a completed book." },
    { id: 15, target: 'div.grid > div:first-child', action: 'click', duration: 2000 },
    { id: 16, target: 'button:has-text("Professional PDF")', description: "Once a book is complete, you can download it as a professional PDF." },
    { id: 17, target: 'button:has-text("Professional PDF")', action: 'move', duration: 2500 },
    { id: 18, target: 'button[title="Library & Settings"]', description: "To generate books, you need to add an API key in Settings." },
    { id: 19, target: 'button[title="Library & Settings"]', action: 'click', duration: 1500 },
    { id: 20, target: 'button:has-text("Settings")', description: "Let's open the settings menu." },
    { id: 21, target: 'button:has-text("Settings")', action: 'click', duration: 1500 },
    { id: 22, target: 'input[id="googleApiKey"]', description: "This is where you add your API keys. It's the first step to get started!" },
    { id: 23, target: 'input[id="googleApiKey"]', action: 'move', duration: 2500 },
    { id: 24, target: 'button:has-text("Cancel")', description: "Now we'll return to the home screen." },
    { id: 25, target: 'button:has-text("Cancel")', action: 'click', duration: 1500 },
    { id: 26, target: 'button:has-text("Back to My Books")', action: 'click', duration: 1500 },
    { id: 27, target: 'button:has-text("Back")', action: 'click', duration: 1500 },
    { id: 28, target: 'button[title="Toggle Theme"]', description: "The interface also supports both dark and light themes." },
    { id: 29, target: 'button[title="Toggle Theme"]', action: 'click', duration: 2000 },
    { id: 30, target: 'button[title="Toggle Theme"]', action: 'click', duration: 1500 },
    { id: 31, description: "That concludes our quick tour. Now it's your turn to bring ideas to life!", duration: 4000 },
];

export function DemoSimulation() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [caption, setCaption] = useState('');
    const cursorControls = useAnimation();
    const highlighterControls = useAnimation();
    const simulationRef = useRef<boolean>(false);

    const findElement = (selector: string): HTMLElement | null => {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) return element;
        } catch (e) { /* Invalid selector */ }

        if (selector.includes(':has-text')) {
            const textMatch = selector.match(/has-text\("(.+?)"\)/);
            const targetText = textMatch ? textMatch[1].trim() : null;
            if (targetText) {
                const elements = Array.from(document.querySelectorAll<HTMLElement>('*'));
                const matches = elements.filter(el => el.textContent?.trim() === targetText);
                if (matches.length > 0) {
                    const interactiveMatch = matches.find(el => ['BUTTON', 'A'].includes(el.tagName));
                    return interactiveMatch || matches[0];
                }
            }
        }
        if (selector !== 'body') {
            console.warn(`[DemoSimulation] Could not find element with selector: "${selector}"`);
        }
        return null;
    };

    const setCaptionWithDelay = async (text: string, delay: number) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        setCaption(text);
        if (delay > 0) await wait(delay);
    };

    const moveCursor = async (coords: { x: number | string; y: number | string; }, duration: number = 1.0) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        await cursorControls.start({ 
            x: coords.x, 
            y: coords.y,
            transition: { duration, ease: [0.4, 0, 0.2, 1] }
        });
    };

    const highlightElement = async (selector: string, padding: number = 6) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        await wait(50);
        const element = findElement(selector);
        if (!element) {
            await hideHighlighter();
            return;
        };

        const rect = element.getBoundingClientRect();
        await highlighterControls.start({ 
            x: rect.left - padding, 
            y: rect.top - padding, 
            width: rect.width + (padding * 2), 
            height: rect.height + (padding * 2),
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } 
        });
    };

    const hideHighlighter = async () => {
        if (!simulationRef.current) return;
        await highlighterControls.start({ 
            opacity: 0, 
            scale: 1.05, 
            transition: { duration: 0.3, ease: 'easeOut' } 
        });
    };
    
    const moveCursorToElement = async (selector: string, duration: number = 1.0) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        await wait(50);
        const element = findElement(selector);
        if (!element) return;
        
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await wait(400);

        const rect = element.getBoundingClientRect();
        await moveCursor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, duration);
    };

    const clickElement = async (selector: string) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        const element = findElement(selector);
        if (element) {
            await cursorControls.start({ scale: 0.85, transition: { duration: 0.1 } });
            element.click();
            await wait(100);
            await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        }
    };
    
    const typeInElement = async (selector: string, text: string, duration: number) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        const element = findElement(selector) as HTMLInputElement | HTMLTextAreaElement;
        if (element) {
            element.focus();
            const charDelay = duration / text.length;
            for (let i = 0; i < text.length; i++) {
                if (!simulationRef.current) break;
                element.value = text.substring(0, i + 1);
                element.dispatchEvent(new Event('input', { bubbles: true }));
                await wait(charDelay);
            }
        }
    };

    const runSimulation = useCallback(async () => {
        if (simulationRef.current) return;
        simulationRef.current = true;
        setIsSimulating(true);

        try {
            await cursorControls.start({ x: '50%', y: '50%', opacity: 1, transition: { duration: 1 } });

            for (const step of DEMO_SCRIPT) {
                if (!simulationRef.current) throw new Error("Simulation stopped");

                await setCaptionWithDelay(step.description || '', 0);
                
                if (step.target) {
                    await moveCursorToElement(step.target);
                    await highlightElement(step.target);
                    await wait(300); 
                }
                
                if (step.action) {
                    switch (step.action) {
                        case 'click':
                            if (step.target) {
                                await hideHighlighter();
                                await clickElement(step.target);
                            }
                            break;
                        case 'type':
                            if (step.target && step.text) await typeInElement(step.target, step.text, step.duration || 3000);
                            break;
                        case 'fake-click':
                             await cursorControls.start({ scale: 0.85, transition: { duration: 0.1 } });
                             await wait(150);
                             await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
                             break;
                        case 'move': 
                             break;
                    }
                }
                
                if (step.target && step.action !== 'click') {
                    await hideHighlighter();
                }

                await wait(step.duration || 2500); 
            }
        
        } catch (error) {
            console.log("Simulation stopped.", error);
        } finally {
            simulationRef.current = false;
            setCaption('');
            await Promise.all([
                hideHighlighter(),
                cursorControls.start({ opacity: 0, transition: { duration: 0.8 } })
            ]);
            setIsSimulating(false);
        }
    }, [cursorControls, highlighterControls]);

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <AnimatePresence>
            {!isSimulating && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    onClick={runSimulation}
                    className="fixed bottom-6 right-6 z-[10001] pointer-events-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 hover:bg-blue-700 transition-all group"
                    aria-label="Play Walkthrough"
                >
                    <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Play Walkthrough</span>
                </motion.button>
            )}
            </AnimatePresence>
            
            <motion.div
                className="absolute border-blue-400 rounded-lg shadow-2xl shadow-blue-500/50"
                animate={highlighterControls}
                initial={{ opacity: 0, scale: 1.1, borderWidth: '3px' }}
                style={{ pointerEvents: 'none' }}
            />

            <motion.div
                className="absolute"
                animate={cursorControls}
                initial={{ opacity: 0 }}
                style={{ pointerEvents: 'none' }}
            >
                <MousePointer2 
                    size={28} 
                    className="text-blue-400" 
                    style={{ 
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
                        strokeWidth: 2,
                        transform: 'translate(-4px, -2px)'
                    }}
                />
            </motion.div>
            
            <AnimatePresence>
                {isSimulating && caption && (
                    <motion.div
                        key={caption}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-lg shadow-2xl border border-white/10 max-w-md text-center"
                    >
                        {caption}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
