import React from "react";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="text-display-sm text-ink mb-md text-2xl font-bold">
        404 - Page Not Found!
      </h1>
      <p className="text-body mb-lg mt-1 max-w-md text-body-md text-lg">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-5 h-9 rounded-DEFAULT bg-primary px-4 py-2 font-semibold tracking-wide text-on-primary transition-all hover:bg-primary/90 hover:shadow-md"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Error404;
