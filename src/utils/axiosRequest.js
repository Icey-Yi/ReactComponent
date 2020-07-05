import axios from 'axios';
//import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};


function getError(option, xhr) {
  /*const errortext = codeMessage[xhr.status] || xhr.statusText;
  notification.error({
    message: `请求错误 ${xhr.status}: ${option.url}`,
    description: errortext,
  });*/

  const msg = `cannot ${option.method} ${option.action} ${xhr.status}'`;
  const err = new Error(msg);
  err.status = xhr.status;
  err.method = option.method;
  err.url = option.action;
  return err;
}

function getBody(response) {
  const successtext = codeMessage[response.status] || response.statusText;
  /*notification.success({
    message: `请求成功${response.status}`,
    description: successtext,
  });*/
  if (!successtext) {
    return successtext;
  }

  try {
    return JSON.parse(successtext);
  } catch (e) {
    return successtext;
  }
}

export default async function axiosRequest(option) {
  const formData = new FormData();

  if (option.data) {
    Object.keys(option.data).forEach(key => {
      const value = option.data[key];
      // support key-value array data
      if (Array.isArray(value)) {
        value.forEach(item => {
          formData.append(`${key}[]`, item);
        });
        return;
      }
      formData.append(key, option.data[key]);
    });
  }

  // eslint-disable-next-line no-undef
  if (option.file) {
    formData.append(option.filename, option.file);
  }


  const newOptions = {
    url: option.action,
    method: option.method || 'get',
    headers: { ...option.headers, 'X-Requested-With': 'XMLHttpRequest' }, // `headers` 是即将被发送的自定义请求头
    params: option.params || {},
    data: formData || {},
    timeout: option.timeout || 2000,
    withCredentials: option.withCredentials || false, // default

    // `onUploadProgress` 允许为上传处理进度事件
    onUploadProgress: function (progressEvent) {
      if (progressEvent.total > 0) {
        progressEvent.percent = progressEvent.loaded / progressEvent.total * 100;
      }
      if (option.onProgress) {
        option.onProgress(progressEvent, option.file);
      }
    },

    // `onDownloadProgress` 允许为下载处理进度事件
    onDownloadProgress: function (progressEvent) {
      // 对原生进度事件的处理
    },

    // `validateStatus` 定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。
    // 如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 
    // 否则，promise 将被 rejecte
    validateStatus: function (status) {
      return status >= 200 && status < 300; // default
    },

  }

  if (option.onStart) {
    option.onStart(option.file);
  }

  return axios({ ...newOptions })
    .then(response => {
      if (option.onSuccess) {
        option.onSuccess(getBody(response), option.file, response);
      }
      return response;
    })
    .catch(error => {
      if (option.onError) {
        option.onError(getError(option, error), getBody(error), option.file);
      }
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      console.log(error.config);
      return error;
    })
}