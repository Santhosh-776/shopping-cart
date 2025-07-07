import { useContext, useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import { ShopContext } from "./ShopContext";
import added from "../assets/icons/checked.png";
import { searchApiKey } from "../constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
export const loader = async ({ params }) => {
  const { asin } = params;

  if (!asin) {
    return { product: null, error: "ASIN is undefined" };
  }
  const apiUrl = `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=IN`;

  let currentKeyIndex = 0;
  const getApiKey = () => {
    const key = searchApiKey[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % searchApiKey.length;
    return key;
  };

  const makeRequest = async (url, options) => {
    const response = await fetch(url, options);
    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    if (!response.ok) {
      throw new Error("API request failed");
    }
    return response;
  };

  let apiKey = getApiKey();
  let retries = 0;
  const maxRetries = searchApiKey.length;

  while (retries < maxRetries) {
    try {
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
        },
      };

      const response = await makeRequest(apiUrl, options);
      const result = await response.json();
      const data = result.data;
      return { product: data };
    } catch (error) {
      if (error.message === "Rate limit exceeded" && retries < maxRetries - 1) {
        apiKey = getApiKey();
        retries++;
      } else {
        throw error;
      }
    }
  }

};

const ProductDetails = () => {
  const { asin } = useParams();
  const { product } = useLoaderData();
  const { addToCart, isAuthenticated, user } = useContext(ShopContext);
  const [message, setMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) {
    return <p className="text-center text-blue-600">Product not found.</p>;
  }

  const handleAddToCart = async () => {
    if (isAddingToCart) return; // Prevent multiple rapid clicks

    if (!isAuthenticated || !user) {
      setMessage("Please log in to add items to cart!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsAddingToCart(true);
    const success = await addToCart(product);

    if (success) {
      setMessage("Added to cart!");
    } else {
      setMessage("Failed to add item to cart. Please try again.");
    }

    setTimeout(() => {
      setMessage("");
      setIsAddingToCart(false);
    }, 1000); // Reset after 1 second
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.product_photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.product_photos.length - 1 : prevIndex - 1
    );
  };
  return (
    <div className="flex justify-center w-full p-2">
      <div className="p-6 bg-white shadow-lg rounded-lg max-w-sm mx-auto mt-8 flex flex-col gap-5 lg:min-w-[900px] 2xl:min-w-[1440px] md:min-w-[600px]">
        <div className="relative">
          <img
            src={product.product_photos[currentImageIndex]}
            alt={`${product.product_title} - Image ${currentImageIndex + 1}`}
            className="h-64 object-contain mx-auto mb-4 max-w-sm md:min-w-md shadow-sm"
          />
          <button
            onClick={prevImage}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="flex justify-center space-x-2 mb-4">
          {product.product_photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-600">
          {product.product_title}
        </h2>
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-bold text-blue-600">
            <del>{product.product_original_price}</del> {product.product_price}
          </p>
          <p className="text-xl text-yellow-500 font-bold">
            Rating: {product.product_star_rating}⭐
          </p>
        </div>
        <p className="text-gray-600 mb-4">
          Total Ratings: {product.product_num_ratings}
        </p>
        <p>{product.delivery}</p>
        <div className="flex flex-col items-center">
          <button
            className={`text-lg font-semibold py-2 px-6 rounded-lg shadow-md transition ${isAddingToCart
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-slate-300 hover:text-blue-700'
              }`}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add to cart'}
          </button>
          {message && (
            <div className="flex items-center mt-4 bg-green-100 text-green-700 p-3 rounded-lg shadow-md">
              <img src={added} alt="Added" className="w-6 h-6 mr-2" />
              <p className="text-md font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;