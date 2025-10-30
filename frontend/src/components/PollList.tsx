import { useState, useEffect } from 'react';
import { Vote, CheckCircle, Clock, StopCircle } from 'lucide-react';
import { Poll } from '../hooks/useContract';
import { useLanguageContext } from '../contexts/LanguageContext';

interface PollWithIndex extends Poll {
  index: number;
}

interface PollListProps {
  platformId: number;
  getPoll: (platformId: number, pollIndex: number) => Promise<Poll>;
  hasUserVoted: (platformId: number, pollIndex: number, address: string) => Promise<boolean>;
  userAddress: string | null;
  onVote: (pollIndex: number) => void;
  onViewResults: (pollIndex: number) => void;
  onFinalize: (pollIndex: number) => void;
}

export function PollList({
  platformId,
  getPoll,
  hasUserVoted,
  userAddress,
  onVote,
  onViewResults,
  onFinalize,
}: PollListProps) {
  const { t } = useLanguageContext();
  const [polls, setPolls] = useState<PollWithIndex[]>([]);
  const [votedStatus, setVotedStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const pollsList: PollWithIndex[] = [];
      const votedMap: Record<number, boolean> = {};

      // Try to load polls (index starts at 0)
      for (let i = 0; i < 100; i++) {
        try {
          const poll = await getPoll(platformId, i);
          pollsList.push({ ...poll, index: i });
          
          if (userAddress) {
            const hasVoted = await hasUserVoted(platformId, i, userAddress);
            votedMap[i] = hasVoted;
          }
        } catch {
          // No more polls
          break;
        }
      }

      setPolls(pollsList);
      setVotedStatus(votedMap);
    } catch (error) {
      console.error('加载投票失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [platformId, userAddress]);

  if (loading) {
    return <div className="loading">{t.loadingPolls}</div>;
  }

  if (polls.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>{t.noPolls}</h3>
        <p>{t.noPollsDesc}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {polls.map((poll) => {
        const hasVoted = votedStatus[poll.index];
        const totalVoted = Number(poll.totalVoted);
        const memberCount = Number(poll.memberCountSnapshot);
        const participation = memberCount > 0 ? (totalVoted / memberCount) * 100 : 0;

        return (
          <div key={poll.index} className="card" style={{
            borderColor: hasVoted ? 'rgba(16, 185, 129, 0.3)' : poll.finalized ? 'rgba(245, 158, 11, 0.3)' : undefined,
            background: hasVoted 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(30, 30, 30, 0.95) 100%)'
              : poll.finalized 
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(30, 30, 30, 0.95) 100%)'
              : undefined
          }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>{poll.title}</h3>
                  {hasVoted && (
                    <span className="badge badge-success">
                      <CheckCircle size={14} />
                      {t.voted}
                    </span>
                  )}
                  {poll.finalized && (
                    <span className="badge badge-warning">{t.finalized}</span>
                  )}
                  {!poll.finalized && !hasVoted && (
                    <span className="badge" style={{
                      background: 'var(--info-light)',
                      color: 'var(--info-color)',
                      borderColor: 'rgba(59, 130, 246, 0.2)'
                    }}>
                      {t.inProgress}
                    </span>
                  )}
                </div>
                <div style={{ 
                  marginTop: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  <Clock size={14} />
                  <span>{t.participation}: {totalVoted} / {memberCount} ({participation.toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* 参与进度条 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-hover)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${participation}%`,
                    height: '100%',
                    background: hasVoted ? 'var(--gradient-success)' : 'var(--gradient-purple)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* 选项列表 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}>
                  {t.pollOptions}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {poll.options.map((option, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all var(--transition-normal)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary-color)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!hasVoted && !poll.finalized && (
                  <button
                    className="btn btn-primary"
                    onClick={() => onVote(poll.index)}
                  >
                    <Vote size={18} />
                    {t.voteNow}
                  </button>
                )}
                {!poll.finalized && (
                  <button
                    className="btn btn-warning"
                    onClick={() => onFinalize(poll.index)}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: 'none',
                    }}
                  >
                    <StopCircle size={18} />
                    {t.endPoll}
                  </button>
                )}
                {poll.finalized && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onViewResults(poll.index)}
                  >
                    <CheckCircle size={18} />
                    {t.viewResults}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

