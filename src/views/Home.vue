<template>
  <div class="bg_bottom">
    <topHeader></topHeader>
    <div class="screenpix">
      <!-- <el-col :span="3">
        <div class="grid-content bg-purple">
          <menu-tree></menu-tree>
        </div>
      </el-col> -->
      <button @click="test">跳转</button>
          <work></work>
    </div>
        <!-- <div class="grid-content bg-purple">
          <bottom-tag></bottom-tag>
        </div> -->
  </div>
</template>

<script>
import topHeader from "../views/header/TopHeader.vue";
// import bottomTag from "../views/footer/BottomTag.vue";
// import menuTree from "../views/left/MenuTree.vue";
import work from "../views/content/work/Work.vue";

export default {
  name: "Home",
  components: {
    topHeader,
    // bottomTag,
    // menuTree,
    work
  },
  data() {
    return {};
  },
  methods: {
    test() {
      this.$router.push({
        path: '/medicalupload'
      })
    }
  }
};
</script>
<style scoped>
.screenpix{
  width:80%;
  height:calc(100% - 120px);
  height:-webkit-calc(100% - 120px);
  height:-moz-calc(100% - 120px);
  height:-ms-calc(100% - 120px);
  height:-o-calc(100% - 120px);
  margin:0 auto 20px auto;
}
.bg_bottom{
  margin-bottom:20px
}
</style>