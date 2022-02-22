<template>
  <v-select
    :value="value"
    class="ml-4"
    :items="items"
    dense
    solo
    menu-props="auto"
    hide-details
    label="strokeWidth"
    style="max-width: 200px"
    @input="$emit('input', $event)"
  >
    <template v-slot:selection="{ item, on, attrs }">
      <v-list-item ripple dense v-bind="attrs" v-on="on">
        <v-list-item-action class="my-0">
          <div :style="[strokeStyle(item.value)]"></div>
        </v-list-item-action>
        <v-list-item-content v-text="item.text"></v-list-item-content>
      </v-list-item>
    </template>
    <template v-slot:item="{ item, on, attrs }">
      <v-list-item ripple v-bind="attrs" dense v-on="on">
        <v-list-item-action class="my-0">
          <div :style="[strokeStyle(item.value)]"></div>
        </v-list-item-action>
        <v-list-item-content v-text="item.text"></v-list-item-content>
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
module.exports = {
  props: {
    value: {
      type: Number,
    },
    items: Array,
    strokeCircle: {
      type: Boolean,
      default: false,
    },
    strokeColor: {
      type: String,
      default: "#000000",
    },
  },
  methods: {
    strokeStyle(value) {
      return {
        display: "block",
        alignSelf: "center",
        margin: "8px",
        background: this.strokeColor,
        height: value + "px",
        borderRadius: this.strokeCircle ? "50%" : "0",
        width: this.strokeCircle ? value + "px" : "36px",
      };
    },
  },
};
</script>