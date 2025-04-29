import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Optional decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-200 rounded-full opacity-20 mix-blend-multiply filter blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-200 rounded-full opacity-20 mix-blend-multiply filter blur-xl"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-yellow-200 rounded-full opacity-20 mix-blend-multiply filter blur-xl"></div>
    </div>
  );
};

export default NotFound;
