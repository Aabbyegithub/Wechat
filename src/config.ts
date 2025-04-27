const env = uni.getAccountInfoSync().miniProgram.envVersion; // develop | trial | release

const config = {
    // 测试:/rc/test/，开发：/rc/dev/，正式：/rc/prd/
    baseUrl: 'https://app.huntkey.com'
    // baseUrl: 'http://192.168.24.14:8000/'
}

export const envconfig = () => {
    let configCopy = {...config};
    switch(env){
        case 'develop':
            // configCopy.baseUrl
            configCopy.baseUrl+='/rc/dev/'
            break
        case 'trial':
            // configCopy.baseUrl+='/rc/test/'
            configCopy.baseUrl+='/rc/dev/'
            break
        case 'release':
            configCopy.baseUrl+='/rc/prd/'
            break
    }
    return configCopy;
}
//如果有用户使用的是测试环境--根据配置类型取Url----正式环境和开发则不用
export const Userconfig =()=>{
    let configCopy = {...config};
    switch(env){
        case 'develop':
            // configCopy.baseUrl
            configCopy.baseUrl+='/rc/dev/'
            break
        case 'trial':
            var UserInfo = uni.getStorageSync('UserInfo')
            if(UserInfo.billUserType === undefined || UserInfo.billUserType === null || UserInfo.billUserType === ''){
                // configCopy.baseUrl+='/rc/test/'
                configCopy.baseUrl+='/rc/dev/'
            }
            if(UserInfo.billUserType===1){
                // configCopy.baseUrl+='/rc/test/'
                configCopy.baseUrl+='/rc/dev/'
            }
            if(UserInfo.billUserType===2){
                // configCopy.baseUrl+='/rc/prd/'
                configCopy.baseUrl+='/rc/dev/'
            }
            break
        case 'release':
            configCopy.baseUrl+='/rc/prd/'
            break
    }
    return configCopy;
}
 