import React, { useState } from 'react';
import { X, FileText, BookOpen, FlaskConical, Lightbulb, Plus } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../lib/utils.js';

const templates = [
    {
        id: 'blank',
        name: 'Blank Document',
        description: 'Start with a completely empty document.',
        category: 'General',
        icon: Plus,
        content: '',
    },
    {
        id: 'essay-5-paragraph',
        name: '5-Paragraph Essay',
        description: 'A classic structure for argumentative or expository essays.',
        category: 'Essay Formats',
        icon: BookOpen,
        content: '# Title\n\n## Introduction\n\n[Hook, Background Information, Thesis Statement]\n\n## Body Paragraph 1\n\n[Topic Sentence, Supporting Evidence, Elaboration, Concluding Sentence]\n\n## Body Paragraph 2\n\n[Topic Sentence, Supporting Evidence, Elaboration, Concluding Sentence]\n\n## Body Paragraph 3\n\n[Topic Sentence, Supporting Evidence, Elaboration, Concluding Sentence]\n\n## Conclusion\n\n[Restate Thesis, Summarize Main Points, Concluding Thought/Call to Action]',
    },
    {
        id: 'research-paper',
        name: 'Research Paper Outline',
        description: 'A detailed outline for structuring academic research papers.',
        category: 'Research Papers',
        icon: FileText,
        content: '# Research Paper Title\n\n## Abstract\n\n[Brief summary of the paper: purpose, methods, results, conclusions]\n\n## Introduction\n\n### Background\n[General overview of the topic, context]\n\n### Problem Statement\n[Identify the specific problem or gap in knowledge]\n\n### Research Questions/Hypotheses\n[State the questions the research aims to answer or hypotheses to test]\n\n### Significance\n[Explain why this research is important]\n\n## Literature Review\n\n[Summarize and critically evaluate existing research relevant to your topic]\n\n## Methodology\n\n### Research Design\n[Qualitative, quantitative, mixed methods]\n\n### Participants/Subjects\n[Who or what was studied, sampling methods]\n\n### Data Collection\n[Instruments, procedures]\n\n### Data Analysis\n[Statistical methods, thematic analysis, etc.]\n\n## Results\n\n[Present findings objectively, often with tables, figures, or graphs]\n\n## Discussion\n\n[Interpret results, relate to literature, discuss implications, limitations]\n\n## Conclusion\n\n[Summarize main findings, restate significance, suggest future research]\n\n## References\n\n[List all sources cited in the paper]',
    },
    {
        id: 'lab-report',
        name: 'Lab Report Template',
        description: 'Standard format for scientific laboratory reports.',
        category: 'Lab Reports',
        icon: FlaskConical,
        content: '# Lab Report Title\n\n## Abstract\n\n[Brief summary of the experiment: objective, methods, key results, conclusions]\n\n## Introduction\n\n[Background information, relevant theories, objective of the experiment]\n\n## Materials and Methods\n\n[List all materials used and describe the experimental procedure in detail]\n\n## Results\n\n[Present data, observations, and measurements, often in tables or graphs]\n\n## Discussion\n\n[Interpret results, explain discrepancies, relate to theory, discuss sources of error]\n\n## Conclusion\n\n[Summarize findings, state whether objective was met, suggest improvements]\n\n## References\n\n[List any external sources used]',
    },
    {
        id: 'brainstorming-session',
        name: 'Brainstorming Session',
        description: 'A free-form template to capture ideas and organize thoughts.',
        category: 'General',
        icon: Lightbulb,
        content: '# Brainstorming Session: [Topic]\n\n## Key Ideas\n\n* Idea 1\n* Idea 2\n* Idea 3\n\n## Sub-points/Details\n\n### Idea 1\n- Detail A\n- Detail B\n\n### Idea 2\n- Detail C\n- Detail D\n\n## Action Items\n\n- [ ] Task 1\n- [ ] Task 2\n\n## Notes\n\n[Any additional thoughts or observations]',
    },
];

export function TemplateSelectionModal({ isOpen, onClose, onTemplateSelect }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleConfirm = () => {
        if (selectedTemplate) {
            // Basic analytics tracking
            console.log(`[Analytics] Template selected: ${selectedTemplate.name} (ID: ${selectedTemplate.id})`);
            
            onTemplateSelect(selectedTemplate.content);
        }
    };

    const handleSelect = (template) => {
        if (!template) {
            // User chose "Start from Scratch"
            console.log('[Analytics] Template selected: Blank (Start from Scratch)');
            onTemplateSelect(null);
            return;
        }
        setSelectedTemplate(template);
    };

    const categories = [...new Set(templates.map(t => t.category))];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Document Template</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Choose a pre-made template or start from scratch.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-8">
                        {categories.map(category => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{category}</h3>
                                    <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.filter(t => t.category === category).map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleSelect(template)}
                                            className={cn(
                                                "flex flex-col items-center p-5 border rounded-2xl text-center transition-all duration-300 group relative",
                                                selectedTemplate?.id === template.id
                                                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-500/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-4 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110",
                                                selectedTemplate?.id === template.id
                                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                            )}>
                                                <template.icon className="h-6 w-6" />
                                            </div>
                                            <h4 className={cn(
                                                "font-bold mb-1.5 transition-colors",
                                                selectedTemplate?.id === template.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"
                                            )}>{template.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{template.description}</p>
                                            
                                            {selectedTemplate?.id === template.id && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            {selectedTemplate ? (
                                <>Selected: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedTemplate.name}</span></>
                            ) : (
                                "Please select a template to continue"
                            )}
                        </p>
                        <button 
                            onClick={() => {
                                console.log('User feedback: Template not found');
                                alert('Thank you for your feedback! We are constantly adding new templates.');
                            }}
                            className="text-xs text-indigo-500 hover:text-indigo-600 hover:underline transition-all text-left w-fit"
                        >
                            Can't find the template you need?
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="secondary" 
                            onClick={() => handleSelect(null)}
                            className="px-6 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Start from Scratch
                        </Button>
                        <Button 
                            onClick={handleConfirm} 
                            disabled={!selectedTemplate}
                            className="px-8 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 border-none shadow-lg shadow-indigo-500/25"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
