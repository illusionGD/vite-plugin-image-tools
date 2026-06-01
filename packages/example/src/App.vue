<template>
  <div class="demo">
    <header class="demo-header">
      <h1>Vite Image Tools 测试用例</h1>
      <p class="demo-desc">convert / perImage / sprites / cssGen (build + dev watcher)</p>
    </header>

    <section class="demo-section">
      <h2>1. Import 导入</h2>
      <p class="section-desc">import.jpg → perImage 转为 avif</p>
      <div class="card-grid">
        <div class="card">
          <div class="card-label">import 导入</div>
          <img :src="importImg" alt="import" class="img-preview" />
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>2. CSS background-image</h2>
      <p class="section-desc">url() 引用，convert 转 webp</p>
      <div class="card-grid">
        <div class="card">
          <div class="card-label">image.png</div>
          <div class="img-bg img-bg--image"></div>
        </div>
        <div class="card">
          <div class="card-label">css.jpg (perImage quality: 50)</div>
          <div class="img-bg img-bg--css"></div>
        </div>
        <div class="card">
          <div class="card-label">base64.png</div>
          <div class="img-bg img-bg--base64"></div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>3. 精灵图 Sprites</h2>
      <p class="section-desc">icons 目录合并为 icons-sprites.png</p>
      <div class="card-grid card-grid--icons">
        <div class="card">
          <div class="card-label">icon.png</div>
          <div class="sprite-icon sprite-icon--default"></div>
        </div>
        <div class="card">
          <div class="card-label">icon_hover.png (:hover)</div>
          <div class="sprite-icon sprite-icon--hover"></div>
        </div>
        <div class="card">
          <div class="card-label">1.png</div>
          <div class="sprite-icon sprite-icon--1"></div>
        </div>
        <div class="card">
          <div class="card-label">2.png</div>
          <div class="sprite-icon sprite-icon--2"></div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>4. cssGen 自动类</h2>
      <p class="section-desc">根据 assets 自动生成的 CSS 类（含 transform 自定义样式 + 默认回退）</p>
      <div class="card-grid card-grid--small">
        <div class="card" v-for="cls in cssGenClasses" :key="cls">
          <div class="card-label">{{ cls }}</div>
          <div :class="['cssgen-box', cls]"></div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>5. SVG</h2>
      <div class="card-grid">
        <div class="card">
          <div class="card-label">large-image.svg</div>
          <div class="img-bg img-bg--svg"></div>
        </div>
        <div class="card">
          <div class="card-label">vue.svg</div>
          <div class="img-bg img-bg--vue"></div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>6. 中文文件名</h2>
      <div class="card-grid">
        <div class="card">
          <div class="card-label">图片_2.jpg</div>
          <div class="img-bg img-bg--zh"></div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>7. HTML img 标签</h2>
      <p class="section-desc">index.html 中直接引用</p>
      <div class="card-grid">
        <div class="card">
          <div class="card-label">html.jpg</div>
          <img src="./assets/html.jpg" alt="html" class="img-preview" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import importImg from './assets/import.jpg'
const cssGenClasses = ['ui-1', 'ui-2', 'ui-3', 'ui-4', 'ui-5', 'ui-icon', 'ui-base64', 'ui-css']
</script>

<style scoped lang="scss">
.demo {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  margin-bottom: 2.5rem;
  text-align: center;

  h1 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem;
  }
}

.demo-desc {
  margin: 0;
  font-size: 0.9rem;
  color: #b8b8b8;
}

.demo-section {
  margin-bottom: 2.5rem;

  h2 {
    font-size: 1.1rem;
    margin: 0 0 0.25rem;
    color: #8b9cff;
  }
}

.section-desc {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: #a8a8a8;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.card-grid--icons {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.card-grid--small {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.card-label {
  font-size: 0.75rem;
  color: #c4c4c4;
  text-align: center;
  word-break: break-all;
}

.img-preview {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.img-bg {
  width: 80px;
  height: 80px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.img-bg--image {
  background-image: url('./assets/image.png');
}

.img-bg--css {
  background-image: url('./assets/css.jpg');
}

.img-bg--base64 {
  background-image: url('./assets/base64.png');
}

.img-bg--svg {
  background-image: url('./assets/large-image.svg');
}

.img-bg--vue {
  background-image: url('./assets/vue.svg');
}

.img-bg--zh {
  background-image: url('./assets/图片_2.jpg');
}

.sprite-icon {
  width: 56px;
  height: 68px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.sprite-icon--default {
  background-image: url('./assets/icons/icon.png');
}

.sprite-icon--hover {
  background-image: url('./assets/icons/icon.png');
  &:hover {
    background-image: url('./assets/icons/icon_hover.png');
  }
}

.sprite-icon--1 {
  background-image: url('./assets/icons/1.png');
}

.sprite-icon--2 {
  background-image: url('./assets/icons/2.png');
}

.cssgen-box {
  width: 56px;
  height: 56px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

@media (prefers-color-scheme: light) {
  .card {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .card-label {
    color: #444;
  }

  .section-desc,
  .demo-desc {
    color: #555;
  }

  .demo-section h2 {
    color: #4a5dcc;
  }
}
</style>
