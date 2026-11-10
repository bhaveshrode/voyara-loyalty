import "server-only";

import { Contract, FetchRequest, JsonRpcProvider, Wallet, type InterfaceAbi } from "ethers";
import deployment from "@/lib/chain/deployment.json";
import abis from "@/lib/chain/abis.json";

const RPC_URL = process.env.NEXT_PUBLIC_CHAIN_RPC || "http://127.0.0.1:8545";

let provider: JsonRpcProvider | null = null;

export function getProvider() {
  if (!provider) {
    const request = new FetchRequest(RPC_URL);
    request.timeout = 1800;
    provider = new JsonRpcProvider(request, 31337, {
      staticNetwork: true,
    });
  }
  return provider;
}

export function getDeployment() {
  return deployment as typeof deployment & {
    contracts: { token: string; membership: string; manager: string };
    accounts: Array<{ index: number; label: string; address: string; privateKey: string }>;
  };
}

export function getContracts(runner?: JsonRpcProvider | Wallet) {
  const activeRunner = runner ?? getProvider();
  return {
    token: new Contract(deployment.contracts.token, abis.token as InterfaceAbi, activeRunner),
    membership: new Contract(deployment.contracts.membership, abis.membership as InterfaceAbi, activeRunner),
    manager: new Contract(deployment.contracts.manager, abis.manager as InterfaceAbi, activeRunner),
  };
}

export function getSignerForAddress(address: string) {
  const account = getDeployment().accounts.find(
    (entry) => entry.address.toLowerCase() === address.toLowerCase()
  );
  if (!account) {
    throw new Error("No local demo signer exists for this wallet.");
  }
  return new Wallet(account.privateKey, getProvider());
}

export function getSignerByLabel(label: string) {
  const account = getDeployment().accounts.find((entry) => entry.label === label);
  if (!account) throw new Error(`No local demo signer labelled ${label}.`);
  return new Wallet(account.privateKey, getProvider());
}

export function chainConfig() {
  return {
    rpcUrl: RPC_URL,
    chainId: 31337,
    contracts: deployment.contracts,
  };
}
