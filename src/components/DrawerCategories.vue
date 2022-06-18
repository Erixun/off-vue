<template>
  <div
    @click.stop
    class="menu-categories"
    ref="menuCategories"
    :class="{ expand: state.canExpand }"
  >
    <div class="menu-head">
      <div class="field-search">
        <form @submit.prevent>
          <input
            type="search"
            id="search-category-input"
            ref="categorySearch"
            aria-label="Search for a category"
            v-model="state.searchCategoryTerm"
            placeholder="Search category, e.g. Dairy"
            @input="filterCategories()"
          />
        </form>
      </div>
      <button class="btn-shut-drawer btn-goud lefty" @click="hideCategories()">
        |&lt;-
      </button>
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
</template>
