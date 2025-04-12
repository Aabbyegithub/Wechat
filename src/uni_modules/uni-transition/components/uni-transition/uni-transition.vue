<template>
  <view v-if="isShow" ref="ani" :animation="animationData" :class="customClass" :style="transformStyles" @click="onClick">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'uniTransition',
  emits: ['click', 'change'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    modeClass: {
      type: [Array, String],
      default() {
        return 'fade'
      }
    },
    duration: {
      type: Number,
      default: 300
    },
    styles: {
      type: Object,
      default() {
        return {}
      }
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: false,
      transform: '',
      opacity: 1,
      animationData: {},
      durationTime: 300,
      config: {}
    }
  },
  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.open()
        } else {
          if (this.isShow) {
            this.close()
          }
        }
      },
      immediate: true
    }
  },
  computed: {
    // 生成样式数据
    transformStyles() {
      return `transform:${this.transform};opacity:${this.opacity};${this.stylesObject}`
    },
    stylesObject() {
      let styles = ''
      for (let i in this.styles) {
        styles += `${i}:${this.styles[i]};`
      }
      return styles
    }
  },
  created() {
    // 动画默认配置
    this.config = {
      duration: this.duration,
      timingFunction: 'ease',
      transformOrigin: '50% 50%',
      delay: 0
    }
    this.durationTime = this.duration
  },
  methods: {
    /**
     *  ref 触发 初始化动画
     */
    init(obj = {}) {
      if (obj.duration) {
        this.durationTime = obj.duration
      }
      this.animation = uni.createAnimation({
        transformOrigin: obj.transformOrigin || this.config.transformOrigin,
        duration: obj.duration || this.config.duration,
        timingFunction: obj.timingFunction || this.config.timingFunction,
        delay: obj.delay || this.config.delay
      })
    },
    /**
     * 点击组件触发回调
     */
    onClick() {
      this.$emit('click', {
        detail: this.isShow
      })
    },
    /**
     * ref 触发 动画分组
     * @param {Object} obj
     */
    step(obj, config = {}) {
      if (!this.animation) return
      for (let i in obj) {
        try {
          if (typeof obj[i] === 'object') {
            this.animation[i](...obj[i])
          } else {
            this.animation[i](obj[i])
          }
        } catch (e) {
          console.error(`方法 ${i} 不存在`)
        }
      }
      this.animation.step(config)
      return this
    },
    /**
     *  ref 触发 执行动画
     */
    run(fn) {
      if (!this.animation) return
      this.animation.run(fn)
    },
    // 开始过度动画
    open() {
      clearTimeout(this.timer)
      this.transform = ''
      this.isShow = true
      let { opacity, transform } = this.styleInit(false)
      if (typeof opacity !== 'undefined') {
        this.opacity = opacity
      }
      this.transform = transform
      // 确保动态样式已经生效后，执行动画，如果不加 nextTick 在低端安卓机上会导致 transform 样式失效
      this.$nextTick(() => {
        // TODO 定时器保证动画完全执行，目前有些问题，后面会取消定时器
        this.timer = setTimeout(() => {
          this.animation = uni.createAnimation({
            duration: this.durationTime,
            timingFunction: 'ease'
          })
          this.tranfromInit(false).step()
          this.animation.run()
          this.$emit('change', {
            detail: this.isShow
          })
        }, 20)
      })
    },
    // 关闭过度动画
    close(type) {
      if (!this.animation) return
      this.tranfromInit(true)
        .step()
        .run(() => {
          this.isShow = false
          this.animationData = null
          this.animation = null
          let { opacity, transform } = this.styleInit(false)
          this.opacity = opacity || 1
          this.transform = transform
          this.$emit('change', {
            detail: this.isShow
          })
        })
    },
    // 处理动画开始前的默认样式
    styleInit(type) {
      let styles = {
        transform: ''
      }
      let buildStyle = (type, mode) => {
        if (mode === 'fade') {
          styles.opacity = this.animationType(type)[mode]
        } else {
          styles.transform += this.animationType(type)[mode] + ' '
        }
      }
      if (typeof this.modeClass === 'string') {
        buildStyle(type, this.modeClass)
      } else {
        this.modeClass.forEach(mode => {
          buildStyle(type, mode)
        })
      }
      return styles
    },
    // 处理内置组合动画
    tranfromInit(type) {
      let buildTranfrom = (type, mode) => {
        let aniNum = null
        if (mode === 'fade') {
          aniNum = type ? 0 : 1
        } else {
          aniNum = type ? '-100%' : '0'
          if (mode === 'zoom-in') {
            aniNum = type ? 0.8 : 1
          }
          if (mode === 'zoom-out') {
            aniNum = type ? 1.2 : 1
          }
          if (mode === 'slide-right') {
            aniNum = type ? '100%' : '0'
          }
          if (mode === 'slide-bottom') {
            aniNum = type ? '100%' : '0'
          }
        }
        this.animation[this.animationMode()[mode]](aniNum)
      }
      if (typeof this.modeClass === 'string') {
        buildTranfrom(type, this.modeClass)
      } else {
        this.modeClass.forEach(mode => {
          buildTranfrom(type, mode)
        })
      }
      return this.animation
    },
    animationType(type) {
      return {
        fade: type ? 1 : 0,
        'slide-top': `translateY(${type ? '0' : '-100%'})`,
        'slide-right': `translateX(${type ? '0' : '100%'})`,
        'slide-bottom': `translateY(${type ? '0' : '100%'})`,
        'slide-left': `translateX(${type ? '0' : '-100%'})`,
        'zoom-in': `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
        'zoom-out': `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
      }
    },
    // 内置动画类型与实际动画对应字典
    animationMode() {
      return {
        fade: 'opacity',
        'slide-top': 'translateY',
        'slide-right': 'translateX',
        'slide-bottom': 'translateY',
        'slide-left': 'translateX',
        'zoom-in': 'scale',
        'zoom-out': 'scale'
      }
    }
  }
}
</script>

<style>
.uni-transition {
  transition-timing-function: ease;
  transition-duration: 0.3s;
  transition-property: transform, opacity;
}
</style>