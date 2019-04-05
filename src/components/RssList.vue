<template>
  <div class="mt-3">
    <table class="table">
      <thead>
        <tr>
          <th scope="col" width="250">Organization</th>
          <th scope="col">Title</th>
          <th scope="col" width="170">Date</th>
        </tr>
      </thead>
      <tbody v-if="sortRssList">
        <tr v-for="item in sortRssList" :key="item.link" :class="{'table-warning': item.dateError}">
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

export default {
  data() {
    return {
      rssList: [],
      yearDisplay: {},
      newRssItem: {
        organization: '',
        title: '',
        link: '',
        Date: '',
        originDate: '',
        dateError: false,
      },
    };
  },
  methods: {
    setRss() {
      const api = process.env.VUE_APP_CORS_PROXY + process.env.VUE_APP_RSS_LIST;
      const vm = this;
      this.$http.get(api).then((res) => {
        const rssData = res.data.feed.entry;
        // Set RSS feed URL
        rssData.forEach((item) => {
          if (item.gsx$feedurl.$t) {
            feeder.add({
              url: process.env.VUE_APP_CORS_PROXY + item.gsx$feedurl.$t,
            });
            this.yearDisplay[item.gsx$title.$t] = item.gsx$yeardisplay.$t;
          }
        });
        // console.log(feeder.list());
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
          // console.log(item.title, item.link, item.description.split(','));
        });
      });
    },
    dateNormalize(date, type) {
      if (type === 'AD') {
        return moment(date).format('YYYY-MM-DD');
      } if (type === 'ROC') {
        const newdate = date.split('.');
        newdate[0] = Number(newdate[0]) + 1911;
        return moment(newdate.join('-')).format('YYYY-MM-DD');
      }
      return date;
    },
  },
  computed: {
    sortRssList() {
      const invalidDate = this.rssList.filter(item => item.date === 'Invalid date');
      const sortDate = this.rssList.filter(item => item.date !== 'Invalid date').sort((a, b) => moment(a.date) - moment(b.date));
      return invalidDate.concat(sortDate);
    },
  },
  created() {
    this.setRss();
  },
};
</script>

<style lang="scss">

</style>
