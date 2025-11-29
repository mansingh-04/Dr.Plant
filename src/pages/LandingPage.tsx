import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Leaf, Activity, Calendar, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation */}
            <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Leaf className="h-6 w-6" />
                        <span>Dr. Plant</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Log in</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

                <div className="space-y-6 max-w-3xl relative z-10">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                        Now with AI Analysis
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                        Your Personal <span className="text-primary">Plant Doctor</span> & Care Companion
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Keep your plants thriving with AI-powered health analysis, personalized care schedules, and a beautiful journal for your green friends.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/signup">
                            <Button size="lg" className="gap-2 h-12 px-8 text-lg">
                                Start for Free <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                                I have an account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need for happy plants</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Whether you're a seasoned gardener or just starting out, Dr. Plant provides the tools you need to succeed.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8 rounded-2xl space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Activity className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">AI Health Analysis</h3>
                            <p className="text-muted-foreground">
                                Snap a photo of your plant and let our AI diagnose issues, pests, or diseases instantly with treatment recommendations.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8 rounded-2xl space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Smart Care Schedules</h3>
                            <p className="text-muted-foreground">
                                Never forget to water again. Get personalized reminders for watering, fertilizing, and repotting based on your plant's species.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8 rounded-2xl space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Plant Journal</h3>
                            <p className="text-muted-foreground">
                                Track your plant's growth over time with a visual timeline. Add notes, photos, and milestones to see how they flourish.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="container">
                    <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">Ready to grow your indoor jungle?</h2>
                            <p className="text-primary-foreground/90 text-lg">
                                Join thousands of plant lovers who trust Dr. Plant to keep their greenery healthy and thriving.
                            </p>
                            <Link to="/signup">
                                <Button size="lg" variant="secondary" className="mt-4 h-12 px-8 text-lg font-semibold">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/40 py-12 bg-muted/20">
                <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Leaf className="h-6 w-6" />
                        <span>Dr. Plant</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Dr. Plant. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
