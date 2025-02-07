import type { Signer } from '@ethersproject/abstract-signer';
import type { JsonRpcProvider } from '@ethersproject/providers';
import debug from 'debug';

import deploymentInfo from '../hardhat/dist/deploymentInfo.json';
import type {
  ApeDistributor,
  ApeRouter,
  ApeVaultFactory,
  ApeVaultWrapperImplementation,
  ERC20,
} from '../hardhat/dist/typechain';
import {
  ApeDistributor__factory,
  ApeRouter__factory,
  ApeVaultFactory__factory,
  ApeVaultWrapperImplementation__factory,
  ERC20__factory,
  VaultAPI__factory,
} from '../hardhat/dist/typechain';
import { HARDHAT_CHAIN_ID, HARDHAT_GANACHE_CHAIN_ID } from '../src/config/env';

export type {
  ApeDistributor,
  ApeRouter,
  ApeVaultFactory,
  ApeVaultWrapperImplementation,
  ERC20,
} from '../hardhat/dist/typechain';

const log = debug('coordinape:contracts');

const requiredContracts = ['ApeVaultFactory', 'ApeRouter', 'ApeDistributor'];

export const supportedChainIds: string[] = Object.entries(deploymentInfo)
  .filter(([, contracts]) => requiredContracts.every(c => c in contracts))
  .map(x => x[0].toString());

export class Contracts {
  vaultFactory: ApeVaultFactory;
  router: ApeRouter;
  distributor: ApeDistributor;
  chainId: string;
  provider: JsonRpcProvider;
  signer: Signer | undefined;

  constructor(
    chainId: number | string,
    provider: JsonRpcProvider,
    useSigner?: boolean
  ) {
    this.chainId = chainId.toString();
    this.provider = provider;
    if (useSigner) this.signer = provider.getSigner();

    const info = (deploymentInfo as any)[chainId];
    if (!info) {
      throw new Error(`No info for chain ${chainId}`);
    }
    this.vaultFactory = ApeVaultFactory__factory.connect(
      info.ApeVaultFactory.address,
      this.signer || this.provider
    );
    this.router = ApeRouter__factory.connect(
      info.ApeRouter.address,
      this.signer || this.provider
    );
    this.distributor = ApeDistributor__factory.connect(
      info.ApeDistributor.address,
      this.signer || this.provider
    );
  }

  getDeploymentInfo(): Record<string, any> {
    return (deploymentInfo as any)[this.chainId];
  }

  getVault(address: string): ApeVaultWrapperImplementation {
    return ApeVaultWrapperImplementation__factory.connect(
      address,
      this.provider
    );
  }

  async getYVault(vaultAddress: string) {
    const yVaultAddress = await this.getVault(vaultAddress).vault();
    return VaultAPI__factory.connect(yVaultAddress, this.provider);
  }

  getTokenAddress(symbol: string) {
    const info = (deploymentInfo as any)[this.chainId];
    let { address } = info[symbol] || {};

    // workaround for mainnet-forked testchains
    if (
      !address &&
      [
        HARDHAT_CHAIN_ID.toString(),
        HARDHAT_GANACHE_CHAIN_ID.toString(),
      ].includes(this.chainId)
    ) {
      address = (deploymentInfo as any)[1][symbol]?.address;
      if (!address) return undefined;
      log(
        `No info for token "${symbol}" on chain ${this.chainId}; using mainnet address`
      );
    }

    return address;
  }

  getERC20(address: string): ERC20 {
    return ERC20__factory.connect(address, this.provider);
  }
}
