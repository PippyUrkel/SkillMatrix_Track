import React from 'react';
import { X, Award, Eye, Calendar } from 'lucide-react';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { useDashboardStore } from '@/stores/dashboardStore';

interface AllCertificatesModalProps {
    open: boolean;
    onClose: () => void;
    onViewCertificate: (course: any) => void;
}

export const AllCertificatesModal: React.FC<AllCertificatesModalProps> = ({ open, onClose, onViewCertificate }) => {
    // Only fetch courses that are marked as completed from the dashboard store
    const courses = useDashboardStore((state) => state.courses) || [];
    const completedCourses = courses.filter((c) => c.status === 'completed' || c.progress === 100);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-slate-50 border-4 border-black shadow-[8px_8px_0_0_#000] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-brutal-yellow border-b-4 border-black p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                            <Award className="w-6 h-6 text-black" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-wider text-black">My Certificates</h2>
                            <p className="text-sm font-bold text-black/70">Verified Achievements ({completedCourses.length})</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000] hover:bg-black hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1">
                    {completedCourses.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-400">
                                <Award className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Certificates Yet</h3>
                            <p className="text-slate-600 max-w-sm mx-auto">
                                Complete your first course to earn your verified blockchain certificate.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedCourses.map((course) => (
                                <MatrixCard
                                    key={course.id}
                                    className="p-0 border-2 overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
                                    onClick={() => onViewCertificate(course)}
                                >
                                    {/* Preview header */}
                                    <div className="bg-blue-900 h-24 relative p-4 flex flex-col justify-end border-b-2 border-black overflow-hidden">
                                        <div className="absolute inset-0 opacity-[0.05]"
                                            style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '10px 10px' }}
                                        />
                                        <div className="absolute top-2 right-2 w-8 h-8 bg-amber-400 rounded-full border border-yellow-200"></div>
                                        <h4 className="text-white font-serif font-bold relative z-10 truncate text-lg shadow-sm">
                                            {course.title}
                                        </h4>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 bg-white relative">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600 uppercase">
                                                Completed recently
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {course.skills?.slice(0, 2).map((skill: string) => (
                                                <span key={skill} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-300">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <button className="w-full py-2 bg-slate-100 hover:bg-black hover:text-white border-2 border-black font-bold text-sm uppercase flex items-center justify-center gap-2 transition-colors">
                                            <Eye className="w-4 h-4" /> View Certificate
                                        </button>
                                    </div>
                                </MatrixCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
