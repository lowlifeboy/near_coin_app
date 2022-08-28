export function SignOutButton({accountId, handleClick}: {accountId: string, handleClick: () => void}) {
  return (
    <button style={{ float: 'right' }} onClick={handleClick}>
      Sign out {accountId}
    </button>
  );
}
