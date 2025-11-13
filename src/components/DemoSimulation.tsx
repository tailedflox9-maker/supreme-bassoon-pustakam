// src/components/DemoSimulation.tsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { PlayCircle, MousePointer2 } from 'lucide-react';

// Helper function for delays
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// The corrected, Pustakam-specific demo script
const DEMO_SCRIPT = [
    { id: 1, target: 'body', action: 'wait', duration: 2500, description: "👋 Welcome to Pustakam AI - Let's turn an idea into a book." },
    { id: 2, target: 'button:has-text("Create New Book")', action: 'move', duration: 1500, description: "First, let's start a new book project." },
    { id: 3, target: 'button:has-text("Create New Book")', action: 'click', duration: 1000, description: "Opening the creation form..." },
    { id: 4, target: 'body', action: 'wait', duration: 1500, description: "✨ Here we define the book's core idea." },
    { id: 5, target: 'textarea#goal', action: 'move', duration: 1800, description: "You can start with a simple topic or a detailed paragraph." },
    { id: 6, target: 'textarea#goal', action: 'type', duration: 5000, text: 'A complete guide to Modern React Development with Hooks and State Management', description: "Let's use 'Modern React Development' as our topic." },
    { id: 7, target: 'button:has-text("Refine with AI")', action: 'move', duration: 1800, description: "Now, let AI enhance this idea into a structured plan." },
    { id: 8, target: 'button:has-text("Refine with AI")', action: 'fake-refine', duration: 4000, description: "🤖 AI is optimizing the goal, title, and target audience..." },
    { id: 9, target: 'body', action: 'wait', duration: 2000, description: "✅ The form is now auto-filled with a refined plan!" },
    { id: 10, target: 'button:has-text("Generate Book Roadmap")', action: 'move', duration: 1800, description: "Next, we generate the book's chapter-by-chapter roadmap." },
    { id: 11, target: 'button:has-text("Generate Book Roadmap")', action: 'click', duration: 4000, description: "🔨 Creating a detailed learning path with 8-12 modules..." },
    { id: 12, target: 'body', action: 'wait', duration: 2500, description: "📖 Here's our book's dashboard and learning roadmap!" },
    { id: 13, target: 'button:has-text("Generate All Modules")', action: 'move', duration: 2000, description: "Ready to write! Clicking this starts the AI generation." },
    { id: 14, target: 'button:has-text("Generate All Modules")', action: 'wait', duration: 3500, description: "📝 It writes 2-4k words per chapter with live progress." },
    { id: 15, target: 'body', action: 'wait', duration: 3000, description: "Progress is auto-saved, so you can pause or resume anytime." },
    { id: 16, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'move', duration: 1800, description: "You can switch AI models for different writing styles." },
    { id: 17, target: 'header button:has(svg[class*="lucide-chevron-down"])', action: 'click', duration: 1000, description: "Opening model selector..." },
    { id: 18, target: 'body', action: 'wait', duration: 2000, description: "Supports Google, Mistral, ZhipuAI, and Groq models." },
    { id: 19, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'move', duration: 1800, description: "Let's switch to Mistral for this book..." },
    { id: 20, target: 'div.model-dropdown button:has-text("Mistral Small")', action: 'click', duration: 1500, description: "✅ Model switched successfully!" },
    { id: 21, target: 'body', action: 'wait', duration: 1000, description: "" },
    { id: 22, target: 'button:has-text("Back to My Books")', action: 'move', duration: 1800, description: "Now, let's go back to our library." },
    { id: 23, target: 'button:has-text("Back to My Books")', action: 'click', duration: 1500, description: "Navigating to the library view..." },
    { id: 24, target: 'body', action: 'wait', duration: 2500, description: "📚 All your book projects are saved here." },
    { id: 25, target: 'div.grid > div:first-child', action: 'move', duration: 2000, description: "You can track progress, manage, and export books from here." },
    { id: 26, target: 'button:has-text("Back")', action: 'move', duration: 1800, description: "Let's return to the home screen." },
    { id: 27, target: 'button:has-text("Back")', action: 'click', duration: 1500, description: "Going back to the main dashboard..." },
    { id: 28, target: 'body', action: 'wait', duration: 3000, description: "🎉 From idea to a structured book in just a few clicks!" },
    { id: 29, target: 'body', action: 'wait', duration: 3000, description: "Thanks for watching the demo. Start creating now!" },
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
        console.warn(`[DemoSimulation] Could not find element with selector: "${selector}"`);
        return null;
    };

    const setCaptionWithDelay = async (text: string, delay: number) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        setCaption(text);
        await wait(delay);
    };

    const moveCursor = async (coords: { x: number | string; y: number | string; }, duration: number = 1.5) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        await cursorControls.start({ 
            ...coords, 
            transition: { duration, ease: [0.25, 0.1, 0.25, 1] }
        });
    };

    const highlightElement = async (selector: string, padding: number = 8) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        await wait(200);
        const element = findElement(selector);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        await highlighterControls.start({ 
            x: rect.left - padding, 
            y: rect.top - padding, 
            width: rect.width + (padding * 2), 
            height: rect.height + (padding * 2),
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } 
        });
    };

    const hideHighlighter = async () => {
        if (!simulationRef.current) return;
        await highlighterControls.start({ 
            opacity: 0, 
            scale: 1.05, 
            transition: { duration: 0.5, ease: 'easeOut' } 
        });
    };
    
    const moveCursorToElement = async (selector: string, duration: number = 1.5) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        await wait(200);
        const element = findElement(selector);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        await moveCursor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, duration);
    };

    const clickElement = async (selector: string) => {
        if (!simulationRef.current) throw new Error("Simulation stopped");
        const element = findElement(selector);
        if (element) {
            await cursorControls.start({ scale: 0.85, transition: { duration: 0.1 } });
            element.click();
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
                await highlightElement(step.target);
                await moveCursorToElement(step.target);
                
                switch (step.action) {
                    case 'click':
                        await clickElement(step.target);
                        break;
                    case 'type':
                        if (step.text) await typeInElement(step.target, step.text, step.duration || 3000);
                        break;
                    case 'fake-refine':
                         await cursorControls.start({ scale: 0.85, transition: { duration: 0.1 } });
                         await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
                         break;
                }

                await hideHighlighter();
                await wait(step.duration || 1000);
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
                    aria-label="Play Demo Simulation"
                >
                    <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Play Demo</span>
                </motion.button>
            )}
            </AnimatePresence>
            
            <motion.div
                className="absolute border-3 border-blue-400 rounded-xl shadow-2xl shadow-blue-500/50"
                animate={highlighterControls}
                initial={{ opacity: 0, scale: 1.1 }}
                style={{ pointerEvents: 'none', borderWidth: '3px' }}
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
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600/80 backdrop-blur-md text-white text-base font-semibold px-6 py-3 rounded-xl shadow-2xl border border-blue-400 max-w-lg text-center"
                    >
                        {caption}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
