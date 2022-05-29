<template>
  <div class="container" :class="{ 'no-scroll': state.selectedProduct }">
    <header>
      <h1>Goud</h1>
      <h2><i>rated foods for the common good</i></h2>
      <div class="header-bg"></div>
    </header>
    <main>
      <div class="control-panel">
        <div class="field-search" v-if="state.selectedCategory === null">
          <form @submit.prevent>
            <label for="search-input">Search food:</label>
            <input
              type="search"
              id="search-input"
              v-model="state.searchTerm"
              placeholder="E.g. Potato"
              @keyup.enter="execSearch()"
            />
            <div class="action">
              <button
                v-show="state.searchTerm && state.hasExecutedSearch"
                :disabled="!(state.searchTerm && state.hasExecutedSearch)"
                class="btn-goud abs x"
                @click="clearSearch()"
              >
                &times;
              </button>
              <button class="btn-goud btn-exec-search" @click="execSearch()">
                Go!
              </button>
            </div>
          </form>
        </div>
        <h3 v-else class="category-header">
          Category - {{ state.selectedCategory.name }}
          <button class="btn-goud abs x" @click="clearCategory()">╳</button>
        </h3>
        <div class="field-country">
          <form @submit.prevent>
            <span>sold in</span>
            <select
              class="country-select"
              id="country"
              v-model="state.selectedCountry"
              @change="handleCountryChange()"
            >
              <option :value="null" default>Any Country</option>
              <option
                v-for="country in state.countries"
                :key="country"
                :value="country"
              >
                {{ country.name }}
              </option>
            </select>
          </form>
        </div>
        <div class="drawer-btns">
          <button
            class="btn-categories btn-goud righty"
            @click.stop="displayCategories()"
          >
            |-> Categories
          </button>
          <button
            class="btn-categories btn-goud lefty"
            @click.stop="displayCategories()"
          >
            Options &lt;-|
          </button>
        </div>

        <div
          @click.stop
          class="menu-categories"
          :class="{ expand: state.canShowCategories && !$props.hasCollapsed }"
        >
          <div class="menu-head">
            <button
              class="btn-shut-drawer btn-goud lefty"
              @click="hideCategories()"
            >
              |&lt;-
            </button>
            <div class="field-search">
              <form @submit.prevent>
                <label for="search-input">Search category:</label>
                <input
                  type="search"
                  id="search-input"
                  ref="categorySearch"
                  v-model="state.searchCategoryTerm"
                  placeholder="E.g. Dairy"
                  @input="filterCategories()"
                />
              </form>
            </div>
          </div>
          <ul class="list-categories">
            <li
              v-for="category in state.categories"
              :key="category"
              tabindex="0"
              @click="getProductsByCategory(category)"
              @keyup.enter="getProductsByCategory(category)"
              @keyup.space="getProductsByCategory(category)"
            >
              {{ category.name }}
            </li>
          </ul>
        </div>
      </div>
      <ul class="product-grid">
        <li
          class="product-card"
          v-for="product of state.products"
          :key="product.id"
          @click="getProduct(product.code)"
          :title="product.product_name"
        >
          <div class="upper">
            <img
              :src="
                product.image_front_thumb_url || '/img/tallriksmodellen.webp'
              "
              :alt="product.generic_name"
              loading="lazy"
            />
          </div>
          <div class="lower">
            <div class="lower-head">
              <h3 class="product-name">
                {{ product.product_name.substr(0, 25).trim()
                }}{{ product.product_name.length > 25 ? "..." : "" }}
              </h3>
              <small>{{ product.brands || "Brand Unspecified" }}</small>
            </div>
            <div class="scores">
              <img
                class="nutriscore-img img-small"
                :src="`https://static.openfoodfacts.org/images/attributes/nutriscore-${
                  product.nutriscore_grade ?? 'unknown'
                }.svg`"
                alt=""
              />
              <img
                class="ecoscore-img img-small"
                :src="`https://static.openfoodfacts.org/images/attributes/ecoscore-${product.ecoscore_grade}.svg`"
                alt=""
              />
              <img
                class="novagroup-img img-small"
                :src="`https://static.openfoodfacts.org/images/attributes/nova-group-${
                  product.nova_group ?? 'unknown'
                }.svg`"
                alt=""
              />
            </div>
          </div>
        </li>
      </ul>
      <p v-if="state.isLoading" class="load-text">Gathering foods...</p>
      <p
        v-else-if="state.products.length === 0 && state.hasExecutedSearch"
        class="no-result-msg"
      >
        Sorry, no foods found...
      </p>
      <div class="page-list-wrapper">
        <ol class="page-list" v-if="state.pages.length > 1 && !state.isLoading">
          <li
            class="page"
            :class="{
              current: state.currentPage === +page,
              ellipsis: page === '...',
            }"
            v-for="(page, i) of state.pages"
            :key="i"
            @click="getPage(+page)"
          >
            {{ page }}
          </li>
        </ol>
      </div>
      <figure
        v-if="!state.hasExecutedSearch && !hasProducts() && !state.isLoading"
      >
        <figcaption>An app based on</figcaption>
        <a href="https://world.openfoodfacts.org/" target="_blank">
          <img
            id="logo"
            src="../assets/openfoodfacts-logo-en.png"
            alt="Open Food Facts logo"
            style="margin-bottom: 0.5rem"
            width="178"
            height="150"
          />
        </a>
      </figure>
    </main>
    <div
      class="product-view"
      v-if="state.selectedProduct"
      @click="dismissProduct()"
    >
      <div class="grid" :class="{ show: state.hasProductInView }" @click.stop>
        <button class="btn-dismiss" @click="dismissProduct()">╳</button>
        <div class="grid-item img-front">
          <img
            :src="state.selectedProduct.image_front_url"
            :alt="state.selectedProduct.product_name"
          />
        </div>
        <div class="grid-item">
          <h3>{{ state.selectedProduct.product_name }}</h3>
          <p>{{ state.selectedProduct.brands || "Brand Unspecified" }}</p>
        </div>
        <figure class="figure-nutriscore">
          <img
            class="nutriscore-img"
            :src="`https://static.openfoodfacts.org/images/attributes/nutriscore-${
              state.selectedProduct.nutriscore_grade ?? 'unknown'
            }.svg`"
            alt=""
          />
        </figure>
        <div class="grid-item nutrients">
          <table class="n-table">
            <thead>
              <tr>
                <th>Nutrition</th>
                <th>per 100g</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="n-label">Energy</td>
                <td>
                  {{ state.selectedProduct.nutriments.energy || "?" }} kJ ({{
                    state.selectedProduct.nutriments["energy-kcal"] || "?"
                  }}
                  kcal)
                </td>
              </tr>
              <tr
                :class="{
                  danger: nutrientLevels.fat === 'high',
                  warning: nutrientLevels.fat === 'moderate',
                }"
              >
                <td class="n-label">Fat</td>
                <td>{{ state.selectedProduct.nutriments.fat || "?" }} g</td>
              </tr>
              <tr
                :class="{
                  danger: nutrientLevels['saturated-fat'] === 'high',
                  warning: nutrientLevels['saturated-fat'] === 'moderate',
                }"
              >
                <td class="n-label indented">Saturated fat</td>
                <td>
                  {{ state.selectedProduct.nutriments["saturated-fat"] || "?" }}
                  g
                </td>
              </tr>
              <tr>
                <td class="n-label">Carbohydrates</td>
                <td>
                  {{ state.selectedProduct.nutriments.carbohydrates || "?" }} g
                </td>
              </tr>
              <tr
                :class="{
                  danger: nutrientLevels.sugars === 'high',
                  warning: nutrientLevels.sugars === 'moderate',
                }"
              >
                <td class="n-label indented">Sugars</td>
                <td>{{ state.selectedProduct.nutriments.sugars || "?" }} g</td>
              </tr>
              <tr>
                <td class="n-label">Proteins</td>
                <td>
                  {{ state.selectedProduct.nutriments.proteins || "?" }} g
                </td>
              </tr>
              <tr
                :class="{
                  danger: nutrientLevels.salt === 'high',
                  warning: nutrientLevels.salt === 'moderate',
                }"
              >
                <td class="n-label">Salt</td>
                <td>{{ state.selectedProduct.nutriments.salt || "?" }} g</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="grid-item ingredients">
          <figure class="figure-nova">
            <img
              class="novagroup-img"
              :src="`https://static.openfoodfacts.org/images/attributes/nova-group-${
                state.selectedProduct.nova_group ?? 'unknown'
              }.svg`"
              alt=""
            />
            <figcaption>
              {{ nova.description }}
            </figcaption>
          </figure>
          <p>
            <strong>Ingredients: </strong>
            <template v-for="(ingredient, i) of ingredients" :key="i">
              <strong v-if="ingredient.includes('_')">{{
                ingredient.replace(/_/g, "")
              }}</strong>
              <span v-else>{{ ingredient }}</span>
              <!-- {{ ingredient }} -->
            </template>
            <!-- {{ ingredients }} -->
            <!-- {{
              state.selectedProduct.ingredients_text_en ||
              state.selectedProduct.ingredients_text ||
              "Unavailable..."
            }} -->
          </p>
        </div>
        <div class="grid-item">
          <figure class="figure-nova">
            <img
              class="ecoscore-img"
              :src="`https://static.openfoodfacts.org/images/attributes/ecoscore-${state.selectedProduct.ecoscore_grade}.svg`"
              alt=""
            />
            <figcaption class="figc-eco">
              This product has a
              {{ describeEcoScore(state.selectedProduct.ecoscore_grade) }}
              impact on the environment
            </figcaption>
          </figure>
        </div>
        <div class="grid-item">
          <a
            :href="`https://world.openfoodfacts.org/product/${state.selectedProduct.id}/${state.selectedProduct.product_name}`"
            target="_blank"
            rel="noopener noreferrer"
            class="off-prod-link"
            >Edit on Open Food Facts</a
          >
        </div>
      </div>
    </div>
    <p class="note">
      <b>Note:</b> some of the products are incomplete, and their associated
      data may be incorrect. <br />You are more than welcome to improve existing
      products, or add your own, via
      <a
        href="https://world.openfoodfacts.org/open-food-facts-mobile-app"
        target="_blank"
      >
        the official Open Food Facts-app.
      </a>
    </p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, reactive, ref } from "vue";
import {
  Nutriments,
  Product,
  ProductsResponse,
  Tag,
  TagsResponse,
} from "../OFFApi/types";
import OFFApi from "@/OFFApi/OFFApi";
import countries from "@/assets/countries.json";
import categories from "@/assets/categories.json";

export default defineComponent({
  props: {
    hasCollapsed: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["open-up"],
  setup(_props, context) {
    const state = reactive<{
      countries: Array<Tag>;
      selectedCountry: null | Tag;
      canShowCategories: boolean;
      categories: Array<Tag>;
      selectedCategory: null | Tag;
      searchTerm: null;
      searchCategoryTerm: null;
      products: Array<Product>;
      isLoading: boolean;
      hasExecutedSearch: boolean;
      allPages: string[];
      pages: string[];
      currentPage: number;
      selectedProduct: null | Product;
      hasProductInView: boolean;
      lastRequest: "" | "search" | "category";
    }>({
      countries: Array<Tag>(),
      selectedCountry: null,
      canShowCategories: false,
      categories: Array<Tag>(),
      selectedCategory: null,
      searchTerm: null,
      searchCategoryTerm: null,
      products: Array<Product>(),
      isLoading: false,
      hasExecutedSearch: false,
      allPages: [],
      pages: [],
      currentPage: 1,
      selectedProduct: null,
      hasProductInView: false,
      lastRequest: "",
    });

    const OFF = new OFFApi();

    onBeforeMount(async () => {
      state.categories = categories.tags
        .filter((t) => t.id.startsWith("en:") && t.products > 1000)
        .sort((a, z) => (a.name > z.name ? 1 : -1));
      const response: TagsResponse = countries;
      state.countries = response.tags.sort((a, z) =>
        a.name > z.name ? 1 : -1
      );
    });

    const logInput = () => {
      console.log(state.searchTerm);
    };

    const initLoading = () => {
      state.hasExecutedSearch = true;
      state.products = [];
      state.isLoading = true;
    };

    const execSearch = async (page = 1) => {
      if (!state.searchTerm) return;
      initLoading();

      const countryId = state.selectedCountry ? state.selectedCountry.id : "";
      const response = await OFF.findProductsBySearchTerm(
        state.searchTerm,
        page,
        countryId
      );

      if (response.products.length === 0) {
        state.isLoading = false;
        return;
      }

      state.currentPage = page;

      state.products = response.products.filter(
        (p) => p.product_name && p.nutriscore_grade && p.image_front_thumb_url
      );
      state.products.forEach(
        (p) => (p.brands = p.brands?.split(",").join(", "))
      );

      handlePages(response);

      state.isLoading = false;
      state.lastRequest = "search";
    };

    const handlePages = (response: ProductsResponse) => {
      const emptyPages = Array(Math.floor(response.count / response.page_size));
      const everyPage = Array.from(emptyPages, (p, i) => `${i + 1}`);
      state.allPages = everyPage;

      if (everyPage.length < 7) {
        state.pages = everyPage;
      } else {
        const firstThree = everyPage.slice(0, 3);
        const end = everyPage.length;
        const lastThree = everyPage.slice(end - 3, end);

        const pages = [...firstThree, "...", ...lastThree];
        state.pages = pages;
      }
    };

    const getPage = async (page: number) => {
      if (page === state.currentPage) return;

      state.selectedCategory
        ? await getProductsByCategory(state.selectedCategory, page)
        : await execSearch(page);

      state.currentPage = page;

      if (state.allPages.length < 7) return;

      const surroundingPages = [
        page - 2,
        page - 1,
        page,
        page + 1,
        page + 2,
      ].filter((p) => 0 < p && p < state.allPages.length);

      if (5 < surroundingPages[0]) {
        surroundingPages.unshift(NaN);
      }
      if (surroundingPages[4] < +state.allPages[state.allPages.length - 4]) {
        surroundingPages.push(NaN);
      }

      const first = [1, 2, 3].filter((p) => !surroundingPages.includes(p));
      const last = getLastThree().filter((p) => !surroundingPages.includes(+p));
      const pagesNums = [...first, ...surroundingPages, ...last];
      state.pages = pagesNums.map((p) => String(+p || "..."));
    };

    const getLastThree = () => {
      const end = state.allPages.length;
      const lastThree = state.allPages.slice(end - 3, end);
      return lastThree;
    };

    const filterCategories = () => {
      state.categories = categories.tags.filter(
        (t) =>
          t.name.includes(state.searchCategoryTerm ?? "") &&
          t.id.startsWith("en:") &&
          t.products > 1000
      );
    };

    const displayCategories = () => {
      state.canShowCategories = true;
      context.emit("open-up");
      categorySearch.value?.focus();
    };

    const getProductsByCategory = async (category: Tag, page = 1) => {
      initLoading();
      state.selectedCategory = category;
      state.searchTerm = null;
      state.canShowCategories = false;
      const country_tag = state.selectedCountry?.id ?? "";
      OFF.findProductsByCategory(category.id, page, country_tag)
        .then((response) => {
          console.log(response);
          state.products = response.products.filter(
            (p) => p.product_name && p.image_front_thumb_url
          );
          state.products.forEach(
            (p) =>
              (p.brands = Array.from(
                new Set(p.brands?.split(",").map((b) => b.trim()))
              ).join(", "))
          );
          if (page === 1) handlePages(response);
        })
        .finally(() => {
          state.isLoading = false;
          state.currentPage = page;
          state.lastRequest = "category";
        });
    };

    const handleCountryChange = () => {
      if (!(state.searchTerm || state.selectedCategory)) return;
      switch (state.lastRequest) {
        case "search":
          execSearch();
          break;
        case "category":
          getProductsByCategory(state.selectedCategory!);
          break;
        default:
          break;
      }
    };

    const getProduct = async (barCode: string) => {
      await OFF.findProductByBarcode(barCode)
        .then((response) => {
          console.log(response);
          state.selectedProduct = response;
          if (response && response.brands) {
            state.selectedProduct!.brands = Array.from(
              new Set(response.brands.split(",").map((b) => b.trim()))
            ).join(", ");
          }
        })
        .catch((e) => {
          console.log(e);
        });

      setTimeout(() => {
        state.hasProductInView = true;
      }, 0);
    };

    const hideCategories = () => (state.canShowCategories = false);
    const clearCategory = () => {
      state.selectedCategory = null;
      state.hasExecutedSearch = false;
      state.products = [];
      state.pages = [];
      state.currentPage = 1;
    };

    const clearSearch = () => {
      state.searchTerm = null;
      state.hasExecutedSearch = false;
      state.products = [];
      state.pages = [];
      state.currentPage = 1;
    };

    const hasCleared = () => !state.selectedCategory && !state.searchTerm;
    const hasProducts = () => state.products.length > 0;
    const dismissProduct = () => {
      state.hasProductInView = false;
      setTimeout(() => {
        state.selectedProduct = null;
      }, 200);
    };

    const describeEcoScore = (score: string) => {
      switch (score) {
        case "a":
          return "very low";
        case "b":
          return "low";
        case "c":
          return "moderate";
        case "d":
          return "high";
        case "e":
          return "very high";
        default:
          return "unknown";
      }
    };
    const categorySearch = ref<null | HTMLInputElement>(null);
    return {
      categorySearch,
      state,
      nutriments: computed(
        () => state.selectedProduct?.nutriments as Nutriments
      ),
      nutrientLevels: computed(() => state.selectedProduct?.nutrient_levels),
      ingredients: computed(() => {
        if (!state.selectedProduct) return;
        const ingredientsText =
          state.selectedProduct?.ingredients_text_en ||
          state.selectedProduct?.ingredients_text ||
          "";

        const matchedIngredients = ingredientsText.match(
          /\s?_[^_]+_{1}|((?<![\s|(]_)[^_]+(?!_))/g
        );
        console.log(matchedIngredients);
        return matchedIngredients;
      }),
      nova: computed(() => {
        const group = state.selectedProduct?.nova_group;
        const description =
          group === 1
            ? "Unprocessed or minimally processed food"
            : group === 2
            ? "Processed culinary ingredient"
            : group === 3
            ? "Processed food"
            : group === 4
            ? "Ultra-processed food or drink product"
            : "Nova-group not specified";
        return {
          group,
          description,
        };
      }),
      describeEcoScore,
      getPage,
      logInput,
      execSearch,
      filterCategories,
      displayCategories,
      hideCategories,
      getProduct,
      getProductsByCategory,
      handleCountryChange,
      clearSearch,
      clearCategory,
      hasCleared,
      hasProducts,
      dismissProduct,
    };
  },
});
</script>

<style lang="scss" scoped>
$form-width: 400px;
$border-color-base: #c3c3c3;
$goud-green: rgb(2, 127, 2);
$goud-beige: var(--goud-beige);

.container {
  position: relative;
  display: grid;
  grid-template-rows: 150px 1fr;
  box-sizing: border-box;
  height: 100vh;
  &.no-scroll {
    overflow: hidden;
  }
}
header {
  color: var(--goud-beige);
  position: relative;
  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    text-shadow: 2px 2px #595959;
  }
  h2 {
    font-size: 1.3rem;
    font-weight: bold;
    text-shadow: 1px 1px #595959;
  }
  .header-bg {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: $goud-green;
    border-radius: 0 0 50% 50%;
    z-index: -1;
    height: 200%;
    width: 200%;
    transform: translateX(-25%);
  }
}
main {
  position: relative;
  margin-top: 2rem;
  max-width: 100vw;
}
.control-panel {
  padding: 5px;
}

.field-search {
  max-width: $form-width;
  margin: auto;
  height: 30px;
  border: 1px solid #80808078;
  border-radius: 20px;
  padding: 0 3px 0 8px;
  background-color: white;

  &:focus-within {
    outline: 2px solid lightblue;
  }

  form {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 6fr 60px;
    grid-template-areas: "search-label search-field action";
    align-items: center;

    label {
      margin-bottom: -2px;
      white-space: nowrap;
      grid-area: search-label;
    }

    input {
      border: none;
      font-size: inherit;
      grid-area: search-field;
      &:focus {
        outline: none;
      }
    }

    .action {
      grid-area: action;
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 2px;
      .x {
        background-color: #888;
        border-color: #888;
        height: 25px;
        width: 25px;
        line-height: 1rem;
        &:hover {
          background-color: #666;
          border-color: #666;
        }
      }
    }

    .btn-exec-search {
      background-color: $goud-green;
      padding: 2px 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      justify-self: end;
      &:hover {
        background-color: $goud-green;
      }
    }
  }
}

.drawer-btns {
  display: flex;
  justify-content: space-between;
  max-width: min(1300px, 100%);
  margin: auto;
  height: 30px;
  padding: 10px 0 5px;
}

.category-header {
  font-size: 1.6rem;
  grid-area: b;
  margin: 2px;
  white-space: normal;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;

  .x {
    background-color: #888;
    border-color: #888;
    line-height: 0.5;
    padding-bottom: 4px;
    font-weight: bold;
    font-size: 0.6rem;
    width: 1.4rem;
    height: 1.4rem;
    &:hover {
      background-color: #666;
      border-color: #666;
    }
  }
}

.btn-goud {
  background-color: rgb(2, 127, 2);
  border: 2px solid rgb(2, 127, 2);
  border-radius: 14px;
  padding: 2px;
  color: whitesmoke;
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    filter: saturate(0.6);
  }

  &.righty {
    border-radius: 2px 14px 14px 2px;
    padding: 0 7px 2px;
  }
  &.lefty {
    border-radius: 14px 2px 2px 14px;
    padding: 0 7px 2px;
  }
}

.field-country {
  max-width: $form-width;
  margin: auto;
  form {
    display: flex;
    gap: 5px;
    padding-left: 8px;
    align-items: baseline;
    justify-content: center;
  }
  .country-select {
    width: 200px;
    max-width: 200px;
    margin-top: 4px;
  }
}

.menu-categories {
  outline: 1px solid $border-color-base;
  border-radius: 4px;
  position: absolute;
  z-index: 12345;
  left: 0;
  top: 0;
  overflow: auto;
  background-color: $goud-green;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  width: 400px;

  transform: translateX(-100%);
  opacity: 0;
  transition: all 500ms;
  pointer-events: none;

  &.expand {
    transform: translateX(0);
    opacity: 1;
    pointer-events: unset;
  }
  .menu-head {
    display: flex;
    gap: 5px;
    position: sticky;
    top: 0;
    background-color: inherit;
    padding: 9px 8px 0;

    .btn-shut-drawer {
      background-color: #999;
      border-color: #999;
      color: whitesmoke;

      &:hover {
        background-color: #888;
        border-color: #888;
      }
    }

    .field-search {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
      padding-left: 5px;
      margin: unset;
      max-width: unset;
      flex-grow: 1;
      form {
        grid-template-columns: auto 1fr;
      }
    }
  }
  .list-categories {
    list-style: none;
    padding: 0;
    color: whitesmoke;

    li {
      padding: 2px;
      cursor: pointer;
      &:hover {
        background-color: #006200;
      }
    }
  }
}

.product-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  padding: 1rem 3rem;
  grid-column-gap: 15px;
  grid-row-gap: 30px;
  margin: auto;
  max-width: Min(1300px, 100%);
}

.product-card {
  margin: 0 auto;
  padding: 1rem;
  border-radius: 3px;
  background-color: white;
  box-shadow: rgba(119, 119, 119, 0.35) 0px 0px 0.357143rem 0px;
  display: grid;
  grid-template: 2fr 3fr / 1fr;
  max-width: 200px;
  cursor: pointer;
  &:hover {
    box-shadow: rgba(119, 119, 119, 0.5) 0px 0px 0.357143rem 0px;
  }
  .upper {
    align-self: center;

    img {
      max-height: 105px;
    }
  }
  .lower {
    justify-self: center;
    border-top: 1px solid #80808063;
    width: 85%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.lower-head {
  margin: 0.5rem 0;
}
.product-name {
  font-size: 1rem;
  margin: 0;
  text-transform: capitalize;
}

.nutriscore-img.img-small {
  height: 50px;
}
.ecoscore-img.img-small {
  height: 40px;
}
.novagroup-img.img-small {
  height: 50px;
  margin-left: 20px;
}

.load-text {
  animation: pulse 500ms ease 0ms alternate infinite;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

.page-list-wrapper {
  display: flex;
  justify-content: center;
  position: sticky;
  bottom: 2px;

  .page-list {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    max-width: 100vw;
    padding: 5px;
    outline: 1px solid $border-color-base;
    border-radius: 7px;
    background-color: white;
    margin: 5px 0;
    .page {
      padding: 5px 8px;
      background-color: lightgray;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        filter: brightness(0.97);
      }

      &.ellipsis {
        background-color: transparent;
        font-weight: bold;
        pointer-events: none;
      }
      &.current {
        pointer-events: none;
        outline: 2px solid $goud-green;
        border-radius: 5px;
      }
    }
  }
}

.product-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99999;
  display: flex;
  align-items: center;
  flex-direction: column;

  .grid {
    position: sticky;
    top: 0px;
    width: Min(100%, 1000px);
    height: 100vh;
    padding: 2rem 2rem 0;
    background-color: #fff;
    overflow: auto;
    border-radius: 3px;
    box-sizing: border-box;
    display: grid;
    opacity: 0;
    transition: all 200ms;
    transform: translateY(20%);

    &.show {
      opacity: 1;
      transition: all 200ms;
      transform: translateY(0);
    }

    .btn-dismiss {
      position: absolute;
      cursor: pointer;
      top: 10px;
      right: 15px;
      width: 40px;
      height: 40px;
      font-weight: bold;
      font-size: inherit;
      border: none;
      border-radius: 50%;
      border: 1px solid #848484;
      color: #626262;
      color: white;
      background-color: #888;
      border-color: #888;
      &:hover {
        background-color: #666;
        border-color: #666;
      }
    }

    .img-front {
      img {
        max-width: 100%;
        height: 300px;
      }
    }

    h3 {
      margin: 0;
    }
    h3 + p {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }

    .grid-item {
      padding: 0.5rem;
    }

    .nutriscore-img,
    .novagroup-img {
      height: 60px;
    }
    .nutriscore-img {
      filter: drop-shadow(0px 0px 1px #000);
    }
    .ecoscore-img {
      height: 50px;
      filter: drop-shadow(0px 0px 1px #000);
    }

    .figure-nutriscore {
      margin: 0;
    }

    .figure-nova {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin: 0 1rem;

      figcaption {
        margin-bottom: 0;
        margin-top: 15px;
        text-align: left;
      }

      .figc-eco {
        margin-top: 5px;
      }
    }

    .ingredients {
      max-width: 500px;
      margin: 10px auto;
      // text-transform: capitalize;
      background-color: rgba(33, 150, 83, 0.1);
      border: 1px solid $border-color-base;
      border-radius: 3px;
    }
  }
}

.n-table {
  margin: auto;
  padding: 1rem;
  background: beige;
  border: 1px solid $border-color-base;
  border-radius: 3px;

  .danger {
    color: rgb(207, 1, 1);
    font-weight: bold;
  }
  td,
  th {
    text-align: right;
  }
  th:first-child,
  .n-label {
    text-align: left;
    &.indented {
      padding-left: 0.5rem;
    }
  }
}

figcaption {
  margin-bottom: 5px;
  font-style: italic;
}

.off-prod-link {
  text-decoration: none;
  padding-bottom: 1rem;
  font-size: 0.9rem;
  &:hover {
    text-decoration: underline;
    color: $goud-green;
  }
}

.note {
  width: 100%;
  padding-bottom: 10px;
}
</style>