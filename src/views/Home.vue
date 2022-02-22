<template>
  <v-row>
    <image-editor
      v-if="imageEditorModel"
      v-model="imageEditorModel"
      :src="img"
      @save-image="imageEditorUpdateImage"
    ></image-editor>

    <v-col sm="6" class="mx-auto">
      <v-hover v-slot="{ hover }">
        <v-sheet class="mx-auto d-flex flex-column justify-center">
          <v-img
            v-if="img.length > 0"
            class="rounded ma-5 elevation-5 image-thumb align-self-center"
            :max-width="isMobile ? '80vw' : 400"
            max-height="80vh"
            min-width="200"
            contain
            :src="img"
            v-ripple
            @click="showPhotoInfoDialog(img)"
            :key="img"
          >
            <v-scale-transition>
              <div
                v-show="hover || isMobile"
                class="pa-1"
                style="position: absolute; top: 0; right: 0; z-index: 1"
              >
                <v-btn
                  class="ma-1 pa-1"
                  color="blue"
                  fab
                  dark
                  x-small
                  @click.stop="showPhotoInfoDialog(img)"
                  title="edit image"
                >
                  <v-icon v-text="'mdi-clipboard-edit-outline'"></v-icon>
                </v-btn>
              </div>
            </v-scale-transition>
          </v-img>
          <v-file-input
            :label="'select img file'"
            :rules="validatorRules"
            accept="image/jpg, image/jpeg"
            prepend-icon="mdi-camera"
            small-chips
            outlined
            show-size
            name="uploadedImages"
            @change="fileInputChangeHandler"
          ></v-file-input>
        </v-sheet>
      </v-hover>
    </v-col>
  </v-row>
</template>

<script>
import ImageEditor from "@/components/ImageEditor";

export default {
  name: "Home",

  components: {
    ImageEditor,
  },
  data: () => ({
    imageEditorModel: false,
    img: "",
    lazySrc: "",
  }),
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },
    validatorRules() {
      return [
        (value) =>
          !value ||
          value.size < 2000000 ||
          "Image size should be less than 2 MB!",
      ];
    },
  },
  mounted() {
    this.lazySrc = require(`../assets/lazy.jpg`);
    this.img = require(`../assets/default-1920x1080.jpg`);
  },
  methods: {
    showPhotoInfoDialog() {
      this.imageEditorModel = true;
    },
    editImage() {},
    fileInputChangeHandler(file) {
      if (file) {
        this.img = URL.createObjectURL(file);
      } else {
        this.img = require(`../assets/default-1920x1080.jpg`);
      }
    },
    imageEditorUpdateImage(val) {
      this.img = val;
    },
  },
};
</script>
<style scoped>
.image-thumb:hover {
  cursor: pointer;
}
</style>