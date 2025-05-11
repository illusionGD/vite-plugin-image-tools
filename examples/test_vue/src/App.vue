<script setup>
import img from './assets/import.jpg'
</script>

<template>
  <div>
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
</style>
