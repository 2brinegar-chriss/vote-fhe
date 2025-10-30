import { useState } from 'react';
import { X, Vote, Lock } from 'lucide-react';
import { Poll } from '../hooks/useContract';

interface VoteModalProps {
  platformId: number;
  poll: Poll;
  pollIndex: number;
  contractAddress: string;
  userAddress: string;
  createEncryptedInput: (contractAddress: string, userAddress: string, value: number) => Promise<{ handles: string[]; inputProof: string }>;
  isRelayerReady: boolean;
  onVote: (platformId: number, pollIndex: number, choice: number, encrypted: string, proof: string) => Promise<any>;
  onClose: () => void;
}

export function VoteModal({ 
  platformId, 
  poll, 
  pollIndex, 
  contractAddress,
  userAddress,
  createEncryptedInput,
  isRelayerReady,
  onVote, 
  onClose 
}: VoteModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (selectedChoice === null) {
      setError('请选择一个选项');
      return;
    }

    if (!isRelayerReady) {
      setError('Relayer SDK 未就绪，请稍后再试');
      return;
    }

    try {
      setVoting(true);
      setEncrypting(true);
      setError(null);
      
      // 使用 Relayer SDK 创建加密输入
      // 加密值为 1 (表示投票)
      const encrypted = await createEncryptedInput(contractAddress, userAddress, 1);
      
      setEncrypting(false);
      
      // 发送投票交易
      await onVote(platformId, pollIndex, selectedChoice, encrypted.handles[0], encrypted.inputProof);
      onClose();
    } catch (err: any) {
      console.error('投票失败:', err);
      setError(err.message || '投票失败');
    } finally {
      setVoting(false);
      setEncrypting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{poll.title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <Lock size={18} color="#6366f1" />
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {encrypting 
                ? '🔐 正在使用 Zama Relayer SDK 加密您的投票...' 
                : '您的投票将通过 FHE 加密保护，确保完全隐私安全。'
              }
            </p>
          </div>

          <div className="vote-options">
            {poll.options.map((option, index) => (
              <label
                key={index}
                className={`vote-option ${selectedChoice === index ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="vote"
                  value={index}
                  checked={selectedChoice === index}
                  onChange={() => setSelectedChoice(index)}
                  disabled={voting}
                />
                <span className="vote-option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={voting}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleVote} disabled={voting || selectedChoice === null || !isRelayerReady}>
            {encrypting ? <Lock size={18} /> : <Vote size={18} />}
            {encrypting ? '加密中...' : voting ? '投票中...' : '确认投票'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem;
        }

        .modal-close:hover {
          color: var(--text-primary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .vote-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vote-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .vote-option:hover {
          border-color: var(--primary-color);
          background: var(--bg-hover);
        }

        .vote-option.selected {
          border-color: var(--primary-color);
          background: rgba(99, 102, 241, 0.1);
        }

        .vote-option input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .vote-option-text {
          flex: 1;
          font-size: 1rem;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

