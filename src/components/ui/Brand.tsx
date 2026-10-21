/**
 * Text wordmark. No official Omni Account logo exists in the Omni repos (the
 * available logos are Omni Tools / Omni Docs), so we do not borrow one.
 */
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true" />
      <span className="brand-text">Omni <strong>Account</strong></span>
    </span>
  );
}
