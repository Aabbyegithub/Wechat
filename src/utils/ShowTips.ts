
/**
 * 显示普通提示
 * @param {string|object} options 提示内容或配置对象
 */
export const showToast = (options) => {
  if (typeof options === 'string') {
    uni.showToast({
      title: options,
      icon: 'none',
      duration: 2000
    })
    return
  }

  uni.showToast({
    title: options.title,
    icon: options.icon || 'none',
    duration: options.duration || 2000,
    mask: options.mask || false
  })
}

/**
 * 显示成功提示
 * @param {string} title 提示内容
 */
export const showSuccess = (title) => {
  showToast({
    title,
    icon: 'success'
  })
}

/**
 * 显示错误提示
 * @param {string} title 提示内容
 */
export const showError = (title) => {
  showToast({
    title,
    icon: 'error'
  })
}

/**
 * 显示加载提示
 * @param {string} title 提示内容
 */
export const showLoading = (title = '加载中...') => {
  uni.showLoading({
    title,
    mask: true,
    icon: 'loading',
    duration: 10000
  })
}

/**
 * 隐藏加载提示
 */
export const hideLoading = () => {
  uni.hideLoading()
}

/**
 * 显示模态框
 * @param {string|object} options 提示内容或配置对象
 */
export const showModal = (options) => {
  if (typeof options === 'string') {
    uni.showModal({
      title: '提示',
      content: options,
      showCancel: false,
      confirmText: '确定'
    })
    return
  }

  uni.showModal({
    title: options.title || '提示',
    content: options.content,
    showCancel: options.showCancel ?? true,
    cancelText: options.cancelText || '取消',
    confirmText: options.confirmText || '确定',
    success: options.success
  })
}

export default {
  showToast,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  showModal
}