<template>
    <div id="app">
        <div class="side-menu">
            <h4 style="text-align:center;">vue-echats库</h4>
            <ul class="router-list">
                <router-link to="/map" tag="li">地图</router-link>
            </ul>
        </div>
        <router-view class="content"></router-view>
    </div>
</template>

<script>
export default {
    name: "app"
};
</script>

<style lang="scss" scoped>
$slide-width: 120px;
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    .side-menu {
        overflow-x: hidden;
        overflow-y: auto;
    }
}
.content {
    position: absolute;
    left: $slide-width;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
}

.side-menu {
    position: absolute;
    left: 0px;
    top: 0;
    right: $slide-width;
    bottom: 0;
    width: $slide-width;
    ul {
        padding: 10px;
        width: calc(100% - 20px);
    }
    li {
        list-style: none;
        width: 100%;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
        &.router-link-active {
            background: #a0b3d6;
            color: #fff;
            border-radius: 10px;
        }
    }
}
</style>
