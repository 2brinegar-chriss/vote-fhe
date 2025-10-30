import { AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'success' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'warning',
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} color="#22c55e" />;
      case 'danger':
        return <AlertCircle size={24} color="#ef4444" />;
      case 'warning':
        return <AlertCircle size={24} color="#f59e0b" />;
      default:
        return <AlertCircle size={24} color="var(--primary-color)" />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        };
      default:
        return {
          background: 'var(--gradient-purple)',
        };
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} icon={getIcon()} />
      <ModalBody>
        <p
          style={{
            margin: 0,
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
          }}
        >
          {message}
        </p>
      </ModalBody>
      <ModalFooter>
        <button
          className="btn btn-secondary"
          onClick={onClose}
          style={{ minWidth: '100px' }}
        >
          {cancelText}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          style={{ minWidth: '100px', ...getButtonStyle() }}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}

