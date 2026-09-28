"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h1>We couldn’t load this report.</h1>
      <p className="my-5">Please try loading the report again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
