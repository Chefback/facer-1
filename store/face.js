import * as faceapi from '@vladmandic/face-api';
import metadataJSON from "../data/metadata.json";
import { tf } from '@vladmandic/face-api';
import { CustomMobileNet } from '@teachablemachine/image';
import * as tmImage from '@teachablemachine/image';

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
    scoreThreshold: 0.5,
    inputSize: 160,
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
        faceapi.loadFaceRecognitionModel('/data/models'),
        faceapi.loadFaceLandmarkModel('/data/models'),
        faceapi.loadTinyFaceDetectorModel('/data/models'),
        faceapi.loadFaceExpressionModel('/data/models')
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
  async train({ rootState }) {
    const self = this
    const faces = []
    await Promise.all(rootState.user.userlist.map(async (user) => {
      const descriptors = []
      console.log(user)
      await Promise.all(user.photos.map(async (photo) => {
        const img = new Image()
        img.src = photo.data
        console.log(img)
        const options = {
          detectionsEnabled: true,
          descriptorsEnabled: true,
        }
        //检测注册用户的人脸数据
        const detections = await dispatch('getFaceDetections', { canvas: img, options })
        detections.forEach((d) => {
          descriptors.push({
            path: photo,
            descriptor: d.descriptor
          })
        })
      }))
      faces.push({
        user: user.name,
        descriptors
      })
    }))
    await dispatch('save', faces)
      .then(() => {
        // self.trainalert = true
        // self.failalert = null
      })
      .catch((e) => {
        // self.trainalert = true
        // self.failalert = true
        console.error(e)
      })
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
      .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: state.detections.scoreThreshold,
        inputSize: state.detections.inputSize
      })).withFaceLandmarks(true).withFaceDescriptors()

    // detections = detections.    if (options && options.descriptorsEnabled) {
    //   detections = detections.withFaceDescriptors()
    // }
    detections = await detections
    return detections
  },

  async getMaskModel({ commit }) {

    const URL = 'https://teachablemachine.withgoogle.com/models/hBKYa4zJe/'
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    const model = await tmImage.load(modelURL, metadataURL)

    commit('setMaskClassfier', model)
    return model

  },

  async recognize({ commit, state }, { descriptor, options }) {
    if (options.descriptorsEnabled) {
      const bestMatch = await state.faceMatcher.findBestMatch(descriptor)
      return bestMatch
    }
    return null
  },

  async classify({ commit, state }, { canvas }) {
    const result = await state.maskClassfier.predict(canvas)
    return result
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
