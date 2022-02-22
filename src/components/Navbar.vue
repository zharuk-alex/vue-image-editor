<template>
  <v-app-bar app color="primary" dark>
    <div class="d-flex align-center">
      <router-link to="/">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />
      </router-link>
    </div>

    <v-spacer></v-spacer>
    <v-btn
      class="mx-1"
      dark
      v-for="(item, i) in Routes"
      :key="i"
      :to="item.path"
      link
      text
    >
      {{ item.name }}
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  computed: {
    Routes() {
      return this.$router.options.routes;
    },
  },
};
</script>

<style>
</style>