<!-- // https://konvajs.org/docs/vue/index.html -->
<template>
  <image-editor-wrapper
    v-model="value"
    @close-dialog="$emit('input', false)"
    @save-image="saveImage"
    :save-btn-is-disabled="!Object.values(stepsHistory).length"
    style="position: relative"
  >
    <template slot="title"><span>image edit</span></template>
    <template slot="actions-toolbar">
      <action-toolbar
        :canva-mode="canva_mode"
        @change-mode="canva_mode = $event"
        :figures-pre-settings="figuresPreSettings"
        :color="color"
        @change-color="color = $event"
        :is-history="!!Object.values(stepsHistory).length"
        :is-image="!!imageConfig.image"
        @reset-btn-click="resetCanva"
        @undo-btn-click="undoCanva"
        @rotate="imageRotation"
      ></action-toolbar>
    </template>
    <template slot="main-stage-wrapper">
      <speed-dial-settings
        v-model="speedDial"
        :is-image-loading="isImageLoading"
        :list-items="shortUsageTutorial"
        @image-save="imageSave($event)"
      ></speed-dial-settings>
      <image-loader-dialog v-model="isImageLoading"></image-loader-dialog>
      <v-stage
        v-if="configKonva.isInited"
        ref="stage"
        :config="configKonva"
        :style="[imageConfig.isLoaded ? konvaStageStyle : '']"
        v-on="
          konvaEvents.reduce((acc, val) => {
            acc[val] = enventsHandlerSwitcher;
            return acc;
          }, {})
        "
      >
        <!-- @click="currSelectedShapeSet('baseimage')" -->
        <!-- Layer  -->
        <v-layer ref="mainLayer">
          <v-image
            ref="baseimage"
            :config="imageConfig"
            @dblclick="imageDblClickEnventHandlerImage($event)"
          ></v-image>
          <!-- selectedArea -->
          <v-rect
            v-if="selectedArea"
            ref="selected-area"
            :config="{
              x: Math.min(
                selectedArea.startPointX,
                selectedArea.startPointX + selectedArea.width
              ),
              y: Math.min(
                selectedArea.startPointY,
                selectedArea.startPointY + selectedArea.height
              ),
              width: Math.abs(selectedArea.width),
              height: Math.abs(selectedArea.height),
              fill: 'rgb(0,0,0,0)',
              stroke: 'rgb(0,0,0,1)',
              strokeWidth: 0.5,
              dash: [10, 5],
            }"
          ></v-rect>
          <!-- end selectedArea -->
          <!-- free draw -->
          <v-line
            v-for="figure in brushArr"
            :key="figure.id"
            :ref="figure.id"
            :config="figure"
            @click="currSelectedShapeSet(figure.id)"
          ></v-line>
          <!-- end free draw -->
          <!-- vector -->
          <v-line
            v-for="figure in vectorArr"
            :key="figure.id"
            :ref="figure.id"
            :config="figure"
            @click="currSelectedShapeSet(figure.id)"
          ></v-line>
          <!-- end vector -->
          <!-- arrow -->
          <v-arrow
            v-for="figure in arrowArr"
            :key="figure.id"
            :ref="figure.id"
            :config="figure"
            @click="currSelectedShapeSet(figure.id)"
          ></v-arrow>
          <!-- end arrow -->
          <!-- rect -->
          <v-rect
            v-for="figure in rectArr"
            :key="figure.id"
            :ref="figure.id"
            @click="currSelectedShapeSet(figure.id)"
            :config="{
              ...figure,
              x: Math.min(
                figure.startPointX,
                figure.startPointX + figure.width
              ),
              y: Math.min(
                figure.startPointY,
                figure.startPointY + figure.height
              ),
              width: Math.abs(figure.width),
              height: Math.abs(figure.height),
            }"
          ></v-rect>
          <!-- end rect -->
          <!-- rect -->
          <v-circle
            v-for="figure in circleArr"
            :key="figure.id"
            :ref="figure.id"
            @click="currSelectedShapeSet(figure.id)"
            :config="figure"
          ></v-circle>
          <!-- end rect -->
          <!-- text -->
          <v-text
            v-for="figure in textArr"
            :key="figure.id"
            :ref="figure.id"
            @click="currSelectedShapeSet(figure.id)"
            :config="figure"
            style="cursor: pointer"
            @mouseenter="stage.content.style.cursor = 'move'"
            @mouseleave="stage.content.style.cursor = 'default'"
            @dragstart="isDragging = true"
            @dragend="isDragging = false"
            @dblclick="textEdit($event, index)"
            @dbltap="textEdit($event, index)"
          ></v-text>
        </v-layer>
      </v-stage>
      <v-scale-transition>
        <v-textarea
          ref="stageTextarea"
          v-if="isTextediting"
          v-model="inputEditText.value"
          :style="[inputEditText.style]"
          background-color="rgba(224,224,224,.75)"
          hide-details
          auto-grow
          autofocus
          outlined
          rows="1"
          @keydown="textInputEditKeydownEventHandler"
          @blur="textInputBlur"
        ></v-textarea>
      </v-scale-transition>
      <!-- debag info -->
      <debag-block :debag-collection="[stepsHistory, configKonva]">
        ></debag-block
      >
      <!-- debag info -->
    </template>
  </image-editor-wrapper>
</template>
<script>
import Konva from "konva";

import _ from "lodash";
import ActionToolbar from "./actionToolbarImageEditor";
import ImageEditorWrapper from "./imageEditorWrapper";
import SpeedDialSettings from "./speedDialSettings";
import ImageLoaderDialog from "./imageLoaderDialog";
import DebagBlock from "./debagBlock.vue";

export default {
  name: "imageEditor",
  components: {
    ActionToolbar,
    ImageEditorWrapper,
    SpeedDialSettings,
    ImageLoaderDialog,
    DebagBlock,
  },

  props: {
    value: {
      type: Boolean,
    },
    src: {
      type: String,
    },
  },
  data: () => ({
    is_debag: false,
    konvaEvents: [
      "mousedown",
      "touchstart",
      "mouseup",
      "touchend",
      "mousemove",
      "touchmove",
      "click",
      "tap",
      "wheel",
      "keydown",
    ],
    canva_mode: "rect",

    transformer_buttons: {
      rotater: {
        path: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><title>box-configurator-rotate</title><circle cx="8" cy="8" r="8" style="fill:#fff"/><path d="M0.9,0.5c0.1,0,0.3,0.1,0.3,0.3L1.1,2.9c1-1.4,2.6-2.4,4.5-2.4c2.9,0,5.3,2.4,5.3,5.3c0,2.9-2.4,5.3-5.3,5.3c-1.4,0-2.6-0.5-3.6-1.4c-0.1-0.1-0.1-0.3,0-0.4L2.3,9c0.1-0.1,0.3-0.1,0.4,0c0.7,0.7,1.7,1.1,2.8,1.1c2.3,0,4.2-1.9,4.2-4.2S7.8,1.7,5.5,1.7c-1.7,0-3.2,1-3.8,2.5l2.7-0.1c0.1,0,0.3,0.1,0.3,0.3v0.6c0,0.1-0.1,0.3-0.3,0.3H0.3C0.1,5.2,0,5.1,0,4.9V0.8c0-0.1,0.1-0.3,0.3-0.3H0.9z"/></svg>',
        shape: "rotater",
      },
      top_left: {
        path: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><title>box-configurator-transform</title><circle cx="8" cy="8" r="8" style="fill:#fff"/><path d="M.07,3.66v-3A.58.58,0,0,1,.65.07h3A.29.29,0,0,1,4,.36V.94a.29.29,0,0,1-.29.29H1.23V3.66A.29.29,0,0,1,.94,4H.36A.29.29,0,0,1,.07,3.66Zm7-3.3V.94a.29.29,0,0,0,.29.29H9.77V3.66a.29.29,0,0,0,.29.29h.58a.29.29,0,0,0,.29-.29v-3a.58.58,0,0,0-.58-.58h-3A.29.29,0,0,0,7.05.36Zm3.59,6.69h-.58a.29.29,0,0,0-.29.29V9.77H7.34a.29.29,0,0,0-.29.29v.58a.29.29,0,0,0,.29.29h3a.58.58,0,0,0,.58-.58v-3A.29.29,0,0,0,10.64,7.05ZM4,10.64v-.58a.29.29,0,0,0-.29-.29H1.23V7.34a.29.29,0,0,0-.29-.29H.36a.29.29,0,0,0-.29.29v3a.58.58,0,0,0,.58.58h3A.29.29,0,0,0,4,10.64Z"/></svg>',
        shape: "top-left",
      },
      /* 
				edit: {
					path: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><title>box-configurator-edit</title><circle cx="8" cy="8" r="8" style="fill:#fff"/><path d="M10.6,7.5c-0.2,0.8-0.6,1.5-1.2,2c-0.1,0.1-0.2,0.1-0.3,0L8.2,9C7.8,9.3,7.4,9.6,6.9,9.8v1.1c0,0.1-0.1,0.2-0.2,0.3c-0.8,0.2-1.6,0.2-2.3,0c-0.1,0-0.2-0.1-0.2-0.3V9.8C3.6,9.6,3.2,9.3,2.8,9L1.9,9.5c-0.1,0.1-0.2,0-0.3,0c-0.5-0.6-0.9-1.3-1.2-2c0-0.1,0-0.2,0.1-0.3l0.9-0.5c-0.1-0.5-0.1-1,0-1.5L0.5,4.6C0.4,4.5,0.4,4.4,0.4,4.3c0.2-0.8,0.6-1.5,1.2-2c0.1-0.1,0.2-0.1,0.3,0l0.9,0.5C3.2,2.4,3.6,2.2,4.1,2V0.9c0-0.1,0.1-0.2,0.2-0.3c0.7-0.2,1.6-0.2,2.3,0c0.1,0,0.2,0.1,0.2,0.3V2c0.5,0.2,0.9,0.4,1.3,0.8l0.9-0.5c0.1-0.1,0.2,0,0.3,0c0.5,0.6,0.9,1.3,1.2,2c0,0.1,0,0.2-0.1,0.3L9.6,5.1c0.1,0.5,0.1,1,0,1.5l0.9,0.5C10.6,7.2,10.6,7.3,10.6,7.5z M7.2,5.9c0-0.9-0.8-1.7-1.7-1.7S3.8,4.9,3.8,5.9s0.8,1.7,1.7,1.7S7.2,6.8,7.2,5.9z"/></svg>',
					shape: 'top-left'
				}, 
				*/
      top_right: {
        path: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><title>box-configurator-delete</title><circle cx="8" cy="8" r="8" style="fill:#fff"/><path d="M10.24,1.08v.66a.39.39,0,0,1-.36.36H1.12a.39.39,0,0,1-.36-.36V1.08A.39.39,0,0,1,1.12.72H3.64L3.82.3A.52.52,0,0,1,4.24,0h2.4a.61.61,0,0,1,.48.3L7.3.72H9.82C10.06.78,10.24.9,10.24,1.08ZM1.42,2.82h8.1V9.91a1.05,1.05,0,0,1-1,1H2.44a1.05,1.05,0,0,1-1-1ZM3.1,9.19a.39.39,0,0,0,.36.36.39.39,0,0,0,.36-.36V4.44a.39.39,0,0,0-.36-.36.39.39,0,0,0-.36.36Zm2,0a.36.36,0,0,0,.72,0V4.44a.36.36,0,1,0-.72,0Zm2,0a.36.36,0,0,0,.72,0V4.44a.36.36,0,0,0-.72,0Z"/></svg>',
        shape: "top-right",
      },
    },
    configKonva: {
      isInited: false,
    },

    imageConfig: {
      x: 0,
      y: 0,
      image: null,
      rotation: 0,
      cachedRotation: 0,
      draggable: false,
      scale: { x: 1, y: 1 },
      isLoaded: false,
      src: null,
    },
    image_original_width: 0,
    image_original_height: 0,

    color: "#B71C1C",
    selectedArea: null,
    brushArr: [],
    textArr: [],
    rectArr: [],
    circleArr: [],
    vectorArr: [],
    arrowArr: [],
    figuresPreSettings: {
      rect: {
        strokeWidth: 4,
        filled: false,
      },
      arrow: {
        strokeWidth: 4,
      },
      vector: {
        strokeWidth: 4,
      },
      circle: {
        strokeWidth: 4,
        filled: false,
      },
      brush: {
        strokeWidth: 6,
      },
      text: {
        textStyle: [],
        fontSize: 16,
      },
    },
    transformer: {},
    //
    stepsHistory: [],
    currSelectedShape: null,
    isImageLoading: false,
    isDragging: false,
    isPainting: false,
    isTextediting: false,
    inputEditText: {
      value: "",
      node: null,
      index: null,
      id: null,
      style: { position: "absolute", top: "0px", left: "0px" },
    },
    figureActionsPosition: {
      x: 0,
      y: 0,
    },
    speedDial: false,
    dialogInformation: false,
    shortUsageTutorial: [
      "Dblclick on image to fit image to height / width",
      "To change the scale of the image (zoom in / zoom out), use the mouse wheel up / down over the cursor on the image.",
      "The image can be dragged if it has been scaled and the default cursore mode is selected.",
      'To add text to the scene - use "text" mode and click on the scene. All text elements are draggble.',
      "Dblclick on the text opens its editing.",
    ],
  }),
  computed: {
    konvaStageStyle: () => ({ border: "1px dashed red" }),
    btnFigureRemoveStyle: () => {
      return this.showSelectedFigureSettingBtn
        ? {
            position: "absolute",
            top: this.currSelectedShape.x,
            left: this.currSelectedShape.y,
          }
        : "";
    },
    brushPoints: () =>
      [2, 4, 6, 8, 10, 12, 14, 16].map((item) => ({
        text: `${item}px`,
        value: item,
      })),

    showSelectedFigureSettingBtn() {
      return !_.isEmpty(this.transformer);
    },
    stage() {
      return this.$refs.stage.getStage();
    },
  },
  mounted() {
    this.imageConfig.src = this.src;
    this.configKonva = { ...this.configKonva, isInited: true };

    this.$nextTick(() => {
      this.imageLoad();
      window.addEventListener("resize", this.fitStageIntoParentContainer);
    });
  },

  methods: {
    transformerDestroy() {
      try {
        this.transformer.nodes([]);
      } catch (err) {
        console.log(err);
      }
      this.transformer = null;
      this.groupConfig = null;
    },

    saveImage() {
      let layer = this.$refs.mainLayer.getNode();
      let pixelRatio = this.image_original_width / layer.getClientRect().width;
      let src = this.stage.toDataURL({
        pixelRatio: pixelRatio,
        mimeType: "image/jpeg",
        quality: 1,
      });

      this.$emit("save-image", src);
      this.$emit("input", false);
    },
    currSelectedShapeSet(ref) {
      this.transformerDestroy();
      try {
        this.currSelectedShape = this.$refs[ref][0];
        let node = this.currSelectedShape.getNode();
        let layer = this.$refs.mainLayer.getNode();

        this.groupConfig = new Konva.Group({
          fill: "#29A9E5",
        });

        this.groupConfig.add(node);

        this.transformer = new Konva.Transformer({
          nodes: [node],
          borderDash: [4, 3],
          anchorCornerRadius: 5,
          anchorStrokeWidth: 18,
          padding: 16,
          keepRatio: false,
          opacity: 1,
          enabledAnchors: ["top-right", "top-left"],
          anchorFill: "#29A9E5",
          rotationSnaps: [0, 90, 180, 270],
          rotateAnchorOffset: 0,
          draggable: true,
        });

        for (var button in this.transformer_buttons) {
          var shape_name = this.transformer_buttons[button].shape;
          var shape = this.transformer.findOne("." + shape_name);
          var selector = button.replace("_", "-");
          var anchorDist = this.transformer.padding() + 5.25;

          var icon = new Konva.Path({
            fill: "white",
            data: this.transformer_buttons[button].path,
            name: selector + "-icon",
          });

          icon.position(shape.position());

          if (selector == "rotater") {
            icon.x(shape.x() - 5.25);
            icon.y(shape.y() - 5.25);
          } else if (selector == "top-right") {
            icon.x(shape.x() + anchorDist / 2);
            icon.y(shape.y() - anchorDist);
          } else if (selector == "top-left") {
            icon.x(shape.x() - anchorDist);
            icon.y(shape.y() - anchorDist);
          }

          this.transformer.add(icon);

          if (selector == "top-right") {
            shape.listening(false);
            icon.on("click", () => {
              let { id, figure_type } = node.attrs;
              this.removeFigure(id, figure_type);
            });
          }
        }

        node.on("transform", () => {
          this.transformer.update();
          for (var button in this.transformer_buttons) {
            var selector = this.transformer_buttons[button].shape.replace(
              "_",
              "-"
            );
            var shape = this.transformer.findOne("." + selector);
            var icon = this.transformer.findOne("." + selector + "-icon");
            var anchorDist = this.transformer.padding() + 5.25;

            icon.position(shape.position());
            if (selector == "rotater") {
              icon.x(shape.x() - 5.25);
              icon.y(shape.y() - 5.25);
            } else if (selector == "top-right") {
              icon.x(shape.x() + anchorDist / 2);
              icon.y(shape.y() - anchorDist);
            } else if (selector == "top-left") {
              icon.x(shape.x() - anchorDist);
              icon.y(shape.y() - anchorDist);
            }
            layer.batchDraw();
          }
        });

        this.groupConfig.add(this.transformer);

        this.groupConfig.on("mouseenter", () => {
          this.stage.content.style.cursor = "move";
          layer.draw();
        });

        this.groupConfig.on("mouseleave", () => {
          this.stage.content.style.cursor = "default";
        });

        layer.add(this.groupConfig);
        layer.batchDraw();
      } catch (err) {
        this.currSelectedShape = null;
        console.log(err);
      }
    },

    fitStageIntoParentContainer() {
      return;
    },

    enventsHandlerSwitcher(event) {
      if (event.type == "wheel") {
        this.imageZoomOnWheel(event);
      }
      // NONE mode
      if (this.canva_mode == "none") {
        return;
      } //end NONE mode
      // paintingMode
      if (this.canva_mode == "brush") {
        if (event.type == "mousedown") {
          this.brushStart(event);
        } else if (event.type == "mousemove" && this.isPainting) {
          this.brushProccessing(event);
        } else if (event.type == "mouseup" && this.isPainting) {
          this.brushEnd(event);
        }
      } //end brush mode
      // rectangle mode
      else if (this.canva_mode == "rect") {
        if (event.type == "mousedown") {
          this.rectDrawStart(event);
        } else if (event.type == "mousemove" && this.isPainting) {
          this.rectDrawProccessing(event);
        } else if (event.type == "mouseup" && this.isPainting) {
          this.rectDrawEnd(event);
        }
      }
      // end rectangle mode
      // circle mode
      else if (this.canva_mode == "circle") {
        if (event.type == "mousedown") {
          this.circleDrawStart(event);
        } else if (event.type == "mousemove" && this.isPainting) {
          this.circleDrawProccessing(event);
        } else if (event.type == "mouseup" && this.isPainting) {
          this.circleDrawEnd(event);
        }
      }
      // end circle mode
      // vector mode
      else if (this.canva_mode == "vector") {
        if (event.type == "mousedown") {
          this.vectorStart(event);
        } else if (event.type == "mousemove" && this.isPainting) {
          this.vectorProccessing(event);
        } else if (event.type == "mouseup" && this.isPainting) {
          this.vectorEnd(event);
        }
      }
      // end vector mode
      // arrow mode
      else if (this.canva_mode == "arrow") {
        if (event.type == "mousedown") {
          this.arrowStart(event);
        } else if (event.type == "mousemove" && this.isPainting) {
          this.arrowProccessing(event);
        } else if (event.type == "mouseup" && this.isPainting) {
          this.arrowEnd(event);
        }
      }
      // end arrow mode
      // text mode
      else if (this.canva_mode == "text" && event.type == "click") {
        if (!this.isTextediting) {
          this.textInputAddText(event);
        } else if (this.isTextediting) {
          this.textInputEditSave();
          this.isTextediting = false;
        }
      }
      // end text mode
      else if (event.type == "click") {
        event.evt.stopPropagation();
        console.log("click");
      }
      //
      else if (event.type == "keydown") {
        // console.log(event)
        // console.log(event.evt)
      }
    },
    //
    selectAreaStart() {
      this.isPainting = true;
      const pos = this.stage.getPointerPosition();
      this.selectedArea = {
        id: Date.now() + "_area",
        startPointX: pos.x,
        startPointY: pos.y,
        width: 0,
        height: 0,
        draggable: true,
      };
    },
    selectAreaEnd() {
      this.isPainting = false;
      this.canva_mode = "none";
    },
    selectAreaProccessing() {
      if (!this.isPainting) {
        return;
      }
      const point = this.stage.getPointerPosition();
      let curRec = this.selectedArea;
      curRec.width = point.x - curRec.startPointX;
      curRec.height = point.y - curRec.startPointY;
      curRec.stroke = "#000000";
    },
    //
    //
    rectDrawStart() {
      this.isPainting = true;

      const pos = this.stage.getPointerPosition();
      this.rectArr = [
        ...this.rectArr,
        {
          id: Date.now() + "_rect",
          mode: "figure",
          figure_type: "rect",
          startPointX: pos.x,
          startPointY: pos.y,
          width: 0,
          height: 0,
          draggable: true,
          fill: this.figuresPreSettings.rect.filled
            ? this.color
            : "rgb(0,0,0,0)",
          stroke: this.color,
          strokeWidth: this.figuresPreSettings.rect.strokeWidth,
        },
      ];
    },

    rectDrawProccessing() {
      if (!this.isPainting) {
        return;
      }
      const point = this.stage.getPointerPosition();

      let curRec = this.rectArr[this.rectArr.length - 1];
      curRec.width = point.x - curRec.startPointX;
      curRec.height = point.y - curRec.startPointY;
    },
    rectDrawEnd() {
      this.isPainting = false;
      let { figure_type, id, width } = _.last(this.rectArr);
      if (width > 0) {
        this.stepsHistory.push({ figure_type, id });
      }
      this.canva_mode = "none";
    },
    //
    circleDrawStart() {
      this.isPainting = true;
      const pos = this.stage.getPointerPosition();
      this.circleArr = [
        ...this.circleArr,
        {
          id: Date.now() + "_circle",
          mode: "figure",
          figure_type: "circle",
          x: pos.x,
          y: pos.y,
          startPointX: pos.x,
          startPointY: pos.y,
          radius: 0,
          draggable: true,
          fill: this.figuresPreSettings.circle.filled
            ? this.color
            : "rgb(0,0,0,0)",
          stroke: this.color,
          strokeWidth: this.figuresPreSettings.circle.strokeWidth,
        },
      ];
    },
    circleDrawEnd() {
      this.isPainting = false;
      let { figure_type, id } = _.last(this.circleArr);
      this.stepsHistory.push({ figure_type, id });
      this.canva_mode = "none";
    },

    circleDrawProccessing() {
      if (!this.isPainting) {
        return;
      }

      const point = this.stage.getPointerPosition();

      let curCircle = this.circleArr[this.circleArr.length - 1];

      let radius = Math.sqrt(
        Math.pow(curCircle.startPointX - point.x, 2) +
          Math.pow(curCircle.startPointY - point.y, 2)
      );

      curCircle.radius = radius;
    },
    //
    brushStart() {
      this.isPainting = true;
      this.stage.content.style.cursor = "crosshair";
      let pos = this.stage.getPointerPosition();

      this.brushArr.push({
        id: Date.now() + "_brush",
        mode: "figure",
        figure_type: "brush",
        stroke: this.color,
        strokeWidth: this.figuresPreSettings.brush.strokeWidth,
        globalCompositeOperation: "source-over",
        lineCap: "round",
        points: [pos.x, pos.y, pos.x, pos.y],
      });
    },
    brushProccessing(event) {
      if (!this.isPainting) {
        return;
      }

      // prevent scrolling on touch devices
      event.evt.preventDefault();
      let last_index = this.brushArr.length - 1;
      let lastLine = this.brushArr[last_index];
      let pos = this.stage.getPointerPosition();
      lastLine.points.push(pos.x);
      lastLine.points.push(pos.y);
      this.$refs.mainLayer.getNode().batchDraw();
    },
    brushEnd() {
      this.isPainting = false;
      let { figure_type, id } = _.last(this.brushArr);
      this.stepsHistory.push({ figure_type, id });
      this.stage.content.style.cursor = "default";
      this.canva_mode = "none";
    },

    vectorStart() {
      this.isPainting = true;
      this.stage.content.style.cursor = "crosshair";
      let pos = this.stage.getPointerPosition();

      this.vectorArr.push({
        id: Date.now() + "_vector",
        mode: "figure",
        figure_type: "vector",
        stroke: this.color,
        strokeWidth: this.figuresPreSettings.vector.strokeWidth,
        globalCompositeOperation: "source-over",
        // round cap for smoother lines
        lineCap: "round",
        // add point twice, so we have some drawings even on a simple click
        points: [pos.x, pos.y, pos.x, pos.y],
      });
    },
    vectorProccessing(event) {
      if (!this.isPainting) {
        return;
      }

      // prevent scrolling on touch devices
      event.evt.preventDefault();
      let last_index = this.vectorArr.length - 1;
      let lastLine = this.vectorArr[last_index];
      let pos = this.stage.getPointerPosition();
      lastLine.points[2] = pos.x;
      lastLine.points[3] = pos.y;
      this.$refs.mainLayer.getNode().batchDraw();
    },
    vectorEnd() {
      this.isPainting = false;
      let { figure_type, id } = _.last(this.vectorArr);
      this.stepsHistory.push({ figure_type, id });
      this.stage.content.style.cursor = "default";
      this.canva_mode = "none";
    },

    // arrow
    arrowStart() {
      this.isPainting = true;
      this.stage.content.style.cursor = "crosshair";
      let pos = this.stage.getPointerPosition();

      this.arrowArr.push({
        id: Date.now() + "_arrow",
        mode: "figure",
        figure_type: "arrow",
        stroke: this.color,
        fill: this.color,
        strokeWidth: this.figuresPreSettings.arrow.strokeWidth,
        points: [pos.x, pos.y],
      });
    },
    arrowProccessing(event) {
      if (!this.isPainting) {
        return;
      }

      // prevent scrolling on touch devices
      event.evt.preventDefault();
      let last_index = this.arrowArr.length - 1;
      let lastLine = this.arrowArr[last_index];
      let pos = this.stage.getPointerPosition();

      lastLine.points[2] = pos.x;
      lastLine.points[3] = pos.y;

      this.$refs.mainLayer.getNode().batchDraw();
    },
    arrowEnd() {
      this.isPainting = false;
      let { figure_type, id } = _.last(this.arrowArr);
      this.stepsHistory.push({ figure_type, id });
      this.stage.content.style.cursor = "default";
      this.canva_mode = "none";
    },
    // end arrow
    imageGetScaledCoordinates(containerWidth, containerHeight, width, height) {
      let widthRatio = containerWidth / width,
        heightRatio = containerHeight / height;
      let bestRatio = Math.min(widthRatio, heightRatio);
      let newWidth = Math.floor(width * bestRatio),
        newHeight = Math.floor(height * bestRatio);
      return { newWidth, newHeight };
    },
    imageDblClickEnventHandlerImage() {
      this.imageConfig = {
        ...this.imageConfig,
        width: this.configKonva.width,
        height: this.configKonva.height,
        x: 0,
        y: 0,
        draggable: false,
        scale: {
          x: 1,
          y: 1,
        },
      };
    },
    imageZoomOnWheel(e) {
      e.evt.preventDefault();
      e.evt.stopPropagation();

      let image = this.$refs.baseimage.getNode();
      let oldScale = image.scale().x;

      let scaleBy = 1.01;
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      if (e.evt.ctrlKey) {
        direction = -direction;
      }

      let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      let pointer = this.stage.getPointerPosition();

      let mousePointTo = {
        x: (pointer.x - image.x()) / oldScale,
        y: (pointer.y - image.y()) / oldScale,
      };

      if (newScale > 2 && direction == 1) {
        newScale = 2;
      } else if (newScale < 1 && direction == -1) {
        newScale = 1;
      }

      let dragBoundFunc2 = () => {
        let pos = image.getAbsolutePosition();

        let x2 = Math.max(pos.x, this.stage.width() * (1 - newScale));
        let y2 = Math.max(pos.y, this.stage.height() * (1 - newScale));

        return { x: x2, y: y2 };
      };

      this.imageConfig = {
        ...this.imageConfig,
        ...{
          x:
            direction == 1
              ? pointer.x - mousePointTo.x * newScale
              : dragBoundFunc2().x,
          y:
            direction == 1
              ? pointer.y - mousePointTo.y * newScale
              : dragBoundFunc2().y,
          scale: {
            x: newScale,
            y: newScale,
          },
          draggable: newScale > 1,
          dragBoundFunc: (pos) => {
            const x = Math.min(
              0,
              Math.max(pos.x, this.stage.width() * (1 - newScale))
            );
            const y = Math.min(
              0,
              Math.max(pos.y, this.stage.height() * (1 - newScale))
            );
            return { x, y };
          },
        },
      };
    },
    imageSave() {
      this.isImageLoading = true;
      setTimeout(() => {
        let layer = this.$refs.mainLayer.getNode();
        let pixelRatio =
          this.image_original_width / layer.getClientRect().width;
        let src = this.stage.toDataURL({
          pixelRatio: pixelRatio,
          mimeType: "image/jpeg",
          quality: 1,
        });

        var link = document.createElement("a");
        link.setAttribute("id", "konva-image-downloader");
        link.download = "image.jpg";
        link.href = src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.isImageLoading = false;
      }, 500);
      // delete link;
    },
    imageLoad() {
      let $vm = this;
      let image = new window.Image();

      image.src = this.imageConfig.src;
      image.onload = function () {
        $vm.image_original_width = this.width;
        $vm.image_original_height = this.height;

        let stage_wrapper = document.getElementById("konva-stage-wrapper");
        let height = stage_wrapper.clientHeight - 2;
        let width = stage_wrapper.clientWidth - 2;
        const { newWidth, newHeight } = $vm.imageGetScaledCoordinates(
          width,
          height,
          this.width,
          this.height
        );

        $vm.configKonva = {
          ...$vm.configKonva,
          width: newWidth,
          height: newHeight,
        };

        setTimeout(() => {
          $vm.imageConfig = {
            ...$vm.imageConfig,
            width: newWidth,
            height: newHeight,
            image,
            isLoaded: true,
            rotation: 0,
          };
        }, 300);
        $vm.isImageLoading = false;
      }; // end onload
    },
    imageRotation(deg) {
      this.isImageLoading = true;
      let node = this.$refs.baseimage.getNode();
      this.imageConfig.rotation = deg;
      this.imageConfig.cachedRotation += deg;
      this.imageConfig.cachedRotation = this.imageConfig.cachedRotation % 360;

      if (this.imageConfig.cachedRotation) {
        this.$nextTick(() => {
          let layer = this.$refs.mainLayer.getNode();
          let pixelRatio =
            this.image_original_width / layer.getClientRect().width;

          let src = node.toDataURL({
            pixelRatio: pixelRatio,
            mimeType: "image/jpeg",
            quality: 1,
          });

          this.imageConfig = { ...this.imageConfig, src };
          this.imageLoad();
        });
      } else {
        let { src } = this;
        this.imageConfig = { ...this.imageConfig, src };
        this.imageLoad();
      }
    },
    // TEXT
    textInputAddText() {
      try {
        if (this.currSelectedShape.getNode().attrs.figure_type == "text") {
          return;
        }
      } catch (err) {
        console.log(err);
      }

      this.isTextediting = true;
      this.inputEditText.value = "";
      this.inputEditText.index = this.textArr.length;

      let pos = this.stage.getPointerPosition();

      let styles = {
        top: pos.y + "px",
        left: pos.x + "px",
      };
      // let styles = {
      // 	top: event.evt.clientY + 'px',
      // 	left: event.evt.clientX + 'px',
      // }

      this.inputEditText.style = { ...this.inputEditText.style, ...styles };

      this.textArr.push({
        id: Date.now() + "_text",
        mode: "figure",
        figure_type: "text",
        text: this.inputEditText.value,
        x: pos.x + 10,
        y: pos.y,
        draggable: true,
        fontSize: this.figuresPreSettings.text.fontSize,
        fill: this.color,
      });
    },
    textInputEditHide() {
      this.isTextediting = false;
      if (this.inputEditText.node != null) {
        setTimeout(() => this.inputEditText.node.show(), 100);
      }
    },
    textInputEditSave() {
      this.textArr[this.inputEditText.index].text = this.inputEditText.value;
      let text_exist = _.find(this.textArr, { id: this.inputEditText.id });

      if (this.inputEditText.value.length > 0 && text_exist == undefined) {
        let { figure_type, id } = _.last(this.textArr);
        this.stepsHistory.push({ figure_type, id });
      }

      this.inputEditText.value = null;

      this.textInputEditHide();
    },
    textInputBlur() {
      if (_.size(this.inputEditText.value) > 0) {
        this.textInputEditSave();
      }
    },
    textInputEditKeydownEventHandler(event) {
      if (event.keyCode === 13 && !event.shiftKey) {
        this.textInputEditSave();
      }

      if (event.keyCode === 27) {
        this.textInputEditHide();
      }
    },

    textEdit(event, index) {
      this.isTextediting = true;

      this.transformerDestroy();

      let textNode = event.target;

      textNode.hide();

      let textPosition = textNode.absolutePosition();

      this.inputEditText = {
        ...this.inputEditText,
        id: this.textArr[index].id,
        value: textNode.text(),
        node: textNode,
        style: {
          ...this.inputEditText.style,
          top: `${textPosition.y}px`,
          left: `${textPosition.x}px`,
        },
        index,
      };
    },
    //
    resetCanva() {
      this.brushArr = [];
      this.vectorArr = [];
      this.arrowArr = [];
      this.textArr = [];
      this.rectArr = [];
      this.circleArr = [];

      this.selectedArea = null;
      this.stepsHistory = [];
      this.currSelectedShape = null;
      this.canva_mode = "none";
      this.transformerDestroy();
    },
    getFigureArray(type) {
      let arrName;
      switch (type) {
        case "rect":
          arrName = this.rectArr;
          break;
        case "brush":
          arrName = this.brushArr;
          break;
        case "vector":
          arrName = this.vectorArr;
          break;
        case "arrow":
          arrName = this.arrowArr;
          break;
        case "circle":
          arrName = this.circleArr;
          break;
        case "text":
          arrName = this.textArr;
          break;
        default:
          arrName = [];
          break;
      }
      return arrName;
    },
    undoCanva() {
      let history_figure = _.last(this.stepsHistory);
      let { id, figure_type } = history_figure;
      this.removeFigure(id, figure_type);
      this.stepsHistory.pop();
    },
    removeSelectedFigure() {
      let index = _.findIndex(this.stepsHistory, {
        id: this.currSelectedShape.config.id,
      });
      let history_figure = this.stepsHistory[index];
      let { id, figure_type } = history_figure;
      this.removeFigure(id, figure_type);
      this.stepsHistory.splice(index, 1);
    },
    removeFigure(id, figure_type) {
      let target_arr = this.getFigureArray(figure_type);
      // reset transformer if isUndoElement
      if (!_.isEmpty(this.transformer)) {
        let nodes = this.transformer.nodes();
        nodes = nodes.filter((node) => node.attrs.id !== id);
        if (nodes.length) {
          this.transformer.nodes(nodes);
        } else {
          this.transformer.destroy();
          this.transformer = null;
          this.groupConfig.destroy();
          this.groupConfig = null;
        }
      }
      // reset selected if isUndoElement
      if (
        !_.isEmpty(this.currSelectedShape) &&
        "config" in this.currSelectedShape &&
        this.currSelectedShape.config.id == id
      ) {
        this.currSelectedShape = null;
      }

      let index = _.findIndex(target_arr, { id: id });
      target_arr.splice(index, 1);

      this.stage.content.style.cursor = "default";
    },
  }, //end methods
  watch: {
    canva_mode(new_val) {
      let img = this.$refs.baseimage.getNode();
      let scale = img.scale().x;
      if (new_val == "none") {
        this.imageConfig = { ...this.imageConfig, draggable: scale > 1 };
      } else {
        this.imageConfig = { ...this.imageConfig, draggable: false };
      }
    },
  },
};
</script>
