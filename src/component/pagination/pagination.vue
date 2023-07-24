<template>
  <div class="pagination">
    <el-select v-model="pageSize" placeholder="" @change="sizechange">
      <el-option
        v-for="item in options"
        :key="item.size"
        size="mini"
        :label="item.label"
        :value="item.size"
      />
    </el-select>
    <button size="mini" class="btn-arrow" @click="prev">{{left}}</button>
    <span class="show-text">{{ pageCount }}</span>
    <button size="mini" class="btn-arrow" @click="next">></button>
  </div>
</template>
<script>
import * as status from '@/utils/global.js'
export default {
  name: 'Pagination',
  props: {
    pageCount: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      left: '<',
      pageSize: status.size,
      options: [
        {
          size: 5,
          label: `5条/页`
        },
        {
          size: 10,
          label: `10条/页`
        },
        {
          size: 15,
          label: `15条/页`
        },
        {
          size: 20,
          label: `20条/页`
        }
      ]

    }
  },
  methods: {
    next() {
      this.$emit('next')
    },
    prev() {
      this.$emit('prev')
    },
    sizechange() {
      this.$emit('selectchange', this.pageSize)
    }
  }
}
</script>
<style scoped>
.el-select {
  width: 100px;
  height: 29px;
  line-height: 29px;
}
.show-text {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: #1890ff;
  color: #fff;
  text-align: center;
  font-size: 14px;
  line-height: 28px;
  border-radius: 3px;
}

.btn-arrow {
  display: inline-block;
  width: 32px;
  height: 32px;
  margin: 0 5px;
  background-color: #fff;
  color: #C0C4CC;
  font-size: 14px;
  line-height: 28px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 2px;
  cursor: pointer;
}
</style>
