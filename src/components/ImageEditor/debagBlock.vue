<template>
  <v-sheet class="debag-sheet">
    <v-btn class="text-lowercase" text @click="is_debag = !is_debag">
      <v-icon
        v-text="!is_debag ? 'mdi-chevron-left' : 'mdi-close-box-outline'"
      ></v-icon>
      debag
    </v-btn>
    <ul class="pa-3" v-show="is_debag">
      <li v-for="(item, i) in debagCollection" :key="i">
        {{ item }}
      </li>
    </ul>
  </v-sheet>
</template>
<script>
export default {
  props: {
    debagCollection: {
      type: [Object, Array],
      required: true,
    },
  },
  data: () => ({
    is_debag: false,
  }),
  computed: {},
};
</script>
<style >
.debag-sheet {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.8);
  width: auto;
  min-width: 50px;
  max-height: 300px;
  overflow-y: auto;
}
</style>