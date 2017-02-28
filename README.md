# tomato
一个web前端的交互组织框架

- 项目主页：[po-to.org/pt-cache](http://po-to.org/pt-cache)
- 项目地址：[Github](https://github.com/po-to/pt-cache)
- API文档： [在线文档](http://po-to.org/pt-cache/docs) 或见 /docs
- 案例应用：[在线文档](http://po-to.org/pt-cache/examples) 或见 /examples
- 概述简介
- 使用说明

# 简介

**什么是web前端的交互组织框架**  
与当前百家争鸣的众多web前端框架不同，本框架的诞生不是为了重复造轮子，也不是为了给已经头晕目眩的前端兄弟们又一个新的选择。正好相反，本框架旨在为各路神仙大侠提供一个组织模块与交互调用的统一方式。 

*(∩_∩)，别排斥我，我不是来添乱的哦...*
- 这不是一个如Angularjs之类的前端MVC框架
- 这不是一个如React之类的View之构建框架
- 这不是一个如Web components之类的组件框架
- 这不是一个如JQuery之类的前端库

*(∩_∩)，忍不住，给自已点个赞：*
- 微框架，小巧灵活，简单易用
- 自由组合，积极拥抱第三方框架
- 兼容低版本浏览器，如IE8

*(∩_∩)，我的家谱：*
- **tomato - 客户端js框架**
- potato - 服务端nodeJS框架
- plate - 典型工程化构建框架
- tomato-jquery - 采用简单jquery做view的实现
- tomato-react - 采用react做view的实现
- tomato-* - 后续会提供更多view的实现
- potato-php - 采用php做server的实现
- potato-* - 后续会提供更多server的实现

![po-to大前端框架](https://raw.githubusercontent.com/po-to/tomato/dev/readme-img/tomato.png)

**为什么家谱中会有server框架？**  
po-to是一个定位为“**大前端**”的框架集合，组织模块和服务器渲染时需要server的支持，虽然用到server技术，但只会围绕前端内容开展，所以服务端可称为“*前端服务适配端*”。

# 什么是交互组织框架
抛开各种技术实现与框架，我们简单的从交互的角度来看看我们一个web页面或是web应用是如何展示在浏览器中，并随着时间和用户操作来改变状态的。