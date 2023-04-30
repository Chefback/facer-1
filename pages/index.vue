<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          口罩检测与人脸识别系统
        </v-card-title>
        <v-responsive>
          <v-list two-line subheader>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>注册</v-list-item-title>
                <v-list-item-subtitle>注册名字</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>图像获取</v-list-item-title>
                <v-list-item-subtitle>上传图片或拍照获取</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>模型训练</v-list-item-title>
                <v-list-item-subtitle>根据获取的图片训练模型</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>上传检测</v-list-item-title>
                <v-list-item-subtitle>检测用户上传图片</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>摄像头检测</v-list-item-title>
                <v-list-item-subtitle>使用摄像头进行识别</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-responsive>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/users">添加</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>

export default {

}
</script>
