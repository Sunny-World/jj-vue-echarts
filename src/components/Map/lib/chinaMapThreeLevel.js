import echarts from "echarts";
import { cityMap, provinces, specialCity } from "./mapData";
/**
 * let map = new ChinaMapThreeLevel({
 *      // 需要被渲染为地图的dom
 *      dom:this.$refs.dom,
 *      // (非必需)map静态内容的服务器访问地址,不写则默认为/map
 *      mapBase:'/map', 
 *      // (非必需)地图标志显示的数量属性,不写则默认为"数量"
 *      keyName:'终端数量', 
 *      // function 返回点亮的省份列表
 *      getProvinceList:()=>[{
 *          name: "北京市",
 *          value: "26947",
 *          id: "110000"
 *      }],
 *      // function 返回点亮的城市列表
 *      getCityList:()=>[{
 *          name: "**市",
 *          value: "26947",
 *          id: ""******""
 *      }],
 *      // function 返回点亮的区县列表
 *      getTownList:()=>[{
 *          name: "**市",
 *          value: "26947",
 *          id: "******"
 *      }],
 *      // 需要定时循环更新省市区列表的时间，若无该值则不渲染
 *      intervalTime:3000
 * })
 * // 取消定时轮询
 * map.clearInterval()
 */
export default class ChinaMapThreeLevel {
    constructor({
        dom,
        mapBase,
        keyName,
        getProvinceList,
        getCityList,
        getTownList,
        intervalTime
    }) {
        this.mapBase = mapBase ? mapBase : "/map";
        this.keyName = keyName ? keyName : "数量";
        this.dom = dom;
        this.getProvinceList = getProvinceList;
        this.getCityList = getCityList;
        this.getTownList = getTownList;
        this.intervalTime = intervalTime
        // 清除计时器
        clearTimeout(this.intervalClick);
        clearTimeout(this.intervalObj);
        // 定义变量
        // 地图坐标
        this.geoCoordMap = {};
        // 提示信息
        this.toolTipData = [];
        //  气泡，定位点 最大、小值
        this.max = 480;
        this.min = 9;
        this.maxSize4Pin = 40;
        this.minSize4Pin = 40;
        this.intervalObj=null
        this.intervalClick=null
        // 地图缩放值
        this._zoom = 1.2;
        // 初始化地图
        this.chart = echarts.init(dom);
        // 初始中国地图
        this.getChian();
    }
    clearInterval(){
        clearTimeout(this.intervalObj);
    }
    readJsonFile(file, callback) {
        
        let rawFile = window.XMLHttpRequest
            ? new XMLHttpRequest()
            // eslint-disable-next-line
            : new ActiveXObject("Microsoft.XMLHTTP");
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = () => {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        };
        rawFile.send(null);
    }

    // 获取初始中国地图数据
    getChian() {
        clearTimeout(this.intervalObj);
        this.readJsonFile(this.mapBase + "/china.json", async data => {
            await this.updateProvinceList(data);
        });
    }
    async updateProvinceList(data) {
        let d = [];
        let provinceList = await this.getProvinceList();
        provinceList.forEach(element => {
            let obj = {
                name: "",
                value: "",
                id: ""
            };
            if (element.name != null) {
                let cityName;
                switch (element.name) {
                    case "新疆维吾尔自治区":
                        cityName = "新疆省";
                        break;
                    case "广西壮族自治区":
                        cityName = "广西省";
                        break;
                    case "内蒙古自治区":
                        cityName = "内蒙古省";
                        break;
                    case "宁夏回族自治区":
                        cityName = "宁夏省";
                        break;
                    case "西藏自治区":
                        cityName = "西藏省";
                        break;
                    case "香港特别行政区":
                        cityName = "香港市";
                        break;
                    case "澳门特别行政区":
                        cityName = "澳门市";
                        break;
                    default:
                        cityName = element.name;
                        break;
                }
                obj.name = cityName.substr(0, cityName.length - 1);
                obj.value = element.value;
                obj.id = element.id;
                d.push(obj);
            }
        });
        this.restMap(d, data, "china");
        clearTimeout(this.intervalObj);
        if (this.intervalTime) {
            this.intervalObj = setTimeout(async () => {
                await this.getProvinceList();
            }, this.intervalTime);
        }
    }
    async updateCityList(params, data) {
        let d = [];
        if (!params.data.id) {
            switch (params.data.name) {
                case "北京":
                    params.data.id = "110000";
                    break;
                default:
                    params.data.id = null;
            }
        }
        let cityList = await this.getCityList(params.data.id);
        cityList.forEach(element => {
            let arr = {
                name: "",
                value: "",
                id: ""
            };
            arr.name = element.name;
            arr.value = element.value;
            arr.id = element.id;
            d.push(arr);
        });
        this.restMap(d, data, params.name);
        clearTimeout(this.intervalObj);
        if (this.intervalTime) {
            this.intervalObj = setTimeout(async () => {
                await this.updateCityList();
            }, this.intervalTime);
        }
    }
    async updataTownList(params, data) {
        switch (params.name) {
            case "嘉峪关市":
                params.data.id = 620200;
                break;
            default:
                break;
        }
        let townList = await this.getTownList(params.data.id);
        let d = [];
        townList.forEach(element => {
            var obj = {
                name: "",
                value: "",
                id: ""
            };
            obj.name = element.name;
            obj.value = element.value;
            obj.id = element.id;
            d.push(obj);
        });
        this.restMap(d, data, params.name, false);
        clearTimeout(this.intervalObj);
        if (this.intervalTime) {
            this.intervalObj = setTimeout(async () => {
                await this.updataTownList();
            }, this.intervalTime);
        }
    }
    /*重绘地图数据
     *@method restMap
     *@for chinaMap
     *@param{Array}chinaData 基本地图信息
     *@param{Object}data 地图坐标信息，包含经纬度范围值
     *@param{String}mapName 地图上省/市/县名字
     *@return void
     */
    restMap(chinaData, data, mapName, isCity) {
        this.toolTipData.length = 0;
        let renderData = [];
        data = JSON.parse(data);
        data.features.forEach(v => {
            // 地区名称
            let name = v.properties.name;
            //初始化value值
            let _v = "",
                _pid = "";
            // 地区经纬度 示例:[121.509062, 25.044332]
            this.geoCoordMap[name] = v.properties.cp;
            // chinaData数组如果顺序和china.json内的顺序不相符，寻找相同省份绑定该数据
            if (!isCity) {
                for (let j = 0; j < chinaData.length; j++) {
                    if (name === chinaData[j].name) {
                        //如果省份名字相同，返回该省份value绑定到mapdata并中断循环
                        _v = chinaData[j].value;
                        _pid = chinaData[j].id;
                        break;
                    }
                }
            } else {
                _v = Math.round(Math.random() * 1000);
            }
            // 添加地图数据
            renderData.push({
                name: name,
                value: _v,
                id: _pid
            });
            // 添加提示数据
            this.toolTipData.push({
                name: name,
                value: [
                    {
                        name: this.keyName,
                        value: _v
                    }
                ]
            });
        });
        echarts.registerMap(mapName, data); //根据返回坐标点绘制地图
        //绘制地图
        this.renderMap(mapName, renderData); //地图填充数据
    }
    registerClickEvent() {
        //地图点击事件
        let isClick = true; //防止重复点击
        this.chart.on("click", params => {
            clearTimeout(this.intervalObj);
            clearTimeout(this.intervalClick);
            this.toolTipData.length = 0;
            if (isClick) {
                isClick = false; //关闭
                this.intervalClick = setTimeout(() => {
                    isClick = true; //开启，具体毫秒数待测试
                }, 800);
                if (params.name in provinces) {
                    //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
                    if (
                        params.name == "甘肃" ||
                        params.name == "内蒙古" ||
                        params.name == "黑龙江" ||
                        params.name == "广东" ||
                        params.name == "辽宁"
                    ) {
                        this._zoom = 0.7;
                    } else if (
                        params.name == "海南" ||
                        params.name == "四川" ||
                        params.name == "新疆"
                    ) {
                        this._zoom = 0.9;
                    }
                    this.readJsonFile(
                        this.mapBase +
                            "/province/" +
                            provinces[params.name] +
                            ".json",
                        data => {
                            this.updateCityList(params, data);
                        }
                    );
                } else if (params.seriesName in provinces) {
                    //如果是【直辖市/特别行政区】只有二级下钻
                    this._zoom = 1.2;
                    if (specialCity.indexOf(params.seriesName) >= 0) {
                        this.getChian();
                    } else {
                        //如果县区级内容不为空显示县区级地图
                        if (cityMap[params.name] == undefined) {
                            //地图数据缺失，现阶段只发现海南存在此情况。重定向到469000，默认是去除海口、三亚、三沙以外所有海南省的县区
                            cityMap[params.name] = 469000;
                        }
                        if (params.name != "") {
                            this.readJsonFile(
                                this.mapBase +
                                    "/city/" +
                                    cityMap[params.name] +
                                    ".json",
                                data => {
                                    this.updataTownList(params, data);
                                }
                            );
                        } else {
                            // 渲染中国地图
                            this.getChian();
                        }
                    }
                } else {
                    // 渲染中国地图
                    this._zoom = 1.2;
                    this.getChian();
                }
            }
        });
    }
    /*设置渲染数据
     *@method renderMap
     *@for chinaMap
     *@param{String}map 地图subtext提示内容
     *@param{Object}data 地图数据 示例: [{name: '北京',value: 123},{name: '上海',value: 456}]
     *@return void
     *renderMap所有配置项均来自echarts官网配置中心，不再一一备注
     */
    renderMap(map, data) {
        let pinArr = []; //地图气泡展示数组
        //遍历传入的数据，如果value==0||==''，不进行pinArr.push
        data.forEach(element => {
            if (element.value !== 0 && element.value !== "") {
                pinArr.push(element);
            }
        });
        let topThree = pinArr.length;
        // 只显示前面几个
        // if (pinArr.length > 3) {
        //     topThree = 3;
        // }
        let option = {
            tooltip: {
                trigger: "item",
                formatter: params => {
                    if (typeof params.value[2] == "undefined") {
                        let toolTiphtml = "";
                        for (let i = 0; i < this.toolTipData.length; i++) {
                            if (params.name == this.toolTipData[i].name) {
                                toolTiphtml +=
                                    this.toolTipData[i].name + ":<br>";
                                for (
                                    let j = 0;
                                    j < this.toolTipData[i].value.length;
                                    j++
                                ) {
                                    toolTiphtml +=
                                        this.toolTipData[i].value[j].name +
                                        ":" +
                                        this.toolTipData[i].value[j].value +
                                        "<br>";
                                }
                            }
                        }
                        return toolTiphtml;
                    } else {
                        let toolTiphtml = "";
                        for (let i = 0; i < this.toolTipData.length; i++) {
                            if (params.name == this.toolTipData[i].name) {
                                toolTiphtml +=
                                    this.toolTipData[i].name + ":<br>";
                                for (
                                    let j = 0;
                                    j < this.toolTipData[i].value.length;
                                    j++
                                ) {
                                    toolTiphtml +=
                                        this.toolTipData[i].value[j].name +
                                        ":" +
                                        this.toolTipData[i].value[j].value +
                                        "<br>";
                                }
                            }
                        }
                        return toolTiphtml;
                    }
                }
            },
            visualMap: {
                show: false,
                left: "left",
                top: "bottom",
                calculable: true,
                seriesIndex: [1],
                inRange: {
                    color: ["#73D0DF", "#73D0DF"]
                }
            },
            toolbox: {
                //工具栏暂时不显示
                show: false,
                orient: "vertical",
                left: "right",
                top: "center",
                feature: {
                    dataView: {
                        readOnly: true
                    },
                    restore: {},
                    saveAsImage: {}
                },
                iconStyle: {
                    normal: {
                        color: "#fff"
                    }
                }
            },
            geo: {
                map: map,
                zoom: this._zoom,
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: "#fff",
                        borderColor: "#fff",
                        color: "#3CE6C0"
                    },
                    emphasis: {
                        areaColor: "#fff",
                        borderColor: "#fff"
                    }
                }
            },
            series: [
                {
                    //series数组下位置不可更换，会引起地图数据错误
                    name: "散点",
                    type: "scatter",
                    coordinateSystem: "geo",
                    data: this.convertData(data),
                    symbolSize: 0,
                    show: false,
                    label: {
                        normal: {
                            show: false,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            }
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            }
                        }
                    }
                },
                {
                    name: map,
                    type: "map",
                    mapType: map,
                    roam: false,
                    zoom: this._zoom,
                    nameMap: {
                        china: "中国"
                    },
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            }
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: "#323c48",
                            borderColor: "#1aa1a9"
                        },
                        emphasis: {
                            areaColor: "#459CB9"
                        }
                    },
                    data: data
                },
                {
                    name: "设备数量",
                    type: "scatter",
                    coordinateSystem: "geo",
                    legendHoverLink: false, //是否启用图例 hover 时的联动高亮。
                    hoverAnimation: false, //是否开启鼠标 hover 的提示动画效果。
                    effectType: "ripple", //特效类型，目前只支持涟漪特效'ripple'。
                    showEffectOn: "emphasis", //配置何时显示特效。可选：'render' 绘制完成后显示特效。'emphasis' 高亮（hover）的时候显示特效
                    symbol: "pin", //气泡
                    symbolSize: val => {
                        let a =
                            (this.maxSize4Pin - this.minSize4Pin) /
                            (this.max - this.min);
                        let b = this.minSize4Pin - a * this.min;
                        b = this.maxSize4Pin - a * this.max;
                        return a * val[2] + b;
                    },
                    symbolOffset: [0, "-10%"],
                    data: this.convertData(
                        data
                            .sort(function(a, b) {
                                //数组进行排序，后期可能要加前十名高亮
                                return b.value - a.value;
                            })
                            .slice(0, pinArr.length)
                    ), //服务端返回数据会出现value为空的情况，当value为0或者空的时候不进行气泡展示
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            },
                            formatter: function(params) {
                                return params.data.value[2];
                            }
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: "#fff",
                            color: "#294862" //标志颜色
                        }
                    },
                    zlevel: 6
                },
                {
                    name: "Top 3",
                    type: "scatter",
                    coordinateSystem: "geo",
                    legendHoverLink: false, //是否启用图例 hover 时的联动高亮。
                    hoverAnimation: false, //是否开启鼠标 hover 的提示动画效果。
                    effectType: "ripple", //特效类型，目前只支持涟漪特效'ripple'。
                    showEffectOn: "emphasis", //配置何时显示特效。可选：'render' 绘制完成后显示特效。'emphasis' 高亮（hover）的时候显示特效
                    symbol: "pin", //气泡
                    symbolSize: val => {
                        let a =
                            (this.maxSize4Pin - this.minSize4Pin) /
                            (this.max - this.min);
                        let b = this.minSize4Pin - a * this.min;
                        b = this.maxSize4Pin - a * this.max;
                        return a * val[2] + b;
                    },
                    symbolOffset: [0, "-10%"],
                    data: this.convertData(
                        data
                            .sort(function(a, b) {
                                return b.value - a.value;
                            })
                            .slice(0, topThree)
                    ),
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            },
                            formatter: function(params) {
                                return params.data.value[2];
                            }
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                color: "#fff",
                                fontSize: 12
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: "#fff",
                            color: "#73D0DF" //标志颜色
                        }
                    },
                    zlevel: 6
                }
            ]
        };
        //渲染地图
        this.chart.setOption(option);
        this.registerClickEvent()
    }
    //   转换为气泡使用数据
    convertData(data) {
        let res = [];
        for (let i = 0; i < data.length; i++) {
            // 取得具体经纬度信息
            let geoCoord = this.geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name, //市/县/区名字
                    value: geoCoord.concat(data[i].value) //市/县/区经纬度及具体数值
                });
            }
        }
        return res;
    }
}
