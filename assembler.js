directiveTable = [{
	name: 'BYTE',
	size: 1
},{
	name: 'Word',
	size: 2
},{
	name: 'DOUBLEWORD',
	size: 4
},{
	name: 'END',
	size: 0
},{
	name: 'SEGMENT',
	size: 0
}];

machineInstructionTable = [{
	name: 'MOV',
	size: 4
},{
	name: 'JMP',
	size: 4
},{
	name: 'ADD',
	size: 8
},{
	name: 'SUB',
	size: 8
},{
	name: 'ADC',
	size: 8
},{
	name: 'SBB',
	size: 8
},{
	name: 'LOOP',
	size: 4
}];

var symbolTable = [];

function parseInstruction(instruction){
	
	var arr = instruction.split(" ");
	var parsedInstruction = {
		label: '',
		opcode: '',
		indirect: false
	};

	instruction.trim();
	for(var i = 0; i < instruction.length; i++){
		if(instruction[i] == ':'){
			parsedInstruction.label = instruction.substr(0, i);
			instruction = instruction.substr(i+1);
			break;
		}else if(instruction[i] == ' '){
			parsedInstruction.opcode = instruction.substr(0, i).toUpperCase();
			instruction = instruction.substr(i+1);
			break;
		}
	}

	instruction.trim();
	if(parsedInstruction.label != ''){
		for(var i = 0; i < instruction.length; i++){
			if(instruction[i] == ' '){
				parsedInstruction.opcode = instruction.substr(0, i).toUpperCase();
				instruction = instruction.substr(i+1);
				break;
			}
		}
	}

	if(parsedInstruction.opcode == '')parsedInstruction.opcode = instruction.toUpperCase();
	else{
		var patt = /\[[^\]]*\]/;
		if(patt.test(instruction)){
			parsedInstruction.indirect = true;
		}
	}

	return parsedInstruction;
	
}

function findLabel(label){
	for(var i = 0; i < symbolTable.length; i++){
		if(label == symbolTable[i].name)return true;
	}
	return false;
}

function updateSymbolTable(object){
	for(var i = 0; i < symbolTable.length; i++){
		if(object.name == symbolTable[i].name){
			for(var propertyName in object) {
				if(propertyName != 'name'){
					symbolTable[i][propertyName] = object[propertyName];
				}
			}				
		}
	}
}

function check(table, opcode){
	for(var i = 0; i < table.length; i++){
		if(opcode == table[i].name){
			return true;				
		}
	}
	return false;
}

function getSize(table, opcode){
	for(var i = 0; i < table.length; i++){
		if(opcode == table[i].name){
			return table[i].size;				
		}
	}
	return 0;
}

function pass1(source){
	let lc = 0,
		parsedInstruction;
	for(var i = 0; i < source.length; i++){
		parsedInstruction = parseInstruction(source[i]);
		if(parsedInstruction.label != ''){
			if(findLabel(parsedInstruction.label, symbolTable)){
				return false
			}else{
				symbolTable.push({
					name: parsedInstruction.label,
					type: 'label',
					size: 0,
					Location:lc
				});
			}
		}
		if(check(directiveTable, parsedInstruction.opcode)){
			if(parsedInstruction.opcode == 'END'){
				return true;
			}else if(parsedInstruction.opcode == 'SEGMENT'){
				update(symbolTable, {
					name: parsedInstruction.label,
					type: parsedInstruction.opcode
				})
				lc = 0;
			}else{
				let size = getSize(directiveTable, parsedInstruction.opcode);
				update(symbolTable, {
					name: parsedInstruction.label,
					type: parsedInstruction.opcode,
					size: size
				})
				lc += size;
			}
		}else if(check(machineInstructionTable, parsedInstruction.opcode)){
			lc += getSize(machineInstructionTable, parsedInstruction.opcode);
		}else{
			return false;
		}
	}
	return true;
}