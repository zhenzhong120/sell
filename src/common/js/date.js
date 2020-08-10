export function formatDate(date,fmt){
if(/(y+)/.test(fmt)){ //用正则表达式匹配fmt时间戳
//substr 截取指定数量的字符串，从哪开始截，截取的长度
//RegExp.$1 指的是匹配到的y+ ,date.getFullYear() + '' 获取到四位年份数字，转为字符串
//将匹配到的y 替换成 转化后并截取完的年份 2016，长度是2，截取之后就是16；长度是4，截取之后就是2016
    fmt = fmt.replace(RegExp.$1,(date.getFullYear() + '').substr(4-RegExp.$1.length));
}
let o = {
    // 匹配的内容，替换成的内容， 
    'M+' : date.getMonth() + 1,
    'd+' : date.getDate(),
    'b+' : date.getHours(),
    'm+' : date.getMinutes(),
    's+' : date.getSeconds()
}
for(let k in o){
    //通过字符串构造正则表达式,通过遍历动态的构造正则表达式，而上面的/(y+)/.test(fmt)是写死的
    if(new RegExp(`(${k})`).test(fmt)){
        let str = o[k] + '';
   //定义需要替换的值，转成字符串(RegExp.$1 =》 str)
   //不能直接替换成str，需要判断是否补0；一位数字需要补0
        fmt = fmt.replace(RegExp.$1,(RegExp.$1.length === 1)? str : padleftZero(str));
    }
}
return fmt;
}
// 补0函数
function padleftZero(str){
    return ('00' + str).substr(str.length);
}