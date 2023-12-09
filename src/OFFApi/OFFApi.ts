import { fetchTyped } from "./fetchTyped";
import * as ApiTypes from "./types";

type OFFOptions = {
  /**
   * Country id.
   * List of countries https://world.openfoodfacts.org/countries.
   * @default 'world'
   */
  country: string;
  /**
   * Sort parameter for products used while requesting the API.
   */
  sortProductsBy: string;
  /**
   * Max number of results per API request.
   */
  pageSize: number;
  /**
   * User Agent used while requesting the API.
   */
  userAgent?: string;
  /**
   * AbortController instance used while requesting the API.
   * Allows you to cancel request at any time.
   */
  abortController?: AbortController;
};

export default class OFFApi {
  private baseUrl: string;
  private country: string;
  private sortProductsBy: string;
  private pageSize: number;
  private userAgent?: string;
  private abortController?: AbortController;

  constructor(options: Partial<OFFOptions> = DefaultOptions) {
    const mergedOptions = {
      ...DefaultOptions,
      ...options,
    };

    this.userAgent = mergedOptions.userAgent;
    this.country = mergedOptions.country;
    this.baseUrl = `https://${this.country}.openfoodfacts.org`;
    this.sortProductsBy = mergedOptions.sortProductsBy;
    this.pageSize = mergedOptions.pageSize;
    this.abortController = mergedOptions.abortController;
    if (this.abortController) {
      const { signal } = this.abortController;
      signal.onabort = () => {
        console.log("Abort signal received.");
        this.abortController = new AbortController();
      };
    }
  }

  async findProductByBarcode(
    barcode: string
  ): Promise<ApiTypes.Product | null> {
    const response = await this.request<ApiTypes.ProductResponse>(
      `/api/v0/product/${barcode}`
    );

    return response?.product ?? null;
  }

  findProductsBySearchTerm(
    searchTerm: string,
    sortProductsBy = "",
    page = 1,
    countries_tags = "",
    states_tags = "nutrition-facts-completed"
  ): Promise<ApiTypes.ProductsResponse> {
    const parsedTerm = encodeURIComponent(searchTerm);

    return this.request<ApiTypes.ProductsResponse>(
      `/cgi/search.pl?search_terms=${parsedTerm}&countries_tags=${countries_tags}&page=${page}&page_size=${
        this.pageSize
      }&sort_by=${
        sortProductsBy || this.sortProductsBy
      }&states_tags=${states_tags}search_simple=1&action=process&json=true`
    );
  }

  findProductsByBrand(
    brandName: string,
    page = 1
  ): Promise<ApiTypes.ProductsResponse> {
    return this.request(`/brand/${brandName}/${page}`);
  }

  findProductsByCategory(
    category: string,
    sortProductsBy = "",
    page = 1,
    countries_tags = "",
    nutrition_grades_tags = "",
    nova_groups_tags = "",
    ecoscore_tags = ""
  ): Promise<ApiTypes.ProductsResponse> {
    return this.request(
      `/api/v2/search?countries_tags=${countries_tags}&categories_tags_en=${category}&page=${page}&sort_by=${
        sortProductsBy || this.sortProductsBy
      }&nutrition_grades_tags=${nutrition_grades_tags}&nova_groups_tags=${nova_groups_tags}&fields=lc,origins_lc,code,product_name,countries,lang,brands,countries_tags,ingredients,ecoscore,nutriscore_data,nutriscore_grade,nova_group,nova_groups_tags,ecoscore_data,ecoscore_grade,ecoscore_score,energy-kcal_100g,categories_tags,image_front_thumb_url,`
    );
  }

  findCategories(): Promise<ApiTypes.TagsResponse> {
    return this.request("/categories");
  }

  findCountries(): Promise<ApiTypes.TagsResponse> {
    return this.request("/countries");
  }

  findIngredients(): Promise<ApiTypes.TagsResponse> {
    return this.request("/ingredients");
  }

  findPackagings(): Promise<ApiTypes.TagsResponse> {
    return this.request("/packaging");
  }

  findPackagingCodes(): Promise<ApiTypes.TagsResponse> {
    return this.request("/packager-codes");
  }

  findPurchasePlaces(): Promise<ApiTypes.TagsResponse> {
    return this.request("/purchase-places");
  }

  findStates(): Promise<ApiTypes.TagsResponse> {
    return this.request("/states");
  }

  findTraces(): Promise<ApiTypes.TagsResponse> {
    return this.request("/traces");
  }

  findEntryDates(): Promise<ApiTypes.TagsResponse> {
    return this.request("/entry-dates");
  }

  findAllergens(): Promise<ApiTypes.TagsResponse> {
    return this.request("/allergens");
  }

  findAdditives(): Promise<ApiTypes.TagsResponse> {
    return this.request("/additives");
  }

  findLanguages(): Promise<ApiTypes.TagsResponse> {
    return this.request("/languages");
  }

  findBrands(): Promise<ApiTypes.TagsResponse> {
    return this.request("/brands");
  }

  setController(abortController?: AbortController): this {
    this.abortController = abortController;
    return this;
  }

  setUserAgent(userAgent?: string): this {
    this.userAgent = userAgent;
    return this;
  }

  abortRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
  }

  private request<T extends object>(apiPath: string): Promise<T> {
    const headers = this.userAgent
      ? { "User-Agent": this.userAgent }
      : undefined;

    return fetchTyped<T>(`${this.baseUrl}${apiPath}.json`, { headers });
  }
}

const DefaultOptions: OFFOptions = {
  country: "world",
  sortProductsBy: "nutriscore_score",
  pageSize: 100,
  abortController: new AbortController(),
};
