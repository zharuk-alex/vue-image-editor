<template>
  <div class="about">
    <h2>About</h2>
    <div>This is NOT commercial project.</div>
    <div>The project was created for myself for just try KonvaJS.</div>

    <div class="my-2"></div>
    <h4>Links:</h4>
    <v-list>
      <v-list-item v-for="(link, i) in links" :key="i">
        <a :href="link.link" class="text-uppercase" target="_blank">
          {{ link.text }}
        </a>
      </v-list-item>
    </v-list>
    <h4>ToDo:</h4>
    <v-list>
      <v-list-item v-for="(todo, i) in todos" :key="i">
        <span class="mr-1">{{ i + 1 }}.</span>
        {{ todo }}
      </v-list-item>
    </v-list>
    <v-sheet elevation="2" class="pa-2">author: zzharuk@gmail.com</v-sheet>
  </div>
</template>
<script>
export default {
  data: () => ({
    links: [
      {
        text: "KonvaJS",
        link: "https://konvajs.org/docs/vue/index.html",
      },
      {
        text: "Vuetify",
        link: "https://vuetifyjs.com/",
      },
    ],
    todos: ["Touchscreen support", "..."],
  }),
};
</script>
