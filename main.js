var svgDocument, source, prevState = -1, state = 0, lc, currentInstruction = 0, parsedInstruction;

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
	})
	document.getElementById('symbolTable').innerHTML = table;
}

function prev(){
	/*if(lineNum > 1){
		line = document.getElementById(lineNum);
		line.innerHTML = line.innerHTML.replace("⇒ ", "");
		lineNum--;
		line = document.getElementById(lineNum);
		line.innerHTML = "⇒ " + line.innerHTML;
		var code = document.getElementById('code');
		code.scroll(0, line.offsetTop - document.getElementById(1).offsetTop);
	}*/
}

func = [
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = 1;
	},
	function(){
		lc = 0;
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = 2;
	},
	function(){
		if(currentInstruction == source.length){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			state = -1;
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
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 3;
		}
	},
	function(){
		parsedInstruction = parseInstruction(source[currentInstruction++]);
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = 4;
	},
	function(){
		if(parsedInstruction.label != ''){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			state = 5;
		}else{
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 8;
		}
	},
	function(){
		if(findLabel(parsedInstruction.label)){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			state = 6;
		}else{
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 7;
		}
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = -1;
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		symbolTable.push({
			name: parsedInstruction.label,
			type: 'label',
			size: 0,
			location:lc
		});
		buildSymbolTable();
		state = 8;
	},
	function(){
		if(check(directiveTable, parsedInstruction.opcode)){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			state = 9;
		}else{
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 16;
		}
	},
	function(){
		if(parsedInstruction.opcode == 'END'){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			state = 10;
		}else{
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 11; 
		}
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = -1;
	},
	function(){
		if(parsedInstruction.opcode == 'SEGMENT'){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			updateSymbolTable({
				name: parsedInstruction.label,
				type: parsedInstruction.opcode
			})
			state = 12;
		}else{
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 14;
		}
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		buildSymbolTable();
		state = 13;
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		lc = 0;
		state = 2;
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		size = getSize(directiveTable, parsedInstruction.opcode);
		updateSymbolTable({
			name: parsedInstruction.label,
			type: parsedInstruction.opcode,
			size: size
		})
		buildSymbolTable();
		lc += size;
		state = 15;
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = 2;
	},
	function(){
		if(check(machineInstructionTable, parsedInstruction.opcode)){
			svgDocument.getElementById('state' + state).style.stroke = 'green';
			state = 17;
		}else{
			svgDocument.getElementById('state' + state).style.stroke = 'red';
			state = 18;
		}	
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		lc += getSize(machineInstructionTable, parsedInstruction.opcode);
		state = 2;
	},
	function(){
		svgDocument.getElementById('state' + state).style.stroke = 'green';
		state = -1;
	}
];

function next(){
	if(state != -1){
		if(prevState != -1){
			svgDocument.getElementById('state' + prevState).style.stroke = '';
		}
		prevState = state;
		var t = svgDocument.getElementById('state' + state).getBoundingClientRect();
		svgDiv = document.getElementById('svg');
		svgDiv.scroll(t.left - 20, t.top -20);
		func[state]();
	}
}