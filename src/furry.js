var FURRY = function(json_string) {
	//Funcion que se encarga del reconocimiento de voz. Genera un transcript de lo escuchado.
    var recognition = (function() {
		if (!('webkitSpeechRecognition' in window)) {
			return function(save_function) {
				save_function(prompt());
			};
		} else {
			var beep = document.createElement('audio');
			beep.setAttribute('src', 'sounds/beep.wav');
			return function (save_function) {
				var recognition = new webkitSpeechRecognition();
				recognition.lang = "es-MX";
				recognition.onstart = function() {beep.play();};
				recognition.onerror = function(event) {
					cont--;
					var audioElement = document.createElement('audio');
					audioElement.setAttribute('src', "sounds/error.ogg");
					audioElement.addEventListener('ended', exec);
					audioElement.play();
				};
				recognition.onend = function() {};
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
	//Funcion que recorre arreglos para obtener el elemento. Recibe como parametro la dimension actual y la lista de indices restantes.
	function arrayfinder(ele, ind){
		if(ind.length === 0){
			return ele;
		}
		return arrayfinder(ele[buscar(ind.shift())], ind);
	}
	//Funcion que recorre arreglos para guardar el elemento. Recibe como parametro la dimension actual, los indices restantes, y el elemento a guardar.
	function arraysaver(ele, ind, val){
		if(ind.length == 1){
			ele[buscar(ind.shift())]=val;
		} else {
			var aux=buscar(ind.shift());
			if(!Array.isArray(ele[aux]))
				ele[aux]=[];
			arraysaver(ele[aux], ind, val);
		}
	}
	//Funcion que se encarga de obtener elementos de la memoria. Recibe como parametro la direccion y regresa el elemento encontrado
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
		return arrayfinder(returner, dir); //recorre el arreglo en caso de que exista
	}
	//Funcion que se encarga de guardar elementos en la memoria. Recibe como parametro el elemento y su direccion.
	function save(element, dir){
		//guarda directamente si no es un arreglo
		if(dir.length == 2) {
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
		} else { //si es un arreglo obtiene el arreglo real en la memoria
			dir = JSON.parse(JSON.stringify(dir));
			var arr;
			var aux;
			switch(dir.shift()){
				case 0: //variable global
					aux=dir.shift();
					if(!Array.isArray(global[aux]))
						global[aux]=[];
					arr=global[aux];
					break;
				case 1: //variable local
					aux=dir.shift();
					if(!Array.isArray(local[0][aux]))
						local[0][aux]=[];
					arr=local[0][aux];
					break;
				case 2: //temporal local
					aux=dir.shift();
					if(!Array.isArray(local[1][aux]))
						local[1][aux]=[];
					arr=local[1][aux];
					break;
				case 3: //temporal global
					aux=dir.shift();
					if(!Array.isArray(temp[aux]))
						temp[aux]=[];
					arr=temp[aux];
					break;
			}
			arraysaver(arr, dir, element);//recorre el arreglo
		}
	}
	//Funcion que se encarga de reproducir la voz. Recibe como parametro el elemento que dira.
	function hablar(element){
		if(typeof element === "boolean")
			element=(element)?"verdadero":"falso";
		var audioElement = document.createElement('audio');
		audioElement.setAttribute('src', "http://www.dajavax.com/tts.php?ie=UTF-8&tl=es_mx&q="+encodeURI(element)+"&textlen="+(element+"").length+"&total=1&idx=0");
		audioElement.addEventListener('ended', exec);
		audioElement.play();
	}
	//Funcion que se encarga de llamar a recognition e interpretar sus resultados. Recibe como parametros el tipo de dato a escuchar y la direccion donde se guardara.
	function escuchar(dir, type){
		recognition(function(result) {
			if(type == 1) {
				//parsea numeros en caracteres a digitos
				result=result.replace(/uno/g, "1");
				result=result.replace(/dos/g, "2");
				result=result.replace(/tres/g, "3");
				result=result.replace(/cuatro/g, "4");
				result=result.replace(/cinco/g, "5");
				result=result.replace(/seis/g, "6");
				result=result.replace(/siete/g, "7");
				result=result.replace(/ocho/g, "8");
				result=result.replace(/nueve/g, "9");
				result=result.replace(/diez/g, "10");
				result=result.replace(/puntos/g, ".");
				result=result.replace(/punto/g, ".");
				result=result.replace(/ /g, "");
				result = parseFloat(result);
				if(isNaN(result)){
					cont--;
					var audioElement = document.createElement('audio'); //genera audio de error
					audioElement.setAttribute('src', "sounds/error.ogg");
					audioElement.addEventListener('ended', exec);
					audioElement.play();
					return;
				}
			}
			save(result, dir);
			var audioElement = document.createElement('audio'); //genera audio de exito
			audioElement.setAttribute('src', "sounds/success.ogg");
			audioElement.addEventListener('ended', exec);
			audioElement.play();
		});
	}
	//Función principal de ejecucion. Se encarga de recorrer los cuadruplos y hacer las operaciones basicas.
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