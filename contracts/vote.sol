// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PlatformVoting - 使用 Zama FHEVM 的加密平台投票系统
/// @notice 支持创建平台、加入成员和运行加密选项投票
contract PlatformVoting is SepoliaConfig {
    struct Platform {
        string name;
        uint256 memberLimit;
        address[] members;
        mapping(address => bool) isMember;
        uint256 nextPollId;
        mapping(uint256 => Poll) polls;
    }

    struct Poll {
        string title;
        string[] options;
        // Encrypted vote counts per option
        euint32[] counts;
        uint256 totalVoted;
        uint256 memberCountSnapshot;
        bool finalized;
        mapping(address => bool) hasVoted;
    }

    uint256 public nextPlatformId;
    mapping(uint256 => Platform) private platforms;
    uint256[] private platformIds;

    event PlatformCreated(uint256 indexed platformId, string name, uint256 memberLimit);
    event JoinedPlatform(uint256 indexed platformId, address indexed account);
    event PollCreated(uint256 indexed platformId, uint256 indexed pollId, string title, string[] options);
    event Voted(uint256 indexed platformId, uint256 indexed pollId, address indexed voter, uint256 optionIndex);
    event Finalized(uint256 indexed platformId, uint256 indexed pollId);

    /// @notice 创建新平台
    function createPlatform(string calldata name, uint256 memberLimit) external returns (uint256 platformId) {
        require(bytes(name).length > 0, "Invalid name");
        require(memberLimit > 0, "Invalid member limit");

        platformId = ++nextPlatformId;
        Platform storage p = platforms[platformId];
        p.name = name;
        p.memberLimit = memberLimit;
        platformIds.push(platformId);
        emit PlatformCreated(platformId, name, memberLimit);
    }

    /// @notice 加入平台
    function joinPlatform(uint256 platformId) external {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(!p.isMember[msg.sender], "Already a member");
        require(p.members.length < p.memberLimit, "Platform is full");

        p.isMember[msg.sender] = true;
        p.members.push(msg.sender);
        emit JoinedPlatform(platformId, msg.sender);
    }

    /// @notice 在平台中创建新投票
    function createPoll(
        uint256 platformId,
        string calldata title,
        string[] calldata options
    ) external returns (uint256 pollId) {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(p.isMember[msg.sender], "Only member");
        require(bytes(title).length > 0, "Invalid title");
        require(options.length >= 2, "At least 2 options");

        pollId = p.nextPollId++;
        Poll storage poll = p.polls[pollId];
        poll.title = title;
        poll.memberCountSnapshot = p.members.length;

        // 初始化选项和加密计数
        for (uint256 i = 0; i < options.length; i++) {
            poll.options.push(options[i]);
            // 初始化为加密的零
            euint32 zero = FHE.asEuint32(0);
            poll.counts.push(zero);
            FHE.allowThis(zero);
        }

        emit PollCreated(platformId, pollId, title, options);
    }

    /// @notice 通过将所选选项的加密计数增加1来投票
    /// @param platformId 平台ID
    /// @param pollId 投票ID
    /// @param optionIndex 要投票的选项索引
    /// @param oneEncrypted 外部加密的euint32值，表示1
    /// @param inputProof Zama输入证明
    function vote(
        uint256 platformId,
        uint256 pollId,
        uint256 optionIndex,
        externalEuint32 oneEncrypted,
        bytes calldata inputProof
    ) external {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(p.isMember[msg.sender], "Only member");
        require(pollId < p.nextPollId, "Poll not found");

        Poll storage poll = p.polls[pollId];
        require(!poll.finalized, "Poll finalized");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(optionIndex < poll.options.length, "Invalid option");

        euint32 one = FHE.fromExternal(oneEncrypted, inputProof);
        poll.counts[optionIndex] = FHE.add(poll.counts[optionIndex], one);

        // 刷新ACL以使合约能够返回密文句柄
        FHE.allowThis(poll.counts[optionIndex]);

        poll.hasVoted[msg.sender] = true;
        poll.totalVoted += 1;
        emit Voted(platformId, pollId, msg.sender, optionIndex);
    }

    /// @notice 在所有成员投票后结束投票；允许所有成员解密计数
    function finalize(uint256 platformId, uint256 pollId) external {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(pollId < p.nextPollId, "Poll not found");

        Poll storage poll = p.polls[pollId];
        require(!poll.finalized, "Already finalized");
        require(poll.totalVoted == poll.memberCountSnapshot, "Not all voted");

        // 允许每个成员解密最终计数
        for (uint256 i = 0; i < poll.counts.length; i++) {
            for (uint256 j = 0; j < p.members.length; j++) {
                FHE.allow(poll.counts[i], p.members[j]);
            }
        }

        poll.finalized = true;
        emit Finalized(platformId, pollId);
    }

    // ------------------------
    // 视图函数
    // ------------------------

    function getPlatform(uint256 platformId)
        external
        view
        returns (string memory name, uint256 memberLimit, uint256 memberCount)
    {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        return (p.name, p.memberLimit, p.members.length);
    }

    function getPlatformMembers(uint256 platformId) external view returns (address[] memory) {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        return p.members;
    }

    function isPlatformMember(uint256 platformId, address account) external view returns (bool) {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        return p.isMember[account];
    }

    function getPoll(uint256 platformId, uint256 pollId)
        external
        view
        returns (
            string memory title,
            string[] memory options,
            uint256 totalVoted,
            uint256 memberCountSnapshot,
            bool finalized
        )
    {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(pollId < p.nextPollId, "Poll not found");
        Poll storage poll = p.polls[pollId];
        return (poll.title, poll.options, poll.totalVoted, poll.memberCountSnapshot, poll.finalized);
    }

    function hasUserVoted(uint256 platformId, uint256 pollId, address user) external view returns (bool) {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(pollId < p.nextPollId, "Poll not found");
        return p.polls[pollId].hasVoted[user];
    }

    /// @notice 获取每个选项的加密计数。仅在结束后可用。
    function getEncryptedCounts(uint256 platformId, uint256 pollId) external view returns (euint32[] memory) {
        Platform storage p = platforms[platformId];
        require(bytes(p.name).length != 0, "Platform not found");
        require(pollId < p.nextPollId, "Poll not found");
        Poll storage poll = p.polls[pollId];
        require(poll.finalized, "Not finalized");

        euint32[] memory out = new euint32[](poll.counts.length);
        for (uint256 i = 0; i < poll.counts.length; i++) {
            out[i] = poll.counts[i];
        }
        return out;
    }

    /// @notice 返回所有平台的基本信息，用于发现和加入界面
    function getAllPlatforms()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            uint256[] memory limits,
            uint256[] memory memberCounts
        )
    {
        uint256 n = platformIds.length;
        ids = new uint256[](n);
        names = new string[](n);
        limits = new uint256[](n);
        memberCounts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            uint256 pid = platformIds[i];
            Platform storage p = platforms[pid];
            ids[i] = pid;
            names[i] = p.name;
            limits[i] = p.memberLimit;
            memberCounts[i] = p.members.length;
        }
    }
}