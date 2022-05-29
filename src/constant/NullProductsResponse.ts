import { ProductsResponse } from "@/OFFApi/types/response";

const NullProductsResponse: ProductsResponse = {
  products: [],
  skip: 0,
  count: 0,
  page_size: 0,
  page: 0,
};

export default NullProductsResponse;
