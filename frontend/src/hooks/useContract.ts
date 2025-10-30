import { useState, useEffect, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import PlatformVotingArtifact from '../PlatformVoting.json';

// Sepolia 测试网合约地址
const CONTRACT_ADDRESS = '0x05A99E0875cEB6F1cD8Aa7497a7866BdE257d2C9';

export interface Platform {
  id: bigint;
  name: string;
  memberLimit: bigint;
  memberCount: bigint;
}

export interface Poll {
  title: string;
  options: string[];
  totalVoted: bigint;
  finalized: boolean;
  memberCountSnapshot: bigint;
}

export function useContract(provider: BrowserProvider | null, address: string | null) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (provider && address) {
      const initContract = async () => {
        try {
          const signer = await provider.getSigner();
          const platformContract = new Contract(
            CONTRACT_ADDRESS,
            PlatformVotingArtifact.abi,
            signer
          );
          
          setContract(platformContract);
          setIsReady(true);
        } catch (err: any) {
          setError(err.message);
          setIsReady(false);
        }
      };
      initContract();
    } else {
      setContract(null);
      setIsReady(false);
    }
  }, [provider, address]);

  const createPlatform = useCallback(async (name: string, memberLimit: number) => {
    if (!contract) throw new Error('合约未初始化');
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.createPlatform(name, memberLimit);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const message = err.reason || err.message || '创建平台失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const joinPlatform = useCallback(async (platformId: number) => {
    if (!contract) throw new Error('合约未初始化');
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.joinPlatform(platformId);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const message = err.reason || err.message || '加入平台失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getAllPlatforms = useCallback(async (): Promise<Platform[]> => {
    if (!contract) throw new Error('合约未初始化');
    setLoading(true);
    setError(null);
    try {
      const result = await contract.getAllPlatforms();
      const platforms: Platform[] = result.ids.map((id: bigint, index: number) => ({
        id,
        name: result.names[index],
        memberLimit: result.limits[index],
        memberCount: result.memberCounts[index],
      }));
      return platforms;
    } catch (err: any) {
      const message = err.reason || err.message || '获取平台列表失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getPlatform = useCallback(async (platformId: number): Promise<any> => {
    if (!contract) throw new Error('合约未初始化');
    try {
      const platform = await contract.getPlatform(platformId);
      return platform;
    } catch (err: any) {
      const message = err.reason || err.message || '获取平台信息失败';
      throw new Error(message);
    }
  }, [contract]);

  const isPlatformMember = useCallback(async (platformId: number, address: string): Promise<boolean> => {
    if (!contract) throw new Error('合约未初始化');
    try {
      return await contract.isPlatformMember(platformId, address);
    } catch (err: any) {
      return false;
    }
  }, [contract]);

  const createPoll = useCallback(async (platformId: number, title: string, options: string[]) => {
    if (!contract) throw new Error('合约未初始化');
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.createPoll(platformId, title, options);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const message = err.reason || err.message || '创建投票失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const vote = useCallback(async (
    platformId: number,
    pollIndex: number,
    choice: number,
    encryptedValue: string,
    proof: string
  ) => {
    if (!contract) throw new Error('合约未初始化');
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.vote(platformId, pollIndex, choice, encryptedValue, proof);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const message = err.reason || err.message || '投票失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getPoll = useCallback(async (platformId: number, pollIndex: number): Promise<Poll> => {
    if (!contract) throw new Error('合约未初始化');
    try {
      const result = await contract.getPoll(platformId, pollIndex);
      // 合约返回的是元组: [title, options, totalVoted, memberCountSnapshot, finalized]
      return {
        title: result[0],
        options: result[1],
        totalVoted: result[2],
        finalized: result[4],
        memberCountSnapshot: result[3],
      };
    } catch (err: any) {
      const message = err.reason || err.message || '获取投票信息失败';
      throw new Error(message);
    }
  }, [contract]);

  const hasUserVoted = useCallback(async (
    platformId: number,
    pollIndex: number,
    userAddress: string
  ): Promise<boolean> => {
    if (!contract) throw new Error('合约未初始化');
    try {
      return await contract.hasUserVoted(platformId, pollIndex, userAddress);
    } catch (err: any) {
      return false;
    }
  }, [contract]);

  const finalizePoll = useCallback(async (platformId: number, pollIndex: number) => {
    if (!contract) throw new Error('合约未初始化');
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.finalize(platformId, pollIndex);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const message = err.reason || err.message || '结束投票失败';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getEncryptedCounts = useCallback(async (platformId: number, pollIndex: number) => {
    if (!contract) throw new Error('合约未初始化');
    try {
      return await contract.getEncryptedCounts(platformId, pollIndex);
    } catch (err: any) {
      const message = err.reason || err.message || '获取加密计数失败';
      throw new Error(message);
    }
  }, [contract]);

  return {
    contract,
    loading,
    error,
    isReady,
    createPlatform,
    joinPlatform,
    getAllPlatforms,
    getPlatform,
    isPlatformMember,
    createPoll,
    vote,
    getPoll,
    hasUserVoted,
    finalizePoll,
    getEncryptedCounts,
  };
}

