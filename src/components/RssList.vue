<template>
  <div class="mt-3">
    <loading :active.sync="isLoading"></loading>
    <div class="form-row mb-3">
      <div class="col form-inline">
        <label for="filterArea" class="mx-3">搜尋欄位</label>
        <select class="form-control" id="filterArea" v-model="search.area">
          <option value="all">全部</option>
          <option value="title">標題</option>
          <option value="date">日期</option>
        </select>
        <input type="text" class="form-control ml-3" placeholder="請輸入要搜尋的文字"
          v-model="search.text">
      </div>
      <div class="col d-flex justify-content-end align-items-center">
        <span class="mr-1">常用過濾關鍵字：</span>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="credit" value="性別"
            v-model="commonFilter">
          <label class="form-check-label" for="credit">性別</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="med" value="感染"
            v-model="commonFilter">
          <label class="form-check-label" for="med">感染</label>
        </div>
      </div>
    </div>
    <div class="form-row mb-3">
      <div class="col form-inline">
        <label for="filterTitle" class="mx-3">單位篩選</label>
        <select class="form-control" id="filterTitle" v-model="organizationFilter">
          <option value="">無篩選</option>
          <option v-for="item in currentLoadRss" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
      <div class="col d-flex justify-content-end align-items-center pr-3">
        <span :class="{'text-danger': currentLoadRss.length !== rssListNum.length,
            'text-success': currentLoadRss.length === rssListNum.length}">
          載入進度：<strong>{{ currentLoadRss.length }} / {{ rssListNum.length }}</strong>
        </span>
        <a href="#" @click.prevent="reload" class="ml-2 reload" title="重新整理">
          <i class="fas fa-redo"></i>
        </a>
      </div>
    </div>
    <div class="row px-3 mt-4 my-2" v-if="organizationFilter">
      <div class="col h3">{{ organizationFilter }}</div>
    </div>
    <table class="table">
      <thead class="text-center">
        <tr>
          <th class="align-middle" rowspan="2" scope="col" width="55">#</th>
          <th class="align-middle" rowspan="2" scope="col" width="250"
            v-if="!organizationFilter">單位</th>
          <th class="align-middle" rowspan="2" scope="col">標題</th>
          <th colspan="2" scope="col">
            日期
            <a class="ml-1" href="#" @click.prevent="ascending = !ascending">
              <div class="icon" :class="{'inverse': ascending}"></div>
            </a>
          </th>
        </tr>
        <tr>
          <th scope="col" width="250">
            <a class="mr-1  text-reset text-decoration-none" href="#"
              @click.prevent="dateDisplay.publish = !dateDisplay.publish">
              <i class="far fa-check-square" v-if="dateDisplay.publish"></i>
              <i class="far fa-square" v-else></i>
            公告日期
            </a>
          </th>
          <th scope="col" width="250">
            <a class="mr-1 text-reset text-decoration-none" href="#"
              @click.prevent="dateDisplay.event = !dateDisplay.event">
              <i class="far fa-check-square" v-if="dateDisplay.event"></i>
              <i class="far fa-square" v-else></i>
            活動日期
            </a>
          </th>
        </tr>
      </thead>
        <transition-group name="fade" tag="tbody" v-if="fliterList">
          <tr v-for="(item, index) in fliterList" :key="item.link"
            :class="{'table-warning': item.dateError}">
            <th scope="row" class="align-middle">{{ index + 1 }}</th>
            <td class="align-middle" v-if="!organizationFilter">{{ item.organization }}</td>
            <td class="align-middle">
              <a :href="item.link" class="text-decoration-none" target="_blank">
                {{ item.title }}
              </a>
            </td>
            <td class="align-middle">
              <div v-if="item.dateMean === 'PUBLISH'">
                {{ item.date }} <br />
                <small>(原始日期：{{ item.originDate }})</small>
              </div>
            </td>
            <td class="align-middle">
              <div v-if="item.dateMean === 'EVENT'">
                {{ item.date }} <br />
                <small>(原始日期：{{ item.originDate }})</small>
              </div>
            </td>
          </tr>
          <tr v-if="!fliterList.length && rssList.length" key="0">
            <td colspan="5" class="text-center alert-info h5" style="line-height: 2.5;">
              查無資料
            </td>
          </tr>
        </transition-group>
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
      rssListNum: [],
      filterYear: 2019,
      ascending: true,
      dateDisplay: {
        publish: true,
        event: true,
      },
      isLoading: false,
      yearDisplay: {},
      dateMean: {},
      newRssItem: {
        organization: '',
        title: '',
        link: '',
        date: '',
        originDate: '',
        dateMean: '',
        dateError: false,
      },
      search: {
        text: '',
        area: 'all',
      },
      commonFilter: [],
      organizationFilter: '',
    };
  },
  methods: {
    setRss() {
      const api = process.env.VUE_APP_RSS_LIST;
      const vm = this;
      vm.isLoading = true;

      this.$http.get(api).then((res) => {
        const rssData = res.data.feed.entry;

        // Set RSS feed URL
        rssData.forEach((item) => {
          if (item.gsx$enabled.$t === 'TRUE') {
            feeder.add({
              url: `${process.env.VUE_APP_CORS_PROXY}?url=${item.gsx$feedurl.$t}&type=rss`,
              refresh: 10 * 60 * 1000,
            });
            this.yearDisplay[item.gsx$title.$t] = item.gsx$yeardisplay.$t;
            this.dateMean[item.gsx$title.$t] = item.gsx$datemean.$t;
          }
        });

        this.getRss();
      });
    },
    getRss() {
      const vm = this;
      vm.isLoading = true;
      // Get RSS feed items
      feeder.on('new-item', (item) => {
        vm.newRssItem = {
          organization: item.description.split(',')[0],
          title: item.title,
          link: item.link,
          originDate: item.description.split(',')[1].split('&nbsp; <A')[0].trim(),
          date: this.dateNormalize(item.description.split(',')[0], item.description.split(',')[1].trim(), this.yearDisplay[item.description.split(',')[0]]),
          dateMean: this.dateMean[item.description.split(',')[0]],
          dateError: false,
        };

        if (vm.newRssItem.date === 'Invalid date') {
          vm.newRssItem.dateError = true;
        }

        if (vm.newRssItem.dateError || Number(vm.newRssItem.date.split('-')[0]) >= vm.filterYear) {
          this.rssListNum.push(item.description.split(',')[0]);
          this.rssListNum = [...new Set(this.rssListNum)];
          vm.rssList.push(vm.newRssItem);
        }
        vm.isLoading = false;
      });
    },
    dateNormalize(organization, date, type) {
      let newdate = date.split(' ')[0];
      if (type === 'AD') {
        newdate = newdate.split(/[/-]/g).map((item) => {
          if (item.length < 2) {
            return `0${item}`;
          }
          return item;
        });
        return moment(newdate.join('-')).format('YYYY-MM-DD');
      } if (type === 'ROC') {
        newdate = newdate.split(/[/.-]/g);
        newdate[0] = Number(newdate[0]) + 1911;
        return moment(newdate.join('-')).format('YYYY-MM-DD');
      }
      return date;
    },
    filter() {
      let newList = this.rssList;
      const vm = this;
      if (vm.dateDisplay.publish === false && vm.dateDisplay.event === false) {
        vm.fliterRssList = [];
        return;
      }
      if (this.commonFilter.length) {
        let tempList = [];
        this.commonFilter.forEach((item) => {
          tempList = tempList.concat(newList.filter(element => element.title.match(item)));
        });
        newList = tempList;
      }

      if (this.organizationFilter) {
        newList = newList.filter(item => item.organization.match(this.organizationFilter));
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
      vm.fliterRssList = vm.fliterRssList.filter(item => ((item.dateMean === 'PUBLISH') === vm.dateDisplay.publish) || ((item.dateMean === 'EVENT') === vm.dateDisplay.event));
    },
    sort() {
      const invalidDate = this.fliterRssList.filter(item => item.date === 'Invalid date');
      const sortDate = this.fliterRssList.filter(item => item.date !== 'Invalid date').sort((a, b) => moment(a.date) - moment(b.date));
      if (!this.ascending) {
        sortDate.reverse();
      }
      this.fliterRssList = invalidDate.concat(sortDate);
    },
    reload() {
      this.$emit('reload');
    },
  },
  computed: {
    fliterList() {
      this.filter();
      this.sort();
      return this.fliterRssList;
    },
    currentLoadRss() {
      return [...new Set(this.rssList.map(item => item.organization))].sort();
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
.reload {
  transition-duration: 0.2s;
  &:hover {
  transform: rotate(135deg);
  transition-duration: 0.2s;
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
