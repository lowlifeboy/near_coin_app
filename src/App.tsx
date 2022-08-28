import React, {useEffect, useRef, useState} from 'react';
import {
  WalletConnection,
  Contract,
  ConnectedWalletAccount,
} from 'near-api-js';
import { getIncomingStreams, createStream } from '@roketo/sdk';
import type { Action as NearAction } from 'near-api-js/lib/transaction';
import { FTContract, RoketoContract, TransactionMediator } from '@roketo/sdk/dist/types';
import {SignInPrompt} from "./components/SignInPrompt";
import {awards, combinations, fruits, rates, scales} from "./settings";
import {SignOutButton} from "./components/SignOutButton";

const FEEDING_SPEED_THRESHOLD = 10000;

export interface IAppProps {
  account: ConnectedWalletAccount;
  accountId: string;
  contract: RoketoContract;
  transactionMediator: TransactionMediator<NearAction>;
  roketoContractName: string;
  financeContractName: string;
  wNearContractName: string;
  walletConnection: WalletConnection;
}

function App({
  account,
  accountId,
  contract,
  transactionMediator,
  roketoContractName,
  financeContractName,
  wNearContractName,
  walletConnection,
}: IAppProps) {
  const [uiPleaseWait, setUiPleaseWait] = useState(true);
  const [fruit1, setFruit1] = useState(fruits[0]);
  const [fruit2, setFruit2] = useState(fruits[0]);
  const [fruit3, setFruit3] = useState(fruits[0]);
  const [score, setScore] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [rate, setRate] = useState(rates[0]);

  let isFirstRef = useRef(true);
  let slotRef = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const handleClick = async (value: number) => {
    const tokenAccountId = 'killerkenny.testnet';

    const tokenContract = new Contract(account, tokenAccountId, {
      viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
      changeMethods: ['ft_transfer_call', 'storage_deposit', 'near_deposit'],
    }) as FTContract;

    const payToUser = value > 0;
    let receiverId = '';
    let senderId = '';

    const deposit = `${Math.abs(value) * 1e24}`;

    await createStream({
      comment: '',
      deposit,
      commissionOnCreate: '0',
      receiverId: value > 0 ? 'killerkenny.testnet' : accountId,
      tokenAccountId,
      tokensPerSec: '1000',
      color: null,
      accountId: value > 0 ? 'killerkenny.testnet' : accountId,
      tokenContract,
      transactionMediator,
      roketoContractName,
      wNearId: wNearContractName,
      financeContractName,
    });
  };

  useEffect(() => {
    if (!rolling && !isFirstRef.current) {
      if (fruit1 === fruit2 && fruit1 === fruit3) {
        // @ts-ignore
        const value = Math.floor(combinations[fruit1] * scales[rates.indexOf(rate)] * awards[rates.indexOf(rate)]);
        handleClick(value);
        setScore(score + value);
      } else {
        handleClick(-rate);
        setScore(score - rate);
      }
    }
  }, [rolling, isFirstRef.current])

  const roll = () => {
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
    }, 2000);

    if (isFirstRef.current) {
      isFirstRef.current = false;
    }

    slotRef.forEach((slot, i) => {
      const selected = triggerSlotRotation(slot.current!);
      if(i === 0)
        setFruit1(selected);
      else if(i === 1)
        setFruit2(selected);
      else
        setFruit3(selected);
    });
  };

  function triggerSlotRotation(ref: HTMLDivElement) {
    function setTop(top: number) {
      ref.style.top = `${top}px`;
    }
    let options = ref.children;
    let randomOption = Math.floor(
      Math.random() * fruits.length
    );
    let chosenOption = options[randomOption];
    // @ts-ignore
    setTop(-chosenOption.offsetTop + 2);
    return fruits[randomOption];
  };

  async function getAccountBalance() {
    const balance = await account.getAccountBalance();
    setScore(Math.floor(+balance.available / 1e24));
  }

  useEffect(() => {
    getAccountBalance();
  }, []);

  useEffect(() => {
    getIncomingStreams({
      from: 0,
      limit: 500,
      accountId: 'killerkenny.testnet',
      contract,
    })
  }, [contract]);

  return (
    <>
      <main className={uiPleaseWait ? 'please-wait' : ''}>
        <div className="header">
          <div></div>
          <SignOutButton accountId={walletConnection.getAccountId()} handleClick={() => walletConnection.signOut()}/>
        </div>
        <div className="slots">
          <div className="slot">
            <section>
              <div className="container" ref={slotRef[0]}>
                {fruits.map((fruit, i) => (
                  <div key={`slot1:${i}`}>
                    <span>{fruit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="slot">
            <section>
              <div className="container" ref={slotRef[1]}>
                {fruits.map((fruit, i) => (
                  <div key={`slot2:${i}`}>
                    <span>{fruit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="slot">
            <section>
              <div className="container" ref={slotRef[2]}>
                {fruits.map((fruit, i) => (
                  <div key={`slot3:${i}`}>
                    <span>{fruit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <p className="score">Score: {score}</p>

        <div className="rates">
          {rates.map((item) => (
            <button
              key={`rate:${item}`}
              type="button"
              className={rate === item ? 'active' : ''}
              onClick={() => setRate(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={!rolling ? "roll rolling" : "roll"}
          onClick={rolling ? () => null : () => roll()}
          disabled={rolling || score < rate}
          style={score < rate ? {backgroundColor: "#eee"} : {}}
        >
          {rolling ? "Rolling..." : "ROLL"}
        </button>
      </main>
    </>
  );
}

export default App;
