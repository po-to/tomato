# tomato
tomato是一个客户端JS框架，主要依据前文所提到的“视图组织”思路，提供抽象接口和部分基类。一般不直接使用，你可以跟据具体项目来扩展和实现它。Poto中也提供了多个基于其扩展的框架，如：tomato-jquery、tomato-vue等。tomato采用Typescript开发，编译成为ES5标准的JS，如果你需要效率更高的ES6语法，请自行下载源码编译。

# 项目主页
[po-to.org](po-to.org/page/articles/tomato/s01)

# 兼容
tomato采用“优雅降级”的理念兼容IE8及以上浏览器，在主流现代浏览器中均有很好的用户体验。 

# 依赖
Tomato依赖于两个环境对象：
- Promise：浏览器内置对象，对于低版本的浏览器，你注意引入Promise Shim
- require：AMD模块载入函数，建议使用：RequireJS库

# 安装
- 使用NPM安装：npm install @po-to/tomato
- 手动下载安装：[Github](https://github.com/po-to/tomato)

# 引入
使用AMD标准模块化，推荐使用requireJS引入

# 文档
[API](po-to.org/static/api/tomato)

#设置
Tomato中的设置主要通过其对外函数setConfig()来实现：

    ```
	export declare function setConfig(data: {
	    namespace?: string;
	    application?: Application;
	    createViewComponent?: (data: any) => IViewComponent;
	}): void;
    ```
从上面代码可以看出，tomato可以设置的选项主要有三项：
- namespace?: string   
一个被当作tomato命名空间的字符串，请确保其唯一，默认值为"po-to/tomato"
- application?: Application   
Application为“根会话”（参见：概述->视图组织），tomato中提供Application的抽象基类，项目中必须先继承该基类并实例化后回传给tomato
- createViewComponent?: (data: any) => IViewComponent   
createViewComponent为一个创建IViewComponent的函数，IViewComponent是视图模块的根Component（参见：概述->视图组织）。tomato中不直接提供创建IViewComponent的方法，项目中必须给tomato设置此创建函数。