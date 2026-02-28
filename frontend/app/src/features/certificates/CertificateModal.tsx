import React, { useState } from 'react';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { ShieldCheck, Link as LinkIcon, Loader2, X, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
    courseId: string;
    courseName: string;
    onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ courseId, courseName, onClose }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [certUrl, setCertUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleMint = async () => {
        if (!walletAddress.trim()) {
            setError("Please enter a valid Polygon wallet address.");
            return;
        }
        setError(null);
        setIsMinting(true);

        try {
            const res = await api.post<{ transaction_hash: string, certificate_url: string }>('/api/certificates/mint', {
                course_id: courseId,
                wallet_address: walletAddress.trim(),
            });
            setTxHash(res.transaction_hash);
            setCertUrl(res.certificate_url);

            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#8B5CF6', '#10B981', '#F59E0B'] // Polygon purple + Success colors
            });

        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to mint certificate. Please try again.");
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <MatrixCard className="relative overflow-hidden p-0 border-4">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-brutal-purple to-purple-400 p-8 text-center border-b-4 border-black relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PHBhdGggZD0iTTAgMGw4IDhaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjIiLz48L3N2Zz4=')]" />
                        <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center mx-auto mb-4 relative z-10 shadow-[4px_4px_0_0_#000]">
                            <ShieldCheck className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-2xl font-black text-black uppercase tracking-wider relative z-10">Proof of Completion</h2>
                        <p className="text-black/80 font-bold mt-2 relative z-10">Mint your achievement on the blockchain</p>
                    </div>

                    <div className="p-8 bg-white">
                        {!txHash ? (
                            <div className="space-y-6">
                                <div className="bg-slate-50 border-2 border-black p-4 text-center">
                                    <span className="text-xs font-black uppercase text-slate-500 block mb-1">Course</span>
                                    <p className="font-bold text-lg leading-tight">{courseName}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-wider block">Polygon Wallet Address</label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                                        <input
                                            type="text"
                                            value={walletAddress}
                                            onChange={(e) => setWalletAddress(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all"
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-2">
                                        Enter your Web3 wallet address to receive your NFT certificate on the Polygon network.
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-2 border-red-500 text-red-700 p-3 text-sm font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <MatrixButton
                                    className="w-full"
                                    onClick={handleMint}
                                    disabled={isMinting || !walletAddress.trim()}
                                >
                                    {isMinting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Minting to Blockchain...</>
                                    ) : (
                                        <><ShieldCheck className="w-4 h-4 mr-2" /> Mint NFT Certificate</>
                                    )}
                                </MatrixButton>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-16 h-16 bg-emerald-400 border-[3px] border-black flex items-center justify-center mx-auto shadow-[4px_4px_0_0_#000]">
                                    <ShieldCheck className="w-8 h-8 text-black" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-wider text-emerald-600 mb-2">Minted Successfully!</h3>
                                    <p className="text-slate-600 font-bold mb-6">Your NFT has been deployed to the Polygon network.</p>
                                </div>

                                <div className="bg-slate-50 border-2 border-black p-4 text-left space-y-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Transaction Hash</span>
                                        <a
                                            href={`https://polygonscan.com/tx/${txHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 break-all flex items-center gap-1 group"
                                        >
                                            {txHash} <LinkIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">IPFS Metadata</span>
                                        <a
                                            href={certUrl?.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 break-all flex items-center gap-1 group"
                                        >
                                            {certUrl} <LinkIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <MatrixButton variant="secondary" className="flex-1" onClick={onClose}>
                                        Close
                                    </MatrixButton>
                                    <MatrixButton className="flex-1 right" onClick={() => window.open(`https://polygonscan.com/tx/${txHash}`, '_blank')}>
                                        View on Polygonscan
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
