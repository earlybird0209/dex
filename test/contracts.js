const { expect } = require("chai");
const { parseUnits, formatUnits } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { toBigNum } = require("./utils");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
var exchangeRouter;
var exchangeFactory;
var wETH;

var hirokiToken;
var owner, userWallet, userWallet2, provider;

describe("Create UserWallet", function () {
  it("Create account", async function () {
    [owner, userWallet, userWallet2] = await ethers.getSigners();
    console.log(owner.address);
    var tx = await owner.sendTransaction({
      to: userWallet.address,
      value: ethers.utils.parseUnits("100", 18),
    });
    await tx.wait();
    var tx = await owner.sendTransaction({
      to: userWallet2.address,
      value: ethers.utils.parseUnits("100", 18),
    });
    await tx.wait();
  });
});

describe("Exchange deploy and deploy", function () {
  it("Factory deploy", async function () {
    const Factory = await ethers.getContractFactory("DEXFactory");
    exchangeFactory = await Factory.deploy(owner.address);
    await exchangeFactory.deployed();
    console.log(await exchangeFactory.INIT_CODE_PAIR_HASH());
    console.log(exchangeFactory.address);
  });

  it("WETH deploy", async function () {
    const WETH = await ethers.getContractFactory("WETH");
    wETH = await WETH.deploy();
    await wETH.deployed();
    console.log(wETH.address);
  });

  it("Router deploy", async function () {
    const Router = await ethers.getContractFactory("DEXRouter");
    exchangeRouter = await Router.deploy(exchangeFactory.address, wETH.address);
    await exchangeRouter.deployed();
    console.log(exchangeRouter.address);
  });
});

describe("Token contract deploy", function () {
  it("HIROKI Deploy and Initial", async function () {
    const ERC20TOKEN = await ethers.getContractFactory("ERC20");
    hirokiToken = await ERC20TOKEN.deploy("Token1", "T1");
    await hirokiToken.deployed();

    hirokiToken2 = await ERC20TOKEN.deploy("Token2", "T2");
    await hirokiToken2.deployed();
  });
  it("HIROKI Add Liquidity", async function () {
    var tx = await hirokiToken.approve(
      exchangeRouter.address,
      parseUnits("100000000", 18)
    );
    await tx.wait();

    tx = await exchangeRouter.addLiquidityETH(
      hirokiToken.address,
      parseUnits("5000000", 18),
      0,
      0,
      owner.address,
      "111111111111111111111",
      { value: parseUnits("500", 18) }
    );
    await tx.wait();
  });
  it("HIROKI2 Add Liquidity", async function () {
    var tx = await hirokiToken2.approve(
      exchangeRouter.address,
      parseUnits("100000000", 18)
    );
    await tx.wait();

    tx = await exchangeRouter.addLiquidityETH(
      hirokiToken2.address,
      parseUnits("5000000", 18),
      0,
      0,
      owner.address,
      "111111111111111111111",
      { value: parseUnits("500", 18) }
    );
    await tx.wait();
  });

  it("Tokens Add Liquidity", async function () {
    var tx = await hirokiToken2.approve(
      exchangeRouter.address,
      parseUnits("100000000", 18)
    );
    await tx.wait();

    var tx = await hirokiToken.approve(
      exchangeRouter.address,
      parseUnits("1000000", 18)
    );
    await tx.wait();

    tx = await exchangeRouter.addLiquidity(
      hirokiToken.address,
      hirokiToken2.address,
      parseUnits("1000000", 18),
      parseUnits("100000000", 18),
      0,
      0,
      owner.address,
      "111111111111111111111"
    );
    await tx.wait();

    var amount = await exchangeRouter.getAmountsOut(parseUnits("1", 18), [
      hirokiToken.address,
      hirokiToken2.address,
    ]);
    console.log("amount", amount);
  });
});
describe("Deploy Dex and Test", function () {
  it("transfer test", async function () {
    const Dex = await ethers.getContractFactory("DefiStarSwap");
    var dex = await Dex.deploy(
      owner.address,
      exchangeRouter.address,
      wETH.address
    );
    await dex.deployed();
    var tx = await dex.swapTokens(
      ethers.constants.AddressZero,
      hirokiToken.address,
      toBigNum("1", 18),
      { value: toBigNum("1", 18) }
    );
    await tx.wait();

    var tx = await dex.swapTokens(
      ethers.constants.AddressZero,
      hirokiToken2.address,
      toBigNum("1", 18),
      { value: toBigNum("1", 18) }
    );
    await tx.wait();

    // var tx = await dex.approveTokens(
    //   [hirokiToken.address],
    //   [toBigNum("1", 18)],
    // );
    // await tx.wait();

    var tx = await hirokiToken.approve(dex.address, toBigNum("1", 18));
    await tx.wait();

    var tx = await dex.swapTokens(
      hirokiToken.address,
      hirokiToken2.address,
      toBigNum("1", 18)
    );
    await tx.wait();

    await mine(864);
    var tx = await dex.airdrop();
    await tx.wait();
  });
});
