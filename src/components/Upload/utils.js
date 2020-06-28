
//文件权限匹配
export function acceptFile(file, accept){
  if (file, accept) {
    const acceptArr = accept.split(',');
    const mineType = file.type || '';
    const baseMineTye = mineType.replace(/\/.*$/, '');
    return acceptArr.some(type => {
      const validType = type.trim();
      if ((/\/\*$/).test(validType)) {
        return baseMineTye === validType.replace(/\/.*$/, '');
      }
      return mineType === validType;
    });
  }
  return true;
};

export function getUid(index){
  return `-${+new Date() + index}`;
}

export function getUploadFile(file){
  return {
    ...file,
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
    name: file.name,
    size: file.size,
    type: file.type,
    uid: file.uid,
    percent: 0,
    originFileObj: file,
  }
} 

export function deleteFileItem(file, fileList){
  return fileList.filter(item => item.uid !== file.uid)
}


export function getPostFiles(files){
  const postFiles = Array.prototype.slice.call(files);
  return postFiles.map((file, index)=>{
    file.uid = getUid(index);
    return file;
  });
}

export function getFileItem(file, fileList) {
  const matchKey = file.uid !== undefined ? 'uid' : 'name';
  return fileList.filter(item => item[matchKey] === file[matchKey])[0];
}

