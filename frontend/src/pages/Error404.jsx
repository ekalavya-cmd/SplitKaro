import React from "react";

const Error404 = () => {
  return (
    <>
      <div className="flex h-[90vh] flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-red-500">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600">
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </>
  );
};

export default Error404;
