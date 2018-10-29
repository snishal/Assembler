var svgDocument, source, lc, currentInstruction = 0, parsedInstruction;

var state = [], currState = -1, nextState = 0;

function loadCode(){
	svgDocument = document.getElementById('svg').firstElementChild.getSVGDocument();
	var code = JSON.parse(sessionStorage.getItem('code'));
	if(code){
		var lineNumber = 1;
		var lineNumbers = '<div id="lineNumber">';
		var sourceDiv = '<div id="source">';
		code.forEach(function(currentValue){
			if(currentValue != ''){
				lineNumbers += '<p>' + lineNumber + '</p>';
				sourceDiv += '<p id="' + lineNumber + '">' + currentValue + '</p>';
				lineNumber++;
			}
		});
		lineNumbers += '</div>';
		sourceDiv += '</div>';
		document.getElementById('code').innerHTML = lineNumbers + sourceDiv;
	}else{
		document.location.href = '/';
	}
	source = code;
}
 
function buildSymbolTable(){
	var table = '';
	symbolTable.forEach(function(object){
		table += '<tr>';
		table += '<td>' + object.name + '</td>';
		table += '<td>' + object.type + '</td>';
		table += '<td>' + object.size + '</td>';
		table += '<td>' + object.location + '</td>';
		table += '</tr>'; 
	});
	document.getElementById('symbolTable').innerHTML = table;
}

func = [
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = 1;
	},
	function(){
		lc = 0;
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = 2;
	},
	function(){
		if(currentInstruction == source.length){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			nextState = -1;
		}else{
			if(currentInstruction == 0){
				line = document.getElementById(currentInstruction + 1);
				line.style.backgroundColor = 'lightgrey';
				var code = document.getElementById('code');
				code.scroll(0, line.offsetTop - document.getElementById(1).offsetTop);
			}else{
				line = document.getElementById(currentInstruction);
				line.style.backgroundColor = 'white';
				nextLine = document.getElementById(currentInstruction + 1);
				nextLine.style.backgroundColor = 'lightgrey';
				var code = document.getElementById('code');
				code.scroll(0, nextLine.offsetTop - document.getElementById(1).offsetTop);
			}
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 3;
		}
	},
	function(){
		parsedInstruction = parseInstruction(source[currentInstruction++]);
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = 4;
	},
	function(){
		if(parsedInstruction.label != ''){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			nextState = 5;
		}else{
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 8;
		}
	},
	function(){
		if(findLabel(parsedInstruction.label)){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			nextState = 6;
		}else{
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 7;
		}
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = -1;
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		symbolTable.push({
			name: parsedInstruction.label,
			type: 'label',
			size: 0,
			location:lc
		});
		buildSymbolTable();
		nextState = 8;
	},
	function(){
		if(check(directiveTable, parsedInstruction.opcode)){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			nextState = 9;
		}else{
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 16;
		}
	},
	function(){
		if(parsedInstruction.opcode == 'END'){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			nextState = 10;
		}else{
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 11; 
		}
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = -1;
	},
	function(){
		if(parsedInstruction.opcode == 'SEGMENT'){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			updateSymbolTable({
				name: parsedInstruction.label,
				type: parsedInstruction.opcode
			})
			nextState = 12;
		}else{
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 14;
		}
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		buildSymbolTable();
		nextState = 13;
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		lc = 0;
		nextState = 2;
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		size = getSize(directiveTable, parsedInstruction.opcode);
		updateSymbolTable({
			name: parsedInstruction.label,
			type: parsedInstruction.opcode,
			size: size
		})
		buildSymbolTable();
		lc += size;
		nextState = 15;
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = 2;
	},
	function(){
		if(check(machineInstructionTable, parsedInstruction.opcode)){
			svgDocument.getElementById('state' + currState).style.stroke = 'green';
			nextState = 17;
		}else{
			svgDocument.getElementById('state' + currState).style.stroke = 'red';
			nextState = 18;
		}	
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		lc += getSize(machineInstructionTable, parsedInstruction.opcode);
		if(parsedInstruction.indirect)lc += 2;
		nextState = 2;
	},
	function(){
		svgDocument.getElementById('state' + currState).style.stroke = 'green';
		nextState = -1;
	}
];

function prev(){

	var temp = state.pop();
	if(temp){
		svgDocument.getElementById('state' + currState).style.stroke = '';
		currState = temp.state;
		if(currState == 3){
			currentInstruction--;	
		}
		var t = svgDocument.getElementById('state' + currState).getBoundingClientRect();
		svgDiv = document.getElementById('svg');
		svgDiv.scroll(t.left - 20, t.top -20);
		symbolTable = temp.table;
		buildSymbolTable();
		func[currState]();
	}

}

function next(){
	if(nextState != -1){
		if(currState != -1){
			svgDocument.getElementById('state' + currState).style.stroke = '';
			state.push({
				state : currState,
				table : Array.from(symbolTable)
			});
		}
		var t = svgDocument.getElementById('state' + nextState).getBoundingClientRect();
		svgDiv = document.getElementById('svg');
		svgDiv.scroll(t.left - 20, t.top -20);
		currState = nextState;
		func[currState]();
	}
}