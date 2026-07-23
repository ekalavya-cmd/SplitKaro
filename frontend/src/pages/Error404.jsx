import React from "react";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-display-sm text-ink font-bold mb-md">
        404 - Page Not Found
      </h1>
      <p className="text-body-md text-body mb-lg max-w-md">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="flex h-10 items-center justify-center rounded-DEFAULT bg-primary px-4 font-label-sm text-label-sm tracking-wide text-on-primary transition-colors hover:bg-primary/90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Error404;
