import classnames from 'classnames';
import { PaperClipOutlined, LoadingOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { Progress } from 'antd';
import styles from './index.less';


function UploadFileList(props) {
  const { fileList, onDelte, listType, showUploadList, progress } = props;
  const { showPreviewIcon=false, showDownloadIcon=false, downloadIcon='', showRemoveIcon=false, removeIcon=null} = showUploadList;

  const renderItem = (file, index) => {
    console.log(file)
    const fileWrap = classnames(
      styles.file,
      file.status !== 'error' ? " " : styles.error,
      listType === 'picture' ? styles.pictureWrap : " ",
    );
    const loading = file.status === 'uploading';
    return (
      <div className={fileWrap} key={index} >
        <span className={styles.clip}>
          {
            loading ? <LoadingOutlined /> : listType === 'text'
              ? <PaperClipOutlined />
              : file.url || file.response ? <a href={file.url||file.response.url}><img src={file.url||file.response.url} className={styles.picture} /></a>
                : <PictureOutlined className={styles.pictureIcon} />
          }
        </span>
        <span className={file.status !== 'error' ? styles.filename : styles.error} title={file.name}>{file.name}</span>
        <span className={styles.del} onClick={onDelte(file, fileList)} title="delete">{showRemoveIcon ? removeIcon : <DeleteOutlined />}</span>
        {showDownloadIcon ? <span className={styles.download} title="download">{downloadIcon}</span> : ""}
        {loading ? <Progress className={styles.progress} percent={file.percent} {...progress} />:""}
      </div>);
  }
  return fileList.map((file, index) => renderItem(file, index));
}
export default UploadFileList;