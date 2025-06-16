<script setup>
import img from './assets/import.jpg'
</script>

<template>
  <div>
    <div>
      <div class="icon-test"></div>
    </div>
    <div class="base64-img"></div>
    <div class="svg-icon"></div>
    <a
      target="_blank"
      class="twitter-share-button"
      href="https://twitter.com/intent/tweet?text=Hello%20world&url=https://mc-carnival.kurogames-global.com/"
    >
      Tweet</a
    >
    <!-- <img src="./assets/image.png" alt=""> -->
    <div class="test-css-img">
      <div class="img-test"></div>
    </div>
    <img :src="img" />
  </div>
</template>

<style scoped lang="scss">
.base64-img {
  width: 40px;
  height: 40px;
  background-image: url('./assets/base64.png');
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.test-css-img {
  .img-test {
    background-image: url('./assets/css.jpg');
    width: 1146px;
    height: 717px;
  }
}
.svg-icon {
  width: 200px;
  aspect-ratio: 1;
  background-image: url('./assets/large-image.svg');
}

.icon-test {
  width: 56px;
  height: 68px;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url('./assets/icons/1.png');
  &:hover {
    background-image: url('./assets/icons/2.png');
  }
}
</style>
