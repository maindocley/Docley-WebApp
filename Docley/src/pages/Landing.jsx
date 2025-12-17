import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Download, FileText, GraduationCap, Layout, ShieldCheck, Sparkles, Wand2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { cn } from '../lib/utils';

function FAQItem({ item, isOpen, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "w-full text-left rounded-xl border border-slate-200 bg-white px-5 py-4 transition-shadow",
                isOpen && "shadow-sm"
            )}
            aria-expanded={isOpen}
        >
            <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-900">{item.q}</span>
                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </div>
            {isOpen && (
                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {item.a}
                </div>
            )}
        </button>
    );
}

function BrowserFrame({ url, children }) {
    return (
        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-3">
                <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-300/80" />
                    <span className="h-3 w-3 rounded-full bg-slate-300/80" />
                    <span className="h-3 w-3 rounded-full bg-slate-300/80" />
                </div>
                <div className="mx-auto hidden h-8 w-[46%] items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 shadow-sm md:flex">
                    {url}
                </div>
            </div>
            {children}
        </div>
    );
}

function ProductUIMock() {
    return (
        <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 to-white">
            <div className="absolute inset-0 p-5 md:p-7">
                <div className="grid h-full grid-cols-12 gap-4">
                    {/* sidebar */}
                    <div className="col-span-4 hidden md:block">
                        <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">D</div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">Dashboard</div>
                                    <div className="truncate text-xs text-slate-500">Free plan</div>
                                </div>
                            </div>
                            <div className="mt-5 space-y-2">
                                {["Overview", "My Documents", "Settings"].map((i, idx) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "rounded-xl px-3 py-2 text-xs font-semibold border",
                                            idx === 1
                                                ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                                                : "border-slate-200 bg-white text-slate-700"
                                        )}
                                    >
                                        {i}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[11px] font-semibold text-slate-700">Usage</div>
                                <div className="mt-2 h-2 rounded-full bg-slate-200">
                                    <div className="h-2 w-1/3 rounded-full bg-indigo-600" />
                                </div>
                                <div className="mt-2 text-[11px] text-slate-500">1/3 upgrades used</div>
                            </div>
                        </div>
                    </div>

                    {/* editor */}
                    <div className="col-span-12 md:col-span-8">
                        <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">Economics 101: Inflation Analysis</div>
                                    <div className="text-xs text-slate-500">APA 7th • Undergraduate</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                                        Export
                                    </div>
                                    <div className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white">
                                        Run upgrade
                                    </div>
                                </div>
                            </div>

                            <div className="grid h-[calc(100%-48px)] grid-cols-12">
                                <div className="col-span-12 lg:col-span-8 p-4">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="h-2 w-40 rounded bg-slate-200" />
                                        <div className="mt-3 space-y-2">
                                            <div className="h-2 w-full rounded bg-slate-100" />
                                            <div className="h-2 w-[94%] rounded bg-slate-100" />
                                            <div className="h-2 w-[88%] rounded bg-slate-100" />
                                            <div className="h-2 w-[82%] rounded bg-slate-100" />
                                        </div>
                                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                            Highlight: informal phrase
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden lg:block lg:col-span-4 border-l border-slate-200 p-4">
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-semibold text-slate-900">Diagnostics</div>
                                            <div className="text-xs font-bold text-indigo-700">B+</div>
                                        </div>
                                        <div className="mt-3 space-y-3">
                                            {[
                                                { label: "Structure", value: 82 },
                                                { label: "Tone", value: 74 },
                                                { label: "Clarity", value: 90 },
                                            ].map((row) => (
                                                <div key={row.label}>
                                                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                                                        <span>{row.label}</span>
                                                        <span className="font-semibold text-slate-900">{row.value}</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                                                        <div className="h-1.5 rounded-full bg-indigo-600" style={{ width: `${row.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
                                        <span className="font-semibold text-slate-900">Suggestion:</span> strengthen topic sentences in paragraphs 2–3.
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

function LifestyleHeroMock() {
    return (
        <div className="relative aspect-[16/9] bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-600">
            <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="absolute inset-0 p-6 md:p-10">
                <div className="relative h-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full max-w-5xl">
                            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
                                <div className="relative aspect-[16/9]">
                                    <img
                                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000"
                                        alt="Students collaborating on an assignment"
                                        className="absolute inset-0 h-full w-full object-cover opacity-95"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                                </div>
                            </div>

                            {/* glass overlay prompt (Cluely-like) */}
                            <div className="absolute left-1/2 top-1/2 w-[min(560px,92%)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-slate-950/55 p-5 text-white shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                                        What should I improve?
                                    </span>
                                    <span className="text-xs text-white/70">Docley Assist</span>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-white/90">
                                    “Your introduction is clear, but strengthen the thesis statement and add a citation to the key statistic.”
                                </p>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-white/80">
                                    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">Improve academic tone</div>
                                    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">Add citations to claims</div>
                                </div>
                                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
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
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            {/* HERO */}
            <section className="relative overflow-hidden bg-white">
                {/* subtle, modern background (grid + soft radials) */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.14),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.14),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.10),transparent_46%)]" />
                    <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
                </div>

                <div className="container relative mx-auto px-4 md:px-6 pt-14 pb-16 md:pt-20 md:pb-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                            Diagnostic report + upgrade workflow
                        </div>

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                            Upgrade your assignments to
                            <span className="block bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                                submission-ready quality
                            </span>
                        </h1>

                        <p className="mt-5 text-base text-slate-600 md:text-xl">
                            Paste your draft, run an academic upgrade, and export a cleaner, clearer version—without losing your voice.
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link to="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 px-7 shadow-xl shadow-indigo-500/20">
                                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/dashboard" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-7 bg-white/70 backdrop-blur">
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> No credit card</span>
                            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Export-ready</span>
                            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Built for university writing</span>
                        </div>
                    </div>

                    {/* hero media (image + glass overlay) */}
                    <div className="mt-12 md:mt-16">
                        <div className="relative mx-auto max-w-6xl">
                            <div className="absolute inset-0 -z-10 rounded-[26px] bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.18),transparent_58%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.14),transparent_58%)] blur-2xl" />
                            <BrowserFrame url="docley.app/assist">
                                <LifestyleHeroMock />
                            </BrowserFrame>
                        </div>
                    </div>
                </div>
            </section>

            {/* LOGO STRIP */}
            <section className="bg-white">
                <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
                    <div className="mx-auto max-w-4xl">
                        <p className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Works with your workflow
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {[
                                "PDF export",
                                "Word (.docx)",
                                "Plain text",
                                "APA 7th",
                                "MLA 9th",
                                "Harvard",
                                "Chicago",
                            ].map((name) => (
                                <div
                                    key={name}
                                    className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES (4-up tiles like your reference) */}
            <section id="features" className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            Built for academic submissions
                        </h2>
                        <p className="mt-4 text-base text-slate-600 md:text-lg">
                            A focused toolkit to turn a rough draft into a cleaner, clearer, more academic version.
                        </p>
                    </div>

                    {/* Bento grid */}
                    <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-12">
                        {/* Big card */}
                        <div className="lg:col-span-7 lg:row-span-2">
                            <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm md:p-8">
                                <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
                                <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700">
                                            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                                            Diagnostics → Upgrade → Export
                                        </div>
                                        <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                            See what’s wrong, then fix it in one run
                                        </h3>
                                        <p className="mt-3 max-w-[60ch] text-sm text-slate-600 leading-relaxed md:text-base">
                                            Get a quick diagnostic report (tone, structure, clarity), apply improvements, and keep editing in your own words.
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-2 text-xs">
                                            {["Tone", "Structure", "Clarity", "Citations"].map((chip) => (
                                                <span key={chip} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-4 md:grid-cols-2">
                                    {/* mini diagnostic UI */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-slate-900">Diagnostic Report</div>
                                            <div className="text-xs font-bold text-indigo-700">B+</div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {[
                                                { label: "Structure", value: 82 },
                                                { label: "Academic tone", value: 74 },
                                                { label: "Clarity", value: 90 },
                                            ].map((row) => (
                                                <div key={row.label}>
                                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                                        <span>{row.label}</span>
                                                        <span className="font-semibold text-slate-900">{row.value}/100</span>
                                                    </div>
                                                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                                                            style={{ width: `${row.value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                            <span className="font-semibold text-slate-900">Next:</span> Replace informal phrases and strengthen topic sentences.
                                        </div>
                                    </div>

                                    {/* mini before/after */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-slate-900">Before → After</div>
                                            <div className="text-xs text-slate-500">Preview</div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div className="rounded-xl border border-red-100 bg-red-50/40 p-3 text-xs text-slate-700">
                                                “This shows the economy is bad and people can’t buy stuff...”
                                            </div>
                                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-xs text-slate-800">
                                                “These findings indicate inflationary pressure has reduced consumer purchasing power...”
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                                            <Check className="h-4 w-4 text-green-600" />
                                            Keeps your intent; improves academic register.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top-right supporting cards */}
                        {bentoTopRight.map((item) => (
                            <div key={item.title} className="lg:col-span-5">
                                <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                                    <div className={cn("pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30", `bg-gradient-to-br ${item.accent}`)} />

                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                        </div>
                                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md", `bg-gradient-to-br ${item.accent}`)}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
                                        {item.chips.map((chip) => (
                                            <span key={chip} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                                                {chip}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                                        {item.title === "Rewrite with academic tone" ? (
                                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                                                <div className="font-semibold text-slate-900">Example upgrade</div>
                                                <div className="mt-2 space-y-2">
                                                    <div className="rounded-lg border border-red-100 bg-red-50/40 p-2">
                                                        “I think this is a big problem for society.”
                                                    </div>
                                                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-2">
                                                        “These findings indicate significant societal implications.”
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                                                <div className="font-semibold text-slate-900">What you control</div>
                                                <ul className="mt-2 space-y-2 text-slate-600">
                                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Your topic and sources</li>
                                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Your thesis and argument</li>
                                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Final edits before export</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Bottom row */}
                        {bentoBottom.map((b) => (
                            <div key={b.title} className="lg:col-span-4">
                                <Card className="h-full overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900">{b.title}</h3>
                                                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{b.description}</p>
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm">
                                                <b.icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        {b.title === "Structure & flow" && (
                                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-[11px] font-semibold text-slate-700">Suggested outline</div>
                                                <div className="mt-3 space-y-2">
                                                    {["Thesis statement", "Argument 1 → evidence", "Argument 2 → evidence"].map((row) => (
                                                        <div key={row} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                                            <span>{row}</span>
                                                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {b.title === "Citation awareness" && (
                                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-semibold text-slate-700">Citation checks</span>
                                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">2 missing</span>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                                        “Factual claim” <span className="font-semibold text-amber-700">needs citation</span>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                                        Reference list <span className="font-semibold text-indigo-700">style: APA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {b.title === "Export-ready output" && (
                                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-[11px] font-semibold text-slate-700">Export</div>
                                                <div className="mt-3 grid gap-2">
                                                    {["PDF Document", "Word (.docx)", "Plain Text"].map((row) => (
                                                        <div key={row} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                                            {row}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STEPS */}
            <section className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Assignment upgrades in 3 steps</h2>
                        <p className="mt-4 text-base text-slate-600 md:text-lg">
                            A short, focused flow designed to get you to a better submission fast.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3">
                        {steps.map((s, idx) => (
                            <Card key={s.title} className="border-slate-200 bg-white">
                                <div className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="text-base font-semibold text-slate-900">{s.title}</div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{s.description}</p>

                                    {/* mini UI previews */}
                                    {idx === 0 && (
                                        <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                                            <div className="space-y-2">
                                                <div className="h-8 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-500">
                                                    Document title…
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="h-8 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-500">
                                                        Type: Essay
                                                    </div>
                                                    <div className="h-8 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-500">
                                                        Level: UG
                                                    </div>
                                                </div>
                                                <div className="h-8 rounded-lg border border-slate-200 bg-white px-3 flex items-center text-xs text-slate-500">
                                                    Style: APA 7th
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idx === 1 && (
                                        <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                <div className="h-2 w-24 rounded bg-slate-200" />
                                                <div className="mt-3 space-y-2">
                                                    <div className="h-2 w-full rounded bg-slate-100" />
                                                    <div className="h-2 w-[92%] rounded bg-slate-100" />
                                                    <div className="h-2 w-[80%] rounded bg-slate-100" />
                                                </div>
                                                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                                    Highlight: informal phrase
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idx === 2 && (
                                        <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs font-semibold text-slate-900">Export</div>
                                                    <div className="text-[11px] text-slate-500">Choose format</div>
                                                </div>
                                                <div className="mt-3 grid gap-2">
                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">PDF Document</div>
                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">Word (.docx)</div>
                                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">Plain Text</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTEGRITY / COMPARISON (clean table style) */}
            <section className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid items-start gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                <ShieldCheck className="h-4 w-4 text-indigo-700" />
                                Integrity-first
                            </div>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                                No generic essays.
                                <span className="block">Transform your own work.</span>
                            </h2>
                            <p className="mt-4 text-base text-slate-600 md:text-lg">
                                Improve structure, tone, and clarity while keeping your thesis, sources, and ideas intact.
                            </p>

                            <div className="mt-6 space-y-3 text-sm text-slate-700">
                                {[
                                    "You provide the content; we improve the academic register.",
                                    "Clear diagnostics explain what changed and why.",
                                    "Export when you’re ready to submit.",
                                ].map((t) => (
                                    <div key={t} className="flex items-start gap-3">
                                        <Check className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="grid grid-cols-2 border-b border-slate-200">
                                    <div className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">
                                        Generic AI writers
                                    </div>
                                    <div className="px-6 py-4 text-sm font-semibold text-indigo-900 bg-indigo-50/40">
                                        Docley
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-200">
                                    {[
                                        { label: "Preserves your meaning", left: false, right: true },
                                        { label: "Improves academic tone", left: true, right: true },
                                        { label: "Highlights missing citations", left: false, right: true },
                                        { label: "Export workflow built-in", left: false, right: true },
                                    ].map((row) => (
                                        <div key={row.label} className="grid grid-cols-2">
                                            <div className="px-6 py-4 text-sm text-slate-700 flex items-center justify-between gap-3">
                                                <span className="min-w-0">{row.label}</span>
                                                {row.left ? (
                                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <X className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="px-6 py-4 text-sm text-slate-700 flex items-center justify-between gap-3 bg-white">
                                                <span className="min-w-0">{row.label}</span>
                                                {row.right ? (
                                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <X className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-3 border-t border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="text-xs font-semibold text-slate-900">What you control</div>
                                        <div className="mt-2 space-y-2 text-xs text-slate-600">
                                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Topic, thesis, and structure</div>
                                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Sources and citations</div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
                                        <div className="text-xs font-semibold text-indigo-900">What Docley improves</div>
                                        <div className="mt-2 space-y-2 text-xs text-indigo-900/90">
                                            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-700" /> Academic tone and clarity</div>
                                            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-700" /> Actionable diagnostics</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* METRICS */}
            <section className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Clear diagnostics, not guesswork</h2>
                        <p className="mt-4 text-base text-slate-600 md:text-lg">
                            A report that’s easy to understand and easy to act on.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-5xl md:mt-14">
                        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
                                {[
                                    { label: "Diagnostic categories", value: "4", note: "Tone, structure, clarity, citations" },
                                    { label: "Citation styles", value: "4", note: "APA, MLA, Harvard, Chicago" },
                                    { label: "Export formats", value: "3", note: "PDF, Word (.docx), plain text" },
                                ].map((m) => (
                                    <div key={m.label} className="p-6">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.label}</div>
                                        <div className="mt-3 flex items-baseline gap-2">
                                            <div className="text-4xl font-bold tracking-tight text-slate-900">{m.value}</div>
                                            <div className="text-sm font-semibold text-slate-700">core</div>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-600">{m.note}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="mt-4 text-center text-xs text-slate-500">
                            Designed to be simple, fast, and clear—so students know exactly what to improve.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRODUCT PREVIEW (moved down as requested) */}
            <section className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">See the editor in action</h2>
                        <p className="mt-4 text-base text-slate-600 md:text-lg">
                            A quick look at the workspace: write, run diagnostics, apply upgrades, and export.
                        </p>
                    </div>

                    <div className="mt-10 md:mt-14">
                        <div className="relative mx-auto max-w-6xl">
                            <div className="absolute inset-0 -z-10 rounded-[26px] bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.14),transparent_58%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.10),transparent_58%)] blur-2xl" />
                            <BrowserFrame url="docley.app/dashboard/editor">
                                <ProductUIMock />
                            </BrowserFrame>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-white py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Frequently asked questions</h2>
                        <p className="mt-4 text-base text-slate-600 md:text-lg">
                            Quick answers to the most common questions.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-3xl space-y-3 md:mt-14">
                        {faq.map((item, idx) => (
                            <FAQItem
                                key={item.q}
                                item={item}
                                isOpen={openFaq === idx}
                                onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="relative overflow-hidden bg-gradient-to-b from-white to-indigo-50 py-16 md:py-24">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -bottom-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-indigo-400/25 blur-3xl" />
                    <div className="absolute -bottom-32 left-[-15%] h-[560px] w-[560px] rounded-full bg-sky-400/20 blur-3xl" />
                </div>

                <div className="container relative mx-auto px-4 md:px-6">
                    <div className="mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/70 p-8 text-center shadow-xl shadow-slate-900/10 backdrop-blur md:p-12">
                        <h3 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                            Ready to upgrade your next assignment?
                        </h3>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                            Create a document, run diagnostics, and refine your work into a cleaner, more academic submission.
                        </p>
                        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link to="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 shadow-xl shadow-indigo-500/20">
                                    Start Free <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/pricing" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 bg-white/70">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-5 text-xs text-slate-500">No credit card required. Cancel anytime.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
