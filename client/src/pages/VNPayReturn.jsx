import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VNPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const vnp_ResponseCode = query.get('vnp_ResponseCode');
        const vnp_TxnRef = query.get('vnp_TxnRef');
        setOrderId(vnp_TxnRef);

        if (vnp_ResponseCode === '00') {
            setStatus('success');
        } else {
            setStatus('failed');
        }
    }, [location]);

    return (
        <main className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/30 text-center">
                {status === 'processing' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                        </div>
                        <h1 className="text-2xl font-bold text-primary mb-2">Verifying Payment...</h1>
                        <p className="text-on-surface-variant text-sm">Please wait while we confirm your transaction.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
                        </div>
                        <h1 className="text-3xl font-black text-primary mb-2 uppercase tracking-tight">Payment Successful</h1>
                        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                            Thank you for your purchase! Your order <span className="font-bold text-primary">#{orderId.slice(-8).toUpperCase()}</span> has been paid and is now in preparation.
                        </p>
                        <div className="w-full space-y-3">
                            <button 
                                onClick={() => navigate('/profile')}
                                className="w-full bg-[#001D52] text-white py-3 rounded-2xl font-bold hover:bg-[#081F5C] transition-all shadow-lg"
                            >
                                View Order History
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 hover:bg-white transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-5xl text-red-600">error</span>
                        </div>
                        <h1 className="text-3xl font-black text-primary mb-2 uppercase tracking-tight">Payment Failed</h1>
                        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                            We couldn't process your payment. If funds were deducted, they will be automatically refunded by your bank.
                        </p>
                        <div className="w-full space-y-3">
                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[#001D52] text-white py-3 rounded-2xl font-bold hover:bg-[#081F5C] transition-all shadow-lg"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold border border-slate-200 hover:bg-white transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default VNPayReturn;
