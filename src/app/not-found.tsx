import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <h1>That report isn’t here.</h1>
      <p className="my-5">Choose a campaign or flow from the demo workspace.</p>
      <Link className="button" href="/">
        Back to overview
      </Link>
    </div>
  );
}
