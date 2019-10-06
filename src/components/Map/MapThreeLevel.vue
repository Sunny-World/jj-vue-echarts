<template>
    <div>
        <div ref="map" style="height:500px;width:800px;"></div>
    </div>
</template>
<script>
import chinaMapThreeLevel from "./lib/chinaMapThreeLevel"
export default {
    mounted(){
        this.init()
    },
    methods: {
        init() {
            let map = new chinaMapThreeLevel({
                // map的静态内容保存位置
                mapBase:process.env.NODE_ENV === 'production' ?'https://sunny-world.github.io/jj-vue-echarts/dist/map':'/map',
                keyName:'终端数量',
                dom: this.$refs.map,
                getProvinceList: async () => {
                    // eslint-disable-next-line
                    console.log('轮询中')
                    return [
                        {
                            name: "北京市",
                            value: "26947",
                            id: "110000"
                        },
                        {
                            name: "天津市",
                            value: "19538",
                            id: "120000"
                        },
                        {
                            name: "河北省",
                            value: "54052",
                            id: "130000"
                        },
                        {
                            name: "山西省",
                            value: "47543",
                            id: "140000"
                        },
                        {
                            name: "内蒙古自治区",
                            value: "28585",
                            id: "150000"
                        },
                        {
                            name: "辽宁省",
                            value: "17904",
                            id: "210000"
                        },
                        {
                            name: "吉林省",
                            value: "24931",
                            id: "220000"
                        },
                        {
                            name: "黑龙江省",
                            value: "18887",
                            id: "230000"
                        },
                        {
                            name: "上海市",
                            value: "16393",
                            id: "310000"
                        },
                        {
                            name: "江苏省",
                            value: "113608",
                            id: "320000"
                        },
                        {
                            name: "浙江省",
                            value: "70943",
                            id: "330000"
                        }
                    ];
                },
                getCityList: async id => {
                    // eslint-disable-next-line
                    console.log(id)
                    return [
                        {
                            name: "杭州市",
                            value: "11432",
                            id: "330100"
                        },
                        {
                            name: "宁波市",
                            value: "13517",
                            id: "330200"
                        },
                        {
                            name: "温州市",
                            value: "4582",
                            id: "330300"
                        },
                        {
                            name: "嘉兴市",
                            value: "4971",
                            id: "330400"
                        }
                    ];
                },
                getTownList: async id => {
                    // eslint-disable-next-line
                    console.log(id)
                    return [
                        {
                            name: "杭州市",
                            value: "573",
                            id: "330100"
                        },
                        {
                            name: "上城区",
                            value: "471",
                            id: "330102"
                        },
                        {
                            name: "下城区",
                            value: "454",
                            id: "330103"
                        },
                        {
                            name: "江干区",
                            value: "4841",
                            id: "330104"
                        },
                        {
                            name: "拱墅区",
                            value: "1408",
                            id: "330105"
                        }
                    ];
                },
                intervalTime: 3000
            });
            setTimeout(()=>{
                map.clearInterval()
            },10000)
        }
    }
};
</script>
