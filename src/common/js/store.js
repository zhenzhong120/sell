export function saveToLocal(id, key, value) {
    //根据商家不同的id，存储商家不同的数据
    //localStorage存储方法 node.js没有localStorage，js只有运行到浏览器环境下，才有localStorage，ESlint检测要声明是处于哪个空间下的window.localStorage,并且文件结尾要加星号*
    let seller = localStorage._seller_; //所有内容存到这里，赋值给seller，双下划线编码风格表示私有，专门存取seller用
    if (!seller) {
        seller = {};
        seller[id] = {}; //seller有多个id，每个id都是单独的对象

    } else {
        seller = JSON.parse(seller);//localStorage存储的是json字符串string，取得时候是json对象JSON.parse
        if (!seller[id]) {
            seller[id] = {};
        }
    }
    seller[id][key] = value; //存储每一个id对应的商家的key的value
    localStorage._seller_ = JSON.stringify(seller);//localStorage以字符串形式存储
}
export function loadFromLocal(id, key, def) {
    //读取
    let seller = localStorage._seller_; //所有内容存到这里，赋值给seller，双下划线编码风格表示私有，专门存取seller用
    if(!seller){
        return def; //没有存储seller=>_seller_，返回默认值def
    }
    seller = JSON.parse(seller)[id];  //有seller,就取当前这个商家(seller对应的id)的所有对象
    if(!seller){
        return def; //取不到seller就返回默认值
    }
    let ret = seller[key]; //取到seller看seller下有没有key，有的话返回value，没有返回默认值
    return ret || def;
}