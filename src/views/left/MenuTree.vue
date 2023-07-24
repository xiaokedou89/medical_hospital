<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple">
          <el-row class="tac">
            <el-col :span="24">
              <el-menu
                default-active="24"
                class="el-menu-vertical-demo"
              >
                <el-menu-item index="1">
                  <i class="el-icon-menu"></i>
                  <span slot="title">工单</span>
                </el-menu-item>
              </el-menu>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "menuTree",
  data() {
    return {};
  }
};
</script>

<style>
</style>