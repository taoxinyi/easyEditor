**这只是一个简单的编辑器，拥有插入表情，插入行块功能，支持IE9+**
演示网址：http://www.jq22.com/jquery-info17495

easyEditor
====================

首先你需要引入css与JS
```html
<link rel="stylesheet" href="css/easyEditor.css" />
<script src="js/easyEditor.js"></script>
```
html你只需要一个div
```html
<div id="editor" style="width:500px;height:300px;"></div>
```
我们需要实例化
```javascript
var editor = easyEditor('editor');
```
如果你需要placeholder
```javascript
/**
* @desc 插入placeholder
* @param {string} placeholder实现
*
*/
editor.placeholder(str);
```
插入表情
```javascript
/**
* @desc 插入表情方法
* @param {object} opt 
* @param {string} opt.src 表情路径 
* @param {string} opt.remark 表情说明
* @param {function} opt.afterInsert 插入后的回调函数
*
*/

editor.insertEmoji({
	src : 'emoji/1.gif', 
	remark : '笑脸',
	afterInsert : function(){
		//do something
	}
});
```
插入行块
```javascript
/**
* @desc 插入行块方法
* @param {object} opt
* @param {string} opt.text 文字 
* @param {string} opt.color 文字颜色
* @param {function} opt.afterInsert 插入后的回调函数
*
*/
    
editor.insertBlock({
	text : '@somebody', 
	color : '#f00',
	afterInsert : function(){
		//do something
	}
});
```
获取编辑器里面的html
```javascript
var myhtml = editor.getContent(false);
```
获取编辑器里面的text
```javascript
var mytext = editor.getContent(true);
```
