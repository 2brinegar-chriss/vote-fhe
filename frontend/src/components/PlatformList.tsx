import { useState, useEffect } from 'react';
import { Users, UserPlus, CheckCircle } from 'lucide-react';
import { Platform } from '../hooks/useContract';
import { useLanguageContext } from '../contexts/LanguageContext';

interface PlatformListProps {
  getAllPlatforms: () => Promise<Platform[]>;
  joinPlatform: (platformId: number) => Promise<any>;
  isPlatformMember: (platformId: number, address: string) => Promise<boolean>;
  userAddress: string | null;
  onSelectPlatform: (platformId: number) => void;
  isContractReady: boolean;
}

export function PlatformList({
  getAllPlatforms,
  joinPlatform,
  isPlatformMember,
  userAddress,
  onSelectPlatform,
  isContractReady,
}: PlatformListProps) {
  const { t } = useLanguageContext();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [memberStatus, setMemberStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const data = await getAllPlatforms();
      setPlatforms(data);

      if (userAddress) {
        const statusChecks = await Promise.all(
          data.map(async (p) => ({
            id: Number(p.id),
            isMember: await isPlatformMember(Number(p.id), userAddress),
          }))
        );
        const statusMap = statusChecks.reduce((acc, { id, isMember }) => {
          acc[id] = isMember;
          return acc;
        }, {} as Record<number, boolean>);
        setMemberStatus(statusMap);
      }
    } catch (error) {
      console.error('加载平台失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isContractReady) {
      loadPlatforms();
    }
  }, [userAddress, isContractReady]);

  const handleJoin = async (platformId: number) => {
    try {
      setJoining(platformId);
      await joinPlatform(platformId);
      await loadPlatforms();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return <div className="loading">{t.loadingPlatforms}</div>;
  }

  if (platforms.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏛️</div>
        <h3>{t.noPlatforms}</h3>
        <p>{t.noPlatformsDesc}</p>
      </div>
    );
  }

  return (
    <div className="platform-grid">
      {platforms.map((platform) => {
        const platformId = Number(platform.id);
        const isMember = memberStatus[platformId];
        const memberCount = Number(platform.memberCount);
        const memberLimit = Number(platform.memberLimit);
        const occupancy = memberLimit > 0 ? (memberCount / memberLimit) * 100 : 0;
        const isFull = memberCount >= memberLimit;

        return (
          <div key={platformId} className="card" style={{
            borderColor: isMember ? 'rgba(16, 185, 129, 0.3)' : undefined,
            background: isMember 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(30, 30, 30, 0.95) 100%)'
              : undefined
          }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>
                    {platform.name}
                  </h3>
                  {isMember && (
                    <span className="badge badge-success">
                      <CheckCircle size={12} />
                      {t.joined}
                    </span>
                  )}
                  {!isMember && isFull && (
                    <span className="badge badge-danger">
                      {t.full}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isMember ? 'var(--success-color)' : 'var(--text-muted)'
                  }} />
                  {t.platformId} #{platformId}
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* 成员信息 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="var(--primary-color)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                      {t.memberCount}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '600',
                    color: isFull ? 'var(--danger-color)' : 'var(--success-color)'
                  }}>
                    {memberCount} / {memberLimit}
                  </span>
                </div>
                
                {/* 成员进度条 */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--bg-hover)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${Math.min(occupancy, 100)}%`,
                    height: '100%',
                    background: isFull 
                      ? 'var(--gradient-danger, linear-gradient(135deg, #ef4444 0%, #dc2626 100%))' 
                      : isMember 
                      ? 'var(--gradient-success)' 
                      : 'var(--gradient-purple)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!isMember && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleJoin(platformId)}
                    disabled={joining === platformId || isFull}
                    style={{ 
                      flex: 1,
                      opacity: isFull ? 0.5 : 1
                    }}
                  >
                    <UserPlus size={18} />
                    {joining === platformId ? t.joining : isFull ? t.full : t.joinPlatform}
                  </button>
                )}
                {isMember && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onSelectPlatform(platformId)}
                    style={{ flex: 1 }}
                  >
                    {t.viewPolls}
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

