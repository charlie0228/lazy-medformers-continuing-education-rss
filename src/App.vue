<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-light bg-light py-0">
      <div class="navbar-brand mb-0 h1">
        <img class="logo" src="@/assets/logo.png" alt="" />
      </div>
        <div class="navbar-nav">
          <h3 class="nav-item nav-link active" href="#">課程網站資料彙整</h3>
        </div>
    </nav>
    <div class="container-fluid">
      <rssList :key="keys" @reload="currentTime" />
    </div>
  </div>
</template>

<script>
import rssList from '@/components/RssList.vue';

export default {
  components: {
    rssList,
  },
  data() {
    return {
      keys: 0,
    };
  },
  methods: {
    currentTime() {
      this.keys = Date.now();
      console.clear();
    },
  },
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+TC');
* {
  font-family: 'Noto Sans TC', sans-serif;
}
body {
  overflow-y: scroll;
}
.logo {
  width: 125px;
}
</style>
