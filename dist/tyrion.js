
// Aqui pueden ir funciones de javascript

// Declarando underscore
var TYRION = function(str) {

// Extender prototype de String para usar startsWith
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
	return this.slice(0, str.length) == str;
  };
}
if(typeof Array.prototype.clean != 'function') {
	Array.prototype.clean = function(deleteValue) {
	  for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
		  this.splice(i, 1);
		  i--;
		}
	  }
	  return this;
	};
}

// Extender underscore para usar la función mergeDictionary
_.mixin({
	mergeDictionary: function (dictionary) {
		var merged = (arguments.length > 0)? arguments[0] : {};
		for (var i = arguments.length - 1; i >= 1; i--) {
			_(arguments[i]).map(function(value, key) {
				if(_(merged).has(key)) {
					// Error variable ya definida;
					IO.printError(1, key);
					return false;
				}
				merged[key] = value;
			});
		};
		return merged;
	}
});
_.mixin({
	addToDictionary: function (dictionary, value) {
		if(_(dictionary).has(value.id)) {
			IO.printError(1, value.id);
			return false;
		}
		if(_(value).has('id')) {
			dictionary[value.id] = value;
		}
		return dictionary;
	}
});
var	OP_NUMBER = 1,
	OP_STRING = 2,
	OP_BOOL   = 3,
	OP_ARRAY  = 4,

	OP_ADD    = 1,	// +
	OP_SUB    = 2,	// -
	OP_MULT   = 3,	// *
	OP_DIV    = 4,	// /
	OP_GT     = 5,	// >
	OP_GT_EQ  = 6,	// >=
	OP_LT     = 7,	// <
	OP_LT_EQ  = 8,	// <=
	OP_EQ     = 9,	// ==
	OP_DIFF   = 10,	// !=
	OP_AND    = 11,	// &
	OP_OR     = 12,	// |
	OP_ASSIGN = 13,	// =
	OP_ASK    = 14,	// preguntar
	OP_SPEAK  = 15,	// hablar
	OP_LISTEN = 16,	// escuchar
	OP_GOTO   = 17,	// goto
	OP_GOTOF  = 18,	// gotof
	OP_GOTOT  = 19,	//  gotov
	OP_ERA    = 20,	// era
	OP_GOSUB  = 21,	// gosub
	OP_PARAM  = 22,	// param
	OP_RETURN = 23,	// return

	Left_Par  = 24,
	Right_Par = 25
;

var tabla_operaciones = {
		1: {
			1: {
				1: 1,
				2: 2
			},
			2: {
				1: 1,
			},
			3: {
				1: 1,
			},
			4: {
				1: 1,
				2: 2,
			},
			5: {
				1: 3,
			},
			6: {
				1: 3,
			},
			7: {
				1: 3,
			},
			8: {
				1: 3,
			},
			9: {
				1: 3,
			},
			10: {
				1: 3,
			},
			13: {
				1: 1,
			}
		},
		2: {
			1: {
				1: 2,
				2: 2,
			},
			5: {
				2: 3,
			},
			6: {
				2: 3,
			},
			7: {
				2: 3,
			},
			8: {
				2: 3,
			},
			9: {
				2: 3,
			},
			10: {
				2: 3,
			},
			13: {
				1: 2,
				2: 2,
			}
		},
		3: {
			9: {
				3: 3,
			},
			10: {
				3: 3,
			},
			11: {
				3: 3,
			},
			12: {
				3: 3,
			},
			13: {
				3: 3,
			}
		}
};
var checkOperation = function (op_1, operation, op_2) {
	return (
			_(tabla_operaciones).has(op_1)
			&& _(tabla_operaciones[op_1]).has(operation)
			&& _(tabla_operaciones[op_1][operation]).has(op_2)
		)?
			tabla_operaciones[op_1][operation][op_2]
			: -1;
};
var VARIABLE = function (id, type, value) {
	if(type == 1) {
		value = parseFloat(value);
	}
	var x = {
		id: id,
		type: type,
		value: value,
		parent: undefined,
		_namespace: undefined,
		namesapce: function() {
			this._namespace = this._namespace? this._namespace : (this.parent? (this.parent.namesapce() + '_' + this.id) : this.id);
			return this._namespace;
		},
		_direction: undefined,
		direction: function() {
			this._direction = this._direction? this._direction : TYRION.addVariable(this.namesapce());
			return this._direction;
		}
	};
	if(id.startsWith('_const_')) {
		x._direction = [4, value];
	}
	return x;
};
var NODE = function(id, type) {
	var node = {
		id: id,
		type: (type? type : 0),
		args: [],
		parameters: [],
		variables: {},
		vars_dir: {temp: [], local: []},
		nodes: {},
		quads_start: undefined,
		parent: undefined,
		_namespace: undefined,
		direction: TYRION.quads.length,
		namesapce: function() {
			this._namespace = this._namespace? this._namespace : (this.parent? (this.parent.namesapce() + '_' + this.id) : this.id);
			return this._namespace;
		},
		addVariable: function(variable) {
			if(_(this.variables).has(variable.id)) {
				// Error! variable ya declarada!
				IO.printError(1, variable.id);
				return false;
			}
			variable.parent = this;
			this.variables[variable.id] = variable;
			if(variable.id.startsWith('_tmp_')) {
				variable._direction = [2, this.vars_dir.temp.push(0) - 1];
			} else if(! variable.id.startsWith('_const_') ){
				variable._direction = [1, this.vars_dir.local.push(0) - 1];
			}
			return variable;
		},
		addNode: function(node) {
			if(_(this.nodes).has(node.id)) {
				// Error! función ya declarada!
				IO.printError(2, node.id);
				return false;
			}
			node.parent = this;
			this.nodes[node.id] = node;
			return node;
		},
		addParameter: function(parameter) {
			this.parameters.push(parameter);
			return parameter;
		},
		addQuad: function(op_id, op_1, op_2, result) {
			return TYRION.quads.push([op_id, op_1, op_2, result].clean()) - 1;
		},
		checkQuad: function(quad_op) {
			switch(quad_op) {
				case "GotoInicio":
					this.addQuad(OP_ERA);
					pila_saltos.push(this.addQuad(OP_GOSUB));
					break;
				case "Inicio":
					var inicio = pila_saltos.pop();
					TYRION.quads[inicio][1] = this.direction;
					break;
				case "ExpSum":
					var operador = pila_operadores.first();
					if( operador == 1 || operador == 2 || operador == 12 ) {
						this.normalQuad();
					}
					break;
				case "ExpMult":
					var operador = pila_operadores.first();
					if( operador == 3 || operador == 4 || operador == 11 ) {
						this.normalQuad();
					}
					break;
				case "ExpRel":
					this.normalQuad();
				break;
				case "ExpAssign":
					var op_2 = pila_operandos.pop();
					var op_1 = pila_operandos.pop();
					var operador = pila_operadores.pop();
					if(op_2.type == op_1.type) {
						this.addQuad(operador, op_2.direction(), op_1.direction());
					} else {
						IO.printError(5, [op_1, operador, op_2]);
					}
					break;
				case "Matriz":
					var op_2 = pila_operandos.pop();
					var op_1 = pila_operandos.pop();
					op_2 = _(op_2).map(function(value) {
						return value.direction();
					});
					op_2 = op_2.join(',');
					var tmp = new VARIABLE(_.uniqueId("tmp"), op_1.type);
					tmp._direction = op_1.direction().slice(0);
					tmp._direction.push(op_2);
					pila_operandos.push(tmp);
					break;
				case "FunCall":
					var op_2 = pila_operandos.pop();
					var op_1 = pila_operandos.pop();
					if(op_2.length != op_1.parameters.length ||
						! _(op_2).reduce(function(memo, value, key) {
							return memo && (value.type == this[key].type);
						},true, op_1.parameters)) {
						IO.printError(5, op_2);
					}
					this.addQuad(OP_ERA);
					_(op_2).map(function(value, key) {
						this.addQuad(OP_PARAM, value.direction());
					}, this);
					var ret = this.addVariable(new VARIABLE(_.uniqueId('_tmp_'), op_1.type));
					this.addQuad(OP_GOSUB, op_1.direction, ret.direction());
					// TODO: Agregar gotosub.
					return ret;
					break;
				case "Ask":
					var ask = true;
				case "Speak":
					var op_2 = pila_operandos.pop();
					var operador = pila_operadores.pop();
					if(op_2.type != 2 && op_2.type != 1 && op_2.type != 3) {
						IO.printError(5, [op_2, operador]);
						break;
					}
					this.addQuad(operador, op_2.direction());
					if(_.isUndefined(ask)) {
						break;
					}
				case "Listen":
					var op_1 = pila_operandos.first();
					var operador = pila_operadores.pop();
					var tmp = this.addVariable(new VARIABLE(_.uniqueId('_tmp_'), op_1.type));
					this.addQuad(operador, tmp.direction(), tmp.type);
					pila_operandos.push(tmp);
					break;
				case "If":
					var op_1 = pila_operandos.pop();
					if(op_1.type != 3) {
						IO.printError(5, [op_1]);
						break;
					}
					pila_saltos.push(this.addQuad(OP_GOTOF, op_1.direction()));
					break;
				case "Else":
					var falso = pila_saltos.pop();
					pila_saltos.push(this.addQuad(OP_GOTO));
					TYRION.quads[falso][2] = pila_saltos.first() + 1;
					break;
				case "While":
					var op_1 = pila_operandos.pop();
					if(op_1.type != 3) {
						IO.printError(5, [op_1]);
						break;
					}
					pila_saltos.push(this.addQuad(OP_GOTOF, op_1.direction()));
					break;
				case "DoWhile":
					pila_saltos.push(TYRION.quads.length);
					break;
				case "EndDoWhile":
					var inicio = pila_saltos.pop();
					var op_1 = pila_operandos.pop();
					this.addQuad(OP_GOTOT, op_1.direction(), inicio);
					break;
				case "EndElse":
					var fin = pila_saltos.pop();
					TYRION.quads[fin][1] = TYRION.quads.length;
					break;
				case "EndIf":
					var fin = pila_saltos.pop();
					TYRION.quads[fin][2] = TYRION.quads.length;
					break;
				case "EndWhile":
					var falso = pila_saltos.pop();
					var retorno = pila_saltos.pop();
					this.addQuad(OP_GOTO, retorno);
					TYRION.quads[falso][2] = TYRION.quads.length;
					break;
				case "Return":
					var op_2 = pila_operandos.pop();
					this.addQuad(OP_RETURN, op_2.direction());
					break;
				default:
				;
			}
		},
		callFunction: function(function_id, override) {
			if(override || this.nodeExists(function_id)) {
				return _(this.nodes).has(function_id)? this.nodes[function_id] : this.parent.callFunction(function_id, true);
			}
			IO.printError(4, function_id);
			return false;
		},
		hasVariable: function(variable) {
			return _(this.variables).has(variable);
		},
		nodeExists: function(node) {
			return _(this.nodes).has(node) || (this.parent? this.parent.nodeExists(node) : false);
		},
		normalQuad: function() {
			// Crear quad de suma
			var op_2 = pila_operandos.pop();
			var op_1 = pila_operandos.pop();
			var operador = pila_operadores.pop();
			var tmp = this.addVariable(new VARIABLE(_.uniqueId('_tmp_'), checkOperation(op_1.type, operador, op_2.type)));
			if(tmp.type == -1) {
				IO.printError(5, [op_1, operador, op_2]);
			} else {
				this.addQuad(operador, op_1.direction(), op_2.direction(), tmp.direction());
				pila_operandos.push(tmp);
			}
		},
		useVariable: function(variable_id, override) {
			if(override || this.variableExists(variable_id)) {
				return _(this.variables).has(variable_id)? this.variables[variable_id] : this.parent.useVariable(variable_id, true);
			}
			IO.printError(3, variable_id);
			return false;
		},
		variableExists: function(variable) {
			return _(this.variables).has(variable) || (this.parent? this.parent.variableExists(variable) : false);
		},
	};

	return node;
};

var IO = {
	print: function (to_print) {
		return console.log(to_print);
	},
	printError: function(error_number) {
		switch(error_number) {
			case 1:
				this.print("Error variable " + arguments[1] + " ya declarada");
			break;
			case 2:
				this.print("Error función " + arguments[1] + " ya declarada");
			break;
			case 3:
				this.print("Error la variable "+ arguments[1] + " no se encuentra declarada");
			break;
			case 4:
				this.print("Error la función "+ arguments[1]  + " no se encuentra declarada");
			break
			case 5:
				this.print("Error, tipos incompatibles - ")
				this.print(arguments[1]);
			break;
			default:
				this.print("Error " + error_number);
		}
	}
};

// Preparation code
var TYRION = {
	addVariable: _.memoize(function(variable) {
		 if(variable.startsWith("_const_")) {
			return [4, this.variables.const.push(0)-1];
		 } else if (variable.startsWith("_tmp_")) {
			return [3, this.variables.temp.push(0)-1];
		 } else if (true) {
			return [0, this.variables.global.push(0)-1];
		 }
	}),
	variables: {
		global: [],
		local: [],
		local: [],
		temp: [],
		const: []
	},
	quads: []
};
var root = new NODE('_global_');
root.addVariable = 	function(variable) {
	if(_(this.variables).has(variable.id)) {
		// Error! variable ya declarada!
		IO.printError(1, variable.id);
		return false;
	}
	variable.parent = this;
	this.variables[variable.id] = variable;
	return variable;
};
var current_node;
var PILA = function() {
	return {
		pila: [],
		push: function(val) {
			this.pila.push(val);
		},
		pop: function() {
			return this.pila.pop();
		},
		shift: function() {
			return this.pila.shift();
		},
		unshift: function() {
			return this.pila.unshift();
		},
		first: function() {
			return this.pila[this.pila.length-1];
		},
		value: function() {
			return this.pila;
		}
	};
}
var pila_operandos = new PILA();
var pila_operadores = new PILA();
var pila_saltos = new PILA();

/*
	Default template driver for JS/CC generated parsers running as
	browser-based JavaScript/ECMAScript applications.
	
	WARNING: 	This parser template will not run as console and has lesser
				features for debugging than the console derivates for the
				various JavaScript platforms.
	
	Features:
	- Parser trace messages
	- Integrated panic-mode error recovery
	
	Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
	
	This is in the public domain.
*/

var FT_dbg_withtrace		= false;
var FT_dbg_string			= new String();

function __FTdbg_print( text )
{
	FT_dbg_string += text + "\n";
}

function __FTlex( info )
{
	var state		= 0;
	var match		= -1;
	var match_pos	= 0;
	var start		= 0;
	var pos			= info.offset + 1;

	do
	{
		pos--;
		state = 0;
		match = -2;
		start = pos;

		if( info.src.length <= start )
			return 100;

		do
		{

switch( state )
{
	case 0:
		if( ( info.src.charCodeAt( pos ) >= 9 && info.src.charCodeAt( pos ) <= 10 ) || info.src.charCodeAt( pos ) == 13 || info.src.charCodeAt( pos ) == 32 ) state = 1;
		else if( info.src.charCodeAt( pos ) == 33 ) state = 2;
		else if( info.src.charCodeAt( pos ) == 37 ) state = 3;
		else if( info.src.charCodeAt( pos ) == 40 ) state = 4;
		else if( info.src.charCodeAt( pos ) == 41 ) state = 5;
		else if( info.src.charCodeAt( pos ) == 42 ) state = 6;
		else if( info.src.charCodeAt( pos ) == 43 ) state = 7;
		else if( info.src.charCodeAt( pos ) == 44 ) state = 8;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 9;
		else if( info.src.charCodeAt( pos ) == 47 ) state = 10;
		else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 11;
		else if( info.src.charCodeAt( pos ) == 59 ) state = 12;
		else if( info.src.charCodeAt( pos ) == 60 ) state = 13;
		else if( info.src.charCodeAt( pos ) == 61 ) state = 14;
		else if( info.src.charCodeAt( pos ) == 62 ) state = 15;
		else if( info.src.charCodeAt( pos ) == 69 ) state = 16;
		else if( info.src.charCodeAt( pos ) == 91 ) state = 17;
		else if( info.src.charCodeAt( pos ) == 93 ) state = 18;
		else if( info.src.charCodeAt( pos ) == 94 ) state = 19;
		else if( ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 99 ) || info.src.charCodeAt( pos ) == 103 || ( info.src.charCodeAt( pos ) >= 105 && info.src.charCodeAt( pos ) <= 107 ) || info.src.charCodeAt( pos ) == 111 || info.src.charCodeAt( pos ) == 113 || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 117 ) || ( info.src.charCodeAt( pos ) >= 119 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 123 ) state = 21;
		else if( info.src.charCodeAt( pos ) == 125 ) state = 22;
		else if( info.src.charCodeAt( pos ) == 38 ) state = 51;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 53;
		else if( info.src.charCodeAt( pos ) == 112 ) state = 54;
		else if( info.src.charCodeAt( pos ) == 39 ) state = 74;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 75;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 76;
		else if( info.src.charCodeAt( pos ) == 68 ) state = 78;
		else if( info.src.charCodeAt( pos ) == 70 ) state = 80;
		else if( info.src.charCodeAt( pos ) == 72 ) state = 82;
		else if( info.src.charCodeAt( pos ) == 76 ) state = 84;
		else if( info.src.charCodeAt( pos ) == 77 ) state = 86;
		else if( info.src.charCodeAt( pos ) == 78 ) state = 88;
		else if( info.src.charCodeAt( pos ) == 80 ) state = 90;
		else if( info.src.charCodeAt( pos ) == 82 ) state = 92;
		else if( info.src.charCodeAt( pos ) == 83 ) state = 94;
		else if( info.src.charCodeAt( pos ) == 124 ) state = 96;
		else if( info.src.charCodeAt( pos ) == 86 ) state = 162;
		else if( info.src.charCodeAt( pos ) == 114 ) state = 200;
		else if( info.src.charCodeAt( pos ) == 100 ) state = 217;
		else if( info.src.charCodeAt( pos ) == 102 ) state = 218;
		else if( info.src.charCodeAt( pos ) == 104 ) state = 219;
		else if( info.src.charCodeAt( pos ) == 108 ) state = 232;
		else if( info.src.charCodeAt( pos ) == 109 ) state = 233;
		else if( info.src.charCodeAt( pos ) == 110 ) state = 234;
		else if( info.src.charCodeAt( pos ) == 118 ) state = 250;
		else state = -1;
		break;

	case 1:
		state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 2:
		if( info.src.charCodeAt( pos ) == 61 ) state = 23;
		else state = -1;
		match = 29;
		match_pos = pos;
		break;

	case 3:
		state = -1;
		match = 41;
		match_pos = pos;
		break;

	case 4:
		state = -1;
		match = 43;
		match_pos = pos;
		break;

	case 5:
		state = -1;
		match = 44;
		match_pos = pos;
		break;

	case 6:
		state = -1;
		match = 40;
		match_pos = pos;
		break;

	case 7:
		state = -1;
		match = 37;
		match_pos = pos;
		break;

	case 8:
		state = -1;
		match = 27;
		match_pos = pos;
		break;

	case 9:
		state = -1;
		match = 38;
		match_pos = pos;
		break;

	case 10:
		if( info.src.charCodeAt( pos ) == 47 ) state = 98;
		else state = -1;
		match = 39;
		match_pos = pos;
		break;

	case 11:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 11;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 76;
		else state = -1;
		match = 50;
		match_pos = pos;
		break;

	case 12:
		state = -1;
		match = 26;
		match_pos = pos;
		break;

	case 13:
		if( info.src.charCodeAt( pos ) == 61 ) state = 26;
		else if( info.src.charCodeAt( pos ) == 62 ) state = 27;
		else state = -1;
		match = 36;
		match_pos = pos;
		break;

	case 14:
		if( info.src.charCodeAt( pos ) == 61 ) state = 28;
		else state = -1;
		match = 28;
		match_pos = pos;
		break;

	case 15:
		if( info.src.charCodeAt( pos ) == 61 ) state = 29;
		else state = -1;
		match = 35;
		match_pos = pos;
		break;

	case 16:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 30;
		else if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 163;
		else state = -1;
		match = 21;
		match_pos = pos;
		break;

	case 17:
		state = -1;
		match = 24;
		match_pos = pos;
		break;

	case 18:
		state = -1;
		match = 25;
		match_pos = pos;
		break;

	case 19:
		state = -1;
		match = 42;
		match_pos = pos;
		break;

	case 20:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 21:
		state = -1;
		match = 22;
		match_pos = pos;
		break;

	case 22:
		state = -1;
		match = 23;
		match_pos = pos;
		break;

	case 23:
		state = -1;
		match = 31;
		match_pos = pos;
		break;

	case 24:
		state = -1;
		match = 46;
		match_pos = pos;
		break;

	case 25:
		if( info.src.charCodeAt( pos ) == 39 ) state = 74;
		else state = -1;
		match = 49;
		match_pos = pos;
		break;

	case 26:
		state = -1;
		match = 33;
		match_pos = pos;
		break;

	case 27:
		state = -1;
		match = 32;
		match_pos = pos;
		break;

	case 28:
		state = -1;
		match = 30;
		match_pos = pos;
		break;

	case 29:
		state = -1;
		match = 34;
		match_pos = pos;
		break;

	case 30:
		state = -1;
		match = 8;
		match_pos = pos;
		break;

	case 31:
		state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 32:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 122;
		else state = -1;
		match = 2;
		match_pos = pos;
		break;

	case 33:
		state = -1;
		match = 45;
		match_pos = pos;
		break;

	case 34:
		state = -1;
		match = 19;
		match_pos = pos;
		break;

	case 35:
		state = -1;
		match = 3;
		match_pos = pos;
		break;

	case 36:
		state = -1;
		match = 13;
		match_pos = pos;
		break;

	case 37:
		state = -1;
		match = 47;
		match_pos = pos;
		break;

	case 38:
		state = -1;
		match = 4;
		match_pos = pos;
		break;

	case 39:
		state = -1;
		match = 16;
		match_pos = pos;
		break;

	case 40:
		state = -1;
		match = 17;
		match_pos = pos;
		break;

	case 41:
		state = -1;
		match = 18;
		match_pos = pos;
		break;

	case 42:
		state = -1;
		match = 15;
		match_pos = pos;
		break;

	case 43:
		if( info.src.charCodeAt( pos ) == 32 ) state = 153;
		else state = -1;
		match = 10;
		match_pos = pos;
		break;

	case 44:
		state = -1;
		match = 7;
		match_pos = pos;
		break;

	case 45:
		state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 46:
		state = -1;
		match = 14;
		match_pos = pos;
		break;

	case 47:
		state = -1;
		match = 5;
		match_pos = pos;
		break;

	case 48:
		state = -1;
		match = 12;
		match_pos = pos;
		break;

	case 49:
		state = -1;
		match = 11;
		match_pos = pos;
		break;

	case 50:
		state = -1;
		match = 9;
		match_pos = pos;
		break;

	case 51:
		if( info.src.charCodeAt( pos ) == 38 ) state = 24;
		else state = -1;
		break;

	case 52:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 52;
		else state = -1;
		match = 50;
		match_pos = pos;
		break;

	case 53:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 82 ) || ( info.src.charCodeAt( pos ) >= 84 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 55;
		else if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 243;
		else state = -1;
		match = 21;
		match_pos = pos;
		break;

	case 54:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 56;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 236;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 248;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 55:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 8;
		match_pos = pos;
		break;

	case 56:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 57:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 79;
		else state = -1;
		match = 2;
		match_pos = pos;
		break;

	case 58:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 19;
		match_pos = pos;
		break;

	case 59:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 3;
		match_pos = pos;
		break;

	case 60:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 13;
		match_pos = pos;
		break;

	case 61:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 47;
		match_pos = pos;
		break;

	case 62:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 4;
		match_pos = pos;
		break;

	case 63:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 16;
		match_pos = pos;
		break;

	case 64:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 17;
		match_pos = pos;
		break;

	case 65:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 18;
		match_pos = pos;
		break;

	case 66:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 15;
		match_pos = pos;
		break;

	case 67:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 32 ) state = 153;
		else state = -1;
		match = 10;
		match_pos = pos;
		break;

	case 68:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 7;
		match_pos = pos;
		break;

	case 69:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 70:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 14;
		match_pos = pos;
		break;

	case 71:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 5;
		match_pos = pos;
		break;

	case 72:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 12;
		match_pos = pos;
		break;

	case 73:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else state = -1;
		match = 11;
		match_pos = pos;
		break;

	case 74:
		if( info.src.charCodeAt( pos ) == 39 ) state = 25;
		else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 38 ) || ( info.src.charCodeAt( pos ) >= 40 && info.src.charCodeAt( pos ) <= 254 ) ) state = 74;
		else state = -1;
		break;

	case 75:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 57;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 76:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 52;
		else state = -1;
		break;

	case 77:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 89 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 121 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 90 || info.src.charCodeAt( pos ) == 122 ) state = 58;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 78:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 100;
		else state = -1;
		break;

	case 79:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 59;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 80:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 102;
		else if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 104;
		else state = -1;
		break;

	case 81:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 60;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 82:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 179;
		else state = -1;
		break;

	case 83:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 61;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 84:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 106;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 108;
		else state = -1;
		break;

	case 85:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 62;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 86:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 109;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 201;
		else state = -1;
		break;

	case 87:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 82 ) || ( info.src.charCodeAt( pos ) >= 84 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 63;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 88:
		if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 110;
		else state = -1;
		break;

	case 89:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 64;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 90:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 31;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 111;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 164;
		else state = -1;
		break;

	case 91:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 89 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 121 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 90 || info.src.charCodeAt( pos ) == 122 ) state = 65;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 92:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 112;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 113;
		else state = -1;
		break;

	case 93:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 66;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 94:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 32;
		else state = -1;
		break;

	case 95:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 67;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 96:
		if( info.src.charCodeAt( pos ) == 124 ) state = 33;
		else state = -1;
		break;

	case 97:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 68;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 98:
		if( info.src.charCodeAt( pos ) == 10 ) state = 1;
		else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 254 ) ) state = 98;
		else state = -1;
		break;

	case 99:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 69;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 100:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 166;
		else state = -1;
		break;

	case 101:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 70;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 102:
		if( info.src.charCodeAt( pos ) == 76 || info.src.charCodeAt( pos ) == 108 ) state = 115;
		else state = -1;
		break;

	case 103:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 82 ) || ( info.src.charCodeAt( pos ) >= 84 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 71;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 104:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 116;
		else state = -1;
		break;

	case 105:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 72;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 106:
		if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 181;
		else state = -1;
		break;

	case 107:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 73;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 108:
		if( info.src.charCodeAt( pos ) == 71 || info.src.charCodeAt( pos ) == 103 ) state = 182;
		else state = -1;
		break;

	case 109:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 117;
		else state = -1;
		break;

	case 110:
		if( info.src.charCodeAt( pos ) == 77 || info.src.charCodeAt( pos ) == 109 ) state = 118;
		else state = -1;
		break;

	case 111:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 167;
		else state = -1;
		break;

	case 112:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 120;
		else state = -1;
		break;

	case 113:
		if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 121;
		else if( info.src.charCodeAt( pos ) == 80 || info.src.charCodeAt( pos ) == 112 ) state = 168;
		else state = -1;
		break;

	case 114:
		if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 183;
		else state = -1;
		break;

	case 115:
		if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 125;
		else state = -1;
		break;

	case 116:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 126;
		else state = -1;
		break;

	case 117:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 130;
		else state = -1;
		break;

	case 118:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 131;
		else state = -1;
		break;

	case 119:
		if( info.src.charCodeAt( pos ) == 71 || info.src.charCodeAt( pos ) == 103 ) state = 132;
		else state = -1;
		break;

	case 120:
		if( info.src.charCodeAt( pos ) == 90 || info.src.charCodeAt( pos ) == 122 ) state = 34;
		else state = -1;
		break;

	case 121:
		if( info.src.charCodeAt( pos ) == 80 || info.src.charCodeAt( pos ) == 112 ) state = 133;
		else state = -1;
		break;

	case 122:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 35;
		else state = -1;
		break;

	case 123:
		if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 184;
		else state = -1;
		break;

	case 124:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 36;
		else state = -1;
		break;

	case 125:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 37;
		else state = -1;
		break;

	case 126:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 173;
		else state = -1;
		break;

	case 127:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 38;
		else state = -1;
		break;

	case 128:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 135;
		else state = -1;
		break;

	case 129:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 136;
		else state = -1;
		break;

	case 130:
		if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 172;
		else state = -1;
		break;

	case 131:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 138;
		else state = -1;
		break;

	case 132:
		if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 140;
		else state = -1;
		break;

	case 133:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 175;
		else state = -1;
		break;

	case 134:
		if( info.src.charCodeAt( pos ) == 72 || info.src.charCodeAt( pos ) == 104 ) state = 142;
		else state = -1;
		break;

	case 135:
		if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 39;
		else state = -1;
		break;

	case 136:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 40;
		else state = -1;
		break;

	case 137:
		if( info.src.charCodeAt( pos ) == 90 || info.src.charCodeAt( pos ) == 122 ) state = 41;
		else state = -1;
		break;

	case 138:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 42;
		else state = -1;
		break;

	case 139:
		if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 144;
		else state = -1;
		break;

	case 140:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 145;
		else state = -1;
		break;

	case 141:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 146;
		else state = -1;
		break;

	case 142:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 149;
		else state = -1;
		break;

	case 143:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 43;
		else state = -1;
		break;

	case 144:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 44;
		else state = -1;
		break;

	case 145:
		if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 151;
		else state = -1;
		break;

	case 146:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 45;
		else state = -1;
		break;

	case 147:
		if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 177;
		else state = -1;
		break;

	case 148:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 152;
		else state = -1;
		break;

	case 149:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 46;
		else state = -1;
		break;

	case 150:
		if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 47;
		else state = -1;
		break;

	case 151:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 154;
		else state = -1;
		break;

	case 152:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 125;
		else state = -1;
		break;

	case 153:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 156;
		else state = -1;
		break;

	case 154:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 48;
		else state = -1;
		break;

	case 155:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 49;
		else state = -1;
		break;

	case 156:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 157;
		else state = -1;
		break;

	case 157:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 158;
		else state = -1;
		break;

	case 158:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 159;
		else state = -1;
		break;

	case 159:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 160;
		else state = -1;
		break;

	case 160:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 50;
		else state = -1;
		break;

	case 161:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 77;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 162:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 165;
		else state = -1;
		break;

	case 163:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 114;
		else state = -1;
		break;

	case 164:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 119;
		else state = -1;
		break;

	case 165:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 123;
		else state = -1;
		break;

	case 166:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 124;
		else state = -1;
		break;

	case 167:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 170;
		else state = -1;
		break;

	case 168:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 171;
		else state = -1;
		break;

	case 169:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 137;
		else state = -1;
		break;

	case 170:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 139;
		else state = -1;
		break;

	case 171:
		if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 141;
		else state = -1;
		break;

	case 172:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 176;
		else state = -1;
		break;

	case 173:
		if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 143;
		else state = -1;
		break;

	case 174:
		if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 148;
		else state = -1;
		break;

	case 175:
		if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 147;
		else state = -1;
		break;

	case 176:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 150;
		else state = -1;
		break;

	case 177:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 155;
		else state = -1;
		break;

	case 178:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 81;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 179:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 180;
		else state = -1;
		break;

	case 180:
		if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 127;
		else state = -1;
		break;

	case 181:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 128;
		else state = -1;
		break;

	case 182:
		if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 129;
		else state = -1;
		break;

	case 183:
		if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 134;
		else state = -1;
		break;

	case 184:
		if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 174;
		else state = -1;
		break;

	case 185:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 82 ) || ( info.src.charCodeAt( pos ) >= 84 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 83;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 186:
		if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 169;
		else state = -1;
		break;

	case 187:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 85;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 188:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 87;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 189:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 89;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 190:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 91;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 191:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 93;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 192:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 95;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 193:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 67 ) || ( info.src.charCodeAt( pos ) >= 69 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 99 ) || ( info.src.charCodeAt( pos ) >= 101 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 97;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 194:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 99;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 195:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 101;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 196:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 103;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 197:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 105;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 198:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 107;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 199:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 83;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 200:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 161;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 237;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 201:
		if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 186;
		else state = -1;
		break;

	case 202:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 178;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 203:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 75 ) || ( info.src.charCodeAt( pos ) >= 77 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 107 ) || ( info.src.charCodeAt( pos ) >= 109 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 76 || info.src.charCodeAt( pos ) == 108 ) state = 185;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 204:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 187;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 205:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 188;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 206:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 189;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 207:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 190;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 208:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 191;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 209:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 192;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 210:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 193;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 211:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 194;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 212:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 71 ) || ( info.src.charCodeAt( pos ) >= 73 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 103 ) || ( info.src.charCodeAt( pos ) >= 105 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 72 || info.src.charCodeAt( pos ) == 104 ) state = 195;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 213:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 196;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 214:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 197;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 215:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 67 ) || ( info.src.charCodeAt( pos ) >= 69 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 99 ) || ( info.src.charCodeAt( pos ) >= 101 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 198;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 216:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 199;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 217:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 202;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 218:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 116 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 203;
		else if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 235;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 219:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 204;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 220:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 205;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 221:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 72 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 102 ) || ( info.src.charCodeAt( pos ) >= 104 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 71 || info.src.charCodeAt( pos ) == 103 ) state = 206;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 222:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 207;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 223:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 76 ) || ( info.src.charCodeAt( pos ) >= 78 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 108 ) || ( info.src.charCodeAt( pos ) >= 110 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 77 || info.src.charCodeAt( pos ) == 109 ) state = 208;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 224:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 209;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 225:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 210;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 226:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 211;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 227:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 212;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 228:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 84 || info.src.charCodeAt( pos ) == 116 ) state = 213;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 229:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 214;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 230:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 215;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 231:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 67 ) || ( info.src.charCodeAt( pos ) >= 69 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 99 ) || ( info.src.charCodeAt( pos ) >= 101 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 216;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 232:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 220;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 221;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 233:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 104 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 222;
		else if( info.src.charCodeAt( pos ) == 73 || info.src.charCodeAt( pos ) == 105 ) state = 244;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 234:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 116 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 223;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 235:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 224;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 236:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 225;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 237:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 79 ) || ( info.src.charCodeAt( pos ) >= 81 && info.src.charCodeAt( pos ) <= 82 ) || ( info.src.charCodeAt( pos ) >= 84 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 111 ) || ( info.src.charCodeAt( pos ) >= 113 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 80 || info.src.charCodeAt( pos ) == 112 ) state = 226;
		else if( info.src.charCodeAt( pos ) == 83 || info.src.charCodeAt( pos ) == 115 ) state = 246;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 238:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 116 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 227;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 239:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 78 || info.src.charCodeAt( pos ) == 110 ) state = 228;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 240:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 116 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 85 || info.src.charCodeAt( pos ) == 117 ) state = 229;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 241:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 79 || info.src.charCodeAt( pos ) == 111 ) state = 230;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 242:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 65 || info.src.charCodeAt( pos ) == 97 ) state = 231;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 243:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 66 ) || ( info.src.charCodeAt( pos ) >= 68 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 67 || info.src.charCodeAt( pos ) == 99 ) state = 238;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 244:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 239;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 245:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 72 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 102 ) || ( info.src.charCodeAt( pos ) >= 104 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 71 || info.src.charCodeAt( pos ) == 103 ) state = 240;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 246:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 79 ) || ( info.src.charCodeAt( pos ) >= 81 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 111 ) || ( info.src.charCodeAt( pos ) >= 113 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 80 || info.src.charCodeAt( pos ) == 112 ) state = 241;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 247:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 67 ) || ( info.src.charCodeAt( pos ) >= 69 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 99 ) || ( info.src.charCodeAt( pos ) >= 101 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 68 || info.src.charCodeAt( pos ) == 100 ) state = 242;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 248:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 245;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 249:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 81 ) || ( info.src.charCodeAt( pos ) >= 83 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 113 ) || ( info.src.charCodeAt( pos ) >= 115 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 82 || info.src.charCodeAt( pos ) == 114 ) state = 247;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

	case 250:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 20;
		else if( info.src.charCodeAt( pos ) == 69 || info.src.charCodeAt( pos ) == 101 ) state = 249;
		else state = -1;
		match = 48;
		match_pos = pos;
		break;

}


			pos++;

		}
		while( state > -1 );

	}
	while( 1 > -1 && match == 1 );

	if( match > -1 )
	{
		info.att = info.src.substr( start, match_pos - start );
		info.offset = match_pos;
		
switch( match )
{
	case 47:
		{
		 info.att = info.att.toLowerCase() == "verdadero"; 
		}
		break;

	case 49:
		{
		 info.att = info.att.substr( 1, info.att.length - 2 );
																   info.att = info.att.replace( /''/g, "\'" );		
		}
		break;

	case 50:
		{
		 $match = parseFloat(info.att); 
		}
		break;

}


	}
	else
	{
		info.att = new String();
		match = -1;
	}

	return match;
}


function __FTparse( src, err_off, err_la )
{
	var		sstack			= new Array();
	var		vstack			= new Array();
	var 	err_cnt			= 0;
	var		act;
	var		go;
	var		la;
	var		rval;
	var 	parseinfo		= new Function( "", "var offset; var src; var att;" );
	var		info			= new parseinfo();
	
/* Pop-Table */
var pop_tab = new Array(
	new Array( 0/* Program' */, 1 ),
	new Array( 56/* Program */, 5 ),
	new Array( 51/* ProgramInit */, 0 ),
	new Array( 53/* GotoInicio */, 0 ),
	new Array( 55/* Inicio */, 4 ),
	new Array( 57/* InicioInit */, 1 ),
	new Array( 64/* Var */, 3 ),
	new Array( 64/* Var */, 2 ),
	new Array( 61/* VarDecInit */, 2 ),
	new Array( 63/* VarDec */, 2 ),
	new Array( 52/* VarDecs */, 2 ),
	new Array( 52/* VarDecs */, 0 ),
	new Array( 67/* ParamOpt */, 1 ),
	new Array( 67/* ParamOpt */, 0 ),
	new Array( 66/* Param */, 3 ),
	new Array( 66/* Param */, 1 ),
	new Array( 69/* ArgsOpt */, 1 ),
	new Array( 69/* ArgsOpt */, 0 ),
	new Array( 68/* Args */, 3 ),
	new Array( 68/* Args */, 1 ),
	new Array( 71/* Function */, 5 ),
	new Array( 70/* FunctionInit */, 3 ),
	new Array( 70/* FunctionInit */, 2 ),
	new Array( 54/* FunctionDecs */, 2 ),
	new Array( 54/* FunctionDecs */, 0 ),
	new Array( 60/* Bloque */, 3 ),
	new Array( 72/* Statements */, 2 ),
	new Array( 72/* Statements */, 0 ),
	new Array( 73/* Statement */, 1 ),
	new Array( 73/* Statement */, 1 ),
	new Array( 73/* Statement */, 1 ),
	new Array( 73/* Statement */, 1 ),
	new Array( 73/* Statement */, 2 ),
	new Array( 73/* Statement */, 1 ),
	new Array( 73/* Statement */, 1 ),
	new Array( 75/* Asignacion */, 3 ),
	new Array( 79/* AsigancionInit */, 2 ),
	new Array( 76/* Regreso */, 3 ),
	new Array( 77/* FunctionCall */, 4 ),
	new Array( 78/* SpecialFunctions */, 5 ),
	new Array( 81/* Read */, 3 ),
	new Array( 81/* Read */, 4 ),
	new Array( 80/* _Read */, 1 ),
	new Array( 74/* Control */, 1 ),
	new Array( 74/* Control */, 1 ),
	new Array( 74/* Control */, 1 ),
	new Array( 74/* Control */, 1 ),
	new Array( 82/* If */, 2 ),
	new Array( 82/* If */, 4 ),
	new Array( 82/* If */, 4 ),
	new Array( 86/* IfInit */, 4 ),
	new Array( 87/* SinoInit */, 1 ),
	new Array( 83/* While */, 6 ),
	new Array( 88/* WhileInit */, 1 ),
	new Array( 89/* RepetirInit */, 1 ),
	new Array( 84/* Foreach */, 2 ),
	new Array( 90/* ForeachInit */, 4 ),
	new Array( 85/* DoWhile */, 7 ),
	new Array( 91/* DoWhileInit */, 1 ),
	new Array( 65/* Tipo */, 1 ),
	new Array( 65/* Tipo */, 1 ),
	new Array( 65/* Tipo */, 1 ),
	new Array( 65/* Tipo */, 1 ),
	new Array( 93/* Matriz */, 2 ),
	new Array( 92/* _Matriz */, 4 ),
	new Array( 92/* _Matriz */, 3 ),
	new Array( 62/* Exp */, 3 ),
	new Array( 62/* Exp */, 1 ),
	new Array( 94/* ExpSum */, 3 ),
	new Array( 94/* ExpSum */, 1 ),
	new Array( 97/* _ExpSum */, 1 ),
	new Array( 97/* _ExpSum */, 1 ),
	new Array( 97/* _ExpSum */, 1 ),
	new Array( 96/* ExpMult */, 3 ),
	new Array( 96/* ExpMult */, 1 ),
	new Array( 99/* _ExpMult */, 1 ),
	new Array( 99/* _ExpMult */, 1 ),
	new Array( 99/* _ExpMult */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 98/* ExpVal */, 3 ),
	new Array( 98/* ExpVal */, 1 ),
	new Array( 58/* LeftPar */, 1 ),
	new Array( 59/* RightPar */, 1 ),
	new Array( 95/* OpRel */, 1 ),
	new Array( 95/* OpRel */, 1 ),
	new Array( 95/* OpRel */, 1 ),
	new Array( 95/* OpRel */, 1 ),
	new Array( 95/* OpRel */, 1 ),
	new Array( 95/* OpRel */, 1 ),
	new Array( 95/* OpRel */, 1 )
);

/* Action-Table */
var act_tab = new Array(
	/* State 0 */ new Array( 16/* "TLETRAS" */,-2 , 15/* "TNUMERO" */,-2 , 17/* "TLOGICO" */,-2 , 18/* "TMATRIZ" */,-2 , 10/* "FUNCION" */,-2 , 9/* "FINICIO" */,-2 ),
	/* State 1 */ new Array( 100/* "$" */,0 ),
	/* State 2 */ new Array( 10/* "FUNCION" */,-11 , 9/* "FINICIO" */,-11 , 16/* "TLETRAS" */,-11 , 15/* "TNUMERO" */,-11 , 17/* "TLOGICO" */,-11 , 18/* "TMATRIZ" */,-11 ),
	/* State 3 */ new Array( 16/* "TLETRAS" */,9 , 15/* "TNUMERO" */,10 , 17/* "TLOGICO" */,11 , 18/* "TMATRIZ" */,12 , 10/* "FUNCION" */,-3 , 9/* "FINICIO" */,-3 ),
	/* State 4 */ new Array( 10/* "FUNCION" */,-10 , 9/* "FINICIO" */,-10 , 16/* "TLETRAS" */,-10 , 15/* "TNUMERO" */,-10 , 17/* "TLOGICO" */,-10 , 18/* "TMATRIZ" */,-10 ),
	/* State 5 */ new Array( 9/* "FINICIO" */,-24 , 10/* "FUNCION" */,-24 ),
	/* State 6 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 7 */ new Array( 28/* "=" */,32 , 26/* ";" */,33 ),
	/* State 8 */ new Array( 48/* "IDENTIFICADOR" */,34 ),
	/* State 9 */ new Array( 48/* "IDENTIFICADOR" */,-59 ),
	/* State 10 */ new Array( 48/* "IDENTIFICADOR" */,-60 ),
	/* State 11 */ new Array( 48/* "IDENTIFICADOR" */,-61 ),
	/* State 12 */ new Array( 48/* "IDENTIFICADOR" */,-62 ),
	/* State 13 */ new Array( 9/* "FINICIO" */,39 , 10/* "FUNCION" */,40 ),
	/* State 14 */ new Array( 26/* ";" */,41 ),
	/* State 15 */ new Array( 30/* "==" */,43 , 31/* "!=" */,44 , 32/* "<>" */,45 , 33/* "<=" */,46 , 34/* ">=" */,47 , 35/* ">" */,48 , 36/* "<" */,49 , 26/* ";" */,-67 , 44/* ")" */,-67 , 27/* "," */,-67 , 25/* "]" */,-67 ),
	/* State 16 */ new Array( 37/* "+" */,51 , 38/* "-" */,52 , 45/* "||" */,53 , 30/* "==" */,-69 , 31/* "!=" */,-69 , 32/* "<>" */,-69 , 33/* "<=" */,-69 , 34/* ">=" */,-69 , 35/* ">" */,-69 , 36/* "<" */,-69 , 26/* ";" */,-69 , 44/* ")" */,-69 , 27/* "," */,-69 , 25/* "]" */,-69 ),
	/* State 17 */ new Array( 40/* "*" */,55 , 39/* "/" */,56 , 46/* "&&" */,57 , 37/* "+" */,-74 , 38/* "-" */,-74 , 45/* "||" */,-74 , 30/* "==" */,-74 , 31/* "!=" */,-74 , 32/* "<>" */,-74 , 33/* "<=" */,-74 , 34/* ">=" */,-74 , 35/* ">" */,-74 , 36/* "<" */,-74 , 26/* ";" */,-74 , 44/* ")" */,-74 , 27/* "," */,-74 , 25/* "]" */,-74 ),
	/* State 18 */ new Array( 24/* "[" */,60 , 43/* "(" */,30 , 40/* "*" */,-78 , 39/* "/" */,-78 , 46/* "&&" */,-78 , 37/* "+" */,-78 , 38/* "-" */,-78 , 45/* "||" */,-78 , 30/* "==" */,-78 , 31/* "!=" */,-78 , 32/* "<>" */,-78 , 33/* "<=" */,-78 , 34/* ">=" */,-78 , 35/* ">" */,-78 , 36/* "<" */,-78 , 26/* ";" */,-78 , 44/* ")" */,-78 , 27/* "," */,-78 , 25/* "]" */,-78 ),
	/* State 19 */ new Array( 40/* "*" */,-79 , 39/* "/" */,-79 , 46/* "&&" */,-79 , 37/* "+" */,-79 , 38/* "-" */,-79 , 45/* "||" */,-79 , 30/* "==" */,-79 , 31/* "!=" */,-79 , 32/* "<>" */,-79 , 33/* "<=" */,-79 , 34/* ">=" */,-79 , 35/* ">" */,-79 , 36/* "<" */,-79 , 26/* ";" */,-79 , 44/* ")" */,-79 , 27/* "," */,-79 , 25/* "]" */,-79 ),
	/* State 20 */ new Array( 40/* "*" */,-80 , 39/* "/" */,-80 , 46/* "&&" */,-80 , 37/* "+" */,-80 , 38/* "-" */,-80 , 45/* "||" */,-80 , 30/* "==" */,-80 , 31/* "!=" */,-80 , 32/* "<>" */,-80 , 33/* "<=" */,-80 , 34/* ">=" */,-80 , 35/* ">" */,-80 , 36/* "<" */,-80 , 26/* ";" */,-80 , 44/* ")" */,-80 , 27/* "," */,-80 , 25/* "]" */,-80 ),
	/* State 21 */ new Array( 40/* "*" */,-81 , 39/* "/" */,-81 , 46/* "&&" */,-81 , 37/* "+" */,-81 , 38/* "-" */,-81 , 45/* "||" */,-81 , 30/* "==" */,-81 , 31/* "!=" */,-81 , 32/* "<>" */,-81 , 33/* "<=" */,-81 , 34/* ">=" */,-81 , 35/* ">" */,-81 , 36/* "<" */,-81 , 26/* ";" */,-81 , 44/* ")" */,-81 , 27/* "," */,-81 , 25/* "]" */,-81 ),
	/* State 22 */ new Array( 40/* "*" */,-82 , 39/* "/" */,-82 , 46/* "&&" */,-82 , 37/* "+" */,-82 , 38/* "-" */,-82 , 45/* "||" */,-82 , 30/* "==" */,-82 , 31/* "!=" */,-82 , 32/* "<>" */,-82 , 33/* "<=" */,-82 , 34/* ">=" */,-82 , 35/* ">" */,-82 , 36/* "<" */,-82 , 26/* ";" */,-82 , 44/* ")" */,-82 , 27/* "," */,-82 , 25/* "]" */,-82 ),
	/* State 23 */ new Array( 40/* "*" */,-83 , 39/* "/" */,-83 , 46/* "&&" */,-83 , 37/* "+" */,-83 , 38/* "-" */,-83 , 45/* "||" */,-83 , 30/* "==" */,-83 , 31/* "!=" */,-83 , 32/* "<>" */,-83 , 33/* "<=" */,-83 , 34/* ">=" */,-83 , 35/* ">" */,-83 , 36/* "<" */,-83 , 26/* ";" */,-83 , 44/* ")" */,-83 , 27/* "," */,-83 , 25/* "]" */,-83 ),
	/* State 24 */ new Array( 40/* "*" */,-84 , 39/* "/" */,-84 , 46/* "&&" */,-84 , 37/* "+" */,-84 , 38/* "-" */,-84 , 45/* "||" */,-84 , 30/* "==" */,-84 , 31/* "!=" */,-84 , 32/* "<>" */,-84 , 33/* "<=" */,-84 , 34/* ">=" */,-84 , 35/* ">" */,-84 , 36/* "<" */,-84 , 26/* ";" */,-84 , 44/* ")" */,-84 , 27/* "," */,-84 , 25/* "]" */,-84 ),
	/* State 25 */ new Array( 40/* "*" */,-85 , 39/* "/" */,-85 , 46/* "&&" */,-85 , 37/* "+" */,-85 , 38/* "-" */,-85 , 45/* "||" */,-85 , 30/* "==" */,-85 , 31/* "!=" */,-85 , 32/* "<>" */,-85 , 33/* "<=" */,-85 , 34/* ">=" */,-85 , 35/* ">" */,-85 , 36/* "<" */,-85 , 26/* ";" */,-85 , 44/* ")" */,-85 , 27/* "," */,-85 , 25/* "]" */,-85 ),
	/* State 26 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 27 */ new Array( 40/* "*" */,-87 , 39/* "/" */,-87 , 46/* "&&" */,-87 , 37/* "+" */,-87 , 38/* "-" */,-87 , 45/* "||" */,-87 , 30/* "==" */,-87 , 31/* "!=" */,-87 , 32/* "<>" */,-87 , 33/* "<=" */,-87 , 34/* ">=" */,-87 , 35/* ">" */,-87 , 36/* "<" */,-87 , 26/* ";" */,-87 , 44/* ")" */,-87 , 27/* "," */,-87 , 25/* "]" */,-87 ),
	/* State 28 */ new Array( 43/* "(" */,30 ),
	/* State 29 */ new Array( 43/* "(" */,30 ),
	/* State 30 */ new Array( 48/* "IDENTIFICADOR" */,-88 , 50/* "NUMERO" */,-88 , 49/* "LETRAS" */,-88 , 47/* "LOGICO" */,-88 , 14/* "ESCUCHAR" */,-88 , 12/* "PREGUNTAR" */,-88 , 20/* "PI" */,-88 , 21/* "E" */,-88 , 43/* "(" */,-88 , 44/* ")" */,-88 , 16/* "TLETRAS" */,-88 , 15/* "TNUMERO" */,-88 , 17/* "TLOGICO" */,-88 , 18/* "TMATRIZ" */,-88 ),
	/* State 31 */ new Array( 43/* "(" */,-42 ),
	/* State 32 */ new Array( 48/* "IDENTIFICADOR" */,-8 , 50/* "NUMERO" */,-8 , 49/* "LETRAS" */,-8 , 47/* "LOGICO" */,-8 , 14/* "ESCUCHAR" */,-8 , 12/* "PREGUNTAR" */,-8 , 20/* "PI" */,-8 , 21/* "E" */,-8 , 43/* "(" */,-8 ),
	/* State 33 */ new Array( 10/* "FUNCION" */,-7 , 9/* "FINICIO" */,-7 , 16/* "TLETRAS" */,-7 , 15/* "TNUMERO" */,-7 , 17/* "TLOGICO" */,-7 , 18/* "TMATRIZ" */,-7 , 23/* "}" */,-7 , 26/* ";" */,-7 , 11/* "RESPONDER" */,-7 , 48/* "IDENTIFICADOR" */,-7 , 13/* "DECIR" */,-7 , 2/* "SI" */,-7 , 5/* "MIENTRAS" */,-7 , 7/* "PORCADA" */,-7 , 4/* "HACER" */,-7 ),
	/* State 34 */ new Array( 26/* ";" */,-9 , 28/* "=" */,-9 , 44/* ")" */,-9 , 27/* "," */,-9 ),
	/* State 35 */ new Array( 9/* "FINICIO" */,-23 , 10/* "FUNCION" */,-23 ),
	/* State 36 */ new Array( 100/* "$" */,-1 ),
	/* State 37 */ new Array( 43/* "(" */,30 ),
	/* State 38 */ new Array( 43/* "(" */,30 ),
	/* State 39 */ new Array( 43/* "(" */,-5 ),
	/* State 40 */ new Array( 48/* "IDENTIFICADOR" */,66 , 16/* "TLETRAS" */,9 , 15/* "TNUMERO" */,10 , 17/* "TLOGICO" */,11 , 18/* "TMATRIZ" */,12 ),
	/* State 41 */ new Array( 10/* "FUNCION" */,-6 , 9/* "FINICIO" */,-6 , 16/* "TLETRAS" */,-6 , 15/* "TNUMERO" */,-6 , 17/* "TLOGICO" */,-6 , 18/* "TMATRIZ" */,-6 , 23/* "}" */,-6 , 26/* ";" */,-6 , 11/* "RESPONDER" */,-6 , 48/* "IDENTIFICADOR" */,-6 , 13/* "DECIR" */,-6 , 2/* "SI" */,-6 , 5/* "MIENTRAS" */,-6 , 7/* "PORCADA" */,-6 , 4/* "HACER" */,-6 ),
	/* State 42 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 43 */ new Array( 48/* "IDENTIFICADOR" */,-90 , 50/* "NUMERO" */,-90 , 49/* "LETRAS" */,-90 , 47/* "LOGICO" */,-90 , 14/* "ESCUCHAR" */,-90 , 12/* "PREGUNTAR" */,-90 , 20/* "PI" */,-90 , 21/* "E" */,-90 , 43/* "(" */,-90 ),
	/* State 44 */ new Array( 48/* "IDENTIFICADOR" */,-91 , 50/* "NUMERO" */,-91 , 49/* "LETRAS" */,-91 , 47/* "LOGICO" */,-91 , 14/* "ESCUCHAR" */,-91 , 12/* "PREGUNTAR" */,-91 , 20/* "PI" */,-91 , 21/* "E" */,-91 , 43/* "(" */,-91 ),
	/* State 45 */ new Array( 48/* "IDENTIFICADOR" */,-92 , 50/* "NUMERO" */,-92 , 49/* "LETRAS" */,-92 , 47/* "LOGICO" */,-92 , 14/* "ESCUCHAR" */,-92 , 12/* "PREGUNTAR" */,-92 , 20/* "PI" */,-92 , 21/* "E" */,-92 , 43/* "(" */,-92 ),
	/* State 46 */ new Array( 48/* "IDENTIFICADOR" */,-93 , 50/* "NUMERO" */,-93 , 49/* "LETRAS" */,-93 , 47/* "LOGICO" */,-93 , 14/* "ESCUCHAR" */,-93 , 12/* "PREGUNTAR" */,-93 , 20/* "PI" */,-93 , 21/* "E" */,-93 , 43/* "(" */,-93 ),
	/* State 47 */ new Array( 48/* "IDENTIFICADOR" */,-94 , 50/* "NUMERO" */,-94 , 49/* "LETRAS" */,-94 , 47/* "LOGICO" */,-94 , 14/* "ESCUCHAR" */,-94 , 12/* "PREGUNTAR" */,-94 , 20/* "PI" */,-94 , 21/* "E" */,-94 , 43/* "(" */,-94 ),
	/* State 48 */ new Array( 48/* "IDENTIFICADOR" */,-95 , 50/* "NUMERO" */,-95 , 49/* "LETRAS" */,-95 , 47/* "LOGICO" */,-95 , 14/* "ESCUCHAR" */,-95 , 12/* "PREGUNTAR" */,-95 , 20/* "PI" */,-95 , 21/* "E" */,-95 , 43/* "(" */,-95 ),
	/* State 49 */ new Array( 48/* "IDENTIFICADOR" */,-96 , 50/* "NUMERO" */,-96 , 49/* "LETRAS" */,-96 , 47/* "LOGICO" */,-96 , 14/* "ESCUCHAR" */,-96 , 12/* "PREGUNTAR" */,-96 , 20/* "PI" */,-96 , 21/* "E" */,-96 , 43/* "(" */,-96 ),
	/* State 50 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 51 */ new Array( 48/* "IDENTIFICADOR" */,-70 , 50/* "NUMERO" */,-70 , 49/* "LETRAS" */,-70 , 47/* "LOGICO" */,-70 , 14/* "ESCUCHAR" */,-70 , 12/* "PREGUNTAR" */,-70 , 20/* "PI" */,-70 , 21/* "E" */,-70 , 43/* "(" */,-70 ),
	/* State 52 */ new Array( 48/* "IDENTIFICADOR" */,-71 , 50/* "NUMERO" */,-71 , 49/* "LETRAS" */,-71 , 47/* "LOGICO" */,-71 , 14/* "ESCUCHAR" */,-71 , 12/* "PREGUNTAR" */,-71 , 20/* "PI" */,-71 , 21/* "E" */,-71 , 43/* "(" */,-71 ),
	/* State 53 */ new Array( 48/* "IDENTIFICADOR" */,-72 , 50/* "NUMERO" */,-72 , 49/* "LETRAS" */,-72 , 47/* "LOGICO" */,-72 , 14/* "ESCUCHAR" */,-72 , 12/* "PREGUNTAR" */,-72 , 20/* "PI" */,-72 , 21/* "E" */,-72 , 43/* "(" */,-72 ),
	/* State 54 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 55 */ new Array( 48/* "IDENTIFICADOR" */,-75 , 50/* "NUMERO" */,-75 , 49/* "LETRAS" */,-75 , 47/* "LOGICO" */,-75 , 14/* "ESCUCHAR" */,-75 , 12/* "PREGUNTAR" */,-75 , 20/* "PI" */,-75 , 21/* "E" */,-75 , 43/* "(" */,-75 ),
	/* State 56 */ new Array( 48/* "IDENTIFICADOR" */,-76 , 50/* "NUMERO" */,-76 , 49/* "LETRAS" */,-76 , 47/* "LOGICO" */,-76 , 14/* "ESCUCHAR" */,-76 , 12/* "PREGUNTAR" */,-76 , 20/* "PI" */,-76 , 21/* "E" */,-76 , 43/* "(" */,-76 ),
	/* State 57 */ new Array( 48/* "IDENTIFICADOR" */,-77 , 50/* "NUMERO" */,-77 , 49/* "LETRAS" */,-77 , 47/* "LOGICO" */,-77 , 14/* "ESCUCHAR" */,-77 , 12/* "PREGUNTAR" */,-77 , 20/* "PI" */,-77 , 21/* "E" */,-77 , 43/* "(" */,-77 ),
	/* State 58 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 , 44/* ")" */,-17 ),
	/* State 59 */ new Array( 24/* "[" */,74 , 40/* "*" */,-63 , 39/* "/" */,-63 , 46/* "&&" */,-63 , 37/* "+" */,-63 , 38/* "-" */,-63 , 45/* "||" */,-63 , 30/* "==" */,-63 , 31/* "!=" */,-63 , 32/* "<>" */,-63 , 33/* "<=" */,-63 , 34/* ">=" */,-63 , 35/* ">" */,-63 , 36/* "<" */,-63 , 26/* ";" */,-63 , 44/* ")" */,-63 , 27/* "," */,-63 , 25/* "]" */,-63 ),
	/* State 60 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 61 */ new Array( 44/* ")" */,77 ),
	/* State 62 */ new Array( 44/* ")" */,77 ),
	/* State 63 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 64 */ new Array( 44/* ")" */,77 ),
	/* State 65 */ new Array( 16/* "TLETRAS" */,9 , 15/* "TNUMERO" */,10 , 17/* "TLOGICO" */,11 , 18/* "TMATRIZ" */,12 , 44/* ")" */,-13 ),
	/* State 66 */ new Array( 43/* "(" */,-22 ),
	/* State 67 */ new Array( 48/* "IDENTIFICADOR" */,84 ),
	/* State 68 */ new Array( 26/* ";" */,-66 , 44/* ")" */,-66 , 27/* "," */,-66 , 25/* "]" */,-66 ),
	/* State 69 */ new Array( 30/* "==" */,-68 , 31/* "!=" */,-68 , 32/* "<>" */,-68 , 33/* "<=" */,-68 , 34/* ">=" */,-68 , 35/* ">" */,-68 , 36/* "<" */,-68 , 26/* ";" */,-68 , 44/* ")" */,-68 , 27/* "," */,-68 , 25/* "]" */,-68 ),
	/* State 70 */ new Array( 37/* "+" */,-73 , 38/* "-" */,-73 , 45/* "||" */,-73 , 30/* "==" */,-73 , 31/* "!=" */,-73 , 32/* "<>" */,-73 , 33/* "<=" */,-73 , 34/* ">=" */,-73 , 35/* ">" */,-73 , 36/* "<" */,-73 , 26/* ";" */,-73 , 44/* ")" */,-73 , 27/* "," */,-73 , 25/* "]" */,-73 ),
	/* State 71 */ new Array( 44/* ")" */,77 ),
	/* State 72 */ new Array( 27/* "," */,86 , 44/* ")" */,-16 ),
	/* State 73 */ new Array( 44/* ")" */,-19 , 27/* "," */,-19 ),
	/* State 74 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 75 */ new Array( 25/* "]" */,88 ),
	/* State 76 */ new Array( 40/* "*" */,-86 , 39/* "/" */,-86 , 46/* "&&" */,-86 , 37/* "+" */,-86 , 38/* "-" */,-86 , 45/* "||" */,-86 , 30/* "==" */,-86 , 31/* "!=" */,-86 , 32/* "<>" */,-86 , 33/* "<=" */,-86 , 34/* ">=" */,-86 , 35/* ">" */,-86 , 36/* "<" */,-86 , 26/* ";" */,-86 , 44/* ")" */,-86 , 27/* "," */,-86 , 25/* "]" */,-86 ),
	/* State 77 */ new Array( 40/* "*" */,-89 , 39/* "/" */,-89 , 46/* "&&" */,-89 , 37/* "+" */,-89 , 38/* "-" */,-89 , 45/* "||" */,-89 , 30/* "==" */,-89 , 31/* "!=" */,-89 , 32/* "<>" */,-89 , 33/* "<=" */,-89 , 34/* ">=" */,-89 , 35/* ">" */,-89 , 36/* "<" */,-89 , 26/* ";" */,-89 , 44/* ")" */,-89 , 27/* "," */,-89 , 25/* "]" */,-89 , 22/* "{" */,-89 , 6/* "REPETIR" */,-89 ),
	/* State 78 */ new Array( 40/* "*" */,-40 , 39/* "/" */,-40 , 46/* "&&" */,-40 , 37/* "+" */,-40 , 38/* "-" */,-40 , 45/* "||" */,-40 , 30/* "==" */,-40 , 31/* "!=" */,-40 , 32/* "<>" */,-40 , 33/* "<=" */,-40 , 34/* ">=" */,-40 , 35/* ">" */,-40 , 36/* "<" */,-40 , 26/* ";" */,-40 , 44/* ")" */,-40 , 27/* "," */,-40 , 25/* "]" */,-40 ),
	/* State 79 */ new Array( 44/* ")" */,77 ),
	/* State 80 */ new Array( 22/* "{" */,91 ),
	/* State 81 */ new Array( 44/* ")" */,77 ),
	/* State 82 */ new Array( 27/* "," */,93 , 44/* ")" */,-12 ),
	/* State 83 */ new Array( 44/* ")" */,-15 , 27/* "," */,-15 ),
	/* State 84 */ new Array( 43/* "(" */,-21 ),
	/* State 85 */ new Array( 40/* "*" */,-38 , 39/* "/" */,-38 , 46/* "&&" */,-38 , 37/* "+" */,-38 , 38/* "-" */,-38 , 45/* "||" */,-38 , 30/* "==" */,-38 , 31/* "!=" */,-38 , 32/* "<>" */,-38 , 33/* "<=" */,-38 , 34/* ">=" */,-38 , 35/* ">" */,-38 , 36/* "<" */,-38 , 26/* ";" */,-38 , 44/* ")" */,-38 , 27/* "," */,-38 , 25/* "]" */,-38 ),
	/* State 86 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 87 */ new Array( 25/* "]" */,95 ),
	/* State 88 */ new Array( 40/* "*" */,-65 , 39/* "/" */,-65 , 46/* "&&" */,-65 , 37/* "+" */,-65 , 38/* "-" */,-65 , 45/* "||" */,-65 , 30/* "==" */,-65 , 31/* "!=" */,-65 , 32/* "<>" */,-65 , 33/* "<=" */,-65 , 34/* ">=" */,-65 , 35/* ">" */,-65 , 36/* "<" */,-65 , 26/* ";" */,-65 , 24/* "[" */,-65 , 44/* ")" */,-65 , 27/* "," */,-65 , 25/* "]" */,-65 ),
	/* State 89 */ new Array( 40/* "*" */,-41 , 39/* "/" */,-41 , 46/* "&&" */,-41 , 37/* "+" */,-41 , 38/* "-" */,-41 , 45/* "||" */,-41 , 30/* "==" */,-41 , 31/* "!=" */,-41 , 32/* "<>" */,-41 , 33/* "<=" */,-41 , 34/* ">=" */,-41 , 35/* ">" */,-41 , 36/* "<" */,-41 , 26/* ";" */,-41 , 44/* ")" */,-41 , 27/* "," */,-41 , 25/* "]" */,-41 ),
	/* State 90 */ new Array( 100/* "$" */,-4 ),
	/* State 91 */ new Array( 23/* "}" */,-27 , 26/* ";" */,-27 , 16/* "TLETRAS" */,-27 , 15/* "TNUMERO" */,-27 , 17/* "TLOGICO" */,-27 , 18/* "TMATRIZ" */,-27 , 11/* "RESPONDER" */,-27 , 48/* "IDENTIFICADOR" */,-27 , 13/* "DECIR" */,-27 , 2/* "SI" */,-27 , 5/* "MIENTRAS" */,-27 , 7/* "PORCADA" */,-27 , 4/* "HACER" */,-27 ),
	/* State 92 */ new Array( 22/* "{" */,91 ),
	/* State 93 */ new Array( 16/* "TLETRAS" */,9 , 15/* "TNUMERO" */,10 , 17/* "TLOGICO" */,11 , 18/* "TMATRIZ" */,12 ),
	/* State 94 */ new Array( 44/* ")" */,-18 , 27/* "," */,-18 ),
	/* State 95 */ new Array( 40/* "*" */,-64 , 39/* "/" */,-64 , 46/* "&&" */,-64 , 37/* "+" */,-64 , 38/* "-" */,-64 , 45/* "||" */,-64 , 30/* "==" */,-64 , 31/* "!=" */,-64 , 32/* "<>" */,-64 , 33/* "<=" */,-64 , 34/* ">=" */,-64 , 35/* ">" */,-64 , 36/* "<" */,-64 , 26/* ";" */,-64 , 24/* "[" */,-64 , 44/* ")" */,-64 , 27/* "," */,-64 , 25/* "]" */,-64 ),
	/* State 96 */ new Array( 23/* "}" */,100 , 26/* ";" */,107 , 11/* "RESPONDER" */,113 , 48/* "IDENTIFICADOR" */,114 , 13/* "DECIR" */,115 , 16/* "TLETRAS" */,9 , 15/* "TNUMERO" */,10 , 17/* "TLOGICO" */,11 , 18/* "TMATRIZ" */,12 , 2/* "SI" */,120 , 5/* "MIENTRAS" */,121 , 7/* "PORCADA" */,122 , 4/* "HACER" */,123 ),
	/* State 97 */ new Array( 9/* "FINICIO" */,-20 , 10/* "FUNCION" */,-20 ),
	/* State 98 */ new Array( 44/* ")" */,-14 , 27/* "," */,-14 ),
	/* State 99 */ new Array( 23/* "}" */,-26 , 26/* ";" */,-26 , 16/* "TLETRAS" */,-26 , 15/* "TNUMERO" */,-26 , 17/* "TLOGICO" */,-26 , 18/* "TMATRIZ" */,-26 , 11/* "RESPONDER" */,-26 , 48/* "IDENTIFICADOR" */,-26 , 13/* "DECIR" */,-26 , 2/* "SI" */,-26 , 5/* "MIENTRAS" */,-26 , 7/* "PORCADA" */,-26 , 4/* "HACER" */,-26 ),
	/* State 100 */ new Array( 100/* "$" */,-25 , 9/* "FINICIO" */,-25 , 10/* "FUNCION" */,-25 , 23/* "}" */,-25 , 26/* ";" */,-25 , 16/* "TLETRAS" */,-25 , 15/* "TNUMERO" */,-25 , 17/* "TLOGICO" */,-25 , 18/* "TMATRIZ" */,-25 , 11/* "RESPONDER" */,-25 , 48/* "IDENTIFICADOR" */,-25 , 13/* "DECIR" */,-25 , 2/* "SI" */,-25 , 5/* "MIENTRAS" */,-25 , 7/* "PORCADA" */,-25 , 4/* "HACER" */,-25 , 3/* "SINO" */,-25 ),
	/* State 101 */ new Array( 23/* "}" */,-28 , 26/* ";" */,-28 , 16/* "TLETRAS" */,-28 , 15/* "TNUMERO" */,-28 , 17/* "TLOGICO" */,-28 , 18/* "TMATRIZ" */,-28 , 11/* "RESPONDER" */,-28 , 48/* "IDENTIFICADOR" */,-28 , 13/* "DECIR" */,-28 , 2/* "SI" */,-28 , 5/* "MIENTRAS" */,-28 , 7/* "PORCADA" */,-28 , 4/* "HACER" */,-28 ),
	/* State 102 */ new Array( 23/* "}" */,-29 , 26/* ";" */,-29 , 16/* "TLETRAS" */,-29 , 15/* "TNUMERO" */,-29 , 17/* "TLOGICO" */,-29 , 18/* "TMATRIZ" */,-29 , 11/* "RESPONDER" */,-29 , 48/* "IDENTIFICADOR" */,-29 , 13/* "DECIR" */,-29 , 2/* "SI" */,-29 , 5/* "MIENTRAS" */,-29 , 7/* "PORCADA" */,-29 , 4/* "HACER" */,-29 ),
	/* State 103 */ new Array( 23/* "}" */,-30 , 26/* ";" */,-30 , 16/* "TLETRAS" */,-30 , 15/* "TNUMERO" */,-30 , 17/* "TLOGICO" */,-30 , 18/* "TMATRIZ" */,-30 , 11/* "RESPONDER" */,-30 , 48/* "IDENTIFICADOR" */,-30 , 13/* "DECIR" */,-30 , 2/* "SI" */,-30 , 5/* "MIENTRAS" */,-30 , 7/* "PORCADA" */,-30 , 4/* "HACER" */,-30 ),
	/* State 104 */ new Array( 23/* "}" */,-31 , 26/* ";" */,-31 , 16/* "TLETRAS" */,-31 , 15/* "TNUMERO" */,-31 , 17/* "TLOGICO" */,-31 , 18/* "TMATRIZ" */,-31 , 11/* "RESPONDER" */,-31 , 48/* "IDENTIFICADOR" */,-31 , 13/* "DECIR" */,-31 , 2/* "SI" */,-31 , 5/* "MIENTRAS" */,-31 , 7/* "PORCADA" */,-31 , 4/* "HACER" */,-31 ),
	/* State 105 */ new Array( 26/* ";" */,124 ),
	/* State 106 */ new Array( 23/* "}" */,-33 , 26/* ";" */,-33 , 16/* "TLETRAS" */,-33 , 15/* "TNUMERO" */,-33 , 17/* "TLOGICO" */,-33 , 18/* "TMATRIZ" */,-33 , 11/* "RESPONDER" */,-33 , 48/* "IDENTIFICADOR" */,-33 , 13/* "DECIR" */,-33 , 2/* "SI" */,-33 , 5/* "MIENTRAS" */,-33 , 7/* "PORCADA" */,-33 , 4/* "HACER" */,-33 ),
	/* State 107 */ new Array( 23/* "}" */,-34 , 26/* ";" */,-34 , 16/* "TLETRAS" */,-34 , 15/* "TNUMERO" */,-34 , 17/* "TLOGICO" */,-34 , 18/* "TMATRIZ" */,-34 , 11/* "RESPONDER" */,-34 , 48/* "IDENTIFICADOR" */,-34 , 13/* "DECIR" */,-34 , 2/* "SI" */,-34 , 5/* "MIENTRAS" */,-34 , 7/* "PORCADA" */,-34 , 4/* "HACER" */,-34 ),
	/* State 108 */ new Array( 23/* "}" */,-43 , 26/* ";" */,-43 , 16/* "TLETRAS" */,-43 , 15/* "TNUMERO" */,-43 , 17/* "TLOGICO" */,-43 , 18/* "TMATRIZ" */,-43 , 11/* "RESPONDER" */,-43 , 48/* "IDENTIFICADOR" */,-43 , 13/* "DECIR" */,-43 , 2/* "SI" */,-43 , 5/* "MIENTRAS" */,-43 , 7/* "PORCADA" */,-43 , 4/* "HACER" */,-43 ),
	/* State 109 */ new Array( 23/* "}" */,-44 , 26/* ";" */,-44 , 16/* "TLETRAS" */,-44 , 15/* "TNUMERO" */,-44 , 17/* "TLOGICO" */,-44 , 18/* "TMATRIZ" */,-44 , 11/* "RESPONDER" */,-44 , 48/* "IDENTIFICADOR" */,-44 , 13/* "DECIR" */,-44 , 2/* "SI" */,-44 , 5/* "MIENTRAS" */,-44 , 7/* "PORCADA" */,-44 , 4/* "HACER" */,-44 ),
	/* State 110 */ new Array( 23/* "}" */,-45 , 26/* ";" */,-45 , 16/* "TLETRAS" */,-45 , 15/* "TNUMERO" */,-45 , 17/* "TLOGICO" */,-45 , 18/* "TMATRIZ" */,-45 , 11/* "RESPONDER" */,-45 , 48/* "IDENTIFICADOR" */,-45 , 13/* "DECIR" */,-45 , 2/* "SI" */,-45 , 5/* "MIENTRAS" */,-45 , 7/* "PORCADA" */,-45 , 4/* "HACER" */,-45 ),
	/* State 111 */ new Array( 23/* "}" */,-46 , 26/* ";" */,-46 , 16/* "TLETRAS" */,-46 , 15/* "TNUMERO" */,-46 , 17/* "TLOGICO" */,-46 , 18/* "TMATRIZ" */,-46 , 11/* "RESPONDER" */,-46 , 48/* "IDENTIFICADOR" */,-46 , 13/* "DECIR" */,-46 , 2/* "SI" */,-46 , 5/* "MIENTRAS" */,-46 , 7/* "PORCADA" */,-46 , 4/* "HACER" */,-46 ),
	/* State 112 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 113 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 114 */ new Array( 28/* "=" */,127 , 43/* "(" */,30 ),
	/* State 115 */ new Array( 43/* "(" */,30 ),
	/* State 116 */ new Array( 22/* "{" */,91 ),
	/* State 117 */ new Array( 43/* "(" */,30 ),
	/* State 118 */ new Array( 22/* "{" */,91 ),
	/* State 119 */ new Array( 22/* "{" */,91 ),
	/* State 120 */ new Array( 43/* "(" */,30 ),
	/* State 121 */ new Array( 43/* "(" */,-53 ),
	/* State 122 */ new Array( 48/* "IDENTIFICADOR" */,134 ),
	/* State 123 */ new Array( 22/* "{" */,-58 ),
	/* State 124 */ new Array( 23/* "}" */,-32 , 26/* ";" */,-32 , 16/* "TLETRAS" */,-32 , 15/* "TNUMERO" */,-32 , 17/* "TLOGICO" */,-32 , 18/* "TMATRIZ" */,-32 , 11/* "RESPONDER" */,-32 , 48/* "IDENTIFICADOR" */,-32 , 13/* "DECIR" */,-32 , 2/* "SI" */,-32 , 5/* "MIENTRAS" */,-32 , 7/* "PORCADA" */,-32 , 4/* "HACER" */,-32 ),
	/* State 125 */ new Array( 26/* ";" */,135 ),
	/* State 126 */ new Array( 26/* ";" */,136 ),
	/* State 127 */ new Array( 48/* "IDENTIFICADOR" */,-36 , 50/* "NUMERO" */,-36 , 49/* "LETRAS" */,-36 , 47/* "LOGICO" */,-36 , 14/* "ESCUCHAR" */,-36 , 12/* "PREGUNTAR" */,-36 , 20/* "PI" */,-36 , 21/* "E" */,-36 , 43/* "(" */,-36 ),
	/* State 128 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 129 */ new Array( 3/* "SINO" */,139 , 23/* "}" */,-47 , 26/* ";" */,-47 , 16/* "TLETRAS" */,-47 , 15/* "TNUMERO" */,-47 , 17/* "TLOGICO" */,-47 , 18/* "TMATRIZ" */,-47 , 11/* "RESPONDER" */,-47 , 48/* "IDENTIFICADOR" */,-47 , 13/* "DECIR" */,-47 , 2/* "SI" */,-47 , 5/* "MIENTRAS" */,-47 , 7/* "PORCADA" */,-47 , 4/* "HACER" */,-47 ),
	/* State 130 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 131 */ new Array( 23/* "}" */,-55 , 26/* ";" */,-55 , 16/* "TLETRAS" */,-55 , 15/* "TNUMERO" */,-55 , 17/* "TLOGICO" */,-55 , 18/* "TMATRIZ" */,-55 , 11/* "RESPONDER" */,-55 , 48/* "IDENTIFICADOR" */,-55 , 13/* "DECIR" */,-55 , 2/* "SI" */,-55 , 5/* "MIENTRAS" */,-55 , 7/* "PORCADA" */,-55 , 4/* "HACER" */,-55 ),
	/* State 132 */ new Array( 5/* "MIENTRAS" */,141 ),
	/* State 133 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 134 */ new Array( 8/* "EN" */,143 ),
	/* State 135 */ new Array( 23/* "}" */,-35 , 26/* ";" */,-35 , 16/* "TLETRAS" */,-35 , 15/* "TNUMERO" */,-35 , 17/* "TLOGICO" */,-35 , 18/* "TMATRIZ" */,-35 , 11/* "RESPONDER" */,-35 , 48/* "IDENTIFICADOR" */,-35 , 13/* "DECIR" */,-35 , 2/* "SI" */,-35 , 5/* "MIENTRAS" */,-35 , 7/* "PORCADA" */,-35 , 4/* "HACER" */,-35 ),
	/* State 136 */ new Array( 23/* "}" */,-37 , 26/* ";" */,-37 , 16/* "TLETRAS" */,-37 , 15/* "TNUMERO" */,-37 , 17/* "TLOGICO" */,-37 , 18/* "TMATRIZ" */,-37 , 11/* "RESPONDER" */,-37 , 48/* "IDENTIFICADOR" */,-37 , 13/* "DECIR" */,-37 , 2/* "SI" */,-37 , 5/* "MIENTRAS" */,-37 , 7/* "PORCADA" */,-37 , 4/* "HACER" */,-37 ),
	/* State 137 */ new Array( 44/* ")" */,77 ),
	/* State 138 */ new Array( 22/* "{" */,91 , 2/* "SI" */,120 ),
	/* State 139 */ new Array( 2/* "SI" */,-51 , 22/* "{" */,-51 ),
	/* State 140 */ new Array( 44/* ")" */,77 ),
	/* State 141 */ new Array( 43/* "(" */,30 ),
	/* State 142 */ new Array( 44/* ")" */,77 ),
	/* State 143 */ new Array( 48/* "IDENTIFICADOR" */,150 ),
	/* State 144 */ new Array( 26/* ";" */,151 ),
	/* State 145 */ new Array( 23/* "}" */,-49 , 26/* ";" */,-49 , 16/* "TLETRAS" */,-49 , 15/* "TNUMERO" */,-49 , 17/* "TLOGICO" */,-49 , 18/* "TMATRIZ" */,-49 , 11/* "RESPONDER" */,-49 , 48/* "IDENTIFICADOR" */,-49 , 13/* "DECIR" */,-49 , 2/* "SI" */,-49 , 5/* "MIENTRAS" */,-49 , 7/* "PORCADA" */,-49 , 4/* "HACER" */,-49 ),
	/* State 146 */ new Array( 23/* "}" */,-48 , 26/* ";" */,-48 , 16/* "TLETRAS" */,-48 , 15/* "TNUMERO" */,-48 , 17/* "TLOGICO" */,-48 , 18/* "TMATRIZ" */,-48 , 11/* "RESPONDER" */,-48 , 48/* "IDENTIFICADOR" */,-48 , 13/* "DECIR" */,-48 , 2/* "SI" */,-48 , 5/* "MIENTRAS" */,-48 , 7/* "PORCADA" */,-48 , 4/* "HACER" */,-48 ),
	/* State 147 */ new Array( 6/* "REPETIR" */,153 ),
	/* State 148 */ new Array( 48/* "IDENTIFICADOR" */,18 , 50/* "NUMERO" */,19 , 49/* "LETRAS" */,20 , 47/* "LOGICO" */,21 , 20/* "PI" */,24 , 21/* "E" */,25 , 14/* "ESCUCHAR" */,28 , 43/* "(" */,30 , 12/* "PREGUNTAR" */,31 ),
	/* State 149 */ new Array( 22/* "{" */,-50 ),
	/* State 150 */ new Array( 22/* "{" */,-56 ),
	/* State 151 */ new Array( 23/* "}" */,-39 , 26/* ";" */,-39 , 16/* "TLETRAS" */,-39 , 15/* "TNUMERO" */,-39 , 17/* "TLOGICO" */,-39 , 18/* "TMATRIZ" */,-39 , 11/* "RESPONDER" */,-39 , 48/* "IDENTIFICADOR" */,-39 , 13/* "DECIR" */,-39 , 2/* "SI" */,-39 , 5/* "MIENTRAS" */,-39 , 7/* "PORCADA" */,-39 , 4/* "HACER" */,-39 ),
	/* State 152 */ new Array( 22/* "{" */,91 ),
	/* State 153 */ new Array( 22/* "{" */,-54 ),
	/* State 154 */ new Array( 44/* ")" */,77 ),
	/* State 155 */ new Array( 23/* "}" */,-52 , 26/* ";" */,-52 , 16/* "TLETRAS" */,-52 , 15/* "TNUMERO" */,-52 , 17/* "TLOGICO" */,-52 , 18/* "TMATRIZ" */,-52 , 11/* "RESPONDER" */,-52 , 48/* "IDENTIFICADOR" */,-52 , 13/* "DECIR" */,-52 , 2/* "SI" */,-52 , 5/* "MIENTRAS" */,-52 , 7/* "PORCADA" */,-52 , 4/* "HACER" */,-52 ),
	/* State 156 */ new Array( 26/* ";" */,157 ),
	/* State 157 */ new Array( 23/* "}" */,-57 , 26/* ";" */,-57 , 16/* "TLETRAS" */,-57 , 15/* "TNUMERO" */,-57 , 17/* "TLOGICO" */,-57 , 18/* "TMATRIZ" */,-57 , 11/* "RESPONDER" */,-57 , 48/* "IDENTIFICADOR" */,-57 , 13/* "DECIR" */,-57 , 2/* "SI" */,-57 , 5/* "MIENTRAS" */,-57 , 7/* "PORCADA" */,-57 , 4/* "HACER" */,-57 )
);

/* Goto-Table */
var goto_tab = new Array(
	/* State 0 */ new Array( 56/* Program */,1 , 51/* ProgramInit */,2 ),
	/* State 1 */ new Array(  ),
	/* State 2 */ new Array( 52/* VarDecs */,3 ),
	/* State 3 */ new Array( 64/* Var */,4 , 53/* GotoInicio */,5 , 61/* VarDecInit */,6 , 63/* VarDec */,7 , 65/* Tipo */,8 ),
	/* State 4 */ new Array(  ),
	/* State 5 */ new Array( 54/* FunctionDecs */,13 ),
	/* State 6 */ new Array( 62/* Exp */,14 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 7 */ new Array(  ),
	/* State 8 */ new Array(  ),
	/* State 9 */ new Array(  ),
	/* State 10 */ new Array(  ),
	/* State 11 */ new Array(  ),
	/* State 12 */ new Array(  ),
	/* State 13 */ new Array( 71/* Function */,35 , 55/* Inicio */,36 , 57/* InicioInit */,37 , 70/* FunctionInit */,38 ),
	/* State 14 */ new Array(  ),
	/* State 15 */ new Array( 95/* OpRel */,42 ),
	/* State 16 */ new Array( 97/* _ExpSum */,50 ),
	/* State 17 */ new Array( 99/* _ExpMult */,54 ),
	/* State 18 */ new Array( 58/* LeftPar */,58 , 92/* _Matriz */,59 ),
	/* State 19 */ new Array(  ),
	/* State 20 */ new Array(  ),
	/* State 21 */ new Array(  ),
	/* State 22 */ new Array(  ),
	/* State 23 */ new Array(  ),
	/* State 24 */ new Array(  ),
	/* State 25 */ new Array(  ),
	/* State 26 */ new Array( 62/* Exp */,61 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 27 */ new Array(  ),
	/* State 28 */ new Array( 58/* LeftPar */,62 ),
	/* State 29 */ new Array( 58/* LeftPar */,63 ),
	/* State 30 */ new Array(  ),
	/* State 31 */ new Array(  ),
	/* State 32 */ new Array(  ),
	/* State 33 */ new Array(  ),
	/* State 34 */ new Array(  ),
	/* State 35 */ new Array(  ),
	/* State 36 */ new Array(  ),
	/* State 37 */ new Array( 58/* LeftPar */,64 ),
	/* State 38 */ new Array( 58/* LeftPar */,65 ),
	/* State 39 */ new Array(  ),
	/* State 40 */ new Array( 65/* Tipo */,67 ),
	/* State 41 */ new Array(  ),
	/* State 42 */ new Array( 62/* Exp */,68 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 43 */ new Array(  ),
	/* State 44 */ new Array(  ),
	/* State 45 */ new Array(  ),
	/* State 46 */ new Array(  ),
	/* State 47 */ new Array(  ),
	/* State 48 */ new Array(  ),
	/* State 49 */ new Array(  ),
	/* State 50 */ new Array( 94/* ExpSum */,69 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 51 */ new Array(  ),
	/* State 52 */ new Array(  ),
	/* State 53 */ new Array(  ),
	/* State 54 */ new Array( 96/* ExpMult */,70 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 55 */ new Array(  ),
	/* State 56 */ new Array(  ),
	/* State 57 */ new Array(  ),
	/* State 58 */ new Array( 69/* ArgsOpt */,71 , 68/* Args */,72 , 62/* Exp */,73 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 59 */ new Array(  ),
	/* State 60 */ new Array( 62/* Exp */,75 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 61 */ new Array( 59/* RightPar */,76 ),
	/* State 62 */ new Array( 59/* RightPar */,78 ),
	/* State 63 */ new Array( 62/* Exp */,79 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 64 */ new Array( 59/* RightPar */,80 ),
	/* State 65 */ new Array( 67/* ParamOpt */,81 , 66/* Param */,82 , 63/* VarDec */,83 , 65/* Tipo */,8 ),
	/* State 66 */ new Array(  ),
	/* State 67 */ new Array(  ),
	/* State 68 */ new Array(  ),
	/* State 69 */ new Array(  ),
	/* State 70 */ new Array(  ),
	/* State 71 */ new Array( 59/* RightPar */,85 ),
	/* State 72 */ new Array(  ),
	/* State 73 */ new Array(  ),
	/* State 74 */ new Array( 62/* Exp */,87 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 75 */ new Array(  ),
	/* State 76 */ new Array(  ),
	/* State 77 */ new Array(  ),
	/* State 78 */ new Array(  ),
	/* State 79 */ new Array( 59/* RightPar */,89 ),
	/* State 80 */ new Array( 60/* Bloque */,90 ),
	/* State 81 */ new Array( 59/* RightPar */,92 ),
	/* State 82 */ new Array(  ),
	/* State 83 */ new Array(  ),
	/* State 84 */ new Array(  ),
	/* State 85 */ new Array(  ),
	/* State 86 */ new Array( 62/* Exp */,94 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 87 */ new Array(  ),
	/* State 88 */ new Array(  ),
	/* State 89 */ new Array(  ),
	/* State 90 */ new Array(  ),
	/* State 91 */ new Array( 72/* Statements */,96 ),
	/* State 92 */ new Array( 60/* Bloque */,97 ),
	/* State 93 */ new Array( 63/* VarDec */,98 , 65/* Tipo */,8 ),
	/* State 94 */ new Array(  ),
	/* State 95 */ new Array(  ),
	/* State 96 */ new Array( 73/* Statement */,99 , 64/* Var */,101 , 74/* Control */,102 , 75/* Asignacion */,103 , 76/* Regreso */,104 , 77/* FunctionCall */,105 , 78/* SpecialFunctions */,106 , 61/* VarDecInit */,6 , 63/* VarDec */,7 , 82/* If */,108 , 83/* While */,109 , 84/* Foreach */,110 , 85/* DoWhile */,111 , 79/* AsigancionInit */,112 , 65/* Tipo */,8 , 86/* IfInit */,116 , 88/* WhileInit */,117 , 90/* ForeachInit */,118 , 91/* DoWhileInit */,119 ),
	/* State 97 */ new Array(  ),
	/* State 98 */ new Array(  ),
	/* State 99 */ new Array(  ),
	/* State 100 */ new Array(  ),
	/* State 101 */ new Array(  ),
	/* State 102 */ new Array(  ),
	/* State 103 */ new Array(  ),
	/* State 104 */ new Array(  ),
	/* State 105 */ new Array(  ),
	/* State 106 */ new Array(  ),
	/* State 107 */ new Array(  ),
	/* State 108 */ new Array(  ),
	/* State 109 */ new Array(  ),
	/* State 110 */ new Array(  ),
	/* State 111 */ new Array(  ),
	/* State 112 */ new Array( 62/* Exp */,125 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 113 */ new Array( 62/* Exp */,126 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 114 */ new Array( 58/* LeftPar */,58 ),
	/* State 115 */ new Array( 58/* LeftPar */,128 ),
	/* State 116 */ new Array( 60/* Bloque */,129 ),
	/* State 117 */ new Array( 58/* LeftPar */,130 ),
	/* State 118 */ new Array( 60/* Bloque */,131 ),
	/* State 119 */ new Array( 60/* Bloque */,132 ),
	/* State 120 */ new Array( 58/* LeftPar */,133 ),
	/* State 121 */ new Array(  ),
	/* State 122 */ new Array(  ),
	/* State 123 */ new Array(  ),
	/* State 124 */ new Array(  ),
	/* State 125 */ new Array(  ),
	/* State 126 */ new Array(  ),
	/* State 127 */ new Array(  ),
	/* State 128 */ new Array( 62/* Exp */,137 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 129 */ new Array( 87/* SinoInit */,138 ),
	/* State 130 */ new Array( 62/* Exp */,140 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 131 */ new Array(  ),
	/* State 132 */ new Array(  ),
	/* State 133 */ new Array( 62/* Exp */,142 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 134 */ new Array(  ),
	/* State 135 */ new Array(  ),
	/* State 136 */ new Array(  ),
	/* State 137 */ new Array( 59/* RightPar */,144 ),
	/* State 138 */ new Array( 82/* If */,145 , 60/* Bloque */,146 , 86/* IfInit */,116 ),
	/* State 139 */ new Array(  ),
	/* State 140 */ new Array( 59/* RightPar */,147 ),
	/* State 141 */ new Array( 58/* LeftPar */,148 ),
	/* State 142 */ new Array( 59/* RightPar */,149 ),
	/* State 143 */ new Array(  ),
	/* State 144 */ new Array(  ),
	/* State 145 */ new Array(  ),
	/* State 146 */ new Array(  ),
	/* State 147 */ new Array( 89/* RepetirInit */,152 ),
	/* State 148 */ new Array( 62/* Exp */,154 , 94/* ExpSum */,15 , 96/* ExpMult */,16 , 98/* ExpVal */,17 , 93/* Matriz */,22 , 81/* Read */,23 , 58/* LeftPar */,26 , 77/* FunctionCall */,27 , 80/* _Read */,29 ),
	/* State 149 */ new Array(  ),
	/* State 150 */ new Array(  ),
	/* State 151 */ new Array(  ),
	/* State 152 */ new Array( 60/* Bloque */,155 ),
	/* State 153 */ new Array(  ),
	/* State 154 */ new Array( 59/* RightPar */,156 ),
	/* State 155 */ new Array(  ),
	/* State 156 */ new Array(  ),
	/* State 157 */ new Array(  )
);



/* Symbol labels */
var labels = new Array(
	"Program'" /* Non-terminal symbol */,
	"WHITESPACE" /* Terminal symbol */,
	"SI" /* Terminal symbol */,
	"SINO" /* Terminal symbol */,
	"HACER" /* Terminal symbol */,
	"MIENTRAS" /* Terminal symbol */,
	"REPETIR" /* Terminal symbol */,
	"PORCADA" /* Terminal symbol */,
	"EN" /* Terminal symbol */,
	"FINICIO" /* Terminal symbol */,
	"FUNCION" /* Terminal symbol */,
	"RESPONDER" /* Terminal symbol */,
	"PREGUNTAR" /* Terminal symbol */,
	"DECIR" /* Terminal symbol */,
	"ESCUCHAR" /* Terminal symbol */,
	"TNUMERO" /* Terminal symbol */,
	"TLETRAS" /* Terminal symbol */,
	"TLOGICO" /* Terminal symbol */,
	"TMATRIZ" /* Terminal symbol */,
	"RAIZ" /* Terminal symbol */,
	"PI" /* Terminal symbol */,
	"E" /* Terminal symbol */,
	"{" /* Terminal symbol */,
	"}" /* Terminal symbol */,
	"[" /* Terminal symbol */,
	"]" /* Terminal symbol */,
	";" /* Terminal symbol */,
	"," /* Terminal symbol */,
	"=" /* Terminal symbol */,
	"!" /* Terminal symbol */,
	"==" /* Terminal symbol */,
	"!=" /* Terminal symbol */,
	"<>" /* Terminal symbol */,
	"<=" /* Terminal symbol */,
	">=" /* Terminal symbol */,
	">" /* Terminal symbol */,
	"<" /* Terminal symbol */,
	"+" /* Terminal symbol */,
	"-" /* Terminal symbol */,
	"/" /* Terminal symbol */,
	"*" /* Terminal symbol */,
	"%" /* Terminal symbol */,
	"^" /* Terminal symbol */,
	"(" /* Terminal symbol */,
	")" /* Terminal symbol */,
	"||" /* Terminal symbol */,
	"&&" /* Terminal symbol */,
	"LOGICO" /* Terminal symbol */,
	"IDENTIFICADOR" /* Terminal symbol */,
	"LETRAS" /* Terminal symbol */,
	"NUMERO" /* Terminal symbol */,
	"ProgramInit" /* Non-terminal symbol */,
	"VarDecs" /* Non-terminal symbol */,
	"GotoInicio" /* Non-terminal symbol */,
	"FunctionDecs" /* Non-terminal symbol */,
	"Inicio" /* Non-terminal symbol */,
	"Program" /* Non-terminal symbol */,
	"InicioInit" /* Non-terminal symbol */,
	"LeftPar" /* Non-terminal symbol */,
	"RightPar" /* Non-terminal symbol */,
	"Bloque" /* Non-terminal symbol */,
	"VarDecInit" /* Non-terminal symbol */,
	"Exp" /* Non-terminal symbol */,
	"VarDec" /* Non-terminal symbol */,
	"Var" /* Non-terminal symbol */,
	"Tipo" /* Non-terminal symbol */,
	"Param" /* Non-terminal symbol */,
	"ParamOpt" /* Non-terminal symbol */,
	"Args" /* Non-terminal symbol */,
	"ArgsOpt" /* Non-terminal symbol */,
	"FunctionInit" /* Non-terminal symbol */,
	"Function" /* Non-terminal symbol */,
	"Statements" /* Non-terminal symbol */,
	"Statement" /* Non-terminal symbol */,
	"Control" /* Non-terminal symbol */,
	"Asignacion" /* Non-terminal symbol */,
	"Regreso" /* Non-terminal symbol */,
	"FunctionCall" /* Non-terminal symbol */,
	"SpecialFunctions" /* Non-terminal symbol */,
	"AsigancionInit" /* Non-terminal symbol */,
	"_Read" /* Non-terminal symbol */,
	"Read" /* Non-terminal symbol */,
	"If" /* Non-terminal symbol */,
	"While" /* Non-terminal symbol */,
	"Foreach" /* Non-terminal symbol */,
	"DoWhile" /* Non-terminal symbol */,
	"IfInit" /* Non-terminal symbol */,
	"SinoInit" /* Non-terminal symbol */,
	"WhileInit" /* Non-terminal symbol */,
	"RepetirInit" /* Non-terminal symbol */,
	"ForeachInit" /* Non-terminal symbol */,
	"DoWhileInit" /* Non-terminal symbol */,
	"_Matriz" /* Non-terminal symbol */,
	"Matriz" /* Non-terminal symbol */,
	"ExpSum" /* Non-terminal symbol */,
	"OpRel" /* Non-terminal symbol */,
	"ExpMult" /* Non-terminal symbol */,
	"_ExpSum" /* Non-terminal symbol */,
	"ExpVal" /* Non-terminal symbol */,
	"_ExpMult" /* Non-terminal symbol */,
	"$" /* Terminal symbol */
);


	
	info.offset = 0;
	info.src = src;
	info.att = new String();
	
	if( !err_off )
		err_off	= new Array();
	if( !err_la )
	err_la = new Array();
	
	sstack.push( 0 );
	vstack.push( 0 );
	
	la = __FTlex( info );

	while( true )
	{
		act = 159;
		for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
		{
			if( act_tab[sstack[sstack.length-1]][i] == la )
			{
				act = act_tab[sstack[sstack.length-1]][i+1];
				break;
			}
		}

		if( FT_dbg_withtrace && sstack.length > 0 )
		{
			__FTdbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
							"\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
							"\tAction: " + act + "\n" + 
							"\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
									"..." : "" ) + "\"\n" +
							"\tStack: " + sstack.join() + "\n" +
							"\tValue stack: " + vstack.join() + "\n" );
		}
		
			
		//Panic-mode: Try recovery when parse-error occurs!
		if( act == 159 )
		{
			if( FT_dbg_withtrace )
				__FTdbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
			
			err_cnt++;
			err_off.push( info.offset - info.att.length );			
			err_la.push( new Array() );
			for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
				err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
			
			//Remember the original stack!
			var rsstack = new Array();
			var rvstack = new Array();
			for( var i = 0; i < sstack.length; i++ )
			{
				rsstack[i] = sstack[i];
				rvstack[i] = vstack[i];
			}
			
			while( act == 159 && la != 100 )
			{
				if( FT_dbg_withtrace )
					__FTdbg_print( "\tError recovery\n" +
									"Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
									"Action: " + act + "\n\n" );
				if( la == -1 )
					info.offset++;
					
				while( act == 159 && sstack.length > 0 )
				{
					sstack.pop();
					vstack.pop();
					
					if( sstack.length == 0 )
						break;
						
					act = 159;
					for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
					{
						if( act_tab[sstack[sstack.length-1]][i] == la )
						{
							act = act_tab[sstack[sstack.length-1]][i+1];
							break;
						}
					}
				}
				
				if( act != 159 )
					break;
				
				for( var i = 0; i < rsstack.length; i++ )
				{
					sstack.push( rsstack[i] );
					vstack.push( rvstack[i] );
				}
				
				la = __FTlex( info );
			}
			
			if( act == 159 )
			{
				if( FT_dbg_withtrace )
					__FTdbg_print( "\tError recovery failed, terminating parse process..." );
				break;
			}


			if( FT_dbg_withtrace )
				__FTdbg_print( "\tError recovery succeeded, continuing" );
		}
		
		/*
		if( act == 159 )
			break;
		*/
		
		
		//Shift
		if( act > 0 )
		{			
			if( FT_dbg_withtrace )
				__FTdbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
		
			sstack.push( act );
			vstack.push( info.att );
			
			la = __FTlex( info );
			
			if( FT_dbg_withtrace )
				__FTdbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
		}
		//Reduce
		else
		{		
			act *= -1;
			
			if( FT_dbg_withtrace )
				__FTdbg_print( "Reducing by producution: " + act );
			
			rval = void(0);
			
			if( FT_dbg_withtrace )
				__FTdbg_print( "\tPerforming semantic action..." );
			
switch( act )
{
	case 0:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 1:
	{
		 /* EMPTY */ 
	}
	break;
	case 2:
	{
		 current_node = root; 
	}
	break;
	case 3:
	{
		 current_node.checkQuad('GotoInicio'); 
	}
	break;
	case 4:
	{
		 /* EMPTY */ 
	}
	break;
	case 5:
	{
		 current_node = current_node.addNode(new NODE('inicio')); current_node.checkQuad('Inicio') 
	}
	break;
	case 6:
	{
		 current_node.checkQuad('ExpAssign'); 
	}
	break;
	case 7:
	{
		 /* EMPTY */ 
	}
	break;
	case 8:
	{
		 pila_operandos.push(vstack[ vstack.length - 2 ]); pila_operadores.push(OP_ASSIGN); 
	}
	break;
	case 9:
	{
		 rval = current_node.addVariable(new VARIABLE(vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ])); 
	}
	break;
	case 10:
	{
		 /* EMPTY */ 
	}
	break;
	case 11:
	{
		 /* EMPTY */ 
	}
	break;
	case 12:
	{
		 /* EMPTY */ 
	}
	break;
	case 13:
	{
		 /* EMPTY */ 
	}
	break;
	case 14:
	{
		 current_node.addParameter(vstack[ vstack.length - 1 ]); 
	}
	break;
	case 15:
	{
		 current_node.addParameter(vstack[ vstack.length - 1 ]); 
	}
	break;
	case 16:
	{
		 rval = vstack[ vstack.length - 1 ]; 
	}
	break;
	case 17:
	{
		 rval = []; 
	}
	break;
	case 18:
	{
		 rval = vstack[ vstack.length - 3 ].push(pila_operandos.pop()); 
	}
	break;
	case 19:
	{
		 rval = [pila_operandos.pop()]; 
	}
	break;
	case 20:
	{
		
																	pila_operandos.push(current_node.addVariable(new VARIABLE(_.uniqueId('_const_'), OP_NUMBER, 0)));
																	current_node.checkQuad('Return');
																
	}
	break;
	case 21:
	{
		 current_node = current_node.addNode(new NODE(vstack[ vstack.length - 1 ], vstack[ vstack.length - 2 ])); 
	}
	break;
	case 22:
	{
		 current_node = current_node.addNode(new NODE(vstack[ vstack.length - 1 ])); 
	}
	break;
	case 23:
	{
		 current_node = current_node.parent; 
	}
	break;
	case 24:
	{
		 /* EMPTY */ 
	}
	break;
	case 25:
	{
		 /* EMPTY */ 
	}
	break;
	case 26:
	{
		 /* EMPTY */ 
	}
	break;
	case 27:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 28:
	{
		 /* EMPTY */ 
	}
	break;
	case 29:
	{
		 /* EMPTY */ 
	}
	break;
	case 30:
	{
		 /* EMPTY */ 
	}
	break;
	case 31:
	{
		 /* EMPTY */ 
	}
	break;
	case 32:
	{
		 /* EMPTY */ 
	}
	break;
	case 33:
	{
		 /* EMPTY */ 
	}
	break;
	case 34:
	{
		 /* EMPTY */ 
	}
	break;
	case 35:
	{
		 current_node.checkQuad('ExpAssign'); 
	}
	break;
	case 36:
	{
		 pila_operandos.push(current_node.useVariable(vstack[ vstack.length - 2 ])); pila_operadores.push(OP_ASSIGN); 
	}
	break;
	case 37:
	{
		 current_node.checkQuad('Return'); 
	}
	break;
	case 38:
	{
		
																	pila_operandos.push(current_node.callFunction(vstack[ vstack.length - 4 ]));
																	pila_operandos.push(vstack[ vstack.length - 2 ]);
																	rval = current_node.checkQuad('FunCall');
																
	}
	break;
	case 39:
	{
		 pila_operadores.push(OP_SPEAK); current_node.checkQuad('Speak');  
	}
	break;
	case 40:
	{
		 pila_operadores.push(OP_LISTEN); current_node.checkQuad('Listen'); 
	}
	break;
	case 41:
	{
		 pila_operadores.push(OP_SPEAK); current_node.checkQuad('Ask');  
	}
	break;
	case 42:
	{
		 pila_operadores.push(OP_LISTEN); 
	}
	break;
	case 43:
	{
		 /* EMPTY */ 
	}
	break;
	case 44:
	{
		 /* EMPTY */ 
	}
	break;
	case 45:
	{
		 /* TODO  */ 
	}
	break;
	case 46:
	{
		 /* EMPTY */ 
	}
	break;
	case 47:
	{
		 current_node.checkQuad("EndIf"); 
	}
	break;
	case 48:
	{
		 current_node.checkQuad("EndElse"); 
	}
	break;
	case 49:
	{
		 current_node.checkQuad("EndElse"); 
	}
	break;
	case 50:
	{
		 current_node.checkQuad('If'); 
	}
	break;
	case 51:
	{
		 current_node.checkQuad('Else'); 
	}
	break;
	case 52:
	{
		 current_node.checkQuad('EndWhile'); 
	}
	break;
	case 53:
	{
		 pila_saltos.push(TYRION.quads.length); 
	}
	break;
	case 54:
	{
		 current_node.checkQuad('While'); 
	}
	break;
	case 55:
	{
		 /* TODO */ 
	}
	break;
	case 56:
	{
		 current_node.useVariable(vstack[ vstack.length - 1 ]); current_node.addVariable(vstack[ vstack.length - 3 ]); 
	}
	break;
	case 57:
	{
		 current_node.checkQuad("EndDoWhile"); 
	}
	break;
	case 58:
	{
		 current_node.checkQuad("DoWhile"); 
	}
	break;
	case 59:
	{
		 rval = OP_STRING; 
	}
	break;
	case 60:
	{
		 rval = OP_NUMBER; 
	}
	break;
	case 61:
	{
		 rval = OP_BOOL; 
	}
	break;
	case 62:
	{
		 rval = OP_ARRAY; 
	}
	break;
	case 63:
	{
		
																	pila_operandos.push(current_node.useVariable(vstack[ vstack.length - 2 ]));
																	pila_operandos.push(vstack[ vstack.length - 1 ]);
																	current_node.checkQuad("Matriz");
																
	}
	break;
	case 64:
	{
		 rval = vstack[ vstack.length - 4 ].push(pila_operandos.pop());
	}
	break;
	case 65:
	{
		 rval = [pila_operandos.pop()]; 
	}
	break;
	case 66:
	{
		 current_node.checkQuad('ExpRel'); 
	}
	break;
	case 67:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 68:
	{
		 /* EMPTY */ 
	}
	break;
	case 69:
	{
		 current_node.checkQuad('ExpSum'); 
	}
	break;
	case 70:
	{
		 current_node.checkQuad('ExpSum'); pila_operadores.push(OP_ADD); 
	}
	break;
	case 71:
	{
		 current_node.checkQuad('ExpSum'); pila_operadores.push(OP_SUB); 
	}
	break;
	case 72:
	{
		 current_node.checkQuad('ExpSum'); pila_operadores.push(OP_OR); 
	}
	break;
	case 73:
	{
		 /* EMPTY */ 
	}
	break;
	case 74:
	{
		 current_node.checkQuad('ExpMult'); 
	}
	break;
	case 75:
	{
		 current_node.checkQuad('ExpMult'); pila_operadores.push(OP_MULT); 
	}
	break;
	case 76:
	{
		 current_node.checkQuad('ExpMult'); pila_operadores.push(OP_DIV); 
	}
	break;
	case 77:
	{
		 current_node.checkQuad('ExpMult'); pila_operadores.push(OP_AND); 
	}
	break;
	case 78:
	{
		 pila_operandos.push(current_node.useVariable(vstack[ vstack.length - 1 ])); 
	}
	break;
	case 79:
	{
		 pila_operandos.push(current_node.addVariable(new VARIABLE(_.uniqueId('_const_'), OP_NUMBER, vstack[ vstack.length - 1 ])));
	}
	break;
	case 80:
	{
		 pila_operandos.push(current_node.addVariable(new VARIABLE(_.uniqueId('_const_'), OP_STRING, vstack[ vstack.length - 1 ])));
	}
	break;
	case 81:
	{
		 pila_operandos.push(current_node.addVariable(new VARIABLE(_.uniqueId('_const_'), OP_BOOL, vstack[ vstack.length - 1 ])));
	}
	break;
	case 82:
	{
		 /* TODO  */ 
	}
	break;
	case 83:
	{
		 /* EMPTY */ 
	}
	break;
	case 84:
	{
		 pila_operandos.push(current_node.addVariable(new VARIABLE(_.uniqueId('_const_'), OP_NUMBER, Math.PI))); 
	}
	break;
	case 85:
	{
		 pila_operandos.push(current_node.addVariable(new VARIABLE(_.uniqueId('_const_'), OP_NUMBER, Math.E))); 
	}
	break;
	case 86:
	{
		 /* EMPTY */ 
	}
	break;
	case 87:
	{
		 pila_operandos.push(vstack[ vstack.length - 1 ]);
	}
	break;
	case 88:
	{
		 pila_operadores.push(Left_Par); 
	}
	break;
	case 89:
	{
		 pila_operadores.pop(); 
	}
	break;
	case 90:
	{
		 pila_operadores.push(OP_EQ); 
	}
	break;
	case 91:
	{
		 pila_operadores.push(OP_DIFF); 
	}
	break;
	case 92:
	{
		 pila_operadores.push(OP_DIFF); 
	}
	break;
	case 93:
	{
		 pila_operadores.push(OP_LT_EQ); 
	}
	break;
	case 94:
	{
		 pila_operadores.push(OP_GT_EQ); 
	}
	break;
	case 95:
	{
		 pila_operadores.push(OP_GT); 
	}
	break;
	case 96:
	{
		 pila_operadores.push(OP_LT); 
	}
	break;
}



			if( FT_dbg_withtrace )
				__FTdbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
				
			for( var i = 0; i < pop_tab[act][1]; i++ )
			{
				sstack.pop();
				vstack.pop();
			}
									
			go = -1;
			for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
			{
				if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
				{
					go = goto_tab[sstack[sstack.length-1]][i+1];
					break;
				}
			}
			
			if( act == 0 )
				break;
				
			if( FT_dbg_withtrace )
				__FTdbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
				
			sstack.push( go );
			vstack.push( rval );			
		}
		
		if( FT_dbg_withtrace )
		{		
			alert( FT_dbg_string );
			FT_dbg_string = new String();
		}
	}

	if( FT_dbg_withtrace )
	{
		__FTdbg_print( "\nParse complete." );
		alert( FT_dbg_string );
	}
	
	return err_cnt;
}



if(str.length > 0) {
	var error_cnt = 0;
	var error_off = new Array();
	var error_la = new Array();
	if((error_cnt = __FTparse(str, error_off, error_la)) > 0) {
		for(var i = 0; i < error_cnt; i++ ) {
			IO.print( "Parse error near >" + str.substr( error_off[i], 30 ) + "<, expecting \"" + error_la[i].join() + "\"" );
		}
		return "";
	} else {
		var quads = JSON.stringify(TYRION.quads);
		return quads;
	}
} else {
	IO.print( 'Usage: TYRION(source_code)' );
	return "";
}
};

