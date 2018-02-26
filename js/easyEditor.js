; (function () {
	"use strict"
	function begin(_ele) {
		_ele.setAttribute('class', 'easyEditor');
		_ele.spellcheck = false;
		_ele.contentEditable = 'true';
		_ele.focus();
		setRange(_ele);
		_ele.blur();
		window.scrollTo(0, 0);
		// 兼容 ie9 range方法
		if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
			Range.prototype.createContextualFragment = function (html) {
				var frag = document.createDocumentFragment(),
					div = document.createElement("div");
				frag.appendChild(div);
				div.outerHTML = html;
				return frag;
			};
		}
		filter(_ele);
		_ele.onclick = function () {
			eventFunc(_ele);
		}
		_ele.onkeyup = function () {
			eventFunc(_ele);
		}
		_ele.onkeypress = function () {
			eventFunc(_ele);
		}
		_ele.ondrop = function (event) {
			var event = event || window.event;
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		}
	}
	// 粘贴时过滤内容
	function filter(_ele) {
		try {
			document.execCommand("AutoUrlDetect", false, false);
		} catch (e) { }
		_ele.onpaste = function (event) {
			var event = event || window.event;
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
			var text = null;
			if (window.clipboardData && clipboardData.setData) {
				text = window.clipboardData.getData('text');
			} else {
				text = (event.originalEvent || event).clipboardData.getData('text/plain');
			}
			if (document.body.createTextRange) {
				if (document.selection) {
					textRange = document.selection.createRange();
				} else if (window.getSelection) {
					var sel = window.getSelection();
					var range = sel.getRangeAt(0);
					var tempEl = document.createElement("span");
					tempEl.innerHTML = "&#FEFF;";
					range.deleteContents();
					range.insertNode(tempEl);
					textRange = document.body.createTextRange();
					textRange.moveToElementText(tempEl);
					tempEl.parentNode.removeChild(tempEl);
				}
				textRange.text = text;
				textRange.collapse(false);
				textRange.select();
			} else {
				document.execCommand("insertText", false, text);
			}
		}
	}
	function eventFunc(_ele) {
		var oText = _ele.textContent;
		var oHtml = _ele.innerHTML;
		var oTLen = oText.length;
		var oHLen = oHtml.length;
		if (oTLen == 0 && oHLen != 0) {
			if (oHLen == 4) {
				var br = _ele.getElementsByTagName('br');
				removeElement(br[br.length - 1]);
			} else if (oHLen == 11 || oHLen == 13) {
				var p = _ele.getElementsByTagName('p');
				removeElement(p[p.length - 1]);
			} else if (oHLen == 15) {
				var div = _ele.getElementsByTagName('div');
				removeElement(div[div.length - 1]);
			}
		}
		if (document.activeElement.id == _ele.id) setRange(_ele);
	}
	function insertHTML(_ele, html) {
		if (_ele.ran == undefined) {
			_ele.focus();
			setRange(_ele);
		}
		var oFragment = _ele.ran.createContextualFragment(html);
		var oLastNode = oFragment.lastChild;
		_ele.ran.deleteContents();
		_ele.ran.insertNode(oFragment);
		_ele.ran.setStartAfter(oLastNode);
		_ele.sel.removeAllRanges();
		_ele.sel.addRange(_ele.ran);
		_ele.focus();
	}
	function setRange(_ele) {
		_ele.sel = _createRange(_ele);
		if (_ele.sel == null) {
			return false
		} else {
			(window.getSelection) ? _ele.ran = _ele.sel.getRangeAt(0) : _ele.ran = _ele.sel.createRange();
		}
	}
	function _createRange(_ele) {
		if (window.getSelection) {
			var sel = window.getSelection();
			if (sel.rangeCount > 0) {
				return sel;
			}
		} else if (document.selection) {
			var sel = document.selection;
			return sel.createRange();
		}
		return null;
	}
	function getRect(_ele) {
		var rect = _ele.getBoundingClientRect();
		var _left = document.documentElement.clientLeft;
		var _top = document.documentElement.clientTop;
		return {
			left: rect.left - _left,
			top: rect.top - _top,
			right: rect.right - _left,
			bottom: rect.bottom - _top,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top
		}
	}
	function removeElement(_ele) {
		var _parentElement = _ele.parentNode;
		if (_parentElement) {
			_parentElement.removeChild(_ele);
		}
	}


	var init = {
		placeholder: function (holder) {
			this.obj.setAttribute('placeholder', holder || '');
			return this;
		},
		insertEmoji: function (opts) {
			if (opts.src == undefined) {
				console.error('insert emoji src is not define');
				return false;
			}
			if (!opts.remark) opts.remark = '';
			var newImg = '<img src="' + opts.src + '" easy-remark="' + opts.remark + '" />';
			insertHTML(this.obj, newImg);
			if (opts.afterInsert) {
				opts.afterInsert.call(this);
			}
			return this;
		},
		insertBlock: function (opts) {
			insertHTML(this.obj, '<br id="changeLinear"/><span id="easyEditorSaveWidth">' + opts.text + '</span>');
			var spanObj = document.getElementById('easyEditorSaveWidth');
			var width = getRect(spanObj).width;
			removeElement(spanObj);
			removeElement(document.getElementById('changeLinear'));
			opts.color = opts.color == undefined ? '' : 'color:' + opts.color + ';';
			var labelBox = '<input type="text" disabled="disabled" value="' + opts.text + '" style="width:' + width + 'px;' + opts.color + '">';
			insertHTML(this.obj, labelBox);
			if (opts.afterInsert) {
				opts.afterInsert.call(this);
			}
			return this;
		},
		getContent: function (bol) {
			var oldHtml = this.obj.innerHTML;
			if (typeof bol == 'function') {
				var func = bol;
				var bol = false;
			}
			var res = this.obj.innerHTML;
			if (bol) {
				var block = this.obj.getElementsByTagName('input');
				for (var i = 0; i < block.length; i++) {
					var newSpan = document.createElement('span');
					newSpan.innerHTML = '|' + block[i].getAttribute('value') + '|';
					block[i].parentNode.insertBefore(newSpan, block[i]);
				}
				var emojis = this.obj.getElementsByTagName('img');
				for (var i = 0; i < emojis.length; i++) {
					var newSpan = document.createElement('span');
					newSpan.innerHTML = '|' + emojis[i].getAttribute('easy-remark') + '|';
					emojis[i].parentNode.insertBefore(newSpan, emojis[i]);
				}
				res = this.obj.innerHTML;
				res = res.replace(/<\/p>/g, '#easyEditor#');
				res = res.replace(/<\/div>/g, '#easyEditor#');
				res = res.replace(/<\/?[^>]*>/g, '');
				res = res.replace(/#easyEditor#/g, '<br />');
			}
			this.obj.innerHTML = oldHtml;
			this.obj.focus();
			return res;
		}
	}
	window.easyEditor = function (id) {
		if (id == undefined || null) {
			console.error('[EasyEditor] editor id not no defined');
			return;
		}
		return new EasyEditor(id);
	}
	var EasyEditor = function (id) {
		this.obj = document.getElementById(id);
		begin(this.obj);
	}
	EasyEditor.prototype = {
		placeholder: function (holder) {
			return init.placeholder.call(this, holder);
		},
		insertEmoji: function (opts) {
			return init.insertEmoji.call(this, opts);
		},
		insertBlock: function (opts) {
			return init.insertBlock.call(this, opts);
		},
		getContent: function (bol) {
			return init.getContent.call(this, bol);
		}
	}
})();