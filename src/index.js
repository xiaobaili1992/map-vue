import PreviewMap from './components/PreviewMap.vue';
import StationModel from './components/StationModel.vue';
import StationMap from './components/StationMap.vue';
import UploadTiff from './components/UploadTiff.vue';
import SubTitle from './components/SubTitle.vue';
import ThreeDimensionalMap from './components/ThreeDimensionalMap.vue';

export { PreviewMap, StationModel, StationMap, UploadTiff, ThreeDimensionalMap, SubTitle };

const install = (app) => {
  app.component('PreviewMap', PreviewMap);
  app.component('StationModel', StationModel);
  app.component('StationMap', StationMap);
  app.component('UploadTiff', UploadTiff);
  app.component('SubTitle', SubTitle);
  app.component('ThreeDimensionalMap', ThreeDimensionalMap);
};

export default {
  install,
};
