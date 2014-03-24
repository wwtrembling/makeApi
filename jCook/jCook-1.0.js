/*
속도저하문제
- arguments.callee 사용시 JS 엔진에서 속도저하 발생(또한, ES5 스트릭트 모드에서는 허용안됨)
- for in 사용시 JS 엔진에서 속도저하 발생
*/

;(function(){
	var 
		win = window,
		loc = win.location,
		doc = win.document,
		docElem = doc.documentElement, //<html />, 구버전: document.body

		/*
		document.doctype : <!DOCTYPE>
		document.documentElement : <html lang="en">
		document.head : <head>
		document.body : <body>
		*/

		version = '0.1',

		isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
		
		//터지여부
		hasTouch = 'ontouchstart' in win && !isTouchPad,
		
		//이벤트 종류
		eventResize = 'onorientationchange' in win ? 'orientationchange' : 'resize',
		eventStart = hasTouch ? 'touchstart' : 'mousedown',
		eventMove = hasTouch ? 'touchmove' : 'mousemove',
		eventEnd = hasTouch ? 'touchend' : 'mouseup',

		jCook = function() {
			/*
			if(!(this instanceof jCook)) {
				//return new arguments.callee;
				return new jCook(); //arguments.callee 사용시 JS 엔진에서 속도저하 발생
			}
			*/
			return new jCook.fn.init(Array.prototype.slice.call(arguments)); //arguments to array
		};

	jCook.fn = jCook.prototype = {
		constructor: jCook, //디폴트 constructor 를 jCook으로 재설정
		init : function(args, target) {
			var 
				target = target || doc;

			if(args.length == 0 || !args[0]) {
				return this;
			}

			//모든 노드는 Node 로 부터 상속받는 nodeType, nodeName 속성을 가진다.
			//명확하지 않은 경우에 노드의 유형을 판별하는 가장 빠른 방법은
			//nodeType 속성을 확인해보는 것이다.
			if(args.length === 2) {
				//_$('id', '값');
				//_$('class', '값');
				//_$('tag', '값');
				//_$('selector', '값'); //querySelectorAll() 가능한 곳에서만 제한적으로 사용가능
				return this[args[0]](args[1], target);
			}else if(args[0].nodeType || args[0] == win) { //DOMElement, window
				//_$(document);
				//_$(window);
				/*
				nodeType
				1 : Element 노드를 의미
				2 : Attribute 노드를 의미
				3 : Text 노드를 의미
				4 : CDATASection 노드를 의미
				5 : EntityReference 노드를 의미
				6 : Entity 노드를 의미
				7 : ProcessingInstruction 노드를 의미
				8 : Comment 노드를 의미
				9 : Document 노드를 의미
				10 : DocumentType 노드를 의미
				11 : DocumentFragment 노드를 의미
				12 : Notation 노드를 의미
				*/
				this.elem = args[0];
				this.length = 1;
				this[0] = this.elem;
				return this;
			}else {
				//보완이 필요하다!
				//querySelectorAll 을 지원하고,
				//#, . 등이 있고, 위에 띄어쓰기 등이 있으면, 
				//_$('selector', '값') 을 통해 DOM을 select 하자
				switch(args[0].charAt(0)) {
					case "<":
						//doc.createElement();
						//doc.createTextNode();
						this.elem = target.createElement(args[0]);
						this.length = 1;
						this[0] = this.elem;
						return this;
						break;
					case "#":
						//doc.getElementById(id);
						return this['id'](args[0].slice(1), target);
						break;
					case ".":
						//doc.getElementsByClassName(class, tag);
						return this['class'](args[0].slice(1), target);
						break;
					default:
						//doc.getElementsByTagName(tag);
						return this['tag'](args[0], target);
						break;
				}
			}

			return this;
		},
		//Element 를 Array 로 변환하여 반환한다.
		elementsToArray : function(elements) {
			var arr = [];
			if(elements instanceof NodeList) {
				arr = Array.prototype.slice.call(elements);
			}else if(elements instanceof HTMLCollection) {
				for(var i = 0, max = elements.length; i < max; i++) {
					arr[i] = elements[i];
				}
			}
			return arr;
		},
		//기본구조
		//elem : element 저장
		//this.length : this object 크기 강제 조절
		//this[...] : element 목록
		selector : function(name, target) {
			//_$('selector', '#test')
			if(doc.querySelectorAll) { //IE8 이하 사용 불가능
				var 
					target = target || doc,
					elem = target.querySelectorAll(name),
					arr = this.elementsToArray(elem);
				
				this.elem = elem;
				this.length = arr.length;
				for(var key in arr) {
					this[key] = arr[key];
				}
				return this;
			}
			return false;
		},
		id : function(name, target) {
			var 
				target = target || doc;

			this.elem = target.getElementById(name);
			this.length = 1;
			this[0] = this.elem;

			return this;
		},
		class : function(name, target) {
			var 
				target = target || doc,
				elem = target.getElementsByClassName(name),
				arr = this.elementsToArray(elem);

			this.elem = elem;
			this.length = arr.length;
			for(var key in arr) {
				this[key] = arr[key];
			}
			return this;
		},
		tag : function(name, target) {
			var 
				target = target || doc,
				elem = target.getElementsByTagName(name), //type : HTMLCollection
				arr = this.elementsToArray(elem);

			this.elem = elem;
			this.length = arr.length;
			for(var key in arr) {
				this[key] = arr[key];
			}
			return this;
		},
		name : function(name, target) {
			var 
				target = target || doc,
				elem,
				arr = [];

			if(doc.getElementsByName) {
				elem = target.getElementsByName(name);
				arr = this.elementsToArray(elem);
				this.elem = elem;
				this.length = arr.length;
				for(var key in arr) {
					this[key] = arr[key];
				}
			}else {
				var 
					i = 0,
					tag = doc.getElementsByTagName('*'),
					max = tag.length;
				for( ; i<max; i++) {
					if(tag[i].name === name || tag[i].getAttribute('name') === name) {
						arr[arr.length] = tag[i];
					}
				}
				this.length = arr.length;
				for(var key in arr) {
					this[key] = arr[key];
				}
			}
			return this;
		},
		create : function(name) {
			//추후 doc.createDocumentFragment(); 사용하는 방안을 생각해보자
			return doc.createElement(name);
		}
	};

	//Rady
	jCook.ready = function(callback) {
		if(doc.addEventListener) {
			//DOMContentLoaded : HTML(DOM) 해석이 끝난 직후에 발생하는 이벤트
			doc.addEventListener('DOMContentLoaded', function() {
				//alert(document.getElementById('test').innerHTML);
				callback();
			});
		}else {
			(function () {
				try {
					docElem.doScroll('left');
				} catch(error) {
					setTimeout(arguments.callee, 0); //arguments.callee 대체할 수 있는 것 알아내자
					return;
					callback();
				}
			}());
		}
	};

	// Give the init function the jCook prototype for later instantiation
	jCook.fn.init.prototype = jCook.fn; 
	//jCook() 호출시 new jCook.prototype.init(); 반환
	//jCook.prototype.init.prototype = jCook.prototype;


	//extend (외부 JS 전용으로 하자)
	/*
	this는 호출할 때 결정되는 요소이므로,
	jCook.extend( ... )를 하면 jCook 객체에 추가
	jCook.fn.extend( ... )를 호출하면 jCook.fn 객체에 추가
	*/
	jCook.extend = jCook.fn.extend = function() {
		var target = arguments[0] || {};
		if(typeof target !== "object") {
			target = {};
		}
		for (var name in target) {
			if(this.hasOwnProperty(name)) continue;
			//this : jCook.extend( ... ), jCook.fn.extend( ... ) 분리 추가됨
			this[name] = target[name]; 
		}
	};
	/*
	//extend 예제
	jCook.extend({
		//jCook.aa(); 형식으로 추가된다.
		aa : function() {
			alert('a');
		}
	});
	jCook.fn.extend({
		//jCook(...).bb(); 형식으로 추가된다.
		bb : function() {
			alert('b');
		}
	});
	*/

	//아래 코드는 다른 곳에서도 사용할 수 있도록 공통 변수가 아닌 지역 변수를 사용하자.
	var 
		//스크롤 값(element의 경우에는??? 다시 수정 개발하자!!!)
		getScrollSize = function() {
			var scrollX, scrollY;
			if( typeof( window.pageYOffset ) == 'number' ) {
				//Netscape compliant
				scrollY = window.pageYOffset;
				scrollX = window.pageXOffset;
			}else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
				//DOM compliant
				scrollY = document.body.scrollTop;
				scrollX = document.body.scrollLeft;
			} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
				//IE6 standards compliant mode
				scrollY = document.documentElement.scrollTop;
				scrollX = document.documentElement.scrollLeft;
			}
		  
			return {x: scrollX, y: scrollY};
		}
		//마우스 위치값
		getMouseXY = function(event) {
			var mouseX, mouseY; //clientX: 브라우저 내부영역, screenX: 해당도 영역
			//모바일 확인
			if(hasTouch){
				event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			}
			mouseX = event.clientX;
			mouseY = event.clientY;

			//추후 아래 내용 getScrollSize() 사용으로 변경하자!!
			if(docElem) { //document.documentElement
				mouseX += docElem.scrollLeft;
				mouseY += docElem.scrollTop;
			}else if(document.body) { //IE: document.body
				mouseX += document.body.scrollLeft;
				mouseY += document.body.scrollTop;
			}

			return {x: mouseX, y: mouseY};
		},
		//style 값
		getStyle = function(elem, value) {
			var ret;
			if(value == 'opacity' && elem.filters) { //IE opacity
				ret = 1;
				try {
					ret = elem.filters.item('alpha').opacity / 100;		
				}catch(e) {}
			}else if(elem.style[value]) { //style로 값을 구할 수 있는 경우
				ret = elem.style[value];
			}else if(elem.currentStyle && elem.currentStyle[value]) { //IE의 경우
				ret = elem.currentStyle[value];
			}else if(document.defaultView && document.defaultView.getComputedStyle) {
				//대문자를 소문자로 변환하고 그 앞에 '-'를 붙인다. (예: font-weight -> fontWeight)
				var converted = '';
				for(i = 0, len = value.length; i < len; ++i) {
					if(value.charAt(i) == value.charAt(i).toUpperCase()) {
						converted = converted + '-' + value.charAt(i).toLowerCase();
					}else {
						converted = converted + value.charAt(i);
					}
				}
				if(document.defaultView.getComputedStyle(elem, '').getPropertyValue(converted)) {
					ret = document.defaultView.getComputedStyle(elem, '').getPropertyValue(converted);
				}
			}
			return ret;
		},
		//element 위치 출력
		getElemXY = function(elem) {
			//elem은 문서에 포함되어 있어야 하고, 화면에 보여야 한다.
			if(elem.parentNode === null || elem.style.display == 'none') {
				return false;
			}
			
			var 
				parent = null,
				pos = [], //pos[0]에 x 좌표, pos[1]에 y 좌표 값 저장
				box;
			
			if(document.getBoxObjectFor) { //gecko 엔진 기반
				box = document.getBoxObjectFor(elem); //파이어폭스 등 gecko 엔진 기반에서 x, y좌표 구하기
				pos = [box.x, box.y];
			}else { //기타 브라우저
				//offsetLeft와 offsetTop을 최상위 offsetParent 까지 반복적으로 더한다.
				pos = [elem.offsetLeft, elem.offsetTop];
				parent = elem.offsetParent;
				if(parent != elem){
					while(parent){
						pos[0] += parent.offsetLeft;
						pos[1] += parent.offsetTop;
						parent = parent.offsetParent;
					}
				}
				//오페라와 사파리의 'absolute' position의 경우
				//body의 offsetTop을 잘못 계산하므로 보정해야 한다.
				var ua = navigator.userAgent.toLowerCase();
				
				if(ua.indexOf('opera') != -1 || (ua.indexOf('safari') != -1 && getStyle(elem, 'position') == 'absolute')) {
					pos[1] -= document.body.offsetTop;
				}
			}
			
			if(elem.parentNode) { parent = elem.parentNode; }
			else { parent = null; }
			
			//body 또는 html 이외의 부모 노드 중에 스크롤되어 있는
			//영역이 있다면 알맞게 처리한다.
			while(parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
				pos[0] -= parent.scrollLeft;
				pos[1] -= parent.scrollTop;
				
				if(parent.parentNode) { parent = parent.parentNode; }
				else { parent = null; }
			}
			return {x: pos[0], y: pos[1]}
		},
		//element 위치 설정
		setElemXY = function(elem, x, y){
			var 
				pageXY = getElemXY(elem), 
				position, 
				delta;

			if(pageXY === false) {return false;}
			position = getStyle(elem, 'position'); //Javascript 사용자함수
			//position이 static인 경우, left와 top이 적용되지 않으므로,
			//position을 relative로 변경
			if(!position || position == 'static') {
				elem.style.position = 'relative';
			}
			delta = {
				x: parseInt(getStyle(elem, 'left'), 10), //position이 relative인 경우 보정을 위한 값 저장
				y: parseInt(getStyle(elem, 'top'), 10)
			};
			if(isNaN(delta.x)) { delta.x = 0; } //position이 static이었던 경우, left와 top값이 없으므로 x와 y의 값에 0을 할당
			if(isNaN(delta.y)) { delta.y = 0; }
			
			if(x != null) {
				elem.style.left = (x - pageXY.x + delta.x) + 'px';
			}
			if(y != null) {
				elem.style.top = (y - pageXY.y + delta.y) + 'px';
			}
		},
		getOffset = function(elem) {
			return elem.getBoundingClientRect();
		};

	jCook.fn.extend({
		//기본구조
		//elem : element 저장
		//this.length : this object 크기 강제 조절
		//this[...] : element 목록
		find : function() { //작업완료
			var 
				arr = Array.prototype.slice.call(arguments),
				target = this[0] || doc;

			return this['init'](arr, target);
		},
		closest : function(selectors, target) { //작업완료
			var 
				target = target || docElem, //docElem: <html />
				i = 0,
				length = this.length,
				name,
				value,
				elem;
			if(/^[#\.]/.test(selectors)) { //#:id, .:class
				switch(selectors.charAt(0)) {
					case '#':
						//id
						name = 'id';
						break;
					case '.':
						//class
						name = 'class';
						break;
				}
				value = selectors.slice(1);
			}else { //tag
				value = selectors.toLowerCase(); //toLowerCase(): 소문자변환
			}

			for ( ; i<length; i++) { //this[] 연관배열이 .class 값등으로 여러개가 들어올 수 있다.
				for (elem = this[i]; elem && elem !== target; elem = elem.parentNode) {
					if((name && elem.getAttribute(name) === value) || (elem.tagName.toLowerCase() === value)) {
						this[0] = elem;
						this.length = 1;
						return this;
					}
				}
			}
		},
		each : function(callback) { //작업완료
			return jCook.each(this, callback);
		},
		data : function(key, value) { //작업완료
			return this.each(function() {
				jCook.data(this, key, value);
			});
		},
		removeData : function(key) { //작업완료
			return this.each(function() {
				jCook.removeData(this, key);
			});	
		},
		attr : function(name, value) { //작업완료
			//attribute
			var 
				name = name || '',
				value = value || '';

			if(value === '') { //get
				return this[0].getAttribute(name);
			}else { //set
				this.each(function() {
					this.setAttribute(name, value);
				});
				return this;
			}
		},
		removeAttr : function(name) { //작업완료
			this.each(function() {
				this.removeAttribute(name);
			});
			return this;
		},
		hasAttr : function(name) { //작업완료
			//elem.hasAttribute('href');
			return this[0].hasAttribute(name);
		},
		prop : function(name, value) { //작업완료
			//property
			var 
				name = name || '',
				value = value || '';

			if(value === '') { //get
				return this[0][name];
			}else { //set
				this.each(function() {
					this[name] = value;
				});
				return this;
			}
		},
		removeProp : function(name) { //작업완료
			this.each(function() {
				try {
					this[name] = undefined;
					delete this[name];
				} catch( e ) {}
			});
			return this;	
		},
		html : function(value) { //작업완료
			var 
				value = value || '',
				i = 0,
				length = this.length;
			if(value === '') { //get
				//return this[i].outerHTML;
				return this[0].innerHTML;
			}else { //set
				for( ; i < length; i++) {
					this[i].innerHTML = value;
				}
			}
		},
		text : function(value) { //작업완료
			var 
				value = value || '',
				i = 0,
				length = this.length;
			if(value === '') { //get
				return this[0].textContent;
			}else { //set
				for( ; i < length; i++) {
					this[i].textContent = value;
				}
			}
		},
		val : function(value) { //작업완료
			return this.each(function() {
				this.value = value;
			});
		},
		append : function(elem) { //작업완료
			//elem.appendChild();
			this[0].appendChild(elem);
			return this;
		},
		before : function(elem) { //작업완료
			//elem.insertBefore('대상', '어디');
			//자식 노드 목록 끝에 노드를 추가하는 것 외에 삽입 위치를 조정
			//insertBefore() 메서드의 두번째 매개변수를 전달하지 않으면,
			//이 메서드는 appendChild() 처럼 동작한다.
			this.each(function() {
				this.insertBefore(elem, this);
			});
			return this;
		},
		replaceWith : function(value) { //작업완료
			return this.each(function() {
				this.outerHTML = value;
			});
		},
		remove : function() { //작업완료
			//elem.removeChild();
			this.each(function() {
				this.parentNode.removeChild(this);
			});
		},
		clone : function(is) { //작업완료
			//elem.cloneNode();
			//is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)
			return this[0].cloneNode(is || true); //id를 가진 node를 복사할 때 주의하자(페이지내 중복 id를 가진 노드가 만들어 지는 가능성이 있다)
		},
		css : function(value) { //작업완료
			var 
				type = jCook.type(value),
				CSS3Browsers = ['', '-moz-', '-webkit-', '-o-', '-ms-'],
				CSS3RegExp = /^(transition|border-radius|transform|box-shadow|perspective|flex-direction)/i; //사용자가 수동으로 -webkit- , -moz- , -o- , -ms- 입력하는 것들은 제외시킨다.

			if(type === 'string') { //get
				//return getStyle(this[0], value); //방법1
				//return this[0].style[value]; //방법2(CSS 속성과 JS 에서의 CSS 속성형식이 다르므로 사용불가능)
				return this[0].style.getPropertyValue(value); //방법3(CSS 속성명을 사용하여 정상적 출력가능)
			}else if(type === 'object'){ //set
				for(var key in value) {
					this.each(function() {
						var elem = this;
						if(CSS3RegExp.test(key)) { //CSS3
							jCook.each(CSS3Browsers, function() {
								//elem.style[this.concat(key)] = value[key]; //방법1
								elem.style.setProperty(this.concat(key), value[key]); //방법2
							});
						}else {
							//단위(예:px)까지 명확하게 입력해줘야 한다.	
							//this.style[key] = value[key]; //방법1
							elem.style.setProperty(key, value[key]); //방법2
						}
					});
				}
			}
		},
		width : function(value) {
			var 
				value = value || '',
				elem = this[0];
			if(value === '') { //get
				if(this[0] == win) { //window
					//win.outerWidth
					return win.innerWidth;
				}else if(this[0].nodeType == 9) { //document
					return Math.max(
						doc.body["scrollWidth"], docElem["scrollWidth"],
						doc.body["offsetWidth"], docElem["offsetWidth"],
						docElem["clientWidth"]
					);
				}else {
					return this[0].clientWidth;
				}
			}else { //set
				this.css.apply(this, [{'width':value}]);
			}
		},
		innerWidth : function(value) {
			//get, set 작업 필요
			//clientWidth(border값 제외) - div.style.padding
			//elem.getBoundingClientRect(); //Top, Right, Bottom, Left

		},
		outerWidth : function(value) {
			//get, set 작업 필요
			//offsetWidth(border값 포함) + div.style.margin
		},
		height : function(value) {
			//get, set 작업 필요
			//x.clientHeight
			var 
				value = value || '',
				elem = this[0];
			if(value === '') { //get
				if(this[0] == win) {
					//win.outerHeight
					return win.innerHeight;
				}else if(this[0].nodeType == 9) {
					//수정필요!!! window, document 구분해서 값을 구해야 한다!!
					return Math.max(
						doc.body["scrollHeight"], docElem["scrollHeight"],
						doc.body["offsetHeight"], docElem["offsetHeight"],
						docElem["clientHeight"]
					);
				}else {
					return this[0].clientHeight;
				}
			}else { //set
				this.css.apply(this, [{'height':value}]);
			}
		},
		innerHeight : function(value) {
			//get, set 작업 필요
			//clientHeight(border값 제외)
		},
		outerHeight : function(value) {
			//get, set 작업 필요
			//offsetHeight(border값 포함) + div.style.margin
		},
		hasClass : function(cl) { //작업완료
			//elem.classList; //클래스 리스트 출력
			var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
			return !!this[0].className.match(regex);
		},
		addClass : function(cl) { //작업완료
			//elem.classList.add('');
			var 
				arr = cl.split(' '),
				elem;
			this.each(function() {
				//this.className += ' ' + cl; //방법1
				//this.classList.add(cl); //방법2 (한번에 하나의 클래스만 입력 가능하다. 죽, 띄어쓰기로 여러 클래스 입력 불가능)
				elem = this;
				jCook.each(arr, function(index, value) {
					elem.classList.add(value);
				});
			});
			return this;
		},
		removeClass : function(cl) { //작업완료
			//elem.classList.remove('');
			var 
				//regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)'),
				arr = cl.split(' '),
				elem;
			this.each(function() {
				//this.className = this.className.replace(regex, ' '); //방법1
				//this.classList.remove(cl); //방법2 ((한번에 하나의 클래스만 삭제 가능하다. 죽, 띄어쓰기로 여러 클래스 삭제 불가능))
				elem = this;
				jCook.each(arr, function(index, value) {
					elem.classList.remove(value);
				});
			});
			return this;
		},
		toggleClass : function(cl) {  //작업완료
			//elem.classList.toggle('');
			var 
				arr = cl.split(' '),
				elem;
			//this.hasClass.apply(this, arguments) ? this.removeClass.apply(this, arguments) : this.addClass.apply(this, arguments); //방법1
			this.each(function() {
				elem = this;
				jCook.each(arr, function(index, value) {
					elem.classList.toggle(value);
				});
			}); //방법2
			return this;
		},		
		show : function() {

		},
		hide : function() {

		},
		toggle : function() {

		},
		//jCook 객체에서 매개변수로 지정한 인덱스의 엘리먼트를 반환한다.
		//추후 index값이 없을 경우, 배열에 element 태그를 담아서 반환하자!(jQuery 참고)
		get : function(index) { //작업완료
			var 
				length = this.length,
				j = +index + ( index < 0 ? length : 0 ); //+index : -1의 값이 들어올 수 있기 때문에(-1은 마지막 last 번지)
			this.length = 1;
			this[0] = this[j];

			return this;
		},
		index : function(elem) {

		}
	});
	
	//Event
	jCook.fn.extend({
		on : function(events, handlers, capture) { //작업완료
			var 
				capture = capture || false;
			this.each(function() {
				if(this.addEventListener) {
					this.addEventListener(events, function() {
						handlers.apply(this, arguments); //this: elements
					}, capture);
				}else if(this.attachEvent){ //IE
					this.attachEvent('on'+events, function() {
						handlers.apply(this, arguments); //this: elements
					});
				}
			});
		},
		off : function(events, handlers, capture) { //작업완료
			var 
				capture = capture || false;
			this.each(function() {
				if(this.removeEventListener) {
					this.removeEventListener(events, function() {
						handlers.apply(this, arguments); //this: elements
					}, capture);
				}else if(this.detachEvent){ //IE
					this.detachEvent('on'+events, function() {
						handlers.apply(this, arguments); //this: elements
					});
				}
			});
		}
	});

	//Util
	jCook.extend({
		cache: {},
		stopCapture : function(event) { //표준 처리 작업의 취소
			if(event.preventDefault){
				event.preventDefault();
			}else { //IE
				event.returnValue = false;
			}
		},
		stopBubbling : function(event) { //전파 취소
			if(event.stopPropagation){
				event.stopPropagation();
			}else { //IE
				event.cancelBubble = true;
			}
		},
		type : function() { //작업완료
			/*
			참고 : http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/

			jCook.type({a: 4}); //"object"
			jCook.type([1, 2, 3]); //"array"
			(function() {console.log(jCook.type(arguments))})(); //arguments
			jCook.type(new ReferenceError); //"error"
			jCook.type(new Date); //"date"
			jCook.type(/a-z/); //"regexp"
			jCook.type(Math); //"math"
			jCook.type(JSON); //"json"
			jCook.type(new Number(4)); //"number"
			jCook.type(new String("abc")); //"string"
			jCook.type(new Boolean(true)); //"boolean"
			*/
			if(!arguments[0]) return arguments[0];
			return ({}).toString.call(arguments[0]).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
		},
		each : function(array, callback) { //작업완료
			var 
				i = 0,
				length = array.length;

			//추후 연관배열객체의 경우 Array.prototype.slice.call(array); 변환후 사용하자
			for( ; i < length; i++) {
				callback.apply(array[i], [i, array[i]]); //i:key, array[i]:value
			}
		},
		contains : function(container, contained) { //작업완료
			//compareDocumentPosition();
			//contains();
			//특정노드가 다른 노드 내에 포함되었는지를 알 수 있다.
			//사용예 : ????
			return container.contains(contained); //return : true, false;
		},
		equal : function(container, contained) { //작업완료
			//isEqualNode();
			//동일 평가 기준
			// 1. 두 노드가 동일한 형식이다.
			// 2. nodeName, localName, namespaceURI, prefix, nodeValue 문자열 특성이 동일하다.
			// 3. NamedNodeMaps 특성이 동일하다.
			// 4. childNodes NodeLists 가 동일하다.
			//사용예 : ????
			return container.isEqualNode(contained); //return : true, false;
		},
		hasFocus : function(target) { //작업완료
			//document.hasFocus();
			//문서 혹은 문서 내의 특정 노드가 포커스를 가지고 있는지 판별
			var target = target || document;
			return target.hasFocus();
		},
		data : function(elem, key, value) {
			//elem.dataset
			var 
				key = key || '',
				value = value || '';
			if(value == '') {
				return elem.dataset;
			}else {
				elem.dataset = value;
			}
		},
		removeData : function(elem, key) {
			delete elem.dataset.key;
		},
		getScript : function(url, success) { //작업완료
			//외부 JS 비동기 다운로드 및 onload 콜백
			var 
				script = document.createElement('script');
			script.src = url;
			script.onload = success;
			document.body.appendChild(script);
		},
		cookie : function() {
			//arguments 가 1개면 get, 2개면 set
			/*
			// 쿠키를 로드해요!
			clean.cookie.get = function(name) {
				//REQUIRED: name

				var arg = name + '=';
				var alen = arg.length;
				var clen = document.cookie.length;
				var i = 0;

				while (i < clen) {

					var j = i + alen;

					if (document.cookie.substring(i, j) == arg) {
						return get_$ookie_val(j);
					}

					i = document.cookie.indexOf(' ', i) + 1;

					if (i === 0) {
						break;
					}
				}

				// 없으면 undefined!
				return undefined;
			};
			*/
			/*
			// 쿠키를 셋팅해 보아요~
			clean.cookie.set = function(name, value, expireDays) {
				//REQUIRED: name
				//REQUIRED: value
				//REQUIRED: expireDays

				var today = new Date();

				today.setDate(today.getDate() + expireDays);

				document.cookie = name + "=" + escape(value) + ";path=/; expires=" + today.toGMTString() + ";";
			};
			*/
		},
		//json, array 합치기
		merge : function(target1, target2, recursive) { //jQuery에 있는 함수 기능과 유일하게 다른 기능을 하는 함수
			//타입을 검사하여,
			//array, object에 대해 구분하여 처리하자
			//중첩된 target1[원본]에 있는 값을 target2에 있는 값으로 변경할지 여부recursive(불리언값)
			var
				target1 = target1 || undefined;
				target2 = target2 || undefined;
				recursive = recursive || false; //true:동일한 값의 원본 변경, false:해당없음

			for( var key in target2 ) { 
				if( target2.hasOwnProperty( key ) ) {
					target1[key] = target2[key];
				}
			}
			return target1;
		},
		trim : function(text) { //작업완료
			return text.replace(/(^\s*)|(\s*$)/g, "");
		}
	});

	window.jCook = window._$ = jCook;
})();