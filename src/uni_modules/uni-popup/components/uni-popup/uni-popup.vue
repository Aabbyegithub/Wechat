<template>
  <view v-if="showPopup" class="uni-popup" :class="[popupstyle, isDesktop ? 'fixforpc-z-index' : '']" @touchmove.stop.prevent="clear">
    <uni-transition :mode-class="['fade']" :styles="maskClass" :duration="duration" :show="showTrans" @click="onTap" />
    <uni-transition :mode-class="ani" :styles="transClass" :duration="duration" :show="showTrans" @click="onTap">
      <view class="uni-popup__wrapper-box" @click.stop="clear">
        <slot />
      </view>
    </uni-transition>
  </view>
</template>

<script>
export default {
  name: 'uniPopup',
  components: {},
  emits: ['change', 'maskClick'],
  props: {
    // 开启动画
    animation: {
      type: Boolean,
      default: true
    },
    // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
    type: {
      type: String,
      default: 'center'
    },
    // maskClick
    isMaskClick: {
      type: Boolean,
      default: true
    },
    // 蒙版颜色
    maskBackgroundColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0.4)'
    },
    duration: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      showPopup: false,
      showTrans: false,
      popupWidth: 0,
      popupHeight: 0,
      isDesktop: false
    }
  },
  computed: {
    maskClass() {
      return {
        position: 'fixed',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: this.maskBackgroundColor
      }
    },
    transClass() {
      return {
        position: 'fixed',
        left: 0,
        right: 0
      }
    },
    popupstyle() {
      return `uni-popup-${this.type}`
    },
    ani() {
      return [`fade-${this.type}`]
    }
  },
  methods: {
    clear(e) {
      e.stopPropagation()
    },
    open() {
      this.showPopup = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.showTrans = true
        }, 50)
      })
      this.$emit('change', {
        show: true,
        type: this.type
      })
    },
    close(type) {
      this.showTrans = false
      this.$nextTick(() => {
        setTimeout(() => {
          this.showPopup = false
        }, 300)
      })
      this.$emit('change', {
        show: false,
        type: this.type
      })
    },
    onTap() {
      if (!this.isMaskClick) return
      this.$emit('maskClick')
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.uni-popup {
  position: fixed;
  z-index: 99;

  &.center {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    justify-content: center;
    align-items: center;
  }

  &.top {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &.bottom {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

.uni-popup__wrapper-box {
  /* #ifndef APP-NVUE */
  display: block;
  /* #endif */
  position: relative;
}

.fixforpc-top {
  top: 0;
}

.fixforpc-bottom {
  bottom: 0;
}

.fixforpc-left {
  left: 0;
}

.fixforpc-right {
  right: 0;
}

.fixforpc-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fixforpc-z-index {
  z-index: 999;
}

.uni-popup .uni-popup__wrapper {
  /* #ifndef APP-NVUE */
  display: block;
  /* #endif */
  position: relative;
  /* iphonex 等安全区设置，底部安全区适配 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
