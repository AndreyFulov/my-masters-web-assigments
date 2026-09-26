export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  items: OrderItemInput[];
}

export interface Order {
  ID: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: {
    ID: number;
    product_id: number;
    product: Product;
    quantity: number;
    price: number;
  }[];
}

// Add to your productApi or export as orderApi:
export const orderApi = {
  async create(input: CreateOrderInput): Promise<Order> {
    const res = await request<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  },
};
// --- Domain Models ---
export interface ProductImage {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  product_id: number;
  url: string;
}

export interface Product {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  images?: ProductImage[];
  visible: boolean;
}

// DTOs for request payloads
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  visible: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

// Standard API response envelopes from Fiber
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  error: string;
}

// Custom Error Class
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Base Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Generic Fetch Wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  // Default to application/json unless body is FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = (data as ApiErrorResponse)?.error || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorMessage);
  }

  return data as T;
}

// --- Product API Functions ---

export const productApi = {
  /**
   * Fetch all products (includes preloaded images)
   */
  async getAll(): Promise<Product[]> {
    const res = await request<ApiResponse<Product[]>>('/products');
    return res.data;
  },
  async getAllAndInvisible(): Promise<Product[]> {
    const res = await request<ApiResponse<Product[]>>('/products/?alsoInvisible=true');
    return res.data;
  },

  /**
   * Fetch a single product by its ID
   */
  async getById(id: number): Promise<Product> {
    const res = await request<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  /**
   * Create a new product
   */
  async create(input: CreateProductInput): Promise<Product> {
    const res = await request<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Update an existing product by ID
   */
  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const res = await request<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return res.data;
  },

  /**
   * Delete a product by ID
   */
  async delete(id: number): Promise<void> {
    await request<ApiResponse<null>>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Upload an image file for a specific product
   * Accepts a browser File or Blob object
   */
  async uploadImage(productId: number, file: File | Blob): Promise<ProductImage> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await request<ApiResponse<ProductImage>>(`/products/${productId}/images`, {
      method: 'POST',
      body: formData, // Browser automatically sets Content-Type to multipart/form-data with boundary
    });
    return res.data;
  },

  /**
   * Utility helper to get absolute URL for image display
   */
  getImageUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Strips '/api/v1' to point to host root (e.g. http://localhost:3000/uploads/...)
    const host = BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${host}${path}`;
  },
};