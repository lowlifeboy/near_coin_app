import {Slots} from "../images";

export function SignInPrompt({handleClick}: {handleClick: (() => void) | undefined}) {
  return (
    <main>
      <h1>
        Welcome to ModernSlots!
      </h1>
      <div className="content">
        <p>
          These are slots with Near coins instead of regular money
        </p>
        <img src={Slots} alt="ModernSlots"/>
        <br/>
        <p style={{ textAlign: 'center' }}>
          {handleClick ? <button onClick={handleClick}>Sign in with NEAR Wallet</button> : 'Initializing...'}
        </p>
      </div>
    </main>
  );
}
