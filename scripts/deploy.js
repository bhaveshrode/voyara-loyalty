const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { ethers } = require("hardhat");
const { HDNodeWallet } = require("ethers");

const ROOT = path.resolve(__dirname, "..");
const MNEMONIC = "test test test test test test test test test test test junk";

const ACCOUNT_LABELS = [
  "admin",
  "ava",
  "noah",
  "isla",
  "casa-marea",
  "solenne",
  "atelier",
  "ember",
  "dune",
  "aerio",
  "mia",
  "leo",
];

const MEMBERSHIP_TIERS = { ava: 2, noah: 1, isla: 3, mia: 1, leo: 2 };

const AWARDS = [
  { daysAgo: 52, user: "isla", merchant: "mer_casa-marea", campaign: "casa-suite-season", points: 4800 },
  { daysAgo: 49, user: "ava", merchant: "mer_casa-marea", campaign: "casa-suite-season", points: 4200 },
  { daysAgo: 44, user: "noah", merchant: "mer_casa-marea", campaign: "casa-suite-season", points: 420 },
  { daysAgo: 40, user: "isla", merchant: "mer_aerio", campaign: "aerio-window-seat", points: 2900 },
  { daysAgo: 37, user: "ava", merchant: "mer_aerio", campaign: "aerio-window-seat", points: 1650 },
  { daysAgo: 33, user: "leo", merchant: "mer_casa-marea", campaign: "casa-suite-season", points: 1200 },
  { daysAgo: 31, user: "noah", merchant: "mer_ember", campaign: "ember-coastal-table", points: 160 },
  { daysAgo: 27, user: "isla", merchant: "mer_dune", campaign: "dune-desert-escape", points: 3200 },
  { daysAgo: 24, user: "ava", merchant: "mer_dune", campaign: "dune-desert-escape", points: 800 },
  { daysAgo: 21, user: "mia", merchant: "mer_ember", campaign: "ember-coastal-table", points: 300 },
  { daysAgo: 18, user: "ava", merchant: "mer_atelier", campaign: "atelier-the-edit", points: 480 },
  { daysAgo: 15, user: "isla", merchant: "mer_solenne", campaign: "solenne-restore-reset", points: 1900 },
  { daysAgo: 12, user: "noah", merchant: "mer_aerio", campaign: "aerio-window-seat", points: 250 },
  { daysAgo: 9, user: "ava", merchant: "mer_ember", campaign: "ember-coastal-table", points: 720 },
  { daysAgo: 8, user: "leo", merchant: "mer_aerio", campaign: "aerio-window-seat", points: 500 },
  { daysAgo: 6, user: "mia", merchant: "mer_atelier", campaign: "atelier-the-edit", points: 240 },
  { daysAgo: 5, user: "noah", merchant: "mer_dune", campaign: "dune-desert-escape", points: 1290 },
  { daysAgo: 3, user: "ava", merchant: "mer_solenne", campaign: "solenne-restore-reset", points: 600 },
];

const REDEMPTIONS = [
  { daysAgo: 6, user: "isla", reward: "dune-desert-dawn", points: 1600 },
  { daysAgo: 4, user: "noah", reward: "ember-market-brunch", points: 280 },
  { daysAgo: 2, user: "ava", reward: "solenne-hour-of-stillness", points: 950 },
  { daysAgo: 1, user: "ava", reward: "ember-market-brunch", points: 280 },
  { hoursAgo: 12, user: "mia", reward: "ember-market-brunch", points: 280 },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

function deriveAccounts() {
  return ACCOUNT_LABELS.map((label, index) => {
    const wallet = HDNodeWallet.fromPhrase(MNEMONIC, undefined, `m/44'/60'/0'/0/${index}`);
    return {
      index,
      label,
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  });
}

async function nextTimestampAt(targetMs) {
  const latest = await hre.network.provider.send("eth_getBlockByNumber", ["latest", false]);
  const latestTimestamp = Number(BigInt(latest.timestamp));
  const timestamp = Math.max(latestTimestamp + 1, Math.floor(targetMs / 1000));
  await hre.network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  return timestamp;
}

async function main() {
  const network = hre.network.name;
  if (network !== "localhost" && network !== "hardhat") {
    throw new Error(`Refusing to seed demo data on network: ${network}`);
  }

  const seed = readJson("data/seed.json");
  const accounts = deriveAccounts();
  const signers = await ethers.getSigners();

  for (let i = 0; i < accounts.length; i += 1) {
    if (accounts[i].address.toLowerCase() !== signers[i].address.toLowerCase()) {
      throw new Error(`Account derivation mismatch at index ${i}. Check the Hardhat mnemonic.`);
    }
  }

  const admin = signers[0];

  console.log("Deploying Voyara contracts...");
  const Token = await ethers.getContractFactory("VoyaraToken");
  const token = await Token.deploy(admin.address);
  await token.waitForDeployment();

  const Membership = await ethers.getContractFactory("VoyaraMembership");
  const membership = await Membership.deploy(admin.address);
  await membership.waitForDeployment();

  const Manager = await ethers.getContractFactory("LoyaltyManager");
  const manager = await Manager.deploy(await token.getAddress(), admin.address);
  await manager.waitForDeployment();

  await (await token.grantRole(await token.MINTER_ROLE(), await manager.getAddress())).wait();
  await (await token.grantRole(await token.BURNER_ROLE(), await manager.getAddress())).wait();

  console.log("Registering merchants...");
  const merchantById = new Map();
  for (let i = 0; i < seed.merchants.length; i += 1) {
    const merchant = seed.merchants[i];
    const walletIndex = merchant.walletIndex;
    const account = accounts[walletIndex];
    const tx = await manager.connect(admin).registerMerchant(account.address, merchant.name);
    const receipt = await tx.wait();
    const chainMerchantId = i + 1;
    merchantById.set(merchant.id, chainMerchantId);
    console.log(`  #${chainMerchantId} ${merchant.name} → ${account.address} (${receipt.hash.slice(0, 10)}…)`);
  }

  console.log("Minting soulbound memberships...");
  const memberships = [];
  for (const [label, tier] of Object.entries(MEMBERSHIP_TIERS)) {
    const user = seed.users.find((entry) => entry.walletIndex === accounts.find((account) => account.label === label).index);
    const account = accounts.find((entry) => entry.label === label);
    if (!user || !account) continue;
    const tx = await membership.connect(admin).mintMembership(account.address, tier);
    const receipt = await tx.wait();
    const tokenId = (await membership.tokenOf(account.address)).toString();
    memberships.push({ userId: user.id, address: account.address, tokenId, tier });
    console.log(`  ${user.name}: tier ${tier}, NFT #${tokenId} (${receipt.hash.slice(0, 10)}…)`);
  }

  console.log("Issuing seeded rewards, redemptions and transfers...");
  const campaignBySlug = new Map(seed.campaigns.map((campaign) => [campaign.slug, campaign]));
  const rewardBySlug = new Map(seed.rewards.map((reward) => [reward.slug, reward]));
  const userByShortId = new Map(seed.users.map((user) => [user.id.replace("usr_", ""), user]));
  const merchantByIdRecord = new Map(seed.merchants.map((merchant) => [merchant.id, merchant]));

  const activity = [];
  const nowMs = Date.now();
  const timeline = [
    ...AWARDS.map((award) => ({
      kind: "award",
      at: nowMs - award.daysAgo * 86400 * 1000,
      ...award,
    })),
    ...REDEMPTIONS.map((redemption) => ({
      kind: "redeem",
      at: nowMs - (redemption.daysAgo || 0) * 86400 * 1000 - (redemption.hoursAgo || 0) * 3600 * 1000,
      ...redemption,
    })),
    { kind: "transfer", at: nowMs - 6 * 3600 * 1000, points: 450, from: "ava", to: "noah" },
  ].sort((a, b) => a.at - b.at || (a.kind === "award" ? -1 : b.kind === "award" ? 1 : 0));

  for (const event of timeline) {
    if (event.kind === "award") {
      const campaign = campaignBySlug.get(event.campaign);
      const merchant = merchantByIdRecord.get(event.merchant);
      const awardUser = userByShortId.get(event.user);
      if (!campaign || !merchant || !awardUser) continue;

      const merchantAccount = accounts.find((account) => account.index === merchant.walletIndex);
      const userAccount = accounts.find((account) => account.index === awardUser.walletIndex);
      const timestamp = await nextTimestampAt(event.at);
      const tx = await manager
        .connect(signers[merchantAccount.index])
        .award(userAccount.address, ethers.id(campaign.slug), event.points);
      const receipt = await tx.wait();

      activity.push({
        id: `earn-${receipt.hash}`,
        type: "earn",
        userId: awardUser.id,
        userAddress: userAccount.address,
        points: event.points,
        timestamp: timestamp * 1000,
        merchantId: merchant.id,
        merchantName: merchant.name,
        ref: campaign.slug,
        label: campaign.name,
        detail: merchant.name,
        category: merchant.category,
        txHash: receipt.hash,
      });
      continue;
    }

    if (event.kind === "redeem") {
      const reward = rewardBySlug.get(event.reward);
      const user = userByShortId.get(event.user);
      if (!reward || !user) continue;

      const userAccount = accounts.find((account) => account.index === user.walletIndex);
      const merchant = merchantByIdRecord.get(reward.merchantId);
      const timestamp = await nextTimestampAt(event.at);
      const tx = await manager.connect(signers[userAccount.index]).redeem(ethers.id(reward.slug), event.points);
      const receipt = await tx.wait();

      activity.push({
        id: `redeem-${receipt.hash}`,
        type: "redeem",
        userId: user.id,
        userAddress: userAccount.address,
        points: event.points,
        timestamp: timestamp * 1000,
        merchantId: reward.merchantId,
        merchantName: merchant?.name || "Voyara",
        ref: reward.slug,
        label: reward.title,
        detail: merchant?.name || "Voyara",
        category: reward.category,
        txHash: receipt.hash,
      });
      continue;
    }

    const fromUser = userByShortId.get(event.from);
    const toUser = userByShortId.get(event.to);
    const fromAccount = accounts.find((account) => account.index === fromUser.walletIndex);
    const toAccount = accounts.find((account) => account.index === toUser.walletIndex);
    const timestamp = await nextTimestampAt(event.at);
    const tx = await token.connect(signers[fromAccount.index]).transfer(toAccount.address, event.points);
    const receipt = await tx.wait();

    activity.push({
      id: `transfer-${receipt.hash}`,
      type: "transfer-out",
      userId: fromUser.id,
      userAddress: fromAccount.address,
      points: event.points,
      timestamp: timestamp * 1000,
      counterparty: toUser.name,
      label: "Points transfer",
      detail: `To ${toUser.name}`,
      category: "Transfer",
      txHash: receipt.hash,
    });
    activity.push({
      id: `transfer-in-${receipt.hash}`,
      type: "transfer-in",
      userId: toUser.id,
      userAddress: toAccount.address,
      points: event.points,
      timestamp: timestamp * 1000,
      counterparty: fromUser.name,
      label: "Points transfer",
      detail: `From ${fromUser.name}`,
      category: "Transfer",
      txHash: receipt.hash,
    });
  }

  const nowTimestamp = Math.floor(Date.now() / 1000) + 2;
  await hre.network.provider.send("evm_setNextBlockTimestamp", [nowTimestamp]);
  await hre.network.provider.send("evm_mine", []);

  const balances = {};
  const lifetime = {};
  for (const user of seed.users) {
    const account = accounts.find((entry) => entry.index === user.walletIndex);
    if (!account || user.role !== "traveler") continue;
    const balance = await token.balanceOf(account.address);
    balances[user.id] = balance.toString();
    lifetime[user.id] = {
      earned: activity
        .filter((event) => event.type === "earn" && event.userId === user.id)
        .reduce((sum, event) => sum + event.points, 0),
      redeemed: activity
        .filter((event) => event.type === "redeem" && event.userId === user.id)
        .reduce((sum, event) => sum + event.points, 0),
    };
  }

  const tokenAddress = await token.getAddress();
  const membershipAddress = await membership.getAddress();
  const managerAddress = await manager.getAddress();

  const deployment = {
    network,
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    contracts: {
      token: tokenAddress,
      membership: membershipAddress,
      manager: managerAddress,
    },
    accounts,
    memberships,
  };

  const tokenArtifact = await hre.artifacts.readArtifact("VoyaraToken");
  const membershipArtifact = await hre.artifacts.readArtifact("VoyaraMembership");
  const managerArtifact = await hre.artifacts.readArtifact("LoyaltyManager");

  const enrichedSeed = {
    ...seed,
    meta: {
      ...seed.meta,
      seededAt: new Date().toISOString(),
      network,
      tokenAddress,
      membershipAddress,
      managerAddress,
    },
    users: seed.users.map((user) => ({
      ...user,
      walletAddress: accounts.find((account) => account.index === user.walletIndex)?.address || "",
    })),
    merchants: seed.merchants.map((merchant) => ({
      ...merchant,
      walletAddress: accounts.find((account) => account.index === merchant.walletIndex)?.address || "",
      chainMerchantId: merchantById.get(merchant.id) || 0,
    })),
    redemptions: [],
  };

  activity.sort((a, b) => b.timestamp - a.timestamp);
  const merchantStats = seed.merchants.map((merchant) => {
    const issues = activity.filter((event) => event.type === "earn" && event.merchantId === merchant.id);
    const redemptions = activity.filter((event) => event.type === "redeem" && event.merchantId === merchant.id);
    return {
      merchantId: merchant.id,
      issued: issues.reduce((sum, event) => sum + event.points, 0),
      redeemed: redemptions.reduce((sum, event) => sum + event.points, 0),
      transactions: issues.length + redemptions.length,
    };
  });

  const snapshot = {
    generatedAt: new Date().toISOString(),
    network,
    totalSupply: (await token.totalSupply()).toString(),
    merchantCount: Number(await manager.merchantCount()),
    memberCount: memberships.length,
    users: Object.fromEntries(
      seed.users
        .filter((user) => user.role === "traveler")
        .map((user) => {
          const membership = memberships.find((entry) => entry.userId === user.id);
          const account = accounts.find((entry) => entry.index === user.walletIndex);
          return [
            user.id,
            {
              address: account?.address || "",
              balance: balances[user.id] || "0",
              lifetimeEarned: lifetime[user.id]?.earned || 0,
              lifetimeRedeemed: lifetime[user.id]?.redeemed || 0,
              tier: membership?.tier || user.tier,
              tokenId: membership?.tokenId || null,
            },
          ];
        })
    ),
    activity: activity.slice(0, 40),
    merchantStats,
    contracts: {
      token: tokenAddress,
      membership: membershipAddress,
      manager: managerAddress,
    },
    accounts: accounts.map(({ index, label, address }) => ({ index, label, address })),
  };

  writeJson("data/platform.json", enrichedSeed);
  writeJson("data/chain-snapshot.json", snapshot);
  writeJson("lib/chain/deployment.json", deployment);
  writeJson("lib/chain/abis.json", {
    token: tokenArtifact.abi,
    membership: membershipArtifact.abi,
    manager: managerArtifact.abi,
  });

  console.log("");
  console.log("Voyara is live on the local chain.");
  console.log(`  VYA token      ${tokenAddress}`);
  console.log(`  Membership NFT ${membershipAddress}`);
  console.log(`  LoyaltyManager ${managerAddress}`);
  console.log(`  Seeded ${activity.length} activity records for ${Object.keys(balances).length} travelers.`);
  console.log("");
  console.log("Demo sign-ins (password: voyara123)");
  console.log("  Traveler  ava@voyara.club");
  console.log("  Merchant  casa@voyara.club");
  console.log("  Admin     admin@voyara.club");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
