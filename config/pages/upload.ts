import { currentVersion } from '../versions';

export const uploadPageConfig = {
  ...currentVersion.pages.upload,
  // 페이지별 추가 설정
  metadata: {
    title: 'AI OTT - Upload',
    description: 'Upload video content',
  },
  ui: {
    maxWidth: 720,
    showProgress: true,
    enableDragDrop: true,
  },
  validation: {
    requireTitle: false,
    requireFile: true,
  },
};
