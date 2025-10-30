import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPlatformVoting = await deploy("PlatformVoting", {
    from: deployer,
    log: true,
  });

  console.log(`PlatformVoting contract deployed at: `, deployedPlatformVoting.address);
};
export default func;
func.id = "deploy_platformVoting"; // id required to prevent reexecution
func.tags = ["PlatformVoting"];
