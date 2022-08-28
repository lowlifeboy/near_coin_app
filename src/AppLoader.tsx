import React, {useEffect, useState} from 'react';
import {connect, keyStores, transactions, WalletConnection,} from 'near-api-js';
import type {Action as NearAction} from 'near-api-js/lib/transaction';
import {initApiControl} from '@roketo/sdk';
import type {TransactionMediator} from '@roketo/sdk/dist/types';
import App, {IAppProps} from './App';
import {SignInPrompt} from "./components/SignInPrompt";

function AppLoader() {
  const [roketoProps, setRoketoProps] = useState<IAppProps | null>(null);

  useEffect(() => {
    (async () => {
      const NEAR_CONSTANTS = {
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        networkId: 'testnet',
        roketoContractName: 'streaming-r-v2.dcversus.testnet',
        financeContractName: 'finance-r-v2.dcversus.testnet',
        wNearContractName: 'wnear.testnet',
      };

      const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      const near = await connect({
        nodeUrl: NEAR_CONSTANTS.nodeUrl,
        walletUrl: NEAR_CONSTANTS.walletUrl,
        networkId: NEAR_CONSTANTS.networkId,
        keyStore,
        headers: {},
      });

      const walletConnection = new WalletConnection(near, NEAR_CONSTANTS.roketoContractName);
      const accountId = await walletConnection.getAccountId();
      const account = walletConnection.account();

      const transactionMediator: TransactionMediator<NearAction> = {
        functionCall: (...args) => transactions.functionCall(...args),
        // @ts-expect-error signAndSendTransaction is protected
        signAndSendTransaction: (...args) => account.signAndSendTransaction(...args),
      };

      const { contract } = await initApiControl({
        account,
        transactionMediator,
        roketoContractName: NEAR_CONSTANTS.roketoContractName,
      });

      setRoketoProps({
        account,
        accountId,
        contract,
        transactionMediator,
        roketoContractName: NEAR_CONSTANTS.roketoContractName,
        financeContractName: NEAR_CONSTANTS.financeContractName,
        wNearContractName: NEAR_CONSTANTS.wNearContractName,
        walletConnection,
      });
    })();
  }, []);

  return roketoProps?.accountId ? (
    <App {...roketoProps} />
  ) : (
    <SignInPrompt
      handleClick={roketoProps?.roketoContractName
        ? () => roketoProps.walletConnection.requestSignIn(roketoProps.roketoContractName, 'ModernSlots')
        : undefined}
    />
  );
}

export default AppLoader;
