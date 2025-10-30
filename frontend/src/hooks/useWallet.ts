import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Eip1193Provider } from 'ethers';

export interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    provider: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: '请安装 MetaMask 钱包',
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // 明确使用 MetaMask provider
      let ethereum = window.ethereum as any;
      
      // 如果有多个钱包扩展，明确选择 MetaMask
      if (ethereum.providers?.length) {
        ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
      }
      
      // 验证是否为 MetaMask
      if (!ethereum.isMetaMask) {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: '请使用 MetaMask 钱包',
        }));
        return;
      }
      
      const provider = new BrowserProvider(ethereum as Eip1193Provider);
      
      await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletState({
        address,
        provider,
        chainId: Number(network.chainId),
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || '连接钱包失败',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      provider: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const ethereum = window.ethereum as Eip1193Provider & {
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  };
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      providers?: Array<Eip1193Provider & { isMetaMask?: boolean }>;
    };
  }
}

