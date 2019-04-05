<template>
  <div class="mt-3">
    <loading :active.sync="isLoading"></loading>
    <div class="form-row mb-3">
      <div class="col form-inline">
        <input type="text" class="form-control" placeholder="請輸入要搜尋的文字"
          v-model="search.text">
        <label for="filterArea" class="mx-3">搜尋欄位</label>
        <select class="form-control" id="filterArea" v-model="search.area">
          <option value="all">全部</option>
          <option value="title">標題</option>
          <option value="date">日期</option>
        </select>
      </div>
      <div class="col d-flex justify-content-end align-items-center">
        <span class="mr-1">常用過濾關鍵字：</span>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="credit" value="學分"
            v-model="commonFilter">
          <label class="form-check-label" for="credit">學分</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="med" value="醫藥"
            v-model="commonFilter">
          <label class="form-check-label" for="med">醫藥</label>
        </div>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th scope="col" width="250">單位</th>
          <th scope="col">標題</th>
          <th scope="col" width="170">
            日期
            <a class="ml-1" href="#" @click.prevent="ascending = !ascending">
              <div class="icon" :class="{'inverse': ascending}"></div>
            </a>
          </th>
        </tr>
      </thead>
      <tbody v-if="fliterList">
        <tr v-for="item in fliterList" :key="item.link"
          :class="{'table-warning': item.dateError}">
          <th scope="row" class="align-middle">{{ item.organization }}</th>
          <td class="align-middle">
            <a :href="item.link" class="text-decoration-none" target="_blank">{{ item.title }}</a>
          </td>
          <td class="align-middle">
            {{ item.date }} <br />
            <small>(原始日期：{{ item.originDate }})</small>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import moment from 'moment';
import RssFeedEmitter from 'rss-feed-emitter';

const feeder = new RssFeedEmitter();
moment.suppressDeprecationWarnings = true;

export default {
  data() {
    return {
      rssList: [],
      fliterRssList: [],
      ascending: true,
      isLoading: false,
      yearDisplay: {},
      newRssItem: {
        organization: '',
        title: '',
        link: '',
        date: '',
        originDate: '',
        dateError: false,
      },
      search: {
        text: '',
        area: 'all',
      },
      commonFilter: [],
    };
  },
  methods: {
    setRss() {
      const api = process.env.VUE_APP_CORS_PROXY + process.env.VUE_APP_RSS_LIST;
      const vm = this;
      vm.isLoading = true;

      this.$http.get(api).then((res) => {
        const rssData = res.data.feed.entry;

        // Set RSS feed URL
        rssData.forEach((item) => {
          if (item.gsx$feedurl.$t) {
            feeder.add({
              url: process.env.VUE_APP_CORS_PROXY + item.gsx$feedurl.$t,
              refresh: 10 * 60 * 1000,
            });
            this.yearDisplay[item.gsx$title.$t] = item.gsx$yeardisplay.$t;
          }
        });

        // Get RSS feed items
        feeder.on('new-item', (item) => {
          vm.newRssItem = {
            organization: item.description.split(',')[0],
            title: item.title,
            link: item.link,
            originDate: item.description.split(',')[1].trim(),
            date: this.dateNormalize(item.description.split(',')[1], this.yearDisplay[item.description.split(',')[0]]),
            dateError: false,
          };
          if (vm.newRssItem.date === 'Invalid date') {
            vm.newRssItem.dateError = true;
          }
          vm.rssList.push(vm.newRssItem);
          vm.isLoading = false;
        });
      });
    },
    dateNormalize(date, type) {
      if (type === 'AD') {
        const newdate = date.split(/[/-]/g).map((item) => {
          if (item.length < 2) {
            return `0${item}`;
          }
          return item;
        });
        return moment(newdate.join('-')).format('YYYY-MM-DD');
      } if (type === 'ROC') {
        const newdate = date.split('.');
        newdate[0] = Number(newdate[0]) + 1911;
        return moment(newdate.join('-')).format('YYYY-MM-DD');
      }
      return date;
    },
    filter() {
      let newList = this.rssList.map(item => Object.assign({}, item));
      const vm = this;

      if (this.commonFilter.length) {
        let tempList = [];
        this.commonFilter.forEach((item) => {
          tempList = tempList.concat(newList.filter(element => element.title.match(item)));
        });
        newList = tempList;
      }

      if (this.search.text) {
        switch (this.search.area) {
          case 'all': {
            let tempList = [];
            tempList = tempList.concat(newList.filter(item => item.title.match(this.search.text)));
            tempList = tempList.concat(newList.filter(item => item.date.match(this.search.text)));
            newList = tempList;
            break;
          }
          case 'title': {
            newList = newList.filter(item => item.title.match(this.search.text));
            break;
          }
          case 'date': {
            newList = newList.filter(item => item.date.match(this.search.text));
            break;
          }
          default:
            break;
        }
      }
      vm.fliterRssList = [...new Set(newList)];
    },
    sort() {
      const invalidDate = this.fliterRssList.filter(item => item.date === 'Invalid date');
      const sortDate = this.fliterRssList.filter(item => item.date !== 'Invalid date').sort((a, b) => moment(a.date) - moment(b.date));
      if (!this.ascending) {
        sortDate.reverse();
      }
      this.fliterRssList = invalidDate.concat(sortDate);
    },
  },
  computed: {
    fliterList() {
      this.filter();
      this.sort();
      return this.fliterRssList;
    },
  },
  created() {
    this.setRss();
  },
};
</script>

<style lang="scss">
.icon {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 13.0px 7.5px 0 7.5px;
  border-color: #000000 transparent transparent transparent;
  display: inline-block;
  transition-duration: 0.2s;
  &.inverse {
    transform: rotate(180deg);
    transition-duration: 0.2s;
  }
}
</style>
