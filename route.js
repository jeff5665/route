/**
 * 路由模块
 * @param routeConfig object
 * @param pathname 缺省的时候会使用location.pathname
 * @constructor
 */
function RouteModule(routeConfig, pathname) {
    var path = pathname || location.pathname;

    if(typeof routeConfig ==='undefined'){
        throw error('routeConfig 为undefined 传递routeConfig');
    }
    routeConfig[path] && routeConfig[path]();

    var convertList = [];
    var route;
    var hasSpecial = false;

    var specialRule = {
        "*": function (convertObj) {
            var index = convertObj.reg.indexOf('*');
            if (index < 0) {
                return convertObj;
            } else {
                if (index > 0 && convertObj.reg.charAt(index - 1) === '\\') {
                    return convertObj;
                } else {
                    convertObj.reg = convertObj.reg.split(0, index) + '[\w\W]*';
                }
            }

        },
        ":": function (convertObj) {
            // /:id/\:test/:qid
            //console.log('str', str);
            var str = convertObj.reg;

            var tmpStr = str.replace(/\\:/g, '____maohao____');
            tmpStr = tmpStr.replace(/\//g, '\\/');
            //console.log('str--1 ', tmpStr);
            var matchArr = tmpStr.match(/:([^\\]+)/g);
            //console.log('matchArr', matchArr);
            var i;
            if (!!matchArr) {
                for (i = 0; i < matchArr.length; i++) {
                    convertObj.paramKeyList.push(matchArr[i].slice(1));
                }
            }

            tmpStr = tmpStr.replace(/:([^\\]+)/g, '([^\/]+)');
            tmpStr = tmpStr.replace(/____maohao____/g, '\\\\:');

            convertObj.reg = tmpStr;
            //console.log('reg', convertObj.reg);

        }
    };

    /**
     * 检查str中是否存在特殊字符
     * @param str
     * @returns {boolean}
     */
    function checkSpecial(str) {
        var index;
        var hasSpecial = false;
        for (var k in specialRule) {
            index = str.indexOf(k);
            if (index === 0) {//存在特殊字符 并且正好在第一个字符
                hasSpecial = true;
            } else {
                if (index > 0) {//找到特殊字符 判断是否前面存在转义符
                    if (str.charAt(index - 1) !== "\\") { //不存在转义
                        hasSpecial = true;
                    }
                } else {

                }
            }
        }
        return hasSpecial;
    }

    /**
     * 将str中出现特殊字符的地方转换成正则
     * @param str
     * @returns {*}
     */
    function convertReg(str) {
        var result = {
            reg: str, //将要转换成正则
            origin: str, //原始str
            paramKeyList: [""] //第一个元素放空 因为match后分组的元素下标从1开始
        };
        var rule;
        for (rule in specialRule) {//遍历rule，将result当做参数后result会被改变
            specialRule[rule](result);
        }

        return result;
    }

    var convertedRoute;//转换过后的route

    for (route in routeConfig) {//遍历routeConfig
        if (Object.prototype.hasOwnProperty.call(routeConfig, route)) {
            hasSpecial = checkSpecial(route);
            if (hasSpecial) {//存在通配符
                convertedRoute = convertReg(route);
                convertList.push(convertedRoute);
            }
        }
    }

    var i = 0;
    var j;
    var convertRouteItem;
    var matchArr;
    var param = {};
    var matchedItem;

    for (; i < convertList.length; i++) {//遍历convertList
        convertRouteItem = convertList[i];
        var reg = eval('/' + convertRouteItem.reg + '/'); //通过eval生成正则对象
        matchArr = path.match(reg);
        if (!!matchArr) {//如果匹配了 就需要

            for (j = 1; j < matchArr.length; j++) {//遍历matchArr 组成param对象
                // 比如 给定 /123/def 规则是/:id/:title 则得到param={id:123,title:'def'};
                matchedItem = matchArr[j];
                param[convertRouteItem.paramKeyList[j]] = matchedItem;
            }
            routeConfig[convertRouteItem.origin](param); //把参数提交对应的handler
        }
    }

};

/*test code
 RouteModule({
 "/:id/!*": function (param) {
 console.log('param',param);
 }
 }, '/abc/123/\\:ezf');
 */

module.exports = RouteModule;