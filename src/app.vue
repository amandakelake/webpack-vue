<template>
    <div class="app-container">
        <h1>就算做咸鱼，也要比别的鱼咸一点</h1>
        <hello-webpack />
        <img :src="BigLogo" alt="" />
        <img :src="SmallLogo" alt="" />
    </div>
</template>

<script>
import HelloWebpack from '@/components/hello-webpack';
import BigLogo from '@/assets/images/big-logo.png';
import SmallLogo from '@/assets/images/small-logo.jpg';
export default {
    name: 'app',
    data() {
        return {
            BigLogo,
            SmallLogo,
        };
    },
    components: {
        HelloWebpack,
    },
};
</script>

<style>
.app-container {
    background-color: #f1f1f1;
    color: #333;
}
</style>
