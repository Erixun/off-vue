<template>
  <MainPage
    @click="collapseAll()"
    :hasCollapsed="state.hasCollapsedAll"
    v-on:open-up="setHasOpen()"
  />
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import MainPage from "./components/MainPage.vue";

export default defineComponent({
  name: "App",
  components: {
    MainPage,
  },
  setup() {
    const state = reactive({ hasCollapsedAll: true });

    return {
      state,
      collapseAll() {
        state.hasCollapsedAll = true;
      },
      setHasOpen() {
        state.hasCollapsedAll = false;
      },
    };
  },
});
</script>

<style lang="scss">
:root {
  --goud-beige: #f8f9fa;
  background-color: var(--goud-beige);
  font-size: clamp(14px, 1vw, 16px);
  overflow-x: hidden;
}
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  // max-width: 1000px;
  margin: 0 auto 0;
  position: relative;
}
</style>
