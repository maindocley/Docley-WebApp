import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function Pricing() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={cn(
            "min-h-screen font-sans transition-colors duration-300",
            isDark ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" : "bg-slate-50"
        )}>
            <Navbar />

            <div className="py-24 px-4 md:px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className={cn(
                            "text-4xl font-semibold bg-clip-text text-transparent mb-4",
                            isDark
                                ? "bg-gradient-to-r from-orange-400 to-blue-400"
                                : "bg-gradient-to-r from-blue-600 to-violet-600"
                        )}>
                            Invest in your Grades
                        </h1>
                        <p className={cn(
                            "text-xl max-w-2xl mx-auto",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            Choose the plan that fits your academic journey. Upgrade anytime.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <Card className={cn(
                            "border",
                            isDark ? "bg-white/5 border-white/10" : "border-slate-200"
                        )}>
                            <CardHeader>
                                <CardTitle className={isDark ? "text-white" : ""}>Starter</CardTitle>
                                <CardDescription className={isDark ? "text-slate-400" : ""}>
                                    Perfect for trying it out
                                </CardDescription>
                                <div className="mt-4">
                                    <span className={cn(
                                        "text-4xl font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        $0
                                    </span>
                                    <span className={cn(
                                        "ml-1",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        /month
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span><strong>1 Full Transformation</strong> (Try all features)</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span>3 Document Uploads / month</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span>Basic Structure Analysis</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    )}>
                                        <X className="h-5 w-5 mr-3 flex-shrink-0" />
                                        <span>No Advanced Fixing Option</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    )}>
                                        <X className="h-5 w-5 mr-3 flex-shrink-0" />
                                        <span>No Citation Generator</span>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-4 pb-8">
                                <Link to="/signup" className="w-full">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full",
                                            isDark
                                                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                                : "border-slate-300 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                                        )}
                                        size="lg"
                                    >
                                        Get Started Free
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Pro Plan */}
                        <Card className={cn(
                            "relative shadow-xl scale-105 z-10 border",
                            isDark
                                ? "bg-white/5 border-orange-500/30 shadow-orange-500/10"
                                : "border-orange-200 shadow-orange-500/10"
                        )}>
                            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                                <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                    Most Popular
                                </span>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className={isDark ? "text-white" : "text-slate-900"}>
                                        Pro Student
                                    </CardTitle>
                                </div>
                                <CardDescription className={isDark ? "text-slate-400" : ""}>
                                    For serious academic success
                                </CardDescription>
                                <div className="mt-4">
                                    <span className={cn(
                                        "text-4xl font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        $12
                                    </span>
                                    <span className={cn(
                                        "ml-1",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        /month
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    <li className={cn(
                                        "flex items-center font-medium",
                                        isDark ? "text-slate-300" : "text-slate-800"
                                    )}>
                                        <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                                        <span>Unlimited Transformations</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center font-medium",
                                        isDark ? "text-slate-300" : "text-slate-800"
                                    )}>
                                        <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                                        <span>Advanced Tone Fixing</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-300" : "text-slate-800"
                                    )}>
                                        <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                                        <span>Full Citation Generator (APA7, MLA9)</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-300" : "text-slate-800"
                                    )}>
                                        <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                                        <span>Plagiarism Risk Checks</span>
                                    </li>
                                    <li className={cn(
                                        "flex items-center",
                                        isDark ? "text-slate-300" : "text-slate-800"
                                    )}>
                                        <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                                        <span>Priority Support</span>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-4 pb-8">
                                <Link to="/signup" className="w-full">
                                    <Button className="w-full shadow-lg shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                                        Upgrade to Pro
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="mt-24 max-w-3xl mx-auto">
                        <h2 className={cn(
                            "text-2xl font-semibold text-center mb-10",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-6">
                            {[
                                { q: "Can I cancel my subscription anytime?", a: "Yes, absolutely. There are no lock-in contracts. You can cancel from your dashboard settings instantly." },
                                { q: "Is the AI undetectable?", a: "Our tool focuses on transforming YOUR ideas and structure. We don't generate content from scratch, making it much safer and more authentic than generic AI writers." },
                                { q: "What file formats do you support?", a: "We currently support direct text input, DOCX, and PDF uploads for analysis." }
                            ].map((faq, i) => (
                                <div key={i} className={cn(
                                    "p-6 rounded-xl border shadow-sm",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-slate-100"
                                )}>
                                    <h3 className={cn(
                                        "flex items-center text-lg font-semibold mb-2",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        <HelpCircle className={cn(
                                            "h-5 w-5 mr-2",
                                            isDark ? "text-orange-400" : "text-orange-500"
                                        )} />
                                        {faq.q}
                                    </h3>
                                    <p className={cn(
                                        "pl-7",
                                        isDark ? "text-slate-300" : "text-slate-600"
                                    )}>
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
