// utils/upload.js
import { message } from 'antd';

const handleAudioUpload = async (file, audioList, t) => {
  const isAudio = file.type.startsWith('audio');
  const maxFileSize = 25 * 1024 * 1024; // 25 MB

  if (isAudio && audioList.length < 1 && file.size <= maxFileSize) {
    return true;
  }

  // 如果文件不是音频格式
  else if (!isAudio) {
    message.error(t('upload.TypeError'));
    return false;
  }

  // 如果已经上传了一个文件
  else if (audioList.length > 0) {
    message.warning(t('upload.NumError'));
    return false;
  }
  
  // 如果文件大小超过限制
  else if (file.size > maxFileSize) {
    message.error(t('upload.SizeError'));
    return false;
  }
};


export { handleAudioUpload };
