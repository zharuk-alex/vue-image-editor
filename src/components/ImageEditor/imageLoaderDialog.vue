<template>
  <v-dialog :value="value" hide-overlay persistent width="300">
    <v-card color="primary" dark>
      <v-card-text>
        Please stand by
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
module.exports = {
  name: "imageLoaderDialogComponent",
  props: {
    value: {
      type: Boolean,
    },
  },
  data: () => ({}),
};
</script>