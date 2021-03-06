import { reactive } from "vue";

export const options = {
  state: reactive({
    country: "world",
    mainLanguage: "en",
    sortProductsBy: "nutriscore_score",
    excludeIncompleteProducts: false,
    nutriscoreScoreMinimum: "e",
    ecoscoreScoreMinimum: "e",
    novaGroupMinimum: 4,
  }),
  sortOptions: [
    {
      value: "nutriscore_score",
      label: "Nutriscore",
    },
    {
      value: "ecoscore_score",
      label: "Ecoscore",
    },
    {
      value: "nova_group",
      label: "Nova group",
    },
  ],
  scoreOptions: [
    {
      value: "a",
      label: "A",
    },
    {
      value: "b",
      label: "B",
    },
    {
      value: "c",
      label: "C",
    },
    {
      value: "d",
      label: "D",
    },
    {
      value: "e",
      label: "E",
    },
  ],
  getNutritionGradesTags: () => {
    const { nutriscoreScoreMinimum } = options.state;
    return options.scoreOptions
      .map((s) => s.value)
      .filter((s) => s <= nutriscoreScoreMinimum)
      .join("|");
  },
  novaGroupOptions: [
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 3,
      label: "3",
    },
    {
      value: 4,
      label: "4",
    },
  ],
  getNovaGroupsTags: () => {
    const { novaGroupMinimum } = options.state;
    return options.novaGroupOptions
      .map((s) => s.value)
      .filter((s) => s <= novaGroupMinimum)
      .join("|");
  },
};
