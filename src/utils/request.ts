import {Userconfig} from '@/config'

const  { baseUrl }  = Userconfig()

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

export default function request(options: RequestOptions) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('access_token')
    const header = {
      'Authorization': token ? `${token}` : '',
      'Content-Type': 'application/json',
      ...options.header
    }

    uni.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}