import React, { Component } from 'react';
import classNames from 'classnames';
import request from './request';
import axiosRequest from '../../utils/axiosRequest';
import { acceptFile, getUploadFile, deleteFileItem, getPostFiles, getFileItem } from './utils';
import UploadFileList from './UploadFileList';
import styles from './index.less';

class Upload extends Component {

  static getDerivedStateFromProps(nextProps) {
    if ('fileList' in nextProps && nextProps.listType !== 'picture-card') {
      return {
        fileList: [...nextProps.fileList] || [],
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      fileList: props.fileList || props.defaultFileList || [],
    }
  }


  onClick = e => {
    e.stopPropagation();
    const el = this.fileInput;
    if (!el) {
      return;
    }
    el.click();
  };

  //拖入文件
  onFileDrop = e => {
    e.preventDefault();
    if (e.type === 'dragover') {
      return;
    }
    const { accept } = this.props;
    let files = Array.prototype.slice
      .call(e.dataTransfer.files)
      .filter(file => acceptFile(file, accept))
    this.uploadFiles(files);
  }

  //选定文件
  handleChange = e => {
    const files = e.target.files;
    this.uploadFiles(files);
  };

  //上传文件
  uploadFiles = files => {
    const postFiles = getPostFiles(files);
    postFiles.forEach(file => {
      setTimeout(() => this.post(file), 0);
    })
  };

  //request文件
  post = file => {
    let { action, data, method, headers, withCredentials } = this.props;
    const requestOption = {
      action: action,
      data: data,
      method: method,
      headers: headers,
      withCredentials: withCredentials,
      filename: file.name,
      file: file,
      onStart: this.onStart,
      onSuccess: this.onSuccess,
      onProgress: this.onProgress,
      onError: this.onError,
    }
    /*if (this.beforeUpload(file)) {
      request(requestOption);
    }*/
    if (this.beforeUpload(file)) {
      const response = axiosRequest(requestOption);
      response.then(res=>console.log(res)).catch(e=>console.log(e))
    }
  };

  beforeUpload = (file, fileList) => {
    const { beforeUpload } = this.props;
    //const { fileList } = this.state;
    if (!beforeUpload) {
      return true;
    }
    const result = beforeUpload(file);
    if (result && (result).then) {
      return result;
    }
    return true;
  };

  onStart = file => {
    const { onStart } = this.props;
    if (onStart) {
      onStart(file);
    }

    const { fileList } = this.state;
    const targetItem = getUploadFile(file);
    targetItem.status = 'uploading';

    const nextFileList = fileList.concat();

    const fileIndex = nextFileList.findIndex(file => file.uid === targetItem.uid);
    if (fileIndex === -1) {
      nextFileList.push(targetItem);
    } else {
      nextFileList[fileIndex] = targetItem;
    }

    this.onChange({
      file: targetItem,
      fileList: nextFileList,
    });
  };

  onProgress = (e, file) => {
    const { onProgress } = this.props;
    if (onProgress) {
      onProgress(e);
    }

    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.percent = e.percent;
    this.onChange({
      event: e,
      file: { ...targetItem },
      fileList,
    });

  };

  onSuccess = (response, file, xhr) => {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
    } catch (e) {
      console.log(e);
    }
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.status = 'done';
    targetItem.response = response;
    targetItem.xhr = xhr;
    this.onChange({
      file: { ...targetItem },
      fileList,
    });

    const { onSuccess } = this.props;
    if (onSuccess) {
      onSuccess(file);
    }
  };


  onError = (error, response, file) => {
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.error = error;
    targetItem.response = response;
    targetItem.status = 'error';
    this.onChange({
      file: { ...targetItem },
      fileList,
    });

    const { onError } = this.props;
    if (onError) {
      onError(error);
    }
  };

  onChange = info => {
    this.setState({ fileList: info.fileList });
    const { onChange } = this.props;
    if (onChange) {
      onChange({
        ...info,
        fileList: [...info.fileList],
      });
    }
  };

  //删除文件
  deleteFile = (file, fileList) => e => {
    e.stopPropagation();
    const newFileList = deleteFileItem(file, fileList);
    file.status = 'delete';
    this.onChange({
      file: { ...file },
      fileList: newFileList
    });
  };

  //预览图片
  onPreview = file => e =>{
    e.stopPropagation();
    const { onPreview } = this.props;
    if(onPreview && (file.url || file.preview || file.originFileObj) ){
      onPreview(file);
    }
  }

  render() {
    const { children, className, multiple, accept, disable, listType, showUploadList, progress } = this.props;
    const { fileList } = this.state;
    console.log(fileList);
    const cls = classNames({
      [styles.btn]: true,
      [styles.card]: listType === 'picture-card',
      [className]: className,
    });
    const filecls = classNames({
      [styles.fileList]: true,
      [styles.cardWrap]: listType === 'picture-card',
      [styles.listWrap]: listType === 'list',
    })

    const renderUploadList = showUploadList === false ? "" :
      <div className={filecls}>
        <UploadFileList
          fileList={fileList}
          onDelte={this.deleteFile}
          onPreview={this.onPreview}
          listType={listType}
          showUploadList={showUploadList}
          progress={progress} />
      </div>;

    const renderUploadButton = (
      <div
        className={cls}
        onClick={disable ? () => { } : this.onClick}
        onDrop={disable ? () => { } : this.onFileDrop}
        onDragOver={disable ? () => { } : this.onFileDrop}
      >
        <input
          type='file'
          ref={node => this.fileInput = node}
          style={{ display: 'none' }}
          onChange={this.handleChange}
          multiple={multiple}
          accept={accept}
        />
        {children}
      </div>);

    if (listType === 'picture-card') {
      return (
        <span >
          {renderUploadList}
          {renderUploadButton}
        </span>
      )
    }

    return (
      <span >
        {renderUploadButton}
        {renderUploadList}
      </span>
    )
  }
}

Upload.defaultProps = {
  name: 'file',
  accept: 'image/*',
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  data: {},
  method: 'POST',
  headers: { authorization: 'authorization-text', },
  multiple: true,
  withCredentials: false,
  disable: false,
  listType: 'text', //text,picture
  onChange: () => { },
  beforeUpload: () => { },
  onStart: () => { },
  onSuccess: () => { },
  onProgress: () => { },
  onError: () => { },
  showUploadList: {
    showPreviewIcon: false,
    showDownloadIcon: false,
    downloadIcon: '',
    showRemoveIcon: false,
    removeIcon: null,
  },
};


export default Upload