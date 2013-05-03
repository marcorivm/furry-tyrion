var FURRY = function(json_string) {
    var recognition = (function() {
		if (!('webkitSpeechRecognition' in window)) {
			return function(save_function) {
				save_function(prompt());
			};
		} else {
			var recognition = new webkitSpeechRecognition();
			recognition.lang = "es-MX";
			recognition.onstart = function() {};
			recognition.onerror = function(event) {};
			recognition.onend = function() {};
			return function (save_function) {
				recognition.onresult = function(event) {
					save_function(event.results[0][0].transcript);
				};
				recognition.start();
			};
		}
	})();
	var functionstack = [];
	var global = [];
	var local = [];
	local[0] = [];
	local[1] = [];
	var temp = [];
	var funcionesnuevas = [];
	var cuadruplos = JSON.parse(json_string);
	var cont = 0;
	function arrayfinder(ele, ind){
		if(ind.length == 0){
			return ele;
		}
		return arrayfinder(ele[buscar(ind.shift())], ind);
	}
	function arraysaver(ele, ind, val){
		if(ind.length == 1){
			ele[buscar(ind.shift())]=val;
		}
		arraysaver(ele[buscar(ind.shift())], ind, val);
	}
	function buscar(dir){
		dir = JSON.parse(JSON.stringify(dir));
		var returner;
		switch(dir.shift()){
			case 0: //variable global
				returner =  global[dir.shift()];
				break;
			case 1: //variable local
				returner = local[0][dir.shift()];
				break;
			case 2: //temporal local
				returner = local[1][dir.shift()];
				break;
			case 3: //temporal global
				returner = temp[dir.shift()];
				break;
			case 4: //constante
				returner = dir.shift();
				break;
		}
		return arrayfinder(returner, dir);
	}
	function save(element, dir){
		if(dir.length == 2)
			switch(dir[0]){
				case 0: //variable global
					global[dir[1]]=element;
					break;
				case 1: //variable local
					local[0][dir[1]]=element;
					break;
				case 2: //temporal local
					local[1][dir[1]]=element;
					break;
				case 3: //temporal global
					temp[dir[1]]=element;
					break;
			}
		} else {
			dir = JSON.parse(JSON.stringify(dir));
			var arr;
			switch(dir.shift()){
				case 0: //variable global
					arr=global[dir.shift()];
					break;
				case 1: //variable local
					arr=local[0][dir.shift()];
					break;
				case 2: //temporal local
					arr=local[1][dir.shift()]=element;
					break;
				case 3: //temporal global
					arr=temp[dir.shift()];
					break;
			}
			arraysaver(arr, dir, element);
		}
	}
	function hablar(element){
		var audioElement = document.createElement('audio');
		audioElement.setAttribute('src', "http://www.dajavax.com/tts.php?ie=UTF-8&tl=es_mx&q="+encodeURI(element)+"&textlen="+element.length+"&total=1&idx=0");
		audioElement.addEventListener('ended', exec);
		audioElement.play();
	}
	function escuchar(dir, type){
		recognition(function(result) {
			if(type == 1) {
				result = parseFloat(result);
			}
			save(result, dir);
			exec();
		});
	}
	function exec() {
		while(cont<cuadruplos.length){
			switch(cuadruplos[cont][0]){
				case 1: // +
					save(buscar(cuadruplos[cont][1])+buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 2: // -
					save(buscar(cuadruplos[cont][1])-buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 3: // *
					save(buscar(cuadruplos[cont][1])*buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 4: // /
					save(buscar(cuadruplos[cont][1])/buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 5: // >
					save(buscar(cuadruplos[cont][1])>buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 6: // >=
					save(buscar(cuadruplos[cont][1])>=buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 7: // <
					save(buscar(cuadruplos[cont][1])<buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 8: // <=
					save(buscar(cuadruplos[cont][1])<=buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 9: // ==
					save(buscar(cuadruplos[cont][1])==buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 10: // !=
					save(buscar(cuadruplos[cont][1])!=buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 11: // &
					save(buscar(cuadruplos[cont][1])&&buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 12: // |
					save(buscar(cuadruplos[cont][1])||buscar(cuadruplos[cont][2]), cuadruplos[cont][3]);
					break;
				case 13: // =
					save(buscar(cuadruplos[cont][1]), cuadruplos[cont][2]);
					break;
				case 14: // preguntar
					preguntar(buscar(cuadruplos[cont][1]), cuadruplos[cont][2], cuadruplos[cont][3]);
					break;
				case 15: // hablar
					hablar(buscar(cuadruplos[cont][1]));
					cont++;
					return;
				case 16: // escuchar
					escuchar(cuadruplos[cont][1], cuadruplos[cont][2]);
					cont++;
					return;
				case 17: // goto
					cont=cuadruplos[cont][1]-1;
					break;
				case 18: // gotof
					if(!buscar(cuadruplos[cont][1]))
						cont=cuadruplos[cont][2]-1;
					break;
				case 19: //  gotov
					if(buscar(cuadruplos[cont][1]))
						cont=cuadruplos[cont][2]-1;
					break;
				case 20: // era
					var funcionnueva = [];
					funcionnueva[0] = [];
					funcionnueva[1] = [];
					funcionesnuevas.push(funcionnueva);
					break;
				case 21: // gosub
					functionstack.push(new Array(cont, cuadruplos[cont][2], local));
					local=funcionesnuevas.pop();
					cont=cuadruplos[cont][1]-1;
					break;
				case 22: // param
					funcionesnuevas.slice(-1)[0][0].push(buscar(cuadruplos[cont][1]));
					break;
				case 23: // return
					var tempreturn = buscar(cuadruplos[cont][1]);
					var templocal = functionstack.pop();
					cont = templocal[0];
					local = templocal[2];
					save(tempreturn, templocal[1]);
					break;
			}
			cont++;
		}
	}
	exec();
};