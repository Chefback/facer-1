# 口罩检测与人脸识别系统


本系统使用了以下库
 - [face-api.js](https://github.com/justadudewhohacks/face-api.js)
 - [TensorflowJS](https://github.com/tensorflow/tfjs)
 - [VueJS](https://github.com/vuejs/vue)
 - [NuxtJS](https://github.com/nuxt/nuxt.js/)
 - [VuetifyJS](https://github.com/vuetifyjs/vuetify)
 - [ExpressJS](https://github.com/expressjs/expressjs.com)
 - [Docker](https://github.com/docker)


# 安装
 在根文件夹里运行`npm i` 


# 运行

## 开发模式
1. 运行`npm run api` 开启后端服务器
2. 运行`npm run dev` 开启开发模式前端

## 生产模式
1. 运行 `npm run build` 构建项目
2. 运行 `npm run start` 开启生产模式前端

# 部署

## Docker 映像构建
Either build your own Docker images
- `docker build -t gjovanov/facer .`

or us the build script with your own docker hub username and image name:

- `./build.sh`


## Docker 映像拉取
Or pull the one from Docker Hub
`docker pull gjovanov/facer .`

## Docker 映像运行
```docker
docker run -d --name facer \
    --hostname facer \
    --restart always \
    -e API_URL=https://facer.xplorify.net \
    -p 8081:3000 \
    -v /gjovanov/facer/data:/facer/data \
    --net=bridge \
    gjovanov/facer
```

## Docker push
- `docker push gjovanov\facer`

or use the release.sh script with your own docker hub username and image name:
- `./release.sh`
