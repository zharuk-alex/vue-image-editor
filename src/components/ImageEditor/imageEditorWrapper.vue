<template>
  <v-dialog
    @input="$emit('input', value)"
    :value="value"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card tile class="d-flex flex-column fill-height">
      <v-toolbar dark color="primary" style="max-height: 64px">
        <template v-if="titleSlot">
          <slot name="title"></slot>
        </template>
        <template v-else>
          <v-toolbar-title>Image editor</v-toolbar-title>
        </template>
        <v-spacer></v-spacer>
        <v-btn
          dark
          :disabled="saveBtnIsDisabled"
          @click="$emit('save-image', $event)"
        >
          save
        </v-btn>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <slot name="actions-toolbar"></slot>
      <v-sheet
        id="konva-stage-wrapper"
        class="d-flex justify-center"
        color="#e0e0e0"
        style="position: relative; height: -webkit-fill-available"
      >
        <slot name="main-stage-wrapper"></slot>
      </v-sheet>
      <!-- end wrapper -->
    </v-card>
  </v-dialog>
</template>
<script>
module.exports = {
  name: "imageEditorWrapperComponent",
  props: {
    value: Boolean,
    saveBtnIsDisabled: Boolean,
  },
  data: () => ({
    text: {},
  }),
  computed: {
    konvaWrapperStyle() {
      return {
        display: "flex",
        backgroundColor: "#e0e0e0",
        height: "-webkit-fill-available",
      };
    },
    titleSlot() {
      return !!this.$slots.title;
    },
  },
  methods: {
    clickSave() {
      this.$emit("save-image");
    },
    closeDialog() {
      this.$emit("close-dialog");
    },
  },
};
</script>