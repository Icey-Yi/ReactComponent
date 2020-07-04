import classnames from 'classnames';
import { PaperClipOutlined, LoadingOutlined, DeleteOutlined, PictureOutlined, EyeOutlined } from '@ant-design/icons';
import { Progress, List, Avatar } from 'antd';
import styles from './index.less';


function UploadFileList(props) {
  const { fileList, onDelte, listType, showUploadList, progress, onPreview } = props;
  console.log(fileList)
  const { showPreviewIcon = false, showDownloadIcon = false, downloadIcon = '', showRemoveIcon = false, removeIcon = null } = showUploadList;

  if (listType === 'list') {
    return (
      <List
        itemLayout="horizontal"
        bordered="true"
        dataSource={fileList}
        renderItem={item => (
          <List.Item
            actions={[<a key="list-loadmore-edit" onClick={onPreview(item)}>preview</a>, <a key="list-loadmore-more" onClick={onDelte(item,fileList)}>delete</a>]}
          >
            <List.Item.Meta
              className={classnames({
                [styles.file]: styles.file,
                [styles.error]: item.status === 'error',
              })}
              avatar={item.url ? <Avatar src={item.url||item.response.url} />:<PictureOutlined style={{fontSize:'30px'}}/>}
              title={<span className={item.status === 'error'?styles.error:''}>{item.name}</span>}
            />
            <div>status:  {item.status}</div>
          </List.Item>
        )}
      />
    )
  }

  const renderItem = (file, index) => {
    //console.log(file)
    const fileWrap = classnames({
      [styles.file]: styles.file,
      [styles.error]: file.status === 'error',
      [styles.pictureWrap]: listType === 'picture',
      [styles.card]: listType === 'picture-card',
    });
    const loading = file.status === 'uploading';

    if (listType === 'picture-card') {
      return (
        <div className={fileWrap} key={index} >
          {loading ? <LoadingOutlined />
            : file.url || file.response ? <a href={file.url || file.response.url}><img src={file.url || file.response.url} className={styles.cardPicture} /></a>
              : <div className={styles.cardPicture}><PictureOutlined className={styles.pictureIcon} /> <div>{file.name}</div></div>
          }
          <div className={styles.mask}>
            <span onClick={onPreview(file)}>
              <EyeOutlined className={styles.maskIcon} />
            </span>
            <span onClick={onDelte(file, fileList)}>
              <DeleteOutlined className={styles.maskIcon} />
            </span>
          </div>
        </div>
      )
    }



    return (
      <div className={fileWrap} key={index} >
        <span className={styles.clip}>
          {
            loading ? <LoadingOutlined /> : listType === 'text'
              ? <PaperClipOutlined />
              : file.url || file.response ? <a href={file.url || file.response.url}><img src={file.url || file.response.url} className={styles.picture} /></a>
                : <PictureOutlined className={styles.pictureIcon} />
          }
        </span>
        <span className={file.status !== 'error' ? styles.filename : styles.error} title={file.name}>{file.name}</span>
        <span className={styles.del} onClick={onDelte(file, fileList)} title="delete">{showRemoveIcon ? removeIcon : <DeleteOutlined />}</span>
        {showDownloadIcon ? <span className={styles.download} title="download">{downloadIcon}</span> : ""}
        {loading ? <Progress className={styles.progress} percent={file.percent} {...progress} /> : ""}
      </div>);
  }
  return fileList.map((file, index) => renderItem(file, index));
}
export default UploadFileList;