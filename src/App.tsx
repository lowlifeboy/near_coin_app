import React, {useEffect, useRef, useState} from 'react';
import {
  WalletConnection,
  Contract,
  ConnectedWalletAccount,
} from 'near-api-js';
import { getIncomingStreams, createStream } from '@roketo/sdk';
import type { Action as NearAction } from 'near-api-js/lib/transaction';
import { FTContract, RoketoContract, TransactionMediator } from '@roketo/sdk/dist/types';
import {awards, combinations, fruits, rates, scales} from "./settings";
import {SignOutButton} from "./components/SignOutButton";
import {useAppDispatch, useAppSelector} from "./state/hooks";
import {setAvailableRoutesNumber, setDeposit, setRate} from "./state/slices/userSlice";

const FEEDING_SPEED_THRESHOLD = 10000;

export interface IAppProps {
  account: ConnectedWalletAccount;
  contract: RoketoContract;
  transactionMediator: TransactionMediator<NearAction>;
  roketoContractName: string;
  financeContractName: string;
  wNearContractName: string;
  walletConnection: WalletConnection;
}

function App({
  account,
  contract,
  transactionMediator,
  roketoContractName,
  financeContractName,
  wNearContractName,
  walletConnection,
}: IAppProps) {
  const dispatch = useAppDispatch();

  const {accountId, availableRoutesNumber, deposit, rate} = useAppSelector((state) => state.user);

  const [uiPleaseWait, setUiPleaseWait] = useState(true);
  const [fruit1, setFruit1] = useState(fruits[0]);
  const [fruit2, setFruit2] = useState(fruits[0]);
  const [fruit3, setFruit3] = useState(fruits[0]);
  const [score, setScore] = useState(0);
  const [rolling, setRolling] = useState(false);

  let isFirstRef = useRef(true);
  let slotRef = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const handleClick = async (value: number) => {
    const tokenAccountId = 'wrap.testnet';

    const tokenContract = new Contract(account, tokenAccountId, {
      viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
      changeMethods: ['ft_transfer_call', 'storage_deposit', 'near_deposit'],
    }) as FTContract;

    await createStream({
      comment: '',
      deposit: `${Math.abs(value)}000000000000000000000000`,
      commissionOnCreate: '100000000000000000000000',
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
        dispatch(setDeposit(deposit + value));
      } else {
        dispatch(setDeposit(deposit - rate));
      }

      dispatch(setAvailableRoutesNumber(availableRoutesNumber - 1));
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

  async function finish() {
    const value = deposit;
    dispatch(setDeposit(0));
    dispatch(setAvailableRoutesNumber(0));
    dispatch(setRate(rates[0]));
    handleClick(value);
  }

  return (
    <>
      <main className={uiPleaseWait ? 'please-wait' : ''}>
        <div className="header">
          <div></div>
          <SignOutButton accountId={walletConnection.getAccountId()} handleClick={() => {
            walletConnection.signOut();
            window.location.reload();
          }}/>
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

        {deposit > 0 && availableRoutesNumber > 0 && <p className="score">Deposit: {deposit}</p>}

        {deposit > 0 && availableRoutesNumber > 0 && <p className="score">Available routes number: {availableRoutesNumber}</p>}

        {(deposit > 0 && availableRoutesNumber > 0)
          ? (
            <>
              <button
                type="button"
                className={!rolling ? "roll rolling" : "roll"}
                onClick={rolling ? () => null : () => roll()}
                disabled={rolling || score < rate}
                style={score < rate ? {backgroundColor: "#eee"} : {}}
              >
                {rolling ? "Rolling..." : "ROLL"}
              </button>

              <button
                type="button"
                className="roll rolling"
                onClick={() => finish()}
                disabled={deposit <= 0}
              >
                Finish
              </button>
            </>
          ) : (
            <>
              <p className="score">Select rate</p>
              <div className="rates">
                {rates.map((item) => (
                  <button
                    key={`rate:${item}`}
                    type="button"
                    className={rate === item ? 'active' : ''}
                    onClick={() => dispatch(setRate(item))}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="score">Select number of rotes</p>
              <label htmlFor="availableRoutesNumber">
                <input
                  className="roll rolling"
                  name="availableRoutesNumber"
                  id="availableRoutesNumber"
                  type="number"
                  style={{ width: "100%", maxWidth: 400}}
                  placeholder="Enter number of rotes"
                  onChange={(event) => dispatch(setAvailableRoutesNumber(Math.abs(+event.target.value)))}
                />
              </label>
              <button className="roll" type="button" onClick={((rate * availableRoutesNumber) < score ? () => {
                dispatch(setDeposit(rate * availableRoutesNumber));
                dispatch(setAvailableRoutesNumber(availableRoutesNumber));
                handleClick(-rate * availableRoutesNumber);
              } : () => null)}>Bet</button>
            </>
        )}
      </main>
    </>
  );
}

export default App;
