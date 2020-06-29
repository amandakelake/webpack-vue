<template>
    <div class="app-container">
        <h1>就算做咸鱼，也要比别的鱼咸一点</h1>
        <hello-webpack />
        <img :src="BigLogo" alt="" />
        <img :src="SmallLogo" alt="" />
        <ul>
            <li v-for="(item, index) in list" :key="index">{{ item.name }}</li>
        </ul>
    </div>
</template>

<script>
import HelloWebpack from '@/components/hello-webpack';
import BigLogo from '@/assets/images/big-logo.png';
import SmallLogo from '@/assets/images/small-logo.jpg';
import _ from 'lodash';
export default {
    name: 'app',
    data() {
        return {
            BigLogo,
            SmallLogo,
            list: [{ name: 1 }, { name: 2 }],
        };
    },
    components: {
        HelloWebpack,
    },
    mounted() {
        this.updateList();
    },
    methods: {
        updateList() {
            const newArr = [{ name: 3 }, { name: 4 }];
            this.list = _.concat(this.list, newArr);
        },
    },
};
</script>

<style>
.app-container {
    background-color: #f1f1f1;
    color: #333;
}
</style>
