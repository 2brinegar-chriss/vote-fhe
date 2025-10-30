// 国际化翻译配置

export type Language = 'zh' | 'en';

export interface Translations {
  // Header
  appName: string;
  disconnect: string;
  connectWallet: string;
  connecting: string;
  
  // Wallet Info
  fheReady: string;
  fheInitializing: string;
  
  // Tabs
  platformManagement: string;
  pollManagement: string;
  
  // Platform
  createPlatform: string;
  platformName: string;
  memberLimit: string;
  allPlatforms: string;
  joinPlatform: string;
  joined: string;
  full: string;
  members: string;
  
  // Poll
  createPoll: string;
  pollTitle: string;
  addOption: string;
  pollList: string;
  vote: string;
  voted: string;
  viewResults: string;
  finalizePoll: string;
  finalized: string;
  
  // Modal
  close: string;
  confirm: string;
  cancel: string;
  submit: string;
  
  // Vote Modal
  castVote: string;
  selectOption: string;
  
  // Results Modal
  pollResults: string;
  decrypted: string;
  encrypted: string;
  votes: string;
  
  // Confirm Modal
  confirmFinalize: string;
  confirmFinalizeMessage: string;
  
  // Welcome Page
  welcomeTitle: string;
  welcomeSubtitle: string;
  featureEncryption: string;
  featureEncryptionDesc: string;
  featurePrivacy: string;
  featurePrivacyDesc: string;
  featureDecentralized: string;
  featureDecentralizedDesc: string;
  welcomeNote: string;
  
  // Errors
  errorRelayerSDK: string;
  errorRelayerSDKNote: string;
  
  // Messages
  creating: string;
  submitting: string;
  voting: string;
  finalizing: string;
  loading: string;
  
  // Form validation
  pleaseEnter: string;
  pleaseSelect: string;
  atLeastOptions: string;
  
  // Components - CreatePlatform
  platformNamePlaceholder: string;
  memberLimitPlaceholder: string;
  errorEnterPlatformName: string;
  errorMemberLimitPositive: string;
  
  // Components - PlatformList
  loadingPlatforms: string;
  noPlatforms: string;
  noPlatformsDesc: string;
  platformId: string;
  memberCount: string;
  joining: string;
  viewPolls: string;
  
  // Components - CreatePoll
  pollTitlePlaceholder: string;
  pollOptions: string;
  optionPlaceholder: string;
  deleteOption: string;
  errorEnterPollTitle: string;
  errorAtLeastTwoOptions: string;
  
  // Components - PollList
  loadingPolls: string;
  noPolls: string;
  noPollsDesc: string;
  inProgress: string;
  participation: string;
  voteNow: string;
  endPoll: string;
}

export const translations: Record<Language, Translations> = {
  zh: {
    // Header
    appName: 'PlatformVoting',
    disconnect: '断开连接',
    connectWallet: '连接 MetaMask 钱包',
    connecting: '连接中...',
    
    // Wallet Info
    fheReady: 'FHE 已就绪',
    fheInitializing: 'FHE 初始化中...',
    
    // Tabs
    platformManagement: '平台管理',
    pollManagement: '投票管理',
    
    // Platform
    createPlatform: '创建新平台',
    platformName: '平台名称',
    memberLimit: '成员上限',
    allPlatforms: '所有平台',
    joinPlatform: '加入平台',
    joined: '已加入',
    full: '已满',
    members: '成员',
    
    // Poll
    createPoll: '创建新投票',
    pollTitle: '投票标题',
    addOption: '添加选项',
    pollList: '投票列表',
    vote: '投票',
    voted: '已投票',
    viewResults: '查看结果',
    finalizePoll: '结束投票',
    finalized: '已结束',
    
    // Modal
    close: '关闭',
    confirm: '确定',
    cancel: '取消',
    submit: '提交',
    
    // Vote Modal
    castVote: '投票',
    selectOption: '选择选项',
    
    // Results Modal
    pollResults: '投票结果',
    decrypted: '已解密',
    encrypted: '加密中',
    votes: '票',
    
    // Confirm Modal
    confirmFinalize: '确认结束投票',
    confirmFinalizeMessage: '确定要结束这个投票吗？结束后将无法继续投票，但可以查看解密后的结果。',
    
    // Welcome Page
    welcomeTitle: '欢迎来到',
    welcomeSubtitle: '基于 FHE (全同态加密) 技术的隐私保护投票平台',
    featureEncryption: '完全加密',
    featureEncryptionDesc: '投票数据链上加密存储',
    featurePrivacy: '隐私保护',
    featurePrivacyDesc: '投票内容无人可见',
    featureDecentralized: '去中心化',
    featureDecentralizedDesc: '基于区块链技术',
    welcomeNote: '💡 请确保已安装 MetaMask 扩展并连接到 Sepolia 测试网',
    
    // Errors
    errorRelayerSDK: 'Relayer SDK 错误:',
    errorRelayerSDKNote: '提示: 本地开发环境可能不支持 Relayer SDK，投票功能可能受限。',
    
    // Messages
    creating: '创建中...',
    submitting: '提交中...',
    voting: '投票中...',
    finalizing: '结束中...',
    loading: '加载中...',
    
    // Form validation
    pleaseEnter: '请输入',
    pleaseSelect: '请选择',
    atLeastOptions: '至少需要 2 个选项',
    
    // Components - CreatePlatform
    platformNamePlaceholder: '例如：技术社区DAO',
    memberLimitPlaceholder: '100',
    errorEnterPlatformName: '请输入平台名称',
    errorMemberLimitPositive: '成员限制必须大于 0',
    
    // Components - PlatformList
    loadingPlatforms: '加载中...',
    noPlatforms: '暂无平台',
    noPlatformsDesc: '创建第一个投票平台吧！',
    platformId: '平台',
    memberCount: '成员数量',
    joining: '加入中...',
    viewPolls: '查看投票',
    
    // Components - CreatePoll
    pollTitlePlaceholder: '例如：2024年度预算提案',
    pollOptions: '投票选项',
    optionPlaceholder: '选项',
    deleteOption: '删除选项',
    errorEnterPollTitle: '请输入投票标题',
    errorAtLeastTwoOptions: '至少需要两个选项',
    
    // Components - PollList
    loadingPolls: '加载投票中...',
    noPolls: '暂无投票',
    noPollsDesc: '创建第一个投票吧！',
    inProgress: '进行中',
    participation: '参与率',
    voteNow: '立即投票',
    endPoll: '结束投票',
  },
  
  en: {
    // Header
    appName: 'PlatformVoting',
    disconnect: 'Disconnect',
    connectWallet: 'Connect MetaMask Wallet',
    connecting: 'Connecting...',
    
    // Wallet Info
    fheReady: 'FHE Ready',
    fheInitializing: 'FHE Initializing...',
    
    // Tabs
    platformManagement: 'Platform Management',
    pollManagement: 'Poll Management',
    
    // Platform
    createPlatform: 'Create New Platform',
    platformName: 'Platform Name',
    memberLimit: 'Member Limit',
    allPlatforms: 'All Platforms',
    joinPlatform: 'Join Platform',
    joined: 'Joined',
    full: 'Full',
    members: 'Members',
    
    // Poll
    createPoll: 'Create New Poll',
    pollTitle: 'Poll Title',
    addOption: 'Add Option',
    pollList: 'Poll List',
    vote: 'Vote',
    voted: 'Voted',
    viewResults: 'View Results',
    finalizePoll: 'Finalize Poll',
    finalized: 'Finalized',
    
    // Modal
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    submit: 'Submit',
    
    // Vote Modal
    castVote: 'Cast Your Vote',
    selectOption: 'Select Option',
    
    // Results Modal
    pollResults: 'Poll Results',
    decrypted: 'Decrypted',
    encrypted: 'Encrypted',
    votes: 'votes',
    
    // Confirm Modal
    confirmFinalize: 'Confirm Finalize Poll',
    confirmFinalizeMessage: 'Are you sure you want to finalize this poll? Once finalized, no more votes can be cast, but results can be decrypted.',
    
    // Welcome Page
    welcomeTitle: 'Welcome to',
    welcomeSubtitle: 'Privacy-Preserving Voting Platform powered by FHE (Fully Homomorphic Encryption)',
    featureEncryption: 'Full Encryption',
    featureEncryptionDesc: 'Encrypted on-chain storage',
    featurePrivacy: 'Privacy Protected',
    featurePrivacyDesc: 'Votes remain private',
    featureDecentralized: 'Decentralized',
    featureDecentralizedDesc: 'Built on blockchain',
    welcomeNote: '💡 Please ensure MetaMask is installed and connected to Sepolia testnet',
    
    // Errors
    errorRelayerSDK: 'Relayer SDK Error:',
    errorRelayerSDKNote: 'Note: Local development environment may not support Relayer SDK, voting functionality may be limited.',
    
    // Messages
    creating: 'Creating...',
    submitting: 'Submitting...',
    voting: 'Voting...',
    finalizing: 'Finalizing...',
    loading: 'Loading...',
    
    // Form validation
    pleaseEnter: 'Please enter',
    pleaseSelect: 'Please select',
    atLeastOptions: 'At least 2 options required',
    
    // Components - CreatePlatform
    platformNamePlaceholder: 'e.g., Tech Community DAO',
    memberLimitPlaceholder: '100',
    errorEnterPlatformName: 'Please enter platform name',
    errorMemberLimitPositive: 'Member limit must be greater than 0',
    
    // Components - PlatformList
    loadingPlatforms: 'Loading...',
    noPlatforms: 'No Platforms',
    noPlatformsDesc: 'Create your first voting platform!',
    platformId: 'Platform',
    memberCount: 'Member Count',
    joining: 'Joining...',
    viewPolls: 'View Polls',
    
    // Components - CreatePoll
    pollTitlePlaceholder: 'e.g., 2024 Annual Budget Proposal',
    pollOptions: 'Poll Options',
    optionPlaceholder: 'Option',
    deleteOption: 'Delete Option',
    errorEnterPollTitle: 'Please enter poll title',
    errorAtLeastTwoOptions: 'At least two options required',
    
    // Components - PollList
    loadingPolls: 'Loading polls...',
    noPolls: 'No Polls',
    noPollsDesc: 'Create your first poll!',
    inProgress: 'In Progress',
    participation: 'Participation',
    voteNow: 'Vote Now',
    endPoll: 'End Poll',
  },
};

