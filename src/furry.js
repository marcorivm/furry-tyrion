var FURRY = function(json_string) {
	var functionstack = [];
	var global = [];
	var local = [];
	local[0] = [];
	local[1] = [];
	var temp = [];
	var funcionnueva;
	var cuadruplos = JSON.parse(json_string);
	var cont = 0;
	function buscar(dir){
		switch(dir[0]){
			case 0: //variable global
				return global[dir[1]];
			case 1: //variable local
				return local[0][dir[1]];
			case 2: //temporal local
				return local[1][dir[1]];
			case 3: //temporal global
				return temp[dir[1]];
			case 4: //constante
				return dir[1];
		}
	}
	function save(element, dir){
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
	}
	function preguntar(element, dir, type){
		var result = prompt(element);
		if(type == 1) {
			result = parseFloat(result);
		}
		save(result, dir);
	}
	function hablar(element){
		console.log(element);
	}
	function escuchar(dir, type){
		var result = prompt();
		if(type == 1) {
			result = parseFloat(result);
		}
		save(result, dir);
	}
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
				break;
			case 16: // escuchar
				escuchar(cuadruplos[cont][1], cuadruplos[cont][2]);
				break;
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
				funcionnueva = [];
				funcionnueva[0] = [];
				funcionnueva[1] = [];
				break;
			case 21: // gosub
				functionstack.push(new Array(cont, cuadruplos[cont][2], local));
				local=funcionnueva;
				cont=cuadruplos[cont][1]-1;
				break;
			case 22: // param
				funcionnueva[0].push(buscar(cuadruplos[cont][1]));
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
};