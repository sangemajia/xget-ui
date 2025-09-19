# xget-ui
本项目源码提取自https://xuc.xi-xu.me

版权归xixu所有。

主要解决上面域名部分地区无法访问的问题。

本项目为纯静态资源。
修改js/script.js文件内xgetUrl域名为自己的域名即可。内容如下：

const xgetUrl = `https://xget.xi-xu.me/${platformPrefix}${path}`;