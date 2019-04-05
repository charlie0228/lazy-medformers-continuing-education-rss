<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-light bg-light">
      <div class="navbar-brand mb-0 h1">
        <img class="logo" src="@/assets/logo.png" alt="" />
      </div>
        <div class="navbar-nav">
          <h3 class="nav-item nav-link active" href="#">課程網站資料彙整</h3>
        </div>
    </nav>
    <div class="container">
      <rssList />
    </div>
  </div>
</template>

<script>
import rssList from '@/components/RssList.vue';

export default {
  components: {
    rssList,
  },
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import url('https://fonts.googleapis.com/css?family=Noto+Sans+TC');
* {
  font-family: 'Noto Sans TC', sans-serif;
}
.logo {
  width: 75px;
}
</style>
