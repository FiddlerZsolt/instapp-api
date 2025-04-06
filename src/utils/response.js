// Define the BASE_RESPONSES constants since the constants file doesn't exist
const BASE_RESPONSES = {
  OK: 'OK',
  FAILED: 'FAILED',
};

/**
 * Class representing an API response for a single item
 */
class ApiResponse {
  /**
   * Create an API response for a single item
   * @param {any} item - The item to include in the response
   */
  constructor(item) {
    this.item = item;
    return this.getResponse();
  }

  /**
   * Get the response data
   * @returns {any} The formatted response
   */
  getResponse() {
    return this.item;
  }

  /**
   * Create a base response object
   * @param {boolean} ok - Whether the operation was successful
   * @returns {Object} The base response object
   */
  static baseResponse(ok = false) {
    return { result: ok ? BASE_RESPONSES.OK : BASE_RESPONSES.FAILED };
  }

  static created(res, item) {
    return res.status(201).json(item);
  }

  static success(res, item) {
    return res.status(200).json(item);
  }

  static notFound(res, item) {
    return res.status(404).json(item);
  }
}

/**
 * Class representing an API response for a list of items
 */
class ApiListResponse {
  /**
   * Create an API response for a list of items
   * @param {any[]} items - The items to include in the response
   */
  constructor(items) {
    this.items = items;
    return this.formatResponse();
  }

  /**
   * Format the response
   * @returns {Object} The formatted response
   */
  formatResponse() {
    return {
      items: this.items,
    };
  }

  /**
   * Get the response data
   * @returns {Object} The formatted response
   */
  getResponse() {
    return this.formatResponse();
  }
}

/**
 * Class representing a paginated API response
 */
class ApiPaginatedResponse {
  /**
   * Create a paginated API response
   * @param {Object} options - The pagination options
   * @param {any[]} options.items - The items to include in the response
   * @param {number} options.page - The current page number
   * @param {number} options.total - The total number of items
   * @param {number} options.limit - The maximum number of items per page
   */
  constructor({ items, page, total, limit }) {
    this.items = items;
    this.page = page;
    this.total = total;
    this.limit = limit;
    return this.formatResponse();
  }

  /**
   * Format the response
   * @returns {Object} The formatted response
   */
  formatResponse() {
    return {
      page: this.page,
      total: this.total,
      limit: this.limit,
      items: this.items,
    };
  }

  /**
   * Get the response data
   * @returns {Object} The formatted response
   */
  getResponse() {
    return this.formatResponse();
  }
}

export { ApiResponse, ApiListResponse, ApiPaginatedResponse, BASE_RESPONSES };
