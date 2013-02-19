var obj = {};

(function()
{
	// set up knockout viewmodel that does all the data management

	var vm = {
		Participants: ko.observableArray(),
		Entries: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
		WheelExists: ko.observable(),
		Winner: ko.observable("")
	};

	vm.ParticipantCount = ko.computed(function() { return vm.Participants().length; });

	vm.AddParticipant = function()
	{
		vm.Participants.push({Name: "", Entries: 1});

	};
	vm.RemoveParticpant = function(data)
	{
		vm.Participants.remove(data);
	};
	vm.GenerateWheel = function()
	{
		drawRouletteWheel();
	};
	vm.Spin = function()
	{
		spin();
	}

	ko.applyBindings(vm);
	obj.ViewModel = vm;


	// set up wheel
	/// large portions of this code taken from: http://www.switchonthecode.com/tutorials/creating-a-roulette-wheel-using-html5-canvas

	var colors = ["#3FB618", "#FF0039", "#FF7518", "#9954BB",
             "#007FFF", "#73C9E3", "#EDE55A", "#BEADED"];

	var startAngle = 0;
	var arc = Math.PI / 6;
	var spinTimeout = null;

	var spinArcStart = 10;
	var spinTime = 0;
	var spinTimeTotal = 0;

	var ctx;

	var canvasWidth = 0;
	var canvasHeight = 0;

	var wheelEntries = [];
	var mark = 0;
	    
	function drawRouletteWheel() {
		var containerWidth =  $(".wheel-home").outerWidth();
		var containerHeight = $(".wheel-home").outerHeight();
		var base = 500;
		if (containerWidth < 500) base = containerWidth;
		mark = parseInt(base / 2);

		var canvas = document.getElementById("canvas");
		if (canvas.getContext) {
			var outsideRadius = parseInt(mark * 0.8);
			var textRadius = parseInt(outsideRadius * 0.8);
			var insideRadius = 25;

			ctx = canvas.getContext("2d");
			ctx.clearRect(0,0,canvasWidth,canvasHeight);


			ctx.strokeStyle = "white";
			ctx.lineWidth = 2;

			ctx.font = 'bold ' + (0.04 * base) + 'px Helvetica, Arial';

			wheelEntries = [];
			for (var i = 0; i < vm.Participants().length; i++) {
				for (var j = 0; j < vm.Participants()[i].Entries; j++) {
					wheelEntries.push(vm.Participants()[i].Name);
				};
			};

			//wheelEntries.sort(function() {return 0.5 - Math.random()}); // randomize sort

			arc = Math.PI / (wheelEntries.length / 2);

			for(var i = 0; i < wheelEntries.length; i++) {

			  var angle = startAngle + i * arc;
			  ctx.fillStyle = colors[(i > 7 ?  i % 8 : i)];
			  
			  ctx.beginPath();
			  ctx.arc(mark, mark, outsideRadius, angle, angle + arc, false);
			  ctx.arc(mark, mark, insideRadius, angle + arc, angle, true);
			  ctx.stroke();
			  ctx.fill();
			  
			  ctx.save();
			  //ctx.shadowOffsetX = -1;
			  //ctx.shadowOffsetY = -1;
			  //ctx.shadowBlur    = 0;
			  //ctx.shadowColor   = "rgb(220,220,220)";
			  ctx.fillStyle = "white";
			  ctx.translate(mark + Math.cos(angle + arc / 2) * textRadius, 
			                mark + Math.sin(angle + arc / 2) * textRadius);
			  ctx.rotate(angle + arc / 2 + Math.PI / 2);
			  var text = wheelEntries[i];
			  ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
			  ctx.restore();
			} 

			//Arrow
			ctx.fillStyle = "black";
			ctx.beginPath();
			ctx.moveTo(mark - 4, mark - (outsideRadius + 5));
			ctx.lineTo(mark + 4, mark - (outsideRadius + 5));
			ctx.lineTo(mark + 4, mark - (outsideRadius - 5));
			ctx.lineTo(mark + 9, mark - (outsideRadius - 5));
			ctx.lineTo(mark + 0, mark - (outsideRadius - 13));
			ctx.lineTo(mark - 9, mark - (outsideRadius - 5));
			ctx.lineTo(mark - 4, mark - (outsideRadius - 5));
			ctx.lineTo(mark - 4, mark - (outsideRadius + 5));
			ctx.fill();

			canvasWidth = containerWidth;
			canvasHeight = containerHeight;

			vm.WheelExists(true);
		}
	}
	    
	function spin() {
		vm.Winner("");
		spinAngleStart = Math.random() * 10 + 10;
		spinTime = 0;
		spinTimeTotal = ((Math.random() * 20) + 4) * 1000;
		rotateWheel();
	}

	function rotateWheel() {
		spinTime += 30;
		if(spinTime >= spinTimeTotal) {
			stopRotateWheel();
			return;
		}
		var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
		startAngle += (spinAngle * Math.PI / 180);
		drawRouletteWheel();
		spinTimeout = setTimeout(function() { rotateWheel() }, 30);
	}

	function stopRotateWheel() {
		clearTimeout(spinTimeout);
		var degrees = startAngle * 180 / Math.PI + 90;
		var arcd = arc * 180 / Math.PI;
		var index = Math.floor((360 - degrees % 360) / arcd);
		ctx.save();
		//ctx.fillStyle = "black";
		//ctx.font = 'bold 30px Helvetica, Arial';
		vm.Winner(wheelEntries[index] + " wins!");
		//ctx.fillText(text, mark - ctx.measureText(text).width / 2, mark + 10);
		//ctx.restore();
	}

	function easeOut(t, b, c, d) {
		var ts = (t/=d)*t;
		var tc = ts*t;
		return b+c*(tc + -3*ts + 3*t);
	}
})()