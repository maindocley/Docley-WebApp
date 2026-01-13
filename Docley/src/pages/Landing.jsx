import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Download, FileText, GraduationCap, Layout, ShieldCheck, Sparkles, Wand2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

// Typing Text Component
function TypingText({ isDark }) {
    const words = ['assignments', 'research papers', 'thesis', 'case studies', 'reports', 'essays'];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[currentWordIndex];
        let timeout;

        if (!isDeleting && currentText.length < currentWord.length) {
            timeout = setTimeout(() => {
                setCurrentText(currentWord.substring(0, currentText.length + 1));
            }, 100);
        } else if (!isDeleting && currentText.length === currentWord.length) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, 2000);
        } else if (isDeleting && currentText.length > 0) {
            timeout = setTimeout(() => {
                setCurrentText(currentWord.substring(0, currentText.length - 1));
            }, 50);
        } else if (isDeleting && currentText.length === 0) {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words]);

    return (
        <span className="inline-block">
            <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                isDark
                    ? "from-orange-400 to-blue-400"
                    : "from-orange-500 to-blue-500"
            )}>
                {currentText}
            </span>
            <span className={cn(
                "animate-pulse",
                isDark ? "text-orange-400" : "text-orange-500"
            )}>
                |
            </span>
        </span>
    );
}

function FAQItem({ item, isOpen, onToggle, isDark }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "w-full text-left rounded-xl border backdrop-blur-xl px-5 py-4 transition-all duration-300",
                isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    : "border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 shadow-sm",
                isOpen && (isDark ? "shadow-lg bg-white/10" : "shadow-md bg-blue-50")
            )}
            aria-expanded={isOpen}
        >
            <div className="flex items-center justify-between gap-4">
                <span className={cn(
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900"
                )}>{item.q}</span>
                <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isDark
                        ? isOpen ? "rotate-180 text-orange-400" : "text-slate-400"
                        : isOpen ? "rotate-180 text-orange-500" : "text-slate-500"
                )} />
            </div>
            {isOpen && (
                <div className={cn(
                    "mt-3 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300",
                    isDark ? "text-slate-300" : "text-slate-600"
                )}>
                    {item.a}
                </div>
            )}
        </button>
    );
}

function BrowserFrame({ url, children, isDark }) {
    return (
        <div className={cn(
            "overflow-hidden rounded-[32px] border backdrop-blur-xl shadow-2xl",
            isDark
                ? "border-white/20 bg-white/5 shadow-black/20"
                : "border-blue-200 bg-white shadow-blue-500/10"
        )}>
            <div className={cn(
                "flex items-center gap-2 border-b backdrop-blur-sm px-5 py-3",
                isDark
                    ? "border-white/10 bg-white/5"
                    : "border-blue-100 bg-white"
            )}>
                <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/50" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <span className="h-3 w-3 rounded-full bg-green-500/50" />
                </div>
                <div className={cn(
                    "mx-auto hidden h-8 w-[46%] items-center justify-center rounded-lg border backdrop-blur-sm text-xs font-medium shadow-sm md:flex",
                    isDark
                        ? "border-white/10 bg-white/5 text-white/70"
                        : "border-blue-200 bg-white text-slate-500"
                )}>
                    {url}
                </div>
            </div>
            {children}
        </div>
    );
}

function ProductUIMock({ isDark }) {
    return (
        <div className={cn(
            "relative aspect-[16/9] transition-colors duration-300",
            isDark
                ? "bg-gradient-to-br from-slate-900 to-slate-950"
                : "bg-gradient-to-br from-slate-50 to-white"
        )}>
            <div className="absolute inset-0 p-5 md:p-7">
                <div className="grid h-full grid-cols-12 gap-4">
                    {/* sidebar */}
                    <div className="col-span-4 hidden md:block">
                        <div className={cn(
                            "h-full rounded-2xl border backdrop-blur-xl p-4 shadow-lg transition-colors duration-300",
                            isDark
                                ? "border-white/10 bg-white/5"
                                : "border-blue-200 bg-white"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 text-white font-bold shadow-lg">D</div>
                                <div className="min-w-0">
                                    <div className={cn(
                                        "truncate text-sm font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>Dashboard</div>
                                    <div className={cn(
                                        "truncate text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>Free plan</div>
                                </div>
                            </div>
                            <div className="mt-5 space-y-2">
                                {["Overview", "My Documents", "Settings"].map((i, idx) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "rounded-xl px-3 py-2 text-xs font-semibold border transition-colors",
                                            idx === 1
                                                ? isDark
                                                    ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                                                    : "border-orange-200 bg-orange-50 text-orange-700"
                                                : isDark
                                                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                                    : "border-blue-200 bg-white text-slate-700 hover:bg-blue-50"
                                        )}
                                    >
                                        {i}
                                    </div>
                                ))}
                            </div>
                            <div className={cn(
                                "mt-6 rounded-2xl border backdrop-blur-sm p-3",
                                isDark
                                    ? "border-white/10 bg-white/5"
                                    : "border-blue-200 bg-blue-50/50"
                            )}>
                                <div className={cn(
                                    "text-[11px] font-semibold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>Usage</div>
                                <div className={cn(
                                    "mt-2 h-2 rounded-full",
                                    isDark ? "bg-white/10" : "bg-blue-200"
                                )}>
                                    <div className="h-2 w-1/3 rounded-full bg-gradient-to-r from-orange-500 to-blue-500" />
                                </div>
                                <div className={cn(
                                    "mt-2 text-[11px]",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>1/3 upgrades used</div>
                            </div>
                        </div>
                    </div>

                    {/* editor */}
                    <div className="col-span-12 md:col-span-8">
                        <div className={cn(
                            "h-full overflow-hidden rounded-2xl border backdrop-blur-xl shadow-lg transition-colors duration-300",
                            isDark
                                ? "border-white/10 bg-white/5"
                                : "border-blue-200 bg-white"
                        )}>
                            <div className={cn(
                                "flex items-center justify-between border-b backdrop-blur-sm px-4 py-3",
                                isDark
                                    ? "border-white/10 bg-white/5"
                                    : "border-blue-100 bg-white"
                            )}>
                                <div className="min-w-0">
                                    <div className={cn(
                                        "truncate text-sm font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>Economics 101: Inflation Analysis</div>
                                    <div className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>APA 7th • Undergraduate</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "rounded-lg border backdrop-blur-sm px-3 py-1.5 text-[11px] font-semibold",
                                        isDark
                                            ? "border-white/10 bg-white/5 text-slate-300"
                                            : "border-blue-200 bg-white text-slate-600"
                                    )}>
                                        Export
                                    </div>
                                    <div className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-orange-500/30">
                                        Run upgrade
                                    </div>
                                </div>
                            </div>

                            <div className="grid h-[calc(100%-48px)] grid-cols-12">
                                <div className="col-span-12 lg:col-span-8 p-4">
                                    <div className={cn(
                                        "rounded-xl border backdrop-blur-sm p-4",
                                        isDark
                                            ? "border-white/10 bg-white/5"
                                            : "border-blue-200 bg-blue-50/50"
                                    )}>
                                        <div className={cn(
                                            "h-2 w-40 rounded",
                                            isDark ? "bg-white/20" : "bg-blue-200"
                                        )} />
                                        <div className="mt-3 space-y-2">
                                            <div className={cn(
                                                "h-2 w-full rounded",
                                                isDark ? "bg-white/10" : "bg-blue-100"
                                            )} />
                                            <div className={cn(
                                                "h-2 w-[94%] rounded",
                                                isDark ? "bg-white/10" : "bg-blue-100"
                                            )} />
                                            <div className={cn(
                                                "h-2 w-[88%] rounded",
                                                isDark ? "bg-white/10" : "bg-blue-100"
                                            )} />
                                            <div className={cn(
                                                "h-2 w-[82%] rounded",
                                                isDark ? "bg-white/10" : "bg-blue-100"
                                            )} />
                                        </div>
                                        <div className={cn(
                                            "mt-4 inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-3 py-1 text-[11px] font-semibold",
                                            isDark
                                                ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                                                : "border-orange-200 bg-orange-50 text-orange-700"
                                        )}>
                                            Highlight: informal phrase
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "hidden lg:block lg:col-span-4 border-l p-4",
                                    isDark ? "border-white/10" : "border-blue-100"
                                )}>
                                    <div className={cn(
                                        "rounded-xl border backdrop-blur-sm p-4",
                                        isDark
                                            ? "border-white/10 bg-white/5"
                                            : "border-blue-200 bg-white"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "text-xs font-semibold",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>Diagnostics</div>
                                            <div className="text-xs font-bold text-orange-500">B+</div>
                                        </div>
                                        <div className="mt-3 space-y-3">
                                            {[
                                                { label: "Structure", value: 82 },
                                                { label: "Tone", value: 74 },
                                                { label: "Clarity", value: 90 },
                                            ].map((row) => (
                                                <div key={row.label}>
                                                    <div className={cn(
                                                        "flex items-center justify-between text-[11px]",
                                                        isDark ? "text-slate-300" : "text-slate-600"
                                                    )}>
                                                        <span>{row.label}</span>
                                                        <span className={cn(
                                                            "font-semibold",
                                                            isDark ? "text-white" : "text-slate-900"
                                                        )}>{row.value}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "mt-1 h-1.5 rounded-full",
                                                        isDark ? "bg-white/10" : "bg-blue-100"
                                                    )}>
                                                        <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-blue-500" style={{ width: `${row.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "mt-3 rounded-xl border backdrop-blur-sm p-4 text-[11px]",
                                        isDark
                                            ? "border-white/10 bg-white/5 text-slate-300"
                                            : "border-blue-200 bg-blue-50/50 text-slate-600"
                                    )}>
                                        <span className={cn(
                                            "font-semibold",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>Suggestion:</span> strengthen topic sentences in paragraphs 2–3.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LifestyleHeroMock({ isDark }) {
    return (
        <div className={cn(
            "relative aspect-[16/9] overflow-hidden transition-colors duration-300",
            isDark
                ? "bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600"
                : "bg-gradient-to-br from-orange-400 via-blue-400 to-blue-500"
        )}>
            {/* Animated gradient overlays */}
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.3),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" />
            <div className={cn(
                "absolute inset-0 bg-gradient-to-t",
                isDark
                    ? "from-slate-900/60 via-slate-900/20 to-transparent"
                    : "from-white/40 via-white/10 to-transparent"
            )} />

            {/* Floating particles */}
            <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/20 blur-xl animate-blob"
                        style={{
                            width: `${Math.random() * 200 + 100}px`,
                            height: `${Math.random() * 200 + 100}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 p-6 md:p-10">
                <div className="relative h-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full max-w-5xl">
                            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm animate-in fade-in duration-1000">
                                <div className="relative aspect-[16/9]">
                                    <img
                                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000"
                                        alt="Students collaborating on an assignment"
                                        className="absolute inset-0 h-full w-full object-cover opacity-90"
                                    />
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-t",
                                        isDark
                                            ? "from-slate-900/50 via-slate-900/15 to-transparent"
                                            : "from-white/30 via-white/10 to-transparent"
                                    )} />
                                </div>
                            </div>

                            {/* Glass overlay prompt with enhanced styling */}
                            <div className="absolute left-1/2 top-1/2 w-[min(560px,92%)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 text-white shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-1000 delay-300">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500/30 to-blue-500/30 border border-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                        <Sparkles className="h-3 w-3 mr-1.5" />
                                        What should I improve?
                                    </span>
                                    <span className="text-xs text-white/80 font-medium">Docley AI</span>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-white/95 font-medium">
                                    "Your introduction is clear, but strengthen the thesis statement and add a citation to the key statistic."
                                </p>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs">
                                    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-white/90 hover:bg-white/15 transition-colors">
                                        Improve academic tone
                                    </div>
                                    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-white/90 hover:bg-white/15 transition-colors">
                                        Add citations to claims
                                    </div>
                                </div>
                                <div className="mt-4 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-3 text-xs text-white/70">
                                    Ask anything about your assignment…
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Landing() {
    const [openFaq, setOpenFaq] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const bentoTopRight = useMemo(() => ([
        {
            title: "Rewrite with academic tone",
            description: "Upgrade register, grammar, and precision—without losing your meaning.",
            icon: Wand2,
            accent: "from-blue-600 to-violet-600",
            chips: ["Tone", "Clarity", "Grammar"],
        },
        {
            title: "Integrity-first workflow",
            description: "Transform your draft (not a generic essay) so your ideas stay yours.",
            icon: ShieldCheck,
            accent: "from-indigo-600 to-sky-600",
            chips: ["Your voice", "Safer edits", "Transparent"],
        },
    ]), []);

    const bentoBottom = useMemo(() => ([
        {
            title: "Structure & flow",
            description: "Strengthen paragraphs, transitions, and argument order.",
            icon: Layout,
        },
        {
            title: "Citation awareness",
            description: "Spot uncited claims and keep styles consistent (APA/MLA/Harvard/Chicago).",
            icon: FileText,
        },
        {
            title: "Export-ready output",
            description: "Download as PDF, Word, or plain text when you’re finished.",
            icon: Download,
        },
    ]), []);

    const steps = useMemo(() => ([
        { title: "Create a document", description: "Add title, level, type, and citation style." },
        { title: "Paste or write", description: "Work inside the built-in editor and keep control." },
        { title: "Run upgrade + export", description: "Apply improvements and export when ready." },
    ]), []);

    const faq = useMemo(() => ([
        { q: "Is this safe for academic integrity?", a: "Docley is built to transform your existing draft—improving tone, structure, and clarity while keeping your ideas and direction intact." },
        { q: "What citation styles do you support?", a: "APA 7th Edition, MLA 9th Edition, Harvard, and Chicago." },
        { q: "Can I export to PDF or Word?", a: "Yes. Export options include PDF, Word (.docx), and plain text." },
        { q: "Do you support uploads (PDF/DOCX)?", a: "Text paste is supported today. File uploads are a planned upgrade." },
        { q: "Is there a free plan?", a: "Yes—start free and upgrade anytime. See Pricing for details." },
    ]), []);

    return (
        <div className={cn(
            "min-h-screen font-sans transition-colors duration-300",
            isDark
                ? "bg-slate-950 selection:bg-orange-500/30 selection:text-white"
                : "bg-white selection:bg-blue-200 selection:text-blue-900"
        )}>
            <Navbar />

            {/* HERO */}
            <section className={cn(
                "relative overflow-hidden min-h-screen flex items-center transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
                    : "bg-gradient-to-b from-white via-blue-50/30 to-white"
            )}>
                {/* Animated gradient background */}
                <div className="pointer-events-none absolute inset-0">
                    {/* Large gradient orbs */}
                    <div className={cn(
                        "absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl animate-blob",
                        isDark ? "bg-orange-500/20" : "bg-orange-400/10"
                    )} />
                    <div className={cn(
                        "absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-blob animation-delay-2000",
                        isDark ? "bg-blue-500/20" : "bg-blue-400/10"
                    )} />
                    <div className={cn(
                        "absolute bottom-0 left-1/2 w-[700px] h-[700px] rounded-full blur-3xl animate-blob animation-delay-4000",
                        isDark ? "bg-orange-400/15" : "bg-orange-300/8"
                    )} />

                    {/* Grid pattern overlay */}
                    <div className={cn(
                        "absolute inset-0 opacity-[0.15] [background-size:60px_60px]",
                        isDark
                            ? "[background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)]"
                            : "[background-image:linear-gradient(to_right,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.1)_1px,transparent_1px)]"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 pt-20 pb-16 md:pt-32 md:pb-24 z-10">
                    <div className={cn("mx-auto max-w-4xl text-center transition-all duration-1000", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                        <div className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700",
                            isDark
                                ? "border-white/10 bg-white/5 text-white/90"
                                : "border-blue-200 bg-white/80 text-blue-700 shadow-sm"
                        )}>
                            <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">Diagnostic report + upgrade workflow</span>
                        </div>

                        <h1 className={cn(
                            "mt-6 text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            <span className="block">Upgrade your</span>
                            <span className="block mt-2">
                                <TypingText isDark={isDark} />
                            </span>
                            <span className="block mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-blue-500 bg-clip-text text-transparent animate-gradient">
                                to submission-ready
                            </span>
                        </h1>

                        <p className={cn(
                            "mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            Paste your draft, run an academic upgrade, and export a cleaner, clearer version—without losing your voice.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                            <Link to="/signup" className="w-full sm:w-auto group">
                                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-0 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
                                    Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/dashboard" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className={cn(
                                    "w-full sm:w-auto h-14 px-8 text-base font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95",
                                    isDark
                                        ? "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                                        : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                                )}>
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>

                        <div className={cn(
                            "mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5 text-orange-500" /> No credit card</span>
                            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5 text-blue-500" /> Export-ready</span>
                            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5 text-orange-500" /> Built for university writing</span>
                        </div>
                    </div>

                    {/* hero media (image + glass overlay) */}
                    <div className={cn("mt-16 md:mt-20 transition-all duration-1000 delay-500", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                        <div className="relative mx-auto max-w-6xl">
                            <div className={cn(
                                "absolute inset-0 -z-10 rounded-[32px] blur-3xl opacity-50 animate-pulse",
                                isDark
                                    ? "bg-gradient-to-r from-orange-500/30 via-blue-500/30 to-orange-500/30"
                                    : "bg-gradient-to-r from-orange-400/20 via-blue-400/20 to-orange-400/20"
                            )} />
                            <BrowserFrame url="docley.app/assist" isDark={isDark}>
                                <LifestyleHeroMock isDark={isDark} />
                            </BrowserFrame>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS / SOCIAL PROOF */}
            <section className={cn(
                "relative py-16 md:py-24 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-slate-950"
                    : "bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.02)] border-y border-slate-100"
            )}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-[100%] blur-[120px] opacity-20",
                        isDark ? "bg-orange-500/30" : "bg-blue-400/20"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            { value: "15,000+", label: "Assignments Upgraded", sub: "Built on real data", icon: Sparkles },
                            { value: "98.5%", label: "Student Success Rate", sub: "Based on user feedback", icon: GraduationCap },
                            { value: "250K+", label: "Lines Refined", sub: "High precision AI", icon: Wand2 },
                        ].map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={cn(
                                    "relative group p-8 rounded-[32px] border transition-all duration-500 hover:-translate-y-2",
                                    isDark
                                        ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                        : "border-blue-100 bg-white hover:bg-white hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
                                )}
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <stat.icon className="h-12 w-12" />
                                </div>
                                <div className={cn(
                                    "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br bg-clip-text text-transparent mb-2",
                                    isDark ? "from-orange-400 to-blue-400" : "from-orange-600 to-blue-600"
                                )}>
                                    {stat.value}
                                </div>
                                <div className={cn(
                                    "text-lg font-semibold mb-1",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    {stat.label}
                                </div>
                                <div className={cn(
                                    "text-sm",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    {stat.sub}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LOGO STRIP */}
            <section className={cn(
                "relative py-12 md:py-16 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-950 to-slate-900"
                    : "bg-gradient-to-b from-white to-blue-50/30"
            )}>
                <div className={cn(
                    "absolute inset-0",
                    isDark
                        ? "bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]"
                        : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"
                )} />
                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-4xl">
                        <p className={cn(
                            "text-center text-xs font-semibold tracking-wide uppercase mb-8",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            Works with your workflow
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {[
                                "PDF export",
                                "Word (.docx)",
                                "Plain text",
                                "APA 7th",
                                "MLA 9th",
                                "Harvard",
                                "Chicago",
                            ].map((name, idx) => (
                                <div
                                    key={name}
                                    className={cn(
                                        "flex items-center justify-center rounded-full border backdrop-blur-sm px-5 py-2.5 text-xs font-semibold shadow-lg transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4",
                                        isDark
                                            ? "border-white/10 bg-white/5 text-white/90 hover:bg-white/10 hover:border-white/20"
                                            : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-blue-500/10"
                                    )}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES (4-up tiles like your reference) */}
            <section id="features" className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900"
                    : "bg-slate-50"
            )}>
                {/* Background effects */}
                <div className="absolute inset-0">
                    <div className={cn(
                        "absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl",
                        isDark ? "bg-blue-500/10" : "bg-blue-400/5"
                    )} />
                    <div className={cn(
                        "absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl",
                        isDark ? "bg-orange-500/10" : "bg-orange-400/5"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className={cn(
                            "text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Built for academic submissions
                        </h2>
                        <p className={cn(
                            "mt-6 text-lg md:text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            A focused toolkit to turn a rough draft into a cleaner, clearer, more academic version.
                        </p>
                    </div>

                    {/* Bento grid */}
                    <div className="grid gap-6 md:gap-8 lg:grid-cols-12">
                        {/* Big card */}
                        <div className="lg:col-span-7 lg:row-span-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            <div className={cn(
                                "relative h-full overflow-hidden rounded-3xl border backdrop-blur-xl p-6 shadow-2xl md:p-8 transition-all duration-500 hover:scale-[1.02] group",
                                isDark
                                    ? "border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:border-white/20 hover:shadow-orange-500/10"
                                    : "border-blue-200 bg-white hover:border-blue-300 shadow-blue-500/10 hover:shadow-blue-500/20"
                            )}>
                                <div className={cn(
                                    "pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl animate-pulse",
                                    isDark ? "bg-orange-500/20" : "bg-orange-400/10"
                                )} />
                                <div className={cn(
                                    "pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full blur-3xl animate-pulse animation-delay-2000",
                                    isDark ? "bg-blue-500/20" : "bg-blue-400/10"
                                )} />

                                <div className="flex items-start justify-between gap-6 relative z-10">
                                    <div>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-3 py-1.5 text-[11px] font-semibold",
                                            isDark
                                                ? "border-white/20 bg-white/10 text-white/90"
                                                : "border-blue-200 bg-blue-50 text-blue-700"
                                        )}>
                                            <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            Diagnostics → Upgrade → Export
                                        </div>
                                        <h3 className={cn(
                                            "mt-5 text-2xl font-bold tracking-tight md:text-3xl",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>
                                            See what's wrong, then fix it in one run
                                        </h3>
                                        <p className={cn(
                                            "mt-3 max-w-[60ch] text-sm leading-relaxed md:text-base",
                                            isDark ? "text-slate-300" : "text-slate-600"
                                        )}>
                                            Get a quick diagnostic report (tone, structure, clarity), apply improvements, and keep editing in your own words.
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-2 text-xs">
                                            {["Tone", "Structure", "Clarity", "Citations"].map((chip) => (
                                                <span key={chip} className={cn(
                                                    "rounded-full border backdrop-blur-sm px-3 py-1.5 transition-colors",
                                                    isDark
                                                        ? "border-white/20 bg-white/10 text-white/90 hover:bg-white/15"
                                                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                )}>
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 text-white shadow-lg shadow-orange-500/30 animate-pulse">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-4 md:grid-cols-2 relative z-10">
                                    {/* mini diagnostic UI */}
                                    <div className={cn(
                                        "rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300",
                                        isDark
                                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                                            : "border-blue-200 bg-blue-50/50 hover:bg-blue-100/50"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "text-sm font-semibold",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>Diagnostic Report</div>
                                            <div className="text-xs font-bold text-orange-500">B+</div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {[
                                                { label: "Structure", value: 82 },
                                                { label: "Academic tone", value: 74 },
                                                { label: "Clarity", value: 90 },
                                            ].map((row) => (
                                                <div key={row.label}>
                                                    <div className={cn(
                                                        "flex items-center justify-between text-xs",
                                                        isDark ? "text-slate-300" : "text-slate-600"
                                                    )}>
                                                        <span>{row.label}</span>
                                                        <span className={cn(
                                                            "font-semibold",
                                                            isDark ? "text-white" : "text-slate-900"
                                                        )}>{row.value}/100</span>
                                                    </div>
                                                    <div className={cn(
                                                        "mt-1 h-2 w-full rounded-full",
                                                        isDark ? "bg-white/10" : "bg-blue-200"
                                                    )}>
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
                                                            style={{ width: `${row.value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className={cn(
                                            "mt-4 rounded-xl backdrop-blur-sm p-3 text-xs border",
                                            isDark
                                                ? "bg-white/5 text-slate-300 border-white/10"
                                                : "bg-white text-slate-600 border-blue-200"
                                        )}>
                                            <span className={cn(
                                                "font-semibold",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>Next:</span> Replace informal phrases and strengthen topic sentences.
                                        </div>
                                    </div>

                                    {/* mini before/after */}
                                    <div className={cn(
                                        "rounded-2xl border backdrop-blur-xl p-5 transition-all duration-300",
                                        isDark
                                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                                            : "border-blue-200 bg-blue-50/50 hover:bg-blue-100/50"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "text-sm font-semibold",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>Before → After</div>
                                            <div className={cn(
                                                "text-xs",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>Preview</div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div className={cn(
                                                "rounded-xl border backdrop-blur-sm p-3 text-xs",
                                                isDark
                                                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                                                    : "border-red-200 bg-red-50 text-red-700"
                                            )}>
                                                "This shows the economy is bad and people can't buy stuff..."
                                            </div>
                                            <div className={cn(
                                                "rounded-xl border backdrop-blur-sm p-3 text-xs",
                                                isDark
                                                    ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                            )}>
                                                "These findings indicate inflationary pressure has reduced consumer purchasing power..."
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "mt-4 flex items-center gap-2 text-xs",
                                            isDark ? "text-slate-300" : "text-slate-600"
                                        )}>
                                            <Check className="h-4 w-4 text-green-500" />
                                            Keeps your intent; improves academic register.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top-right supporting cards */}
                        {bentoTopRight.map((item, idx) => (
                            <div key={item.title} className={`lg:col-span-5 animate-in fade-in slide-in-from-bottom-8 duration-1000`} style={{ animationDelay: `${300 + idx * 100}ms` }}>
                                <div className={cn(
                                    "relative h-full overflow-hidden rounded-3xl border backdrop-blur-xl p-6 shadow-2xl md:p-7 transition-all duration-500",
                                    isDark
                                        ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                        : "border-blue-200 bg-white hover:border-blue-300 hover:shadow-blue-500/20 shadow-blue-500/10"
                                )}>
                                    <div className={cn(
                                        "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30 animate-pulse",
                                        `bg-gradient-to-br ${item.accent === "from-blue-600 to-violet-600" ? "from-orange-500 to-blue-500" : "from-blue-500 to-orange-500"}`,
                                        !isDark && "opacity-20"
                                    )} />

                                    <div className="flex items-start justify-between gap-4 relative z-10">
                                        <div>
                                            <h3 className={cn(
                                                "text-lg font-semibold",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>{item.title}</h3>
                                            <p className={cn(
                                                "mt-2 text-sm leading-relaxed",
                                                isDark ? "text-slate-300" : "text-slate-600"
                                            )}>{item.description}</p>
                                        </div>
                                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg", item.accent === "from-blue-600 to-violet-600" ? "bg-gradient-to-br from-orange-500 to-blue-500" : "bg-gradient-to-br from-blue-500 to-orange-500")}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2 text-xs">
                                        {item.chips.map((chip) => (
                                            <span key={chip} className={cn(
                                                "rounded-full border backdrop-blur-sm px-3 py-1.5 transition-colors",
                                                isDark
                                                    ? "border-white/20 bg-white/10 text-white/90 hover:bg-white/15"
                                                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            )}>
                                                {chip}
                                            </span>
                                        ))}
                                    </div>

                                    <div className={cn(
                                        "mt-6 rounded-2xl border backdrop-blur-sm p-4",
                                        isDark
                                            ? "border-white/10 bg-white/5"
                                            : "border-blue-200 bg-blue-50/50"
                                    )}>
                                        {item.title === "Rewrite with academic tone" ? (
                                            <div className={cn(
                                                "rounded-xl border backdrop-blur-sm p-3 text-xs",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-white"
                                            )}>
                                                <div className={cn(
                                                    "font-semibold",
                                                    isDark ? "text-white" : "text-slate-900"
                                                )}>Example upgrade</div>
                                                <div className="mt-2 space-y-2">
                                                    <div className={cn(
                                                        "rounded-lg border backdrop-blur-sm p-2",
                                                        isDark
                                                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                                                            : "border-red-200 bg-red-50 text-red-700"
                                                    )}>
                                                        "I think this is a big problem for society."
                                                    </div>
                                                    <div className={cn(
                                                        "rounded-lg border backdrop-blur-sm p-2",
                                                        isDark
                                                            ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                                                            : "border-blue-200 bg-blue-50 text-blue-700"
                                                    )}>
                                                        "These findings indicate significant societal implications."
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "rounded-xl border backdrop-blur-sm p-3 text-xs",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-white"
                                            )}>
                                                <div className={cn(
                                                    "font-semibold",
                                                    isDark ? "text-white" : "text-slate-900"
                                                )}>What you control</div>
                                                <ul className={cn(
                                                    "mt-2 space-y-2",
                                                    isDark ? "text-slate-300" : "text-slate-600"
                                                )}>
                                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Your topic and sources</li>
                                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Your thesis and argument</li>
                                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Final edits before export</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Bottom row */}
                        {bentoBottom.map((b, idx) => (
                            <div key={b.title} className={`lg:col-span-4 animate-in fade-in slide-in-from-bottom-8 duration-1000`} style={{ animationDelay: `${500 + idx * 100}ms` }}>
                                <div className={cn(
                                    "h-full overflow-hidden rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500",
                                    isDark
                                        ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                        : "border-blue-200 bg-white hover:border-blue-300 hover:shadow-blue-500/20 shadow-blue-500/10"
                                )}>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={cn(
                                                    "text-base font-semibold",
                                                    isDark ? "text-white" : "text-slate-900"
                                                )}>{b.title}</h3>
                                                <p className={cn(
                                                    "mt-2 text-sm leading-relaxed",
                                                    isDark ? "text-slate-300" : "text-slate-600"
                                                )}>{b.description}</p>
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 text-white shadow-lg">
                                                <b.icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        {b.title === "Structure & flow" && (
                                            <div className={cn(
                                                "mt-5 rounded-2xl border backdrop-blur-sm p-4",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-blue-50/50"
                                            )}>
                                                <div className={cn(
                                                    "text-[11px] font-semibold",
                                                    isDark ? "text-white" : "text-slate-900"
                                                )}>Suggested outline</div>
                                                <div className="mt-3 space-y-2">
                                                    {["Thesis statement", "Argument 1 → evidence", "Argument 2 → evidence"].map((row) => (
                                                        <div key={row} className={cn(
                                                            "flex items-center justify-between rounded-xl border backdrop-blur-sm px-3 py-2 text-xs transition-colors",
                                                            isDark
                                                                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                                                : "border-blue-200 bg-white text-slate-700 hover:bg-blue-50"
                                                        )}>
                                                            <span>{row}</span>
                                                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {b.title === "Citation awareness" && (
                                            <div className={cn(
                                                "mt-5 rounded-2xl border backdrop-blur-sm p-4",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-blue-50/50"
                                            )}>
                                                <div className="flex items-center justify-between">
                                                    <span className={cn(
                                                        "text-[11px] font-semibold",
                                                        isDark ? "text-white" : "text-slate-900"
                                                    )}>Citation checks</span>
                                                    <span className={cn(
                                                        "rounded-full border backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold",
                                                        isDark
                                                            ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                                                            : "border-orange-200 bg-orange-50 text-orange-700"
                                                    )}>2 missing</span>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    <div className={cn(
                                                        "rounded-xl border backdrop-blur-sm px-3 py-2 text-xs",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-slate-300"
                                                            : "border-blue-200 bg-white text-slate-600"
                                                    )}>
                                                        "Factual claim" <span className="font-semibold text-orange-600">needs citation</span>
                                                    </div>
                                                    <div className={cn(
                                                        "rounded-xl border backdrop-blur-sm px-3 py-2 text-xs",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-slate-300"
                                                            : "border-blue-200 bg-white text-slate-600"
                                                    )}>
                                                        Reference list <span className="font-semibold text-blue-600">style: APA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {b.title === "Export-ready output" && (
                                            <div className={cn(
                                                "mt-5 rounded-2xl border backdrop-blur-sm p-4",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-blue-50/50"
                                            )}>
                                                <div className={cn(
                                                    "text-[11px] font-semibold",
                                                    isDark ? "text-white" : "text-slate-900"
                                                )}>Export</div>
                                                <div className="mt-3 grid gap-2">
                                                    {["PDF Document", "Word (.docx)", "Plain Text"].map((row) => (
                                                        <div key={row} className={cn(
                                                            "rounded-xl border backdrop-blur-sm px-3 py-2 text-xs transition-colors",
                                                            isDark
                                                                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                                                : "border-blue-200 bg-white text-slate-700 hover:bg-blue-50"
                                                        )}>
                                                            {row}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STEPS */}
            <section className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-900 to-slate-950"
                    : "bg-gradient-to-b from-white via-blue-50/30 to-white"
            )}>
                <div className="absolute inset-0">
                    <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl",
                        isDark ? "bg-orange-500/5" : "bg-orange-400/3"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className={cn(
                            "text-4xl font-bold tracking-tight md:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Assignment upgrades in 3 steps</h2>
                        <p className={cn(
                            "mt-6 text-lg md:text-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            A short, focused flow designed to get you to a better submission fast.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3">
                        {steps.map((s, idx) => (
                            <div key={s.title} className={cn(
                                "rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-8",
                                isDark
                                    ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                    : "border-blue-200 bg-white hover:border-blue-300 hover:shadow-blue-500/20 shadow-blue-500/10"
                            )} style={{ animationDelay: `${200 + idx * 100}ms` }}>
                                <div className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 text-white border border-white/20 font-bold shadow-lg">
                                            {idx + 1}
                                        </div>
                                        <div className={cn(
                                            "text-base font-semibold",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>{s.title}</div>
                                    </div>
                                    <p className={cn(
                                        "mt-3 text-sm leading-relaxed",
                                        isDark ? "text-slate-300" : "text-slate-600"
                                    )}>{s.description}</p>

                                    {/* mini UI previews */}
                                    {idx === 0 && (
                                        <div className={cn(
                                            "mt-5 rounded-2xl border backdrop-blur-sm p-4",
                                            isDark
                                                ? "border-white/10 bg-white/5"
                                                : "border-blue-200 bg-blue-50/50"
                                        )}>
                                            <div className="space-y-2">
                                                <div className={cn(
                                                    "h-8 rounded-lg border backdrop-blur-sm px-3 flex items-center text-xs",
                                                    isDark
                                                        ? "border-white/10 bg-white/5 text-slate-400"
                                                        : "border-blue-200 bg-white text-slate-500"
                                                )}>
                                                    Document title…
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className={cn(
                                                        "h-8 rounded-lg border backdrop-blur-sm px-3 flex items-center text-xs",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-slate-400"
                                                            : "border-blue-200 bg-white text-slate-500"
                                                    )}>
                                                        Type: Essay
                                                    </div>
                                                    <div className={cn(
                                                        "h-8 rounded-lg border backdrop-blur-sm px-3 flex items-center text-xs",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-slate-400"
                                                            : "border-blue-200 bg-white text-slate-500"
                                                    )}>
                                                        Level: UG
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "h-8 rounded-lg border backdrop-blur-sm px-3 flex items-center text-xs",
                                                    isDark
                                                        ? "border-white/10 bg-white/5 text-slate-400"
                                                        : "border-blue-200 bg-white text-slate-500"
                                                )}>
                                                    Style: APA 7th
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idx === 1 && (
                                        <div className={cn(
                                            "mt-5 rounded-2xl border backdrop-blur-sm p-4",
                                            isDark
                                                ? "border-white/10 bg-white/5"
                                                : "border-blue-200 bg-blue-50/50"
                                        )}>
                                            <div className={cn(
                                                "rounded-xl border backdrop-blur-sm p-3",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-white"
                                            )}>
                                                <div className={cn(
                                                    "h-2 w-24 rounded",
                                                    isDark ? "bg-white/20" : "bg-blue-200"
                                                )} />
                                                <div className="mt-3 space-y-2">
                                                    <div className={cn(
                                                        "h-2 w-full rounded",
                                                        isDark ? "bg-white/10" : "bg-blue-100"
                                                    )} />
                                                    <div className={cn(
                                                        "h-2 w-[92%] rounded",
                                                        isDark ? "bg-white/10" : "bg-blue-100"
                                                    )} />
                                                    <div className={cn(
                                                        "h-2 w-[80%] rounded",
                                                        isDark ? "bg-white/10" : "bg-blue-100"
                                                    )} />
                                                </div>
                                                <div className={cn(
                                                    "mt-3 inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-3 py-1 text-[11px] font-semibold",
                                                    isDark
                                                        ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                                                        : "border-orange-200 bg-orange-50 text-orange-700"
                                                )}>
                                                    Highlight: informal phrase
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idx === 2 && (
                                        <div className={cn(
                                            "mt-5 rounded-2xl border backdrop-blur-sm p-4",
                                            isDark
                                                ? "border-white/10 bg-white/5"
                                                : "border-blue-200 bg-blue-50/50"
                                        )}>
                                            <div className={cn(
                                                "rounded-xl border backdrop-blur-sm p-3",
                                                isDark
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-blue-200 bg-white"
                                            )}>
                                                <div className="flex items-center justify-between">
                                                    <div className={cn(
                                                        "text-xs font-semibold",
                                                        isDark ? "text-white" : "text-slate-900"
                                                    )}>Export</div>
                                                    <div className={cn(
                                                        "text-[11px]",
                                                        isDark ? "text-slate-400" : "text-slate-500"
                                                    )}>Choose format</div>
                                                </div>
                                                <div className="mt-3 grid gap-2">
                                                    {["PDF Document", "Word (.docx)", "Plain Text"].map((row) => (
                                                        <div key={row} className={cn(
                                                            "rounded-lg border backdrop-blur-sm px-3 py-2 text-xs transition-colors",
                                                            isDark
                                                                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                                                : "border-blue-200 bg-white text-slate-700 hover:bg-blue-50"
                                                        )}>{row}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTEGRITY / COMPARISON (clean table style) */}
            <section className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-950 to-slate-900"
                    : "bg-gradient-to-b from-white via-blue-50/20 to-white"
            )}>
                <div className="absolute inset-0">
                    <div className={cn(
                        "absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl",
                        isDark ? "bg-blue-500/5" : "bg-blue-400/3"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="grid items-start gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className={cn(
                                "inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-3 py-1.5 text-xs font-semibold",
                                isDark
                                    ? "border-white/10 bg-white/5 text-white/90"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                            )}>
                                <ShieldCheck className="h-4 w-4 text-orange-500" />
                                Integrity-first
                            </div>
                            <h2 className={cn(
                                "mt-5 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                No generic essays.
                                <span className="block mt-2">Transform your own work.</span>
                            </h2>
                            <p className={cn(
                                "mt-5 text-base md:text-lg",
                                isDark ? "text-slate-300" : "text-slate-600"
                            )}>
                                Improve structure, tone, and clarity while keeping your thesis, sources, and ideas intact.
                            </p>

                            <div className={cn(
                                "mt-6 space-y-3 text-sm",
                                isDark ? "text-slate-300" : "text-slate-600"
                            )}>
                                {[
                                    "You provide the content; we improve the academic register.",
                                    "Clear diagnostics explain what changed and why.",
                                    "Export when you're ready to submit.",
                                ].map((t, idx) => (
                                    <div key={t} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <Check className="mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                            <div className={cn(
                                "overflow-hidden rounded-3xl border backdrop-blur-xl shadow-2xl",
                                isDark
                                    ? "border-white/10 bg-white/5"
                                    : "border-blue-200 bg-white shadow-blue-500/10"
                            )}>
                                <div className={cn(
                                    "grid grid-cols-2 border-b",
                                    isDark ? "border-white/10" : "border-blue-100"
                                )}>
                                    <div className={cn(
                                        "px-6 py-4 text-sm font-semibold",
                                        isDark
                                            ? "text-white/70 bg-white/5"
                                            : "text-slate-600 bg-blue-50/50"
                                    )}>
                                        Generic AI writers
                                    </div>
                                    <div className={cn(
                                        "px-6 py-4 text-sm font-semibold bg-gradient-to-r",
                                        isDark
                                            ? "text-white from-orange-500/20 to-blue-500/20"
                                            : "text-blue-700 from-orange-50 to-blue-50"
                                    )}>
                                        Docley
                                    </div>
                                </div>

                                <div className={cn(
                                    "divide-y",
                                    isDark ? "divide-white/10" : "divide-blue-100"
                                )}>
                                    {[
                                        { label: "Preserves your meaning", left: false, right: true },
                                        { label: "Improves academic tone", left: true, right: true },
                                        { label: "Highlights missing citations", left: false, right: true },
                                        { label: "Export workflow built-in", left: false, right: true },
                                    ].map((row) => (
                                        <div key={row.label} className="grid grid-cols-2">
                                            <div className={cn(
                                                "px-6 py-4 text-sm flex items-center justify-between gap-3",
                                                isDark ? "text-slate-300" : "text-slate-600"
                                            )}>
                                                <span className="min-w-0">{row.label}</span>
                                                {row.left ? (
                                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <X className={cn(
                                                        "h-4 w-4 flex-shrink-0",
                                                        isDark ? "text-slate-500" : "text-slate-400"
                                                    )} />
                                                )}
                                            </div>
                                            <div className={cn(
                                                "px-6 py-4 text-sm flex items-center justify-between gap-3",
                                                isDark
                                                    ? "text-slate-300 bg-white/5"
                                                    : "text-slate-600 bg-white"
                                            )}>
                                                <span className="min-w-0">{row.label}</span>
                                                {row.right ? (
                                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <X className={cn(
                                                        "h-4 w-4 flex-shrink-0",
                                                        isDark ? "text-slate-500" : "text-slate-400"
                                                    )} />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={cn(
                                    "grid grid-cols-1 gap-3 border-t p-5 md:grid-cols-2",
                                    isDark
                                        ? "border-white/10 bg-white/5"
                                        : "border-blue-100 bg-blue-50/30"
                                )}>
                                    <div className={cn(
                                        "rounded-2xl border backdrop-blur-sm p-4",
                                        isDark
                                            ? "border-white/10 bg-white/5"
                                            : "border-blue-200 bg-white"
                                    )}>
                                        <div className={cn(
                                            "text-xs font-semibold",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>What you control</div>
                                        <div className={cn(
                                            "mt-2 space-y-2 text-xs",
                                            isDark ? "text-slate-300" : "text-slate-600"
                                        )}>
                                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Topic, thesis, and structure</div>
                                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Sources and citations</div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "rounded-2xl border backdrop-blur-sm p-4",
                                        isDark
                                            ? "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-blue-500/10"
                                            : "border-orange-200 bg-gradient-to-br from-orange-50 to-blue-50"
                                    )}>
                                        <div className={cn(
                                            "text-xs font-semibold",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>What Docley improves</div>
                                        <div className={cn(
                                            "mt-2 space-y-2 text-xs",
                                            isDark ? "text-slate-300" : "text-slate-600"
                                        )}>
                                            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange-500" /> Academic tone and clarity</div>
                                            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" /> Actionable diagnostics</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* METRICS */}
            <section className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-900 to-slate-950"
                    : "bg-gradient-to-b from-white via-blue-50/20 to-white"
            )}>
                <div className="absolute inset-0">
                    <div className={cn(
                        "absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl",
                        isDark ? "bg-orange-500/5" : "bg-orange-400/3"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className={cn(
                            "text-4xl font-bold tracking-tight md:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Clear diagnostics, not guesswork</h2>
                        <p className={cn(
                            "mt-6 text-lg md:text-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            A report that's easy to understand and easy to act on.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-5xl md:mt-14">
                        <div className={cn(
                            "rounded-3xl border backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-200",
                            isDark
                                ? "border-white/10 bg-white/5"
                                : "border-blue-200 bg-white shadow-blue-500/10"
                        )}>
                            <div className={cn(
                                "grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0",
                                isDark ? "divide-white/10" : "divide-blue-100"
                            )}>
                                {[
                                    { label: "Diagnostic categories", value: "4", note: "Tone, structure, clarity, citations" },
                                    { label: "Citation styles", value: "4", note: "APA, MLA, Harvard, Chicago" },
                                    { label: "Export formats", value: "3", note: "PDF, Word (.docx), plain text" },
                                ].map((m, idx) => (
                                    <div key={m.label} className={`p-8 animate-in fade-in slide-in-from-bottom-4 duration-700`} style={{ animationDelay: `${300 + idx * 100}ms` }}>
                                        <div className={cn(
                                            "text-xs font-semibold uppercase tracking-wide",
                                            isDark ? "text-slate-400" : "text-slate-500"
                                        )}>{m.label}</div>
                                        <div className="mt-4 flex items-baseline gap-2">
                                            <div className="text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">{m.value}</div>
                                            <div className={cn(
                                                "text-sm font-semibold",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>core</div>
                                        </div>
                                        <div className={cn(
                                            "mt-3 text-sm",
                                            isDark ? "text-slate-300" : "text-slate-600"
                                        )}>{m.note}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className={cn(
                            "mt-6 text-center text-sm animate-in fade-in duration-700 delay-600",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            Designed to be simple, fast, and clear—so students know exactly what to improve.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRODUCT PREVIEW (moved down as requested) */}
            <section className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-950 to-slate-900"
                    : "bg-gradient-to-b from-white via-blue-50/20 to-white"
            )}>
                <div className="absolute inset-0">
                    <div className={cn(
                        "absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl",
                        isDark ? "bg-blue-500/10" : "bg-blue-400/5"
                    )} />
                    <div className={cn(
                        "absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl",
                        isDark ? "bg-orange-500/10" : "bg-orange-400/5"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className={cn(
                            "text-4xl font-bold tracking-tight md:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700",
                            isDark ? "text-white" : "text-slate-900"
                        )}>See the editor in action</h2>
                        <p className={cn(
                            "mt-6 text-lg md:text-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            A quick look at the workspace: write, run diagnostics, apply upgrades, and export.
                        </p>
                    </div>

                    <div className="mt-10 md:mt-14 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <div className="relative mx-auto max-w-6xl">
                            <div className={cn(
                                "absolute inset-0 -z-10 rounded-[32px] blur-3xl opacity-50 animate-pulse",
                                isDark
                                    ? "bg-gradient-to-r from-orange-500/30 via-blue-500/30 to-orange-500/30"
                                    : "bg-gradient-to-r from-orange-400/20 via-blue-400/20 to-orange-400/20"
                            )} />
                            <BrowserFrame url="docley.app/dashboard/editor" isDark={isDark}>
                                <ProductUIMock isDark={isDark} />
                            </BrowserFrame>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-slate-950"
                    : "bg-blue-50/20"
            )}>
                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className={cn(
                            "text-4xl font-bold tracking-tight md:text-5xl",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Loved by students everywhere</h2>
                        <p className={cn(
                            "mt-6 text-lg md:text-xl",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            Join thousands of students who have transformed their academic writing with Docley.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah J.",
                                role: "Undergraduate Student",
                                text: "Docley completely changed how I approach my essays. The tone upgrade is incredible—my professors actually noticed the difference!",
                                university: "Stanford University"
                            },
                            {
                                name: "Michael R.",
                                role: "Master's Candidate",
                                text: "The citation awareness feature is a lifesaver. No more worrying about missing APA references. It's like having a writing tutor 24/7.",
                                university: "University of Toronto"
                            },
                            {
                                name: "Elena Q.",
                                role: "PhD Researcher",
                                text: "I use Docley to refine my research summaries. It keeps my voice while polishing the technical language. Truly an essential tool.",
                                university: "Oxford University"
                            }
                        ].map((t, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-8 rounded-[32px] border backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1",
                                    isDark
                                        ? "border-white/10 bg-white/5 shadow-2xl shadow-black/20"
                                        : "border-blue-100 bg-white shadow-xl shadow-blue-500/5"
                                )}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Sparkles key={i} className="h-4 w-4 text-orange-500 fill-orange-500" />
                                    ))}
                                </div>
                                <p className={cn(
                                    "text-base leading-relaxed mb-6 italic",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    "{t.text}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className={cn(
                                            "font-bold text-sm",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>{t.name}</div>
                                        <div className={cn(
                                            "text-xs",
                                            isDark ? "text-slate-400" : "text-slate-500"
                                        )}>{t.university}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className={cn(
                "relative py-20 md:py-32 overflow-hidden transition-colors duration-300",
                isDark
                    ? "bg-gradient-to-b from-slate-900 to-slate-950"
                    : "bg-gradient-to-b from-white via-blue-50/20 to-white"
            )}>
                <div className="absolute inset-0">
                    <div className={cn(
                        "absolute top-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl",
                        isDark ? "bg-orange-500/5" : "bg-orange-400/3"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className={cn(
                            "text-4xl font-bold tracking-tight md:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700",
                            isDark ? "text-white" : "text-slate-900"
                        )}>Frequently asked questions</h2>
                        <p className={cn(
                            "mt-6 text-lg md:text-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            Quick answers to the most common questions.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-3xl space-y-3 md:mt-14">
                        {faq.map((item, idx) => (
                            <div key={item.q} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${200 + idx * 50}ms` }}>
                                <FAQItem
                                    item={item}
                                    isOpen={openFaq === idx}
                                    onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                    isDark={isDark}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className={cn(
                "relative overflow-hidden py-24 md:py-40 transition-colors duration-300",
                isDark
                    ? "bg-slate-950"
                    : "bg-white"
            )}>
                <div className="pointer-events-none absolute inset-0">
                    <div className={cn(
                        "absolute top-0 right-[-10%] h-[600px] w-[600px] rounded-full blur-3xl opacity-20 animate-blob",
                        isDark ? "bg-orange-500/30" : "bg-orange-400/20"
                    )} />
                    <div className={cn(
                        "absolute bottom-0 left-[-15%] h-[700px] w-[700px] rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000",
                        isDark ? "bg-blue-500/30" : "bg-blue-400/20"
                    )} />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 z-10">
                    <div className={cn(
                        "mx-auto max-w-5xl rounded-[48px] border backdrop-blur-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:p-20 overflow-hidden relative group",
                        isDark
                            ? "border-white/10 bg-white/5 shadow-black/40"
                            : "border-blue-100 bg-gradient-to-br from-white to-blue-50/50 shadow-blue-500/10"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative z-10">
                            <h3 className={cn(
                                "text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl mb-8 leading-[1.1]",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Ready to upgrade your <br className="hidden md:block" />
                                <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">next assignment?</span>
                            </h3>
                            <p className={cn(
                                "mx-auto max-w-2xl text-lg md:text-2xl mb-12 opacity-80",
                                isDark ? "text-slate-300" : "text-slate-600"
                            )}>
                                Join students from top universities using Docley to refine their work into publication-ready quality.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] border-0 transition-all duration-300 hover:scale-105 active:scale-95">
                                        Get Started For Free <ArrowRight className="ml-2 h-6 w-6" />
                                    </Button>
                                </Link>
                                <Link to="/pricing" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className={cn(
                                        "w-full sm:w-auto h-16 px-10 text-lg font-bold backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95",
                                        isDark
                                            ? "bg-white/5 border-white/20 text-white hover:bg-white/10"
                                            : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                                    )}>
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                            <div className={cn(
                                "mt-10 flex items-center justify-center gap-8 text-sm font-medium opacity-60",
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> No credit card</span>
                                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
