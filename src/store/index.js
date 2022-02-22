import Vue from 'vue';
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    default_src: require(`@/assets/default-1920x1080.jpg`),
    src: require(`@/assets/default-1920x1080.jpg`),
    lazySrc: require(`@/assets/lazy.jpg`)
  },
  mutations: {
    set_src: (state, blob )=>{
      state.src = blob
    },
    reset_src: (state) => {
      state.src = state.default_src
    }
  },
  getters: {
    src : (state)=>state.src,
    lazySrc : (state)=>state.lazySrc
  }
});