// frontend/src/components/ui/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = "medium", text = "Chargement..." }) => {
  const sizes = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  const spinnerSize = sizes[size] || sizes.medium;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        className={`animate-spin rounded-full border-4 border-gray-200 border-b-indigo-600 ${spinnerSize}`}
      />

      {text && (
        <p className="mt-4 text-gray-600 text-sm text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
