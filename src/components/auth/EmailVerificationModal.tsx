import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose }) => {
  const { user, verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    const res = await verifyEmail(code);
    setIsSubmitting(false);

    if (res.success) {
      setStatus({ text: 'Email verified successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
        setCode('');
        setStatus(null);
      }, 1500);
    } else {
      setStatus({ text: res.error || 'Invalid verification code.', type: 'error' });
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setStatus(null);

    const res = await resendVerification(user?.email);
    setIsResending(false);

    if (res.success) {
      setStatus({ text: res.message || 'Verification code resent successfully.', type: 'success' });
    } else {
      setStatus({ text: res.error || 'Failed to resend code.', type: 'error' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Verification"
      subtitle="Enter the verification code sent to your email"
      maxWidth="md"
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="p-3.5 bg-[#141414] border border-[#222] rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 shrink-0">
            <Mail size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Account Email</p>
            <p className="text-xs font-bold text-white truncate">{user?.email}</p>
          </div>
        </div>

        {status && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{status.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#161616] text-white font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 cursor-pointer"
          >
            {isResending ? 'Resending...' : 'Resend Code'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#1f1f1f] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim() || isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-indigo-400/40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>Verify</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};