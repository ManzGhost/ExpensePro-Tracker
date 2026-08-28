import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, deleteAccount } = useAuth();
  const { clearAllExpenses } = useExpenses();
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage('');

    try {
      // Clear React expense context state
      clearAllExpenses();

      // Execute account deletion (MongoDB + Auth session)
      const res = await deleteAccount();
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
        return;
      }

      onClose();
      navigate('/login', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setErrorMessage('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Delete Registered Account"
      subtitle="Permanently remove your account and all associated transaction data."
      maxWidth="md"
      id="delete-account-modal"
    >
      <form onSubmit={handleDelete} className="space-y-4">
        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-200">Irreversible Action</h4>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              This will permanently delete your account (<strong className="text-rose-100">{user?.email}</strong>) and all your recorded expenses from the database. This action cannot be undone.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Confirmation Input */}
        <div>
          <label htmlFor="confirm-delete-input" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Type <span className="text-rose-400 font-mono">DELETE</span> to confirm
          </label>
          <input
            id="confirm-delete-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            placeholder="Type DELETE"
            className="w-full px-3.5 py-2.5 rounded-2xl border border-[#2a2a2a] bg-[#161616] text-white font-mono text-sm focus:border-rose-500 focus:outline-hidden transition-colors"
            autoComplete="off"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f1f]">
          <button
            type="button"
            id="cancel-delete-account-btn"
            onClick={handleModalClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-gray-300 hover:bg-[#1f1f1f] hover:text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="confirm-delete-account-btn"
            disabled={!isConfirmed || isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/40 disabled:text-rose-400/40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Permanently Delete Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
