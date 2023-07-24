<template style="height:100%;width:100%">
  <div id="app" style="height:100%">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {};
  },
  created() {
    // 解决掉刷新页面丢失变量的情况  刷新之前存储变量
    window.addEventListener(`beforeunload`, () => {
      let storeUsername = this.$store.state.username;
      if (
        storeUsername != null &&
        storeUsername != "" &&
        storeUsername != undefined
      ) {
        sessionStorage.setItem(`username`, JSON.stringify(storeUsername));
      }
      let storeToken = JSON.stringify(this.$store.state.token);
      if (
        storeToken != null &&
        storeToken != "" &&
        storeToken != undefined &&
        storeToken != "{}"
      ) {
        sessionStorage.setItem(`token`, storeToken);
      }
    });
  }
};
</script>
