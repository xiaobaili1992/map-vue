import PreviewMap from './PreviewMap.vue';
import StationModel from './StationModel.vue';
import StationMap from './StationMap.vue';
import UploadTiff from './UploadTiff.vue';
import SubTitle from './components/SubTitle.vue';

export { PreviewMap, StationModel, StationMap, UploadTiff, SubTitle };

const install = (app) => {
  app.component('PreviewMap', PreviewMap);
  app.component('StationModel', StationModel);
  app.component('StationMap', StationMap);
  app.component('UploadTiff', UploadTiff);
  app.component('SubTitle', SubTitle);
};

export default {
  install,
};
