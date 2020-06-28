import { notification } from 'antd';

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

function getBody(xhr) {
  /*const successtext = codeMessage[xhr.status] || xhr.statusText;
  notification.success({
    message: `请求成功${xhr.status}`,
    description: successtext,
  });*/
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// option {
//  action: String,
//  data: Object,
//  method: String,
//  withCredentials: Boolean,
//  headers: Object,
//  filename: String,
//  file: File,
//  onProgress: (event: { percent: number }): void,
//  onError: (event: Error, body?: Object): void,
//  onSuccess: (body: Object): void,
// }
export default function upload(option) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest();

  if (option.onProgress && xhr.upload) {
    xhr.upload.onprogress = function progress(e) {
      if (e.total > 0) {
        e.percent = e.loaded / e.total * 100;
      }
      option.onProgress(e,option.file);
    };
  }

  // eslint-disable-next-line no-undef
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

  xhr.onloadstart = function start() {
    option.onStart(option.file)
  };

  xhr.onerror = function error() {
    option.onError(getError(option, xhr), getBody(xhr), option.file);
  };

  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(option, xhr), getBody(xhr), option.file);
    }
    return option.onSuccess(getBody(xhr), option.file, xhr);
  };

  xhr.open(option.method, option.action, true);

  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }

  const headers = option.headers || {};

  if (headers['X-Requested-With'] !== null) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }

  Object.keys(headers).forEach(h => {
    if (headers[h] !== null) {
      xhr.setRequestHeader(h, headers[h]);
    } 
  });

  xhr.send(formData);

  return {
    abort() {
      xhr.abort();
    },
  };
}