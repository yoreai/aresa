"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";
import type { EnrichedAddress } from "../utils/supabase";
import { Search, Filter, MapPin, AlertTriangle } from "lucide-react";

export function AddressTable() {
  const [addresses, setAddresses] = useState<EnrichedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, riskFilter]);

  useEffect(() => {
    fetchAddresses();
  }, [currentPage, debouncedSearch, riskFilter]);

  async function fetchAddresses() {
    setLoading(true);
    setError(null);
    try {
      // Build query without expensive count for large datasets
      let query = supabase
        .from("enriched_addresses")
        .select(
          "id, house_number, street, city, postcode, state, full_address, latitude, longitude, distance_to_fire_miles, distance_category"
        );

      // Apply search filter with optimizations
      if (debouncedSearch.trim()) {
        const searchValue = debouncedSearch.trim();

        // For longer search terms, be more restrictive to prevent timeouts
        if (searchValue.length >= 6) {
          // Use exact city match for longer terms to be more efficient
          query = query.or(
            `city.ilike.${searchValue}%,postcode.eq.${searchValue}`
          );
        } else if (searchValue.length >= 3) {
          // Standard search for medium terms
          query = query.or(
            `city.ilike.%${searchValue}%,postcode.ilike.${searchValue}%`
          );
        } else {
          // Very restrictive for short terms
          query = query.or(
            `city.ilike.${searchValue}%,postcode.eq.${searchValue}`
          );
        }

        // Limit search results more aggressively to prevent timeouts
        query = query.limit(200); // Limit total search results
      }

      // Apply risk filter
      if (riskFilter) {
        query = query.eq("distance_category", riskFilter);
      }

      // Order by ID for better performance
      query = query.order("id", { ascending: true });

      // Apply pagination range
      query = query.range(
        (currentPage - 1) * pageSize,
        currentPage * pageSize - 1
      );

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setAddresses(data || []);

      // Set approximate count based on filters
      if (debouncedSearch.trim() || riskFilter) {
        setTotalCount(Math.min(data?.length || 0, 200)); // Cap at search limit
      } else {
        setTotalCount(2260024); // Known total for unfiltered results
      }
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses");
      setAddresses([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  const getRiskBadge = (
    category: string | undefined,
    distance: number | undefined
  ) => {
    if (!category) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          Unknown
        </span>
      );
    }

    if (category.includes("10 miles")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Very High Risk
        </span>
      );
    }

    if (category.includes("20 miles")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
          High Risk
        </span>
      );
    }

    if (category.includes("30 miles") || category.includes("40 miles")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
          Moderate Risk
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
        Low Risk
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 z-10">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by city or postcode (e.g., Sacramento, 95818)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-fire-high focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
          {searchTerm.length >= 6 && (
            <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-3 py-2 shadow-sm">
              💡 Tip: Longer searches use exact matching for better performance
            </div>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <select
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-fire-high focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Risk Levels</option>
            <option value="Within 10 miles">Very High Risk (10 mi)</option>
            <option value="Within 20 miles">High Risk (20 mi)</option>
            <option value="Within 30 miles">Moderate Risk (30 mi)</option>
            <option value="Within 40 miles">Low Risk (40 mi)</option>
          </select>
        </div>
      </div>

      {/* Results Count & Error */}
      <div className="mb-4">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-800 dark:text-red-200 font-medium">
              ⚠️ Error loading addresses
            </p>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchAddresses}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {addresses.length} of {totalCount.toLocaleString()}{" "}
            addresses
            {(debouncedSearch.trim() || riskFilter) && " (filtered)"}
            {searchTerm !== debouncedSearch && searchTerm.trim() && (
              <span className="text-gray-400 dark:text-gray-500 ml-2">
                • searching...
              </span>
            )}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                State
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Postcode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fire Risk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Distance (miles)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coordinates
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fire-high mr-3"></div>
                    Loading addresses...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="text-red-600 dark:text-red-400">
                    Failed to load addresses. Please check the error above and
                    try again.
                  </div>
                </td>
              </tr>
            ) : addresses.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No addresses found matching your criteria.
                </td>
              </tr>
            ) : (
              addresses.map((address) => (
                <tr
                  key={address.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {address.house_number && address.street
                            ? `${address.house_number} ${address.street}`
                            : address.full_address || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {address.city || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {address.state || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {address.postcode || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {getRiskBadge(
                      address.distance_category,
                      address.distance_to_fire_miles
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {address.distance_to_fire_miles
                      ? address.distance_to_fire_miles.toFixed(1)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {address.latitude && address.longitude
                      ? `${address.latitude.toFixed(4)}, ${address.longitude.toFixed(4)}`
                      : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!error && totalCount > pageSize && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {debouncedSearch.trim() || riskFilter
              ? `Page ${currentPage} (filtered results)`
              : `Page ${currentPage} of ${totalPages}`}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={loading || addresses.length < pageSize}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
