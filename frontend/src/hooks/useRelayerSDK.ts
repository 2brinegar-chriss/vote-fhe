import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// 定义全局 Relayer SDK 类型
declare global {
  interface Window {
    [key: string]: any;
  }
  
  interface ImportMeta {
    env: {
      VITE_GATEWAY_URL?: string;
      [key: string]: any;
    };
  }
}

// 智能搜索 SDK
const findSDKGlobal = (): any => {
  const possibleNames = ['RelayerSDK', 'FhevmSDK', 'ZamaSDK', 'fhevmjs', 'fhevm', 'FHEVM'];

  for (const name of possibleNames) {
    const sdk = window[name];
    if (sdk && typeof sdk === 'object' && 
        typeof sdk.initSDK === 'function' && 
        typeof sdk.createInstance === 'function') {
      return sdk;
    }
  }

  for (const key in window) {
    try {
      const obj = window[key];
      if (obj && typeof obj === 'object' && 
          typeof obj.initSDK === 'function' && 
          typeof obj.createInstance === 'function') {
        return obj;
      }
    } catch (e) {
      // 忽略访问错误
    }
  }

  return null;
};

interface FhevmConfig {
  network: any;
  networkUrl?: string;
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

interface Keypair {
  publicKey: string;
  privateKey: string;
}

interface EIP712 {
  domain: any;
  types: any;
  message: any;
}

interface HandleContractPair {
  handle: string;
  contractAddress: string;
}

interface FhevmInstance {
  createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInputBuilder;
  generateKeypair(): Keypair;
  createEIP712(
    publicKey: string,
    contractAddresses: string[],
    startTimeStamp: string,
    durationDays: string
  ): EIP712;
  userDecrypt(
    handleContractPairs: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimeStamp: string,
    durationDays: string
  ): Promise<Record<string, bigint>>;
}

interface EncryptedInputBuilder {
  add32(value: number): EncryptedInputBuilder;
  add64(value: number | bigint): EncryptedInputBuilder;
  addAddress(address: string): EncryptedInputBuilder;
  addBool(value: boolean): EncryptedInputBuilder;
  encrypt(): Promise<{
    handles: string[];
    inputProof: string;
  }>;
}

export function useRelayerSDK(provider: BrowserProvider | null) {
  const [fhevmInstance, setFhevmInstance] = useState<FhevmInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFhevm = async () => {
      if (!provider) return;
      
      const SDK = findSDKGlobal();
      
      if (!SDK) {
        setError('SDK 未找到。请确保已通过 CDN 加载 Relayer SDK。');
        return;
      }

      try {
        // 步骤 1: 初始化 SDK (加载 WASM)
        await SDK.initSDK();

        // 步骤 2: 获取网络信息
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // 步骤 3: 配置网络
        let config: FhevmConfig;

        // 获取 MetaMask provider
        let ethereum = window.ethereum;
        
        if (ethereum && (ethereum as any).providers?.length) {
          ethereum = (ethereum as any).providers.find((p: any) => p.isMetaMask) || ethereum;
        }
        
        if (!ethereum || !(ethereum as any).isMetaMask) {
          throw new Error('请使用 MetaMask 钱包');
        }

        if (chainId === 31337) {
          // 本地 Hardhat 网络配置
          config = {
            network: ethereum,
          };
        } else if (chainId === 11155111) {
          // Sepolia 测试网配置
          const SepoliaConfig = SDK.SepoliaConfig;
          
          if (!SepoliaConfig) {
            throw new Error('SDK 未提供 Sepolia 配置，请检查 SDK 版本');
          }
          
          config = {
            ...SepoliaConfig,
            network: ethereum,
          };
          
          if (!(config as any).gatewayUrl) {
            if (import.meta.env.VITE_GATEWAY_URL) {
              (config as any).gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
            }
          }
        } else {
          throw new Error(`不支持的网络: Chain ID ${chainId}`);
        }

        // 步骤 4: 创建 FHEVM 实例（60秒超时）
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('创建实例超时（60秒）')), 60000);
        });
        
        const instance = await Promise.race([
          SDK.createInstance(config),
          timeoutPromise
        ]);
        
        if (!instance) {
          throw new Error('实例创建失败');
        }
        
        setFhevmInstance(instance);
        setIsInitialized(true);
        setError(null);
      } catch (err: any) {
        setError(err.message || '初始化失败');
        setIsInitialized(false);
      }
    };

    initFhevm();
  }, [provider]);

  const createEncryptedInput = useCallback(
    async (contractAddress: string, userAddress: string, value: number) => {
      if (!fhevmInstance || !isInitialized) {
        throw new Error('FHEVM 实例未初始化');
      }

      try {
        console.log(`🔐 加密输入: 值=${value}`);
        const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
        const encrypted = await input.add32(value).encrypt();
        console.log('✅ 加密成功');
        return encrypted;
      } catch (err: any) {
        console.error('❌ 加密失败:', err);
        throw new Error(err.message || '加密失败');
      }
    },
    [fhevmInstance, isInitialized]
  );

  const decryptValue = useCallback(
    async (handle: string, contractAddress: string, userAddress: string): Promise<bigint> => {
      if (!fhevmInstance || !isInitialized) {
        throw new Error('FHEVM 实例未初始化');
      }

      if (!provider) {
        throw new Error('Provider 未初始化');
      }

      try {
        console.log(`🔓 开始解密...`);
        
        // 步骤 1: 生成密钥对
        const keypair = fhevmInstance.generateKeypair();
        
        // 步骤 2: 准备解密参数
        const handleContractPairs: HandleContractPair[] = [{
          handle: handle,
          contractAddress: contractAddress,
        }];
        
        const startTimeStamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = '10';
        const contractAddresses = [contractAddress];
        
        // 步骤 3: 创建 EIP712 签名请求
        const eip712 = fhevmInstance.createEIP712(
          keypair.publicKey,
          contractAddresses,
          startTimeStamp,
          durationDays
        );
        
        // 步骤 4: 获取 signer 并签名
        const signer = await provider.getSigner();
        const signature = await signer.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );
        
        // 步骤 5: 调用 userDecrypt 解密
        const result = await fhevmInstance.userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature.replace('0x', ''),
          contractAddresses,
          userAddress,
          startTimeStamp,
          durationDays
        );
        
        const decryptedValue = result[handle];
        console.log('✅ 解密成功:', decryptedValue);
        
        return decryptedValue;
      } catch (err: any) {
        console.error('❌ 解密失败:', err);
        throw new Error(err.message || '解密失败');
      }
    },
    [fhevmInstance, isInitialized, provider]
  );

  return {
    fhevmInstance,
    isInitialized,
    error,
    createEncryptedInput,
    decryptValue,
  };
}

