<template>
  <div class="menu menu-right menu-options" :class="$attrs.class" @click.stop>
    <div class="menu-head">
      <h2>Options</h2>
      <button class="btn-shut-drawer btn-goud righty" @click="hideOptions()">
        -&gt;|
      </button>
    </div>
    <div class="menu-body">
      <section class="sort">
        <h3>Sort Products By</h3>
        <form @submit.prevent class="form-sort">
          <label
            v-for="(sortOption, index) in options.sortOptions"
            :key="index"
          >
            <span>{{ sortOption.label }}</span>
            <input
              type="radio"
              :value="sortOption.value"
              v-model="options.state.sortProductsBy"
            />
          </label>
        </form>
      </section>
      <section class="filter">
        <h3>Filter</h3>
        <form @submit.prevent class="form-filter">
          <label>
            <span>Exclude incomplete products</span>
            <input
              type="checkbox"
              v-model="options.state.excludeIncompleteProducts"
            />
          </label>
          <label class="label-score">
            <span>Nutri-score minimum:</span>
            <select
              v-model="options.state.nutriscoreScoreMinimum"
              :class="options.state.nutriscoreScoreMinimum"
            >
              <option
                v-for="(nutriscoreOption, index) in options.scoreOptions"
                :key="index"
                :value="nutriscoreOption.value"
                :class="nutriscoreOption.value"
              >
                {{ nutriscoreOption.label }}
              </option>
            </select>
          </label>
          <label class="label-score">
            <span>Eco-score minimum:</span>
            <select
              v-model="options.state.ecoscoreScoreMinimum"
              :class="options.state.ecoscoreScoreMinimum"
            >
              <option
                v-for="(ecoscoreOption, index) in options.scoreOptions"
                :key="index"
                :value="ecoscoreOption.value"
                :class="ecoscoreOption.value"
              >
                {{ ecoscoreOption.label }}
              </option>
            </select>
          </label>
          <label class="label-score">
            <span>Nova-group minimum:</span>
            <select
              v-model="options.state.novaGroupMinimum"
              :class="getColorClass(options.state.novaGroupMinimum)"
            >
              <option
                v-for="(novaGroupOption, index) in options.novaGroupOptions"
                :key="index"
                :value="novaGroupOption.value"
                :class="getColorClass(novaGroupOption.value)"
              >
                {{ novaGroupOption.label }}
              </option>
            </select>
          </label>
        </form>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { options } from "@/store/Options";

export default defineComponent({
  name: "DrawerOptions",
  emits: ["shutDrawer"],
  setup(_, { emit }) {
    const getColorClass = (value: number) => {
      switch (value) {
        case 1:
          return "a";
        case 2:
          return "c";
        case 3:
          return "d";
        default:
          return "e";
      }
    };

    return {
      options,
      getColorClass,
      hideOptions() {
        emit("shutDrawer");
      },
    };
  },
});
</script>

<style lang="scss" scoped>
$goud-beige: var(--goud-beige);
$goud-green: var(--goud-green);
.menu-right {
  border-radius: 4px 0 0 4px;
  text-align: left;
  display: flex;
  flex-direction: column;
  background: $goud-beige;
  .menu-head {
    background: $goud-green;
    color: $goud-beige;
    display: flex;
    justify-content: space-between;
    position: relative;

    h2 {
      margin: 0;
      padding-top: 2px;
      box-sizing: border-box;
      font-size: 1.5rem;
      height: 32px;
      font-weight: bold;
      text-shadow: 1px 1px #595959;
    }
  }
}
.menu-body {
  padding: 2rem 0.5rem 0 1rem;
  background-color: var(--goud-beige);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  row-gap: 1rem;

  h3 {
    margin: 0.5rem 0;
    padding: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }

  form {
    padding-left: 5px;
  }

  .form-sort {
    display: flex;
    gap: 0.5rem;

    label {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      cursor: pointer;

      input {
        margin-right: 0.5rem;
        margin-left: 0.25rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        width: 1.1rem;
        height: 1.1rem;
        border: none;
        background: none;
        outline: none;
        cursor: pointer;
      }
    }
  }

  .form-filter {
    display: flex;
    flex-direction: column;

    label {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;

      input {
        margin-right: 0.5rem;
        margin-left: 0.5rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        width: 1.1rem;
        height: 1.1rem;
        border: none;
        background: none;
        outline: none;
        cursor: pointer;
      }

      select {
        margin-left: 0.5rem;
        font-weight: bold;
        color: white;
        text-shadow: 0 0 5px rgb(66, 66, 66);
        border: 1px solid black;
        border-radius: 3px;
        height: 1.5rem;

        option {
          color: rgba(255, 255, 255, 0.5);

          &:hover {
            color: white;
            background: var(--goud-beige);
          }
        }
      }
      .a {
        background: #00803d;
      }
      .b {
        background: #87bd25;
      }
      .c {
        background: #fc0;
      }
      .d {
        background: #ef7d00;
      }
      .e {
        background: #e63312;
      }
    }
  }
}
</style>
