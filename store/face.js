import * as faceapi from '@vladmandic/face-api';
// const faceapi = require('@vladmandic/face-api/dist/face-api.node-gpu.js');
import metadata from "../data/metadata.json";
import { CustomMobileNet } from '@teachablemachine/image';
import * as tmImage from '@teachablemachine/image';
import { loadLayersModel } from '@tensorflow/tfjs';

export const state = () => ({
  faces: [],
  faceimg: null,
  models: undefined,
  loading: false,
  loaded: false,
  faceMatcher: null,
  maskClassfier: null,
  useTiny: false,
  detections: {
    scoreThreshold: 0.7,
    inputSize: 320,
    boxColor: 'blue',
    textColor: 'red',
    lineWidth: 1,
    fontSize: 20,
    fontStyle: 'Georgia'
  },
  expressions: {
    minConfidence: 0.2
  },
  descriptors: {
    withDistance: false
  }
})
//注册的人脸描述器放在后端与前端的视频流描述进行匹配识别

export const mutations = {
  loading(state) {
    state.loading = true
  },

  load(state) {
    state.loading = false
    state.loaded = true
  },

  setFaces(state, faces) {
    state.faces = faces
  },

  setFaceMatcher(state, matcher) {
    state.faceMatcher = matcher
  },

  setMaskClassfier(state, classifier) {
    state.maskClassfier = classifier
  },

}
export const actions = {
  load({ commit, state }) {
    if (!state.loading && !state.loaded) {
      commit('loading')
      return Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/data/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/data/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/data/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/data/models'),
        // faceapi.nets.tinyYolov2.loadFromUri('/data/models'),
      ])
        .then(() => {
          commit('load')
        })
    }
  },
  async getAll({ commit, state }) {
    const data = await this.$axios.$get('/api/face/getAll')
    commit('setFaces', data)
  },

  async getModel({ commit, state }) {
    //从后端获取模型文件，并赋值给state
    // const data = await this.$axios.$get('/api/face/getModel')
    commit('setModels', models)
  },
  async save({ commit }, faces) {
    const { data } = await this.$axios.$post('/api/face/save', { faces })
    commit('setFaces', data)
  },
  getFaceMatcher({ commit, state }) {
    //从服务器获取的提取的特征文件中提取注册人脸的描述器
    const labeledDescriptors = []
    state.faces.forEach((face) => {
      const descriptors = face.descriptors.map((desc) => {
        if (desc.descriptor) {
          const descArray = []
          for (const i in desc.descriptor) {
            descArray.push(parseFloat(desc.descriptor[i]))
          }
          return new Float32Array(descArray)
        }
      })
      if (descriptors.length) {
        labeledDescriptors.push(
          new faceapi.LabeledFaceDescriptors(
            face.user,
            descriptors
          ))
      }
    })
    //将现存的描述器作为参数构造新匹配器
    const matcher = new faceapi.FaceMatcher(labeledDescriptors)
    commit('setFaceMatcher', matcher)
    return matcher
  },

  async getFaceDetections({ commit, state }, { canvas, options }) {
    //从视频流中检测人脸，选择TinyYolov2作为检测算法
    let detections = faceapi
      .detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.8 })
      ).withFaceLandmarks(true).withFaceDescriptors()

    detections = await detections
    return detections
  },

  async getMaskClassify({ commit }, { canvas }) {

    const modelfile = await loadLayersModel('/data/model.json')
    const MobileNet = new CustomMobileNet(modelfile, metadata)
    const maskresult = await MobileNet.predict(canvas)
    // commit('setMaskClassfier', MobileNet)
    return maskresult

  },

  async recognize({ commit, state }, { descriptor, options }) {
    if (options.descriptorsEnabled) {
      const bestMatch = await state.faceMatcher.findBestMatch(descriptor)
      return bestMatch
    }
    return null
  },


  draw({ commit, state }, { canvasDiv, canvasCtx, detection, options }) {

    let name = ''
    if (options.descriptorsEnabled && detection.recognition) {
      name = detection.recognition.toString(state.descriptors.withDistance)
    }

    let maskon = ''
    if (detection.maskdetect) {
      if (detection.maskdetect[0].probability > detection.maskdetect[1].probability) {
        maskon = '已佩戴口罩'
      } else {
        maskon = '未佩戴口罩'
      }
    }

    const text = `${name}${name ? '' : '未知人员'}${maskon}`
    const box = detection.box || detection.detection.box
    if (options.detectionsEnabled && box) {
      // draw box
      canvasCtx.strokeStyle = state.detections.boxColor
      canvasCtx.lineWidth = state.detections.lineWidth
      canvasCtx.strokeRect(box.x, box.y, box.width, box.height)
    }
    if (text && detection && box) {
      // draw text
      const padText = 2 + state.detections.lineWidth
      canvasCtx.fillStyle = state.detections.textColor
      canvasCtx.font = state.detections.fontSize + 'px ' + state.detections.fontStyle
      canvasCtx.fillText(text, box.x + padText, box.y + box.height + padText + (state.detections.fontSize * 0.6))
    }

  },

  async createCanvas({ commit, state }, elementId) {
    const canvas = await faceapi.createCanvasFromMedia(document.getElementById(elementId))
    return canvas
  }
}
