import { CheckCircle, BarChart3, Shield } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from './Modal';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: {
    question: string;
    options: string[];
  };
  results: {
    option: string;
    count: bigint;
  }[];
  isDecrypted: boolean;
}

export function ResultsModal({
  isOpen,
  onClose,
  poll,
  results,
  isDecrypted,
}: ResultsModalProps) {
  const totalVotes = results.reduce((sum, r) => sum + Number(r.count), 0);
  const maxVotes = Math.max(...results.map(r => Number(r.count)), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title="投票结果"
        onClose={onClose}
        icon={<BarChart3 size={24} color="var(--primary-color)" />}
      />
      <ModalBody>
        {/* 投票问题 */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginBottom: '0.375rem',
              fontWeight: '500',
            }}
          >
            投票问题
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '600' }}>
            {poll.question}
          </div>
        </div>

        {/* 总投票数 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%)',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: '500' }}>总投票数</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {totalVotes}
          </span>
        </div>

        {/* 投票结果列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map((result, index) => {
            const count = Number(result.count);
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isWinner = count === maxVotes && count > 0;

            return (
              <div
                key={index}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  background: isWinner
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
                    : 'var(--bg-secondary)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* 进度条背景 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${percentage}%`,
                    background: isWinner
                      ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                      : 'rgba(99, 102, 241, 0.1)',
                    transition: 'width 0.8s ease',
                    borderRadius: 'var(--radius-lg)',
                  }}
                />

                {/* 内容 */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {result.option}
                      {isWinner && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            background: 'var(--gradient-purple)',
                            color: 'white',
                            borderRadius: '999px',
                            fontWeight: '600',
                          }}
                        >
                          领先
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontWeight: '700',
                        fontSize: '1.125rem',
                        color: 'var(--primary-color)',
                      }}
                    >
                      {count} 票
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>
                      占比 {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 解密状态提示 */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: isDecrypted
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(251, 146, 60, 0.1)',
            border: `1px solid ${
              isDecrypted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 146, 60, 0.3)'
            }`,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem',
          }}
        >
          {isDecrypted ? (
            <>
              <Shield size={18} color="#22c55e" />
              <span style={{ color: '#22c55e', fontWeight: '500' }}>
                ✅ 已使用 Zama Relayer SDK 解密
              </span>
            </>
          ) : (
            <>
              <Shield size={18} color="#fb923c" />
              <span style={{ color: '#fb923c', fontWeight: '500' }}>
                ⚠️ 显示加密数据
              </span>
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}

