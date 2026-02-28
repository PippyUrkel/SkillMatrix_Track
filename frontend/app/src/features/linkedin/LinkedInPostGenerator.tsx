import React, { useState } from 'react';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { Linkedin, Loader2, Share2, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';

interface LinkedInPostGeneratorProps {
    courseName: string;
    skillsGained: string[];
    onClose: () => void;
}

export const LinkedInPostGenerator: React.FC<LinkedInPostGeneratorProps> = ({ courseName, skillsGained, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [postContent, setPostContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const res = await api.post<{ post_content: string }>('/api/linkedin/generate', {
                course_name: courseName,
                skills_gained: skillsGained
            });
            setPostContent(res.post_content);
        } catch (err: any) {
            setError("Failed to generate post. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = () => {
        if (!postContent) return;
        const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postContent)}`;
        window.open(linkedInUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <MatrixCard className="relative overflow-hidden p-0 border-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="bg-[#0077B5] p-8 text-center border-b-4 border-black relative text-white">
                        <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center mx-auto mb-4 relative z-10 shadow-[4px_4px_0_0_#000]">
                            <Linkedin className="w-8 h-8 text-[#0077B5]" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-wider relative z-10">Share Achievement</h2>
                        <p className="font-bold border-black mt-2 relative z-10">Let your network know what you just learned</p>
                    </div>

                    <div className="p-8 bg-white space-y-6">
                        {!postContent ? (
                            <div className="text-center space-y-6">
                                <div className="bg-slate-50 border-2 border-black p-4">
                                    <span className="text-xs font-black uppercase text-slate-500 block mb-1">Course Complete</span>
                                    <p className="font-bold text-lg leading-tight">{courseName}</p>
                                </div>

                                <p className="text-slate-600 font-bold">
                                    Generate an AI-crafted post highlighting your new skills in {skillsGained.join(', ') || 'this topic'}.
                                </p>

                                {error && <p className="text-red-600 font-bold text-sm bg-red-50 p-2 border border-red-200">{error}</p>}

                                <MatrixButton
                                    className="w-full bg-[#0077B5] hover:bg-[#005582] text-white"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Crafting Post...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> Auto-Generate Post</>
                                    )}
                                </MatrixButton>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-wider block text-slate-700">Your Post Draft</label>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        rows={6}
                                        className="w-full p-4 bg-slate-50 border-2 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all resize-none"
                                    />
                                    <p className="text-xs font-bold text-slate-500">You can edit the text before sharing.</p>
                                </div>

                                <div className="flex gap-4">
                                    <MatrixButton variant="secondary" className="flex-1" onClick={() => setPostContent(null)}>
                                        Regenerate
                                    </MatrixButton>
                                    <MatrixButton
                                        className="flex-1 bg-[#0077B5] hover:bg-[#005582] text-white"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" /> Share to LinkedIn
                                    </MatrixButton>
                                </div>
                            </div>
                        )}
                    </div>
                </MatrixCard>
            </div>
        </div>
    );
};
