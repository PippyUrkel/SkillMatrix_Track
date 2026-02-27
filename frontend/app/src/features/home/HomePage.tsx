import React from 'react';
import { ArrowRight, Zap, Target, BookOpen, BarChart3 } from 'lucide-react';

interface HomePageProps {
    onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-white overflow-hidden relative">
            {/* Decorative floating blocks */}
            <div className="absolute top-12 right-[8%] w-24 h-24 bg-brutal-pink border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-12 z-0 hidden lg:block" />
            <div className="absolute top-[40%] right-[5%] w-16 h-16 bg-brutal-blue border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6 z-0 hidden lg:block" />
            <div className="absolute bottom-32 left-[6%] w-20 h-20 bg-brutal-orange border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3 z-0 hidden lg:block" />
            <div className="absolute top-[20%] left-[3%] w-12 h-12 bg-brutal-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-45 z-0 hidden lg:block" />

            {/* Top Nav */}
            <header className="relative z-10 border-b-4 border-black bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-brutal-yellow overflow-hidden">
                            <img src="/logo.png" alt="SkillMatrix Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-2xl font-black text-black tracking-tight">SkillMatrix</span>
                    </div>
                    <button
                        onClick={onGetStarted}
                        className="px-6 py-3 bg-black text-white font-black text-sm uppercase tracking-wider border-4 border-black hover:bg-brutal-yellow hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                        Login →
                    </button>
                </div>
            </header>

            {/* Hero Section — Off-centered */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left text block — takes 7 cols, shifted left */}
                    <div className="lg:col-span-7 lg:col-start-1">
                        <div className="inline-block bg-brutal-yellow border-2 border-black px-4 py-2 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                            <span className="font-black text-black text-sm uppercase tracking-wider">⚡ AI-Powered Career Growth</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-[0.9] mb-8 tracking-tighter">
                            KNOW YOUR
                            <br />
                            <span className="inline-block bg-brutal-pink border-4 border-black px-4 py-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-1 my-2">
                                SKILL GAPS
                            </span>
                            <br />
                            FIX THEM.
                        </h1>

                        <p className="text-lg md:text-xl text-black font-medium max-w-lg mb-10 leading-relaxed">
                            AI analyzes your skills against real job market demands. Get personalized
                            learning paths. Close gaps. Land your dream role.
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            <button
                                onClick={onGetStarted}
                                className="px-8 py-4 bg-brutal-blue text-black font-black text-lg uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all flex items-center gap-3"
                            >
                                Get Started Free
                                <ArrowRight className="w-6 h-6" strokeWidth={3} />
                            </button>
                            <div className="bg-brutal-purple border-2 border-black px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
                                <span className="font-black text-black text-sm">✓ No credit card required</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side — stacked feature cards, offset upward */}
                    <div className="lg:col-span-5 lg:col-start-8 space-y-5 lg:-mt-4">
                        {/* Feature Card 1 */}
                        <div className="bg-brutal-yellow border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all -rotate-1">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                    <Target className="w-7 h-7 text-black" strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="font-black text-black text-lg uppercase mb-1">Skill Gap Analysis</h3>
                                    <p className="text-black font-medium text-sm">AI compares your skills to market demands and identifies exactly what's missing.</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="bg-brutal-pink border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all rotate-1">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                    <BookOpen className="w-7 h-7 text-black" strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="font-black text-black text-lg uppercase mb-1">Smart Courses</h3>
                                    <p className="text-black font-medium text-sm">AI-curated YouTube learning paths with progress tracking and checkpoints.</p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="bg-brutal-blue border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all -rotate-1">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                    <BarChart3 className="w-7 h-7 text-black" strokeWidth={3} />
                                </div>
                                <div>
                                    <h3 className="font-black text-black text-lg uppercase mb-1">Track Progress</h3>
                                    <p className="text-black font-medium text-sm">Earn XP, unlock achievements, and visualize your growth with real metrics.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Stats Strip */}
            <section className="relative z-10 border-t-4 border-black bg-black">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'SKILLS TRACKED', value: '200+', color: 'bg-brutal-yellow' },
                            { label: 'COURSES GENERATED', value: 'AI ∞', color: 'bg-brutal-pink' },
                            { label: 'JOB ROLES', value: '50+', color: 'bg-brutal-blue' },
                            { label: 'IT\'S ALL', value: 'FREE', color: 'bg-brutal-orange' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className={`inline-block ${stat.color} border-2 border-black px-5 py-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] mb-2`}>
                                    <span className="font-black text-black text-2xl md:text-3xl">{stat.value}</span>
                                </div>
                                <p className="text-white font-black text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works — off-centered */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="lg:ml-[8%]">
                    <div className="inline-block bg-brutal-orange border-2 border-black px-4 py-2 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
                        <span className="font-black text-black text-sm uppercase tracking-wider">How It Works</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                        {[
                            {
                                step: '01',
                                title: 'TELL US YOUR GOAL',
                                desc: 'Pick your target role. Our AI pulls real market data to know what skills matter.',
                                color: 'bg-brutal-yellow',
                                rotate: '-rotate-1',
                            },
                            {
                                step: '02',
                                title: 'GET YOUR MAP',
                                desc: 'See exactly where you stand. Missing skills highlighted. No BS.',
                                color: 'bg-brutal-pink',
                                rotate: 'rotate-1',
                            },
                            {
                                step: '03',
                                title: 'LEARN & LEVEL UP',
                                desc: 'AI builds your course. Watch. Practice. Track progress. Repeat.',
                                color: 'bg-brutal-blue',
                                rotate: '-rotate-1',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className={`${item.color} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all ${item.rotate}`}
                            >
                                <div className="bg-black text-white font-black text-2xl w-12 h-12 flex items-center justify-center border-2 border-black mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
                                    {item.step}
                                </div>
                                <h3 className="font-black text-black text-xl mb-2">{item.title}</h3>
                                <p className="text-black font-medium text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 border-t-4 border-black bg-brutal-purple">
                <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-black mb-6 tracking-tight">
                        STOP GUESSING.
                        <br />
                        START GROWING.
                    </h2>
                    <p className="text-black font-bold text-lg mb-8 max-w-md mx-auto">
                        Your next career move shouldn't be a gamble. Let AI show you the way.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-black text-white font-black text-xl uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all inline-flex items-center gap-3"
                    >
                        <Zap className="w-6 h-6" strokeWidth={3} />
                        Join SkillMatrix — It's Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-black py-6 text-center relative z-10">
                <p className="text-white font-bold text-sm">
                    Built with <span className="text-brutal-pink">♥</span> by SkillMatrix Team • 2025
                </p>
            </footer>
        </div>
    );
};

export default HomePage;
