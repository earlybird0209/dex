const fs = require("fs");
const colors = require("colors");
const { ethers } = require("hardhat");
// const ERC20ABI = require("../artifacts/contracts/ERC20.sol/ERC20.json").abi;
// const PresaleABI =
//   require("../artifacts/contracts/presale.sol/Presale.json").abi;
async function main() {
  // get network
  let [owner] = await ethers.getSigners();
  console.log("owner address", owner.address);
  let network = await owner.provider._networkPromise;

  const Factory = await ethers.getContractFactory("DEXFactory");
  exchangeFactory = await Factory.deploy(owner.address);
  await exchangeFactory.deployed();

  const WETH = await ethers.getContractFactory("WETH");
  wETH = await WETH.deploy();
  await wETH.deployed();
  console.log("weht address", wETH.address);

  const Router = await ethers.getContractFactory("DEXRouter");
  exchangeRouter = await Router.deploy(exchangeFactory.address, wETH.address);
  await exchangeRouter.deployed();
  console.log("exchange address", exchangeRouter.address);
}

main()
  .then(() => {
    console.log("complete".green);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
