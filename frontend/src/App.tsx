import { useState, useEffect } from 'react';
import { Wallet, Vote, Shield, Building2, Languages } from 'lucide-react';
import './App.css';
import { useWallet } from './hooks/useWallet';
import { useContract, Poll } from './hooks/useContract';
import { useRelayerSDK } from './hooks/useRelayerSDK';
import { useLanguageContext } from './contexts/LanguageContext';
import { PlatformList } from './components/PlatformList';
import { CreatePlatform } from './components/CreatePlatform';
import { CreatePoll } from './components/CreatePoll';
import { PollList } from './components/PollList';
import { VoteModal } from './components/VoteModal';
import { ResultsModal } from './components/ResultsModal';
import { ConfirmModal } from './components/ConfirmModal';

type Tab = 'platforms' | 'polls';

function App() {
  const wallet = useWallet();
  const contract = useContract(wallet.provider, wallet.address);
  const relayerSDK = useRelayerSDK(wallet.provider);
  const { language, toggleLanguage, t } = useLanguageContext();
  
  const [activeTab, setActiveTab] = useState<Tab>('platforms');
  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [votingPoll, setVotingPoll] = useState<{ poll: Poll; index: number } | null>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [resultsModal, setResultsModal] = useState<{
    poll: Poll;
    results: { option: string; count: bigint }[];
    isDecrypted: boolean;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    pollIndex: number;
  } | null>(null);

  // 获取合约地址
  useEffect(() => {
    // Sepolia 测试网合约地址
    const address = '0x05A99E0875cEB6F1cD8Aa7497a7866BdE257d2C9';
    setContractAddress(address);
  }, []);

  const refresh = () => setRefreshKey(prev => prev + 1);

  const handleSelectPlatform = (platformId: number) => {
    setSelectedPlatformId(platformId);
    setActiveTab('polls');
  };

  const handleVote = async (pollIndex: number) => {
    if (selectedPlatformId === null) return;
    try {
      const poll = await contract.getPoll(selectedPlatformId, pollIndex);
      setVotingPoll({ poll, index: pollIndex });
    } catch (error) {
      console.error('获取投票信息失败:', error);
    }
  };

  const handleFinalizePoll = (pollIndex: number) => {
    setConfirmModal({ pollIndex });
  };

  const confirmFinalizePoll = async () => {
    if (selectedPlatformId === null || confirmModal === null) return;
    
    try {
      await contract.finalizePoll(selectedPlatformId, confirmModal.pollIndex);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('❌ 结束投票失败:', error);
    }
  };

  const handleViewResults = async (pollIndex: number) => {
    if (selectedPlatformId === null) return;
    try {
      const counts = await contract.getEncryptedCounts(selectedPlatformId, pollIndex);
      const poll = await contract.getPoll(selectedPlatformId, pollIndex);
      
      let results: { option: string; count: bigint }[] = [];
      let isDecrypted = false;
      
      // 尝试使用 Relayer SDK 解密
      if (relayerSDK.isInitialized && contractAddress && wallet.address) {
        try {
          console.log('🔓 开始解密投票结果...');
          const decryptedCounts = await Promise.all(
            counts.map((handle: string) => 
              relayerSDK.decryptValue(handle, contractAddress, wallet.address!)
            )
          );
          console.log('✅ 解密成功:', decryptedCounts);
          
          results = poll.options.map((opt: string, i: number) => ({
            option: opt,
            count: decryptedCounts[i]
          }));
          isDecrypted = true;
        } catch (decryptError) {
          console.error('❌ 解密失败:', decryptError);
          results = poll.options.map((opt: string) => ({
            option: opt,
            count: BigInt(0)
          }));
        }
      } else {
        results = poll.options.map((opt: string) => ({
          option: opt,
          count: BigInt(0)
        }));
      }
      
      setResultsModal({ poll, results, isDecrypted });
    } catch (error: any) {
      console.error('❌ 获取投票结果失败:', error);
    }
  };

  if (!wallet.address) {
    return (
      <div className="app">
        <div className="header">
          <div className="header-content">
            <div className="logo">
              <Vote className="logo-icon" size={32} />
              <span>{t.appName}</span>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={toggleLanguage}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Languages size={18} />
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
        <div className="main-content" style={{ 
          textAlign: 'center', 
          paddingTop: '4rem',
          paddingBottom: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)'
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }} className="animate-fade-in">
            {/* Hero Icon */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 2rem',
              background: 'var(--gradient-purple)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              animation: 'pulse 3s ease-in-out infinite'
            }}>
              <Shield size={60} color="white" />
            </div>
            
            {/* Title */}
            <h1 style={{ 
              marginBottom: '1.25rem',
              fontSize: '3rem',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              {t.welcomeTitle}{' '}
              <span className="gradient-text">{t.appName}</span>
            </h1>
            
            {/* Subtitle */}
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '1.5rem',
              fontSize: '1.125rem',
              lineHeight: '1.7'
            }}>
              {t.welcomeSubtitle}
            </p>
            
            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '3rem',
              textAlign: 'left'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-normal)'
              }}>
                <Shield size={28} color="var(--primary-color)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                  {t.featureEncryption}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t.featureEncryptionDesc}
                </div>
              </div>
              
              <div style={{
                padding: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <Vote size={28} color="var(--success-color)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                  {t.featurePrivacy}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t.featurePrivacyDesc}
                </div>
              </div>
              
              <div style={{
                padding: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <Wallet size={28} color="var(--warning-color)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
                  {t.featureDecentralized}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t.featureDecentralizedDesc}
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {wallet.error && (
              <div className="error" style={{ marginBottom: '1.5rem' }}>
                {wallet.error}
              </div>
            )}
            
            {/* Connect Button */}
            <button
              className="btn btn-primary"
              onClick={wallet.connectWallet}
              disabled={wallet.isConnecting}
              style={{ 
                fontSize: '1.125rem',
                padding: '1.125rem 2.5rem',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Wallet size={22} />
              {wallet.isConnecting ? t.connecting : t.connectWallet}
            </button>
            
            {/* Footer Note */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'var(--info-light)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--info-color)'
            }}>
              {t.welcomeNote}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const networkName = wallet.chainId === 31337 ? 'Localhost' : 
                       wallet.chainId === 11155111 ? 'Sepolia' : 
                       `Chain ${wallet.chainId}`;

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <Vote className="logo-icon" size={32} />
            <span>{t.appName}</span>
          </div>
          <div className="wallet-section">
            <div className="wallet-info">
              <div className="wallet-address">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <div className="network-badge">{networkName}</div>
                {relayerSDK.isInitialized ? (
                  <div className="network-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
                    <Shield size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {t.fheReady}
                  </div>
                ) : (
                  <div className="network-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
                    {t.fheInitializing}
                  </div>
                )}
              </div>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={toggleLanguage}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.75rem' }}
            >
              <Languages size={18} />
              {language === 'zh' ? 'EN' : '中文'}
            </button>
            <button className="btn btn-secondary" onClick={wallet.disconnectWallet}>
              {t.disconnect}
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveTab('platforms')}
          >
            {t.platformManagement}
          </button>
          <button
            className={`tab ${activeTab === 'polls' ? 'active' : ''}`}
            onClick={() => setActiveTab('polls')}
            disabled={!selectedPlatformId}
          >
            {t.pollManagement}
            {selectedPlatformId && ` (${language === 'zh' ? '平台' : 'Platform'} #${selectedPlatformId})`}
          </button>
        </div>

        {contract.error && (
          <div className="error">{contract.error}</div>
        )}
        
        {relayerSDK.error && (
          <div className="error">
            <strong>{t.errorRelayerSDK}</strong> {relayerSDK.error}
            <br />
            <small>{t.errorRelayerSDKNote}</small>
          </div>
        )}

        {activeTab === 'platforms' && (
          <>
            <CreatePlatform
              createPlatform={contract.createPlatform}
              onSuccess={refresh}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '3rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid var(--border-color)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={16} color="white" />
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {t.allPlatforms}
              </h2>
            </div>
            <PlatformList
              key={refreshKey}
              getAllPlatforms={contract.getAllPlatforms}
              joinPlatform={contract.joinPlatform}
              isPlatformMember={contract.isPlatformMember}
              userAddress={wallet.address}
              onSelectPlatform={handleSelectPlatform}
              isContractReady={contract.isReady}
            />
          </>
        )}

        {activeTab === 'polls' && selectedPlatformId && (
          <>
            <CreatePoll
              platformId={selectedPlatformId}
              createPoll={contract.createPoll}
              onSuccess={refresh}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '3rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid var(--border-color)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Vote size={16} color="white" />
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {t.pollList}
              </h2>
            </div>
            <PollList
              key={refreshKey}
              platformId={selectedPlatformId}
              getPoll={contract.getPoll}
              hasUserVoted={contract.hasUserVoted}
              userAddress={wallet.address}
              onVote={handleVote}
              onViewResults={handleViewResults}
              onFinalize={handleFinalizePoll}
            />
          </>
        )}
      </div>

      {votingPoll && selectedPlatformId !== null && wallet.address && (
        <VoteModal
          platformId={selectedPlatformId}
          poll={votingPoll.poll}
          pollIndex={votingPoll.index}
          contractAddress={contractAddress}
          userAddress={wallet.address}
          createEncryptedInput={relayerSDK.createEncryptedInput}
          isRelayerReady={relayerSDK.isInitialized}
          onVote={contract.vote}
          onClose={() => {
            setVotingPoll(null);
            refresh();
          }}
        />
      )}

      <ResultsModal
        isOpen={resultsModal !== null}
        onClose={() => setResultsModal(null)}
        poll={resultsModal?.poll ? { question: resultsModal.poll.title, options: resultsModal.poll.options } : { question: '', options: [] }}
        results={resultsModal?.results || []}
        isDecrypted={resultsModal?.isDecrypted || false}
      />

      <ConfirmModal
        isOpen={confirmModal !== null}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmFinalizePoll}
        title={t.confirmFinalize}
        message={t.confirmFinalizeMessage}
        confirmText={t.confirm}
        cancelText={t.cancel}
        type="warning"
      />
    </div>
  );
}

export default App;

