<template>
  <v-toolbar dense extended extension-height="60" align-center>
    <v-slide-group show-arrows v-model="canva_mode" mandatory>
      <v-slide-item>
        <v-btn text tile @click="toolbar.showImageSetting = true">
          <v-icon v-text="'mdi mdi-image'"></v-icon>
        </v-btn>
      </v-slide-item>
      <v-slide-item
        v-for="mode in canva_modesArr"
        :key="mode"
        :value="mode.mode"
        v-slot="{ active, toggle }"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :class="active ? 'primary' : ''"
              class="ml-2"
              text
              tile
              @click="toggle"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon v-text="mode.icon"></v-icon>
            </v-btn>
          </template>
          <span v-text="mode.title"></span>
        </v-tooltip>
      </v-slide-item>
      <v-slide-item>
        <v-menu
          offset-y
          :close-on-content-click="false"
          :nudge-width="200"
          left
          :value="colorPaletteIsShown"
        >
          <template v-slot:activator="menu">
            <v-tooltip bottom>
              <template v-slot:activator="tooltip">
                <v-btn
                  class="ml-2"
                  text
                  tile
                  v-bind="{ ...menu.attrs, ...tooltip.attrs }"
                  v-on="{ ...menu.on, ...tooltip.on }"
                  @click="colorPaletteIsShown = !colorPaletteIsShown"
                >
                  <v-icon v-text="'mdi mdi-palette'"></v-icon>
                </v-btn>
              </template>
              <span v-text="'Colors'"></span>
            </v-tooltip>
          </template>
          <v-card>
            <v-color-picker
              v-model="color"
              dot-size="30"
              mode="hexa"
              show-swatches
              swatches-max-height="250"
            >
            </v-color-picker>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                small
                icon
                color="success"
                @click="colorPaletteIsShown = false"
              >
                <v-icon v-text="'mdi-check'"></v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-slide-item>
      <v-slide-item>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-2"
              text
              tile
              @click="resetCanva"
              :disabled="!stepsHistory.length"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon v-text="'mdi mdi-layers-remove'"></v-icon>
            </v-btn>
          </template>
          <span v-text="'Clear All'"></span>
        </v-tooltip>
      </v-slide-item>
      <v-slide-item>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="ml-2"
              text
              tile
              @click="undoCanva"
              :disabled="!stepsHistory.length"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon v-text="'mdi mdi-undo'"></v-icon>
            </v-btn>
          </template>
          <span v-text="'Undo'"></span>
        </v-tooltip>
      </v-slide-item>
    </v-slide-group>
    <template v-slot:extension>
      <div
        class="d-flex align-center flex-wrap flex-grow-1 px-2"
        style="margin: -16px; border-top: #bdbdbd 1px solid; height: 100%"
      >
        <template v-if="toolbar.showImageSetting">
          <v-btn
            text
            tile
            dense
            @click="imageRotation(-90)"
            title="rotate left"
            :disabled="!imageConfig.image"
          >
            <v-icon v-text="'mdi mdi-rotate-left'"></v-icon>
          </v-btn>
          <v-btn
            text
            tile
            @click="imageRotation(90)"
            title="rotate right"
            :disabled="!imageConfig.image"
          >
            <v-icon v-text="'mdi mdi mdi-rotate-right'"></v-icon>
          </v-btn>
        </template>
        <template v-if="canva_mode == 'brush'">
          <v-select-stroke
            v-model="brushSettings.strokeWidth"
            :items="strokeWidth"
            :strokeColor="color"
            :strokeCircle="true"
          ></v-select-stroke>
        </template>
        <template v-else-if="canva_mode == 'vector'">
          <v-select-stroke
            v-model="vectorSettings.strokeWidth"
            :items="strokeWidth"
            :strokeColor="color"
          ></v-select-stroke>
        </template>
        <template v-else-if="canva_mode == 'arrow'">
          <v-select-stroke
            v-model="arrowSettings.strokeWidth"
            :items="strokeWidth"
            :strokeColor="color"
          ></v-select-stroke>
        </template>
        <template v-else-if="canva_mode == 'rect'">
          <v-btn-toggle v-model="rectSettings.filled" dense>
            <v-btn text tile :value="true">
              <v-icon v-text="'mdi-rectangle'"></v-icon>
            </v-btn>
            <v-btn text tile :value="false">
              <v-icon v-text="'mdi-rectangle-outline'"></v-icon>
            </v-btn>
          </v-btn-toggle>
          <v-select-stroke
            v-model="rectSettings.strokeWidth"
            :items="strokeWidth"
            :strokeColor="color"
          ></v-select-stroke>
        </template>
        <template v-else-if="canva_mode == 'circle'">
          <v-btn-toggle v-model="circleSettings.filled" dense>
            <v-btn text tile :value="true">
              <v-icon v-text="'mdi-circle'"></v-icon>
            </v-btn>
            <v-btn text tile :value="false">
              <v-icon v-text="'mdi-circle-outline'"></v-icon>
            </v-btn>
          </v-btn-toggle>
          <v-select-stroke
            v-model="rectSettings.strokeWidth"
            :items="strokeWidth"
            :strokeColor="color"
          ></v-select-stroke>
        </template>
        <template v-else-if="canva_mode == 'text'">
          <v-btn-toggle v-model="textSettings.textStyle" dense multiple>
            <v-btn value="bold">
              <v-icon>mdi-format-bold</v-icon>
            </v-btn>
            <v-btn value="italic">
              <v-icon>mdi-format-italic</v-icon>
            </v-btn>
            <v-btn value="underline">
              <v-icon>mdi-format-underline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
      </div>
    </template>
  </v-toolbar>
</template>
<script>
module.exports = {
  name: "actionsToolbar",
  props: {
    canva_mode: {
      type: [Object, Array],
      required: true,
    },
    color: {
      type: String,
      default: "#000000",
    },
    figuresSettings: {},
  },
  data: () => ({
    colorPaletteIsShown: false,
    canva_modesArr: [
      {
        icon: "mdi-cursor-default-outline",
        title: "cursor default",
        mode: "none",
      },
      {
        icon: "mdi-brush",
        title: "brush",
        mode: "brush",
      },
      {
        icon: "mdi-shape-rectangle-plus",
        title: "rect",
        mode: "rect",
      },
      {
        icon: "mdi-shape-circle-plus",
        title: "circle",
        mode: "circle",
      },
      {
        icon: "mdi-vector-line",
        title: "line",
        mode: "vector",
      },
      {
        icon: "mdi-arrow-bottom-left",
        title: "arrow",
        mode: "arrow",
      },
      {
        icon: "mdi-format-text",
        title: "text",
        mode: "text",
      },
    ],
  }),
};
</script>