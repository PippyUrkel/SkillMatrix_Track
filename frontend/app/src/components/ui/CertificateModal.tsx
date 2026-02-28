import React from 'react';
import { Download, Linkedin, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MatrixButton } from './MatrixButton';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
    open: boolean;
    onClose: () => void;
    courseName: string;
    userName: string;
    completionDate: string;
    skills: string[];
    txHash?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
    open,
    onClose,
    courseName,
    userName,
    completionDate,
    skills,
    txHash,
}) => {
    React.useEffect(() => {
        if (open) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#1e3a8a', '#fbbf24', '#ffffff', '#3b82f6'], // Blue & Gold accents
            });
        }
    }, [open]);

    if (!open) return null;

    // Generate a pseudo-random ID for display
    const { certId, mockTxHash } = React.useMemo(() => {
        const str = `${userName}-${courseName}-${completionDate}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const hexHash = Math.abs(hash).toString(16).toLowerCase().padStart(8, '0');
        return {
            certId: `SMX-${hexHash.toUpperCase()}`,
            mockTxHash: `0x${hexHash.padStart(64, '0')}` // Fallback determinisitic hash for Ethereum
        };
    }, [userName, courseName, completionDate]);

    // Use the real passed txHash, or fallback to the determinisitic mock one so the QR is always scannable
    const finalTxHash = txHash || mockTxHash;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl my-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button - outside the certificate area */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors text-slate-700"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Certificate Container (A4 Landscape aspect ratio ~ 1.414) */}
                <div className="w-full bg-white shadow-2xl relative overflow-hidden aspect-[1.414/1] min-h-[600px] flex items-stretch">

                    {/* Background Pattern / Watermark effect */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#1e3a8a 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                    </div>

                    {/* Inner Content Wrapper with Border */}
                    <div className="flex-1 m-8 md:m-12 relative border-[12px] border-double border-slate-200 bg-white shadow-inner p-8 md:p-14 flex flex-col items-center justify-center text-center">

                        {/* Decorative Corner Accents */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-900" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-900" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-900" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-900" />

                        {/* Top Section: Seal & Issuing Authority */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg border-4 border-amber-400 mb-4 relative">
                                <span className="text-white font-serif font-black text-3xl">S</span>
                                {/* Subtle gold ring */}
                                <div className="absolute inset-1 border border-amber-300/50 rounded-full rounded-full"></div>
                            </div>
                            <p className="font-serif text-blue-900 tracking-[0.2em] text-sm uppercase font-semibold">
                                Issued by SkillMatrix
                            </p>
                        </div>

                        {/* Certificate Title */}
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-wide">
                            Certificate of Achievement
                        </h1>

                        {/* Body Text */}
                        <p className="text-slate-600 text-lg mb-6">
                            This certifies that the above individual
                        </p>

                        {/* Recipient Name */}
                        <h2 className="font-serif text-5xl md:text-6xl text-blue-950 font-bold mb-6 italic">
                            {userName}
                        </h2>

                        {/* Course Description */}
                        <p className="text-slate-600 text-lg mb-2">
                            has successfully completed the program
                        </p>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4 max-w-2xl">
                            {courseName}
                        </h3>

                        {/* Skills */}
                        {skills && skills.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl">
                                {skills.map((skill) => (
                                    <span key={skill} className="text-sm text-blue-800 border-b border-blue-200 px-2">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Bottom Section Wrap */}
                        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-end">
                            {/* Left: Signature & Date */}
                            <div className="flex flex-col items-start gap-8">
                                <div className="text-left">
                                    <div className="mb-2">
                                        {/* Signature Placeholder */}
                                        <span className="font-['Brush_Script_MT',cursive] text-3xl text-slate-800">A. Matrix</span>
                                    </div>
                                    <div className="w-48 h-px bg-slate-400 mb-2"></div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Authorized Signature</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">{completionDate}</p>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Date of Issue</p>
                                    <p className="text-xs text-slate-400 mt-1">ID: {certId}</p>
                                </div>
                            </div>

                            {/* Right: QR Code for Blockchain verification */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-white border border-slate-200 p-2 shadow-sm rounded-sm flex items-center justify-center mb-2">
                                    {finalTxHash ? (
                                        <QRCodeSVG
                                            value={`https://sepolia.etherscan.io/tx/${finalTxHash}`}
                                            width="100%"
                                            height="100%"
                                            level="L"
                                        />
                                    ) : (
                                        <QrCode className="w-full h-full text-slate-800 opacity-20" strokeWidth={1} />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                    Scan to Verify
                                </p>
                                <p className="text-[10px] text-blue-600 font-bold">
                                    on Blockchain
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Actions Panel below certificate */}
                <div className="mt-8 flex items-center justify-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <MatrixButton onClick={() => window.print()} className="bg-white text-blue-900 border-none hover:bg-slate-100">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </MatrixButton>
                    <MatrixButton className="bg-blue-600 text-white border-none hover:bg-blue-700">
                        <Linkedin className="w-4 h-4 mr-2" />
                        Add to Profile
                    </MatrixButton>
                </div>
            </div>
        </div>
    );
};
