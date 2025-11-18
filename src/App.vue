<template>
  <div class="body-page">
    <router-view />
  </div>
</template>

<script>
export default {
  setup() {},
};
</script>

<style lang="less">
body {
  background: #f1f1f1;
}
.body-page {
  padding: 0.2rem;
}

.title {
  padding: .8rem 0 .2rem 0;font-size: 14px;color: #999;
}
.title:first-child {
  padding-top:0;
}
.padding20 {
  padding: 0.2rem;
}
.paddingtb20 {
  padding: 0.2rem 0;
}
.paddingrl20 {
  padding: 0 2rem;
}
</style>
