<template>
<div>
  <div class="vue-audio">
    <div class="play-box">
      <img v-if="isPlayBtn" src="./assets/play.png" @click="play" alt="">
      <img v-else src="./assets/pause.png" @click="pause" alt="">
    </div>
    <div class="play-progress">
      <p v-text="currentTime"></p>
      <div class="progress-line" ref="progressLine" @click='changeProgress' >
        <div class="progress" v-bind:style="{ width: percent  + '%' }" ></div>
        <img class="progress-btn" @touchstart='startTouchBtn' @touchend='endTouchBtn' @touchmove.prevent.stop='moveBtn' v-bind:style="{ left:`calc(${percent}% - 0.25rem)` }" src="./assets/circle.png" alt="">
        <div class="tip" v-if="lock"  v-bind:style="{ left: `calc(${percent}% - 0.5rem)` }"></div>
      </div>
      <p v-text="duration"></p>
    </div>
    <div class="speed-box">
      <img src="./assets/back.png" @click="back" alt="">
      <img src="./assets/forward.png" @click="forward" alt="">
    </div>
  </div>
  <audio ref="kayAudio" :src="audioSrc" @ended="endAudio" ></audio>
</div>
  
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      audioSrc: null,
      isPlayBtn: true,
      currentTime: "0:00",
      duration: "0:00",
      percent: 0,
      pos: 0, //记录触点当前位置
      startPos: 0, //记录触点开始触发X坐标
      distance: 0, //记录触点开始与结束之间的距离
      lastPos: 0, //记录触点结束触发X坐标
      lock: false, //鼠标点击或抬起状态
      dragWidth: 0, //可拖动的宽度
      startPercent: 0,
      endPercent: 100,
      range: {}
    };
  },
  mounted() {
    let parent = this.$refs.progressLine;
    // 进度条总长度94
    this.dragWidth = parent.offsetWidth;
    // 可移动区间
    let start = parent.offsetLeft;
    let end = parent.offsetLeft + parent.offsetWidth;
    this.range = { start, end };
    this.init();
  },
  computed: {
    audio() {
      return this.$refs.kayAudio;
    }
  },
  components: {},
  watch: {
    isPlayBtn(val) {
      this.isPlayBtn = val;
    },
    currentTime(val) {
      this.currentTime = val;
      this.lastPos =
        this.range.start +
        this.audio.currentTime / this.audio.duration * this.dragWidth;
    },
    duration(val) {
      this.duration = val;
    },
    distance(val) {
      this.distance = val;
    }
  },
  methods: {
    init() {
      // 初始化获得音频源
      let src =
        "http://wangfang.oss-cn-qingdao.aliyuncs.com/wf_video/videoPath/CE79F6D41198CA46EF9675D8793E53BE.MP3";
      this.audioSrc = src;
      this.audio.addEventListener(
        "timeupdate",
        () => {
          this.updateProgress(this.audio);
        },
        false
      );
    },
    updateProgress(audio) {
      this.currentTime = this.transTime(audio.currentTime);
      this.duration = this.transTime(audio.duration);
      this.percent = Math.round(audio.currentTime / audio.duration * 100);
    },
    transTime(time) {
      let duration = parseInt(time);
      let minute = parseInt(duration / 60);
      let sec = duration % 60 + "";
      let isM0 = ":";
      if (minute == 0) {
        minute = "00";
      } else if (minute < 10) {
        minute = "0" + minute;
      }
      if (sec.length == 1) {
        sec = "0" + sec;
      }
      return minute + isM0 + sec;
    },
    // 获取鼠标位置
    touchPos(e) {
      let pos = 0;
      if (e.pageX) {
        pos = e.pageX;
      } else {
        pos = e.changedTouches[0].pageX;
      }
      this.pos = pos;
      return pos;
    },
    // 获取初始位置
    startTouchBtn(e) {
      // console.log('range:',this.range.start,this.range.end)
      // 赋值给触点位置
      this.touchPos(e);
      // 将当前触点位置，赋值给初始位置属性
      this.startPos = this.pos;
      // console.log('startPos:',this.startPos)
      // 鼠标处于按下状态，锁定
      this.lock = true;
      // 将当前位置付给lastDistance
      // this.lastDistance = this.distance;
    },
    moveBtn(e) {
      // 如果鼠标未处于点击状态，则返回
      if (this.lock) {
        // 获取最新鼠标位置
        this.touchPos(e);
        // console.log(this.pos)
        // 移动距离=鼠标位置-初始位置
        let moveX = this.pos - this.startPos;
        // console.log(moveX,(this.startPos),(this.pos));
        if (moveX > 0 && moveX < this.range.end - this.startPos) {
          console.log("向后拖动");
          this.distance = this.lastPos + moveX;
          this.calcPercent(this.distance);
          // console.log(this.distance)
        } else if (moveX < 0 && this.pos > this.range.start) {
          console.log("向前拖动");
          this.distance = -this.lastPos + moveX;
          this.calcPercent(this.distance);
        } else {
          console.log("位置超出");
          return;
        }
      }
    },
    endTouchBtn(e) {
      // 鼠标抬起，解锁
      this.lock = false;
      // 获取最新鼠标位置
      this.touchPos(e);
      this.lastPos = this.pos;
    },
    changeProgress(e) {
      if (!this.isPlayBtn) {
        this.pos = e.pageX;
        this.calcPercent(this.pos - this.lastPos, true);
      }
    },
    calcPercent(dis, clickFlag = false) {
      // 一格dragWidth可以耗时(this.duration/this.dragWidth)s---获取当前应该所在的时间
      let moveTime = 0;
      let rate = clickFlag == true ? 1 : 2;
      if (clickFlag) {
        moveTime = this.audio.duration / this.dragWidth * dis / rate;
      } else {
        moveTime = this.dragWidth / this.audio.duration * dis / rate;
      }
      let now = this.audio.currentTime + moveTime;
      // 赋值给currentTime
      if (now < this.audio.duration) {
        this.audio.currentTime = now;
      } else {
        this.audio.currentTime = this.audio.duration;
      }
    },
    play() {
      this.isPlayBtn = false;
      this.audio.play();
      this.currentTime = this.audio.currentTime;
      this.duration = this.audio.duration;
    },
    pause() {
      this.isPlayBtn = true;
      this.audio.pause();
    },
    endAudio() {
      // console.log("结束了");
      this.isPlayBtn = true;
    },
    back() {
      if (this.audio.currentTime > 15) {
        this.audio.currentTime -= 15;
      } else {
        this.audio.currentTime = 0;
      }
    },
    forward() {
      if (this.audio.currentTime < this.audio.duration - 15) {
        this.audio.currentTime += 15;
      } else {
        this.audio.currentTime = this.audio.duration;
      }
    }
  }
};
</script>

<style lang='less'>
html,
body {
  margin: 0;
  padding: 0;
}
.vue-audio {
  margin-top: 1rem;
  background: rgb(71, 59, 59);
  width: 100%;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0.15rem 0.25rem;
  img {
    width: 0.7rem;
  }
  .play-box {
    text-align: center;
    width: 1rem;
  }
  .speed-box {
    text-align: center;
    width: 2rem;
    img:last-child {
      margin-left: 0.3rem;
    }
  }
  .play-progress {
    width: 6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    p {
      color: #fff;
      width: 1.7rem;
      font-size: 0.34rem;
      text-align: center;
    }
    p:last-child {
      margin-right: 0.25rem;
    }
    .progress-btn {
      width: 0.5rem;
    }
    .progress-line {
      width: 2.6rem;
      position: relative;
      height: 2px;
      background: #fff;
      img {
        position: absolute;
        top: -0.25rem;
        left: -0.25rem;
      }
      .progress {
        position: absolute;
        width: 0%;
        background: yellow;
        height: 2px;
      }
      .tip {
        position: absolute;
        top: -1.25rem;
        height: 1rem;
        width: 2rem;
        background: url("./assets/tip.png") no-repeat;
        background-size: contain;
        background-position: 0 center;
      }
    }
  }
}
</style>
