import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("platform:interact")
  .setDescription("Interact with the PlatformVoting contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    console.log("\n🚀 开始测试 PlatformVoting 合约...\n");

    // Check if running in mock mode
    if (!fhevm.isMock) {
      console.warn("⚠️  警告: 此任务需要在 FHEVM mock 环境下运行");
      console.log("请确保使用本地 Hardhat 网络");
      return;
    }

    // 1. 获取账户
    console.log("📋 步骤 1: 获取测试账户");
    const [deployer, alice, bob, charlie] = await ethers.getSigners();
    console.log("  部署者:", deployer.address);
    console.log("  Alice:", alice.address);
    console.log("  Bob:", bob.address);
    console.log("  Charlie:", charlie.address);

    // 2. 部署合约
    console.log("\n📋 步骤 2: 部署合约");
    const PlatformVoting = await ethers.getContractFactory("PlatformVoting");
    const platform = await PlatformVoting.deploy();
    await platform.waitForDeployment();
    const contractAddress = await platform.getAddress();
    console.log("  合约地址:", contractAddress);

    // 3. 创建平台
    console.log("\n📋 步骤 3: 创建平台");
    let tx = await platform.connect(alice).createPlatform("技术社区DAO", 100);
    await tx.wait();
    console.log("  ✅ Alice 创建了平台 '技术社区DAO'");

    const platformInfo = await platform.getPlatform(1);
    console.log("  平台名称:", platformInfo.name);
    console.log("  成员限制:", platformInfo.memberLimit.toString());
    console.log("  当前成员:", platformInfo.memberCount.toString());

    // 4. 成员加入平台
    console.log("\n📋 步骤 4: 成员加入平台");
    tx = await platform.connect(alice).joinPlatform(1);
    await tx.wait();
    console.log("  ✅ Alice 加入平台");

    tx = await platform.connect(bob).joinPlatform(1);
    await tx.wait();
    console.log("  ✅ Bob 加入平台");

    tx = await platform.connect(charlie).joinPlatform(1);
    await tx.wait();
    console.log("  ✅ Charlie 加入平台");

    const info = await platform.getPlatform(1);
    console.log("  当前成员数:", info.memberCount.toString());

    // 5. 获取所有平台
    console.log("\n📋 步骤 5: 查看所有平台");
    const allPlatforms = await platform.getAllPlatforms();
    console.log("  平台总数:", allPlatforms.ids.length);
    for (let i = 0; i < allPlatforms.ids.length; i++) {
      console.log(`  平台 ${allPlatforms.ids[i]}: ${allPlatforms.names[i]} (${allPlatforms.memberCounts[i]}/${allPlatforms.limits[i]} 成员)`);
    }

    // 6. 创建投票
    console.log("\n📋 步骤 6: 创建投票");
    const options = ["提案A: 增加预算", "提案B: 保持现状", "提案C: 减少预算"];
    tx = await platform.connect(alice).createPoll(1, "2024年度预算提案", options);
    await tx.wait();
    console.log("  ✅ 投票创建成功");

    const pollInfo = await platform.getPoll(1, 0);
    console.log("  投票标题:", pollInfo.title);
    console.log("  选项:", pollInfo.options);
    console.log("  成员快照:", pollInfo.memberCountSnapshot.toString());

    // 7. 进行加密投票
    console.log("\n📋 步骤 7: 成员进行加密投票");
    
    // Alice 投票给选项 0 (提案A)
    console.log("  Alice 正在投票...");
    let choice = 0;
    let encryptedOne = await fhevm
      .createEncryptedInput(contractAddress, alice.address)
      .add32(1)
      .encrypt();
    tx = await platform.connect(alice).vote(1, 0, choice, encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();
    console.log("  ✅ Alice 投票成功 (选择: 提案A)");

    // Bob 投票给选项 1 (提案B)
    console.log("  Bob 正在投票...");
    choice = 1;
    encryptedOne = await fhevm
      .createEncryptedInput(contractAddress, bob.address)
      .add32(1)
      .encrypt();
    tx = await platform.connect(bob).vote(1, 0, choice, encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();
    console.log("  ✅ Bob 投票成功 (选择: 提案B)");

    // Charlie 投票给选项 0 (提案A)
    console.log("  Charlie 正在投票...");
    choice = 0;
    encryptedOne = await fhevm
      .createEncryptedInput(contractAddress, charlie.address)
      .add32(1)
      .encrypt();
    tx = await platform.connect(charlie).vote(1, 0, choice, encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();
    console.log("  ✅ Charlie 投票成功 (选择: 提案A)");

    // 8. 查看投票状态
    console.log("\n📋 步骤 8: 查看投票状态");
    const pollStatus = await platform.getPoll(1, 0);
    console.log("  已投票数:", pollStatus.totalVoted.toString());
    console.log("  是否结束:", pollStatus.finalized);

    const aliceVoted = await platform.hasUserVoted(1, 0, alice.address);
    const bobVoted = await platform.hasUserVoted(1, 0, bob.address);
    console.log("  Alice 已投票:", aliceVoted);
    console.log("  Bob 已投票:", bobVoted);

    // 9. 结束投票
    console.log("\n📋 步骤 9: 结束投票");
    tx = await platform.connect(alice).finalize(1, 0);
    await tx.wait();
    console.log("  ✅ 投票已结束，所有成员可查看结果");

    // 10. 解密并查看投票结果
    console.log("\n📋 步骤 10: 解密并查看投票结果");
    const encryptedCounts = await platform.getEncryptedCounts(1, 0);
    console.log("  获取到 " + encryptedCounts.length + " 个选项的加密计数");

    // 解密每个选项的票数
    const count0 = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[0],
      contractAddress,
      alice
    );
    const count1 = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[1],
      contractAddress,
      alice
    );
    const count2 = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCounts[2],
      contractAddress,
      alice
    );

    console.log("\n" + "=".repeat(60));
    console.log("📊 最终投票结果:");
    console.log("=".repeat(60));
    console.log(`  ${options[0]}: ${count0} 票`);
    console.log(`  ${options[1]}: ${count1} 票`);
    console.log(`  ${options[2]}: ${count2} 票`);
    console.log("=".repeat(60));

    // 11. 创建第二个平台和投票（展示多平台功能）
    console.log("\n📋 步骤 11: 创建第二个平台");
    tx = await platform.connect(bob).createPlatform("开发者社区", 50);
    await tx.wait();
    console.log("  ✅ Bob 创建了平台 '开发者社区'");

    // 查看所有平台
    const allPlatforms2 = await platform.getAllPlatforms();
    console.log("\n  📋 所有平台列表:");
    for (let i = 0; i < allPlatforms2.ids.length; i++) {
      console.log(`    平台 ${allPlatforms2.ids[i]}: ${allPlatforms2.names[i]} (${allPlatforms2.memberCounts[i]}/${allPlatforms2.limits[i]} 成员)`);
    }

    console.log("\n✅ 所有功能测试完成！\n");
  });

