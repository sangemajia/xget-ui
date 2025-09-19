# xget-ui
本项目源码提取自https://xuc.xi-xu.me

版权归xixu所有。

主要解决上面域名部分地区无法访问的问题。

本项目为纯静态资源。
修改js/script.js文件内xgetUrl域名为自己的域名即可。内容如下：

const xgetUrl = `https://xget.xi-xu.me/${platformPrefix}${path}`;

项目内平台列表获取自
https://github.com/xixu-me/Xget/blob/main/src/config/platforms.js

如果github不稳定
修改js/script.js文件内平台获取地址

修改内容如下：

默认内容：

const response = await fetch( "https://raw.githubusercontent.com/xixu-me/Xget/refs/heads/main/src/config/platforms.js"
    );

修改后内容：

const response = await fetch( "https://xget.xi-xu.me/gh/xixu-me/Xget/raw/refs/heads/main/src/config/platforms.js"
    );

修改后的域名也记得改成自己的。
