import React from 'react';
import { Download, Linkedin, X } from 'lucide-react';
import { MatrixButton } from './MatrixButton';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
    open: boolean;
    onClose: () => void;
    courseName: string;
    userName: string;
    completionDate: string;
    skills: string[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
    open,
    onClose,
    courseName,
    userName,
    completionDate,
    skills,
}) => {
    React.useEffect(() => {
        if (open) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B', '#3B82F6'],
            });
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-white rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <div className="flex justify-end p-3">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Certificate */}
                <div className="px-12 pb-8">
                    <div className="border-2 border-emerald-200 rounded-none p-10 bg-gradient-to-br from-emerald-50/50 to-white text-center relative overflow-hidden">
                        {/* Decorative corners */}
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-300 rounded-none" />
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-300 rounded-none" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-300 rounded-none" />
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-300 rounded-none" />

                        <div className="w-14 h-14 bg-brutal-yellow border-2 border-black rounded-none flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <img src="/logo.png" alt="SkillMatrix Logo" className="w-full h-full object-cover" />
                        </div>

                        <p className="text-slate-400 text-xs uppercase tracking-[0.3em] mb-2">Certificate of Completion</p>
                        <h2 className="text-3xl font-bold text-slate-900 mb-1">{courseName}</h2>
                        <p className="text-slate-500 text-sm mb-6">SkillMatrix AI Learning Platform</p>

                        <div className="w-16 h-0.5 bg-emerald-300 mx-auto mb-6" />

                        <p className="text-slate-500 text-sm mb-1">Awarded to</p>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-6">{userName}</h3>

                        <p className="text-slate-500 text-sm mb-4">Skills gained:</p>
                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                            {skills.map((skill) => (
                                <span key={skill} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-none text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <p className="text-slate-400 text-xs">Completed on {completionDate}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 px-12 pb-8">
                    <MatrixButton variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Download PNG
                    </MatrixButton>
                    <MatrixButton>
                        <Linkedin className="w-4 h-4 mr-2" />
                        Share to LinkedIn
                    </MatrixButton>
                </div>
            </div>
        </div>
    );
};
