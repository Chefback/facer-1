import * as faceapi from '@vladmandic/face-api';
import metadataJSON from "../data/metadata.json";
import { tf } from '@vladmandic/face-api';
import { CustomMobileNet } from '@teachablemachine/image';

export const state = () => ({
  faces: [],
  models: undefined,
  loading: false,
  loaded: false,
  faceMatcher: null,
  URL: 'https://teachablemachine.withgoogle.com/models/hBKYa4zJe/',
  useTiny: false,
  detections: {
    scoreThreshold: 0.5,
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
  landmarks: {
    drawLines: true,
    lineWidth: 1
  },
  descriptors: {
    withDistance: false
  }
})

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
  getFaceMatcher({ commit, state }) {
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
    const matcher = new faceapi.FaceMatcher(labeledDescriptors)
    commit('setFaceMatcher', matcher)
    return matcher
  },
  async getFaceDetections({ commit, state }, { canvas, options }) {
    let detections = faceapi
      .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: state.detections.scoreThreshold,
        inputSize: state.detections.inputSize
      }))

    if (options && (options.landmarksEnabled || options.descriptorsEnabled)) {
      detections = detections.withFaceLandmarks(state.useTiny)
    }
    if (options && options.expressionsEnabled) {
      detections = detections.withFaceExpressions()
    }
    if (options && options.descriptorsEnabled) {
      detections = detections.withFaceDescriptors()
    }
    detections = await detections
    return detections
  },
  async getMaskDetections({ commit, state }, { canvas }) {

    // let model = await tmImage.loadFromFiles(model1, weights, metadata)
    const customModel = await tf.loadLayersModel('../data/model.json')
    const model = new CustomMobileNet(customModel, metadataJSON);
    let maskDetections = model.predict(canvas)
    // if (options && (options.landmarksEnabled || options.descriptorsEnabled)) {
    //   detections = detections.withFaceLandmarks(state.useTiny)
    // }
    // if (options && options.expressionsEnabled) {
    //   detections = detections.withFaceExpressions()
    // }
    // if (options && options.descriptorsEnabled) {
    //   detections = detections.withFaceDescriptors()
    // }
    // maskDetections = await maskDetections
    return maskDetections
  },

  async recognize({ commit, state }, { descriptor, options }) {
    if (options.descriptorsEnabled) {
      const bestMatch = await state.faceMatcher.findBestMatch(descriptor)
      return bestMatch
    }
    return null
  },
  // [
  //   {
  //     "className": "Mask",
  //     "probability": 0.014806561172008514
  //   },
  //   {
  //     "className": "No Mask",
  //     "probability": 0.9851934313774109
  //   }
  // ],

  draw({ commit, state }, { canvasDiv, canvasCtx, detection, options }) {

    let emotions = ''
    // filter only emontions above confidence threshold and exclude 'neutral'
    if (options.expressionsEnabled && detection.expressions) {
      for (const expr in detection.expressions) {
        if (detection.expressions[expr] > state.expressions.minConfidence && expr !== 'neutral') {
          emotions += ` ${expr} &`
        }
      }
      if (emotions.length) {
        emotions = emotions.substring(0, emotions.length - 2)
      }
    }
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

    const text = `${name}${emotions ? (name ? ' is ' : '') : ''}${emotions}${maskon}`
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

    if (options.landmarksEnabled && detection.landmarks) {
      faceapi.draw.drawFaceLandmarks(canvasDiv, detection.landmarks, { lineWidth: state.landmarks.lineWidth, drawLines: state.landmarks.drawLines })
    }
  },

  async createCanvas({ commit, state }, elementId) {
    const canvas = await faceapi.createCanvasFromMedia(document.getElementById(elementId))
    return canvas
  }
}
