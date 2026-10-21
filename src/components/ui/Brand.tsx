/**
 * Official Omni Account logo. Both variants are rendered and CSS shows the one
 * that matches the active theme, so there is no flash on first paint.
 */
export function Brand() {
  return (
    <span className="brand" role="img" aria-label="Omni Account">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-light" src="/brand/logo-black.png" alt="" width={640} height={111} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-dark" src="/brand/logo-white.png" alt="" width={640} height={111} />
    </span>
  );
}
