<template>
  <div class="singer">
    <list-view @select="selectSinger" :data="singers"></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import ListView from 'base/listView/listView'
// 导入歌手类
import Singer from 'common/js/singer'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = '10'

export default {
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    ...mapMutations(['SET_SINGER']),
    selectSinger(singer) {
      this.$router.push({path: `/singer/${singer.id}`})
      this.SET_SINGER(singer)
    },
    _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
          // console.log(this.singers)
        }
      })
    },
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        // 歌手列表中选取10个热门歌手
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        // 歌手map对象 HOT、A、B、C、D...
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // console.log(map)
      // 将map对象转成有序列表
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 将集合按歌手名首字母升序排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    }
  },
  components: {
    ListView
  }
}
</script>

<style lang="stylus" scoped>
  .singer
    position fixed
    top 88px
    bottom 0
    width 100%
</style>
