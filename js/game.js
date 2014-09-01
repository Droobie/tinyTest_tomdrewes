var	 width = 1024,
 	 height = 600,
 	 towerWidth = 350,
	 gLoop,
	 etageHeight = 75,
	 totalEtages = 0,
	 etageArr = [],
	 etageButton,
	 elevator,
	 elevatorWidth = 60,
	 elevatorButtons = [],
	 personArr = [],
	 money = 1000,
 	 canv = document.getElementById('canv'),
	 ctx = canv.getContext('2d'),
	 moneyHandler,
	 moneyAmount = 0;
canv.width = width;
canv.height = height;

$(document).ready(function()
{
   init();
});

function init()
{
	createLevel();
	setEvents();
	gLoop = setInterval( gameLoop, 1000/50 );
}

var gameLoop = function()
{
	clear();
	etageArr.forEach(function(etage) {
		etage.draw();
	});
	etageButton.draw();
	elevator.move();
	elevator.draw();
	elevatorButtons.forEach(function(button) {
		button.draw();
	});
	personArr.forEach(function(person) {
		person.setPosition();
		person.draw();
	});

	// show amount of money
	moneyHandler.draw();
}

function createLevel() {
	etageButton = new EtageButton();
	elevator = new Elevator();
	elevatorButtons.push(new ElevatorButton(false), new ElevatorButton(true))
	setEtage();

	moneyHandler = new MoneyHandler();

	//temporary at start, needs to be at random later => 3 seconds to give us time to build some etages
	setTimeout(function() { spawnPerson(); }, 3000)
}

function setEvents() {
	canv.addEventListener('mousedown', onMouseDown);
	canv.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(e) {
	var oL = e.pageX-$(canv).offset().left; //make vars here for readability
	var oT = e.pageY-$(canv).offset().top;
	//check if click on new etage button
	if(oL > etageButton.X && oL < etageButton.X + 150 && oT > etageButton.Y && oT < etageButton.Y+30) {
		setEtage();
		moneyHandler.subtract("boughtFloor");
	}
	elevatorButtons.forEach(function(button) {
		if(oL > button.X && oL < button.X + 50 && oT > button.Y && oT < button.Y+50) {
			elevator.isMoving = true;
			elevator.goingUp = button.isUp;
			elevator.speed = 2;
			elevator.isSnapping = false;
		}
	});
}
function onMouseUp(e) {
	var oL = e.pageX-$(canv).offset().left; //make vars here for readability
	var oT = e.pageY-$(canv).offset().top;
	elevatorButtons.forEach(function(button) {
		if(oL > button.X && oL < button.X + 50 && oT > button.Y && oT < button.Y+50) {
			elevator.isSnapping = true;
		}
	});
}

function setEtage() {
	totalEtages++;
	etageArr.push(new Etage());
	etageButton.setNewPosition();
}

var Etage = function() {
	this.color = getRandomColor();
	this.etageNum = totalEtages;
	this.X = (width/2) - (towerWidth/2);
	this.Y = height-(this.etageNum*etageHeight);
	this.draw = function() {
		//draw the sprite here instead
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.X, this.Y, towerWidth, etageHeight);
		ctx.closePath();
		ctx.fill();
	}
}
var Person = function() {
	this.X = etageArr[0].X + 20;
	this.Y = height - 50;
	this.color = getRandomColor();
	this.speed = 1;
	this.xDest = 0;
	this.newDestSet = false;
	this.wantedEtage = (Math.ceil(Math.random()*(totalEtages-1)))+1; //+1 so bottom level is excluded
	//keep this log, else you don't know where they want to go
	console.log('i want to go to:' + this.wantedEtage);
	this.inElevator = false;
	this.inEtage = false;

	this.draw = function() {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.X, this.Y, 25, 50);
		ctx.closePath();
		ctx.fill();
	}
	this.setPosition = function() {
		var self = this;
		if(this.inElevator) {
			this.X = elevator.X+(elevatorWidth/2)-12;
			this.Y = elevator.Y+etageHeight-50;
		} else if(this.inEtage) {
			if(this.X == this.xDest && !this.newDestSet) {
				this.newDestSet = true;
				this.speed = 0;
				setTimeout(function() { self.getNewDestination(); }, 3000);
			} else {
				this.X += this.speed;
			}
		}
	}
	this.getNewDestination = function() {
		this.xDest = Math.ceil(etageArr[this.wantedEtage-1].X + Math.random()*(towerWidth-50));
		if(this.xDest < this.X) this.speed = -1
		else this.speed = 1;
		this.newDestSet = false;

		moneyHandler.add("floorProfit"); // Temporary! Move it when correct game mechanic is available.
	}
	this.enterElevator = function() {
		this.inElevator = true;
	}
	this.leaveElevator = function() {
		this.inElevator = false;
		this.inEtage = true;
		this.X = this.X + 50;
		this.getNewDestination();
	}
}
function spawnPerson() {
	personArr.push(new Person())
	elevator.personIsWaiting = true;
}
var Elevator = function() {
	this.X = (width/2) - (towerWidth/2) - elevatorWidth;
	this.Y = height-etageHeight;
	this.speed = 2;
	this.isMoving = false;
	this.isSnapping = false;
	this.isPopulated = false;
	this.currentPerson;
	this.personIsWaiting = false
	this.currentEtage;
	this.goingUp = false;
	this.draw = function() {
		ctx.fillStyle = '#FF0000';
		ctx.beginPath();
		ctx.rect(this.X, this.Y, elevatorWidth, etageHeight);
		ctx.closePath();
		ctx.fill();
	}
	this.move = function() {
		if(this.isMoving) {
			if(!this.isSnapping) {
				//The elevator is moving normally, just keep going!
				if(this.goingUp)
					this.Y -= this.speed;
				else
					this.Y += this.speed;

				//You can't go lower then ground level #doh
				if(this.Y+etageHeight > height) this.Y = height-etageHeight;
				//You cant go higher then the highest level #doh
				if(this.Y <  height-(totalEtages*etageHeight)) this.Y = height-(totalEtages*etageHeight);
			} else {
				var self = this;
				etageArr.forEach(function(etage) {
					//something is going wrong here, he takes one etage higher then expected
					if(etage.Y < self.Y && self.goingUp || etage.Y > self.Y && !self.goingUp) {
						if(self.Y-2 < etage.Y && self.Y+2 > etage.Y) {
							self.Y = etage.Y;
							self.isSnapping = false;
							self.isMoving = false;
							self.speed = 2;
							self.currentEtage = etage;
							if(self.isPopulated)
								self.checkPerson();

							moneyHandler.add("elevatorTip");
						}
						if(self.isSnapping) {
							self.speed -= 0.015; //needs tweaking for easing
							if(self.speed < 0.2) self.speed = 0.2;
						}
					}
				});
				if(this.isSnapping) {
					if(this.goingUp)
						this.Y -= this.speed;
					else
						this.Y += this.speed;
				}
			}
		} else if(this.Y == height-etageHeight) {
			if(this.personIsWaiting) {
				personArr[personArr.length-1].enterElevator();
				this.currentPerson = personArr[personArr.length-1];
				this.isPopulated = true;
			}
		}
	}
	this.checkPerson = function() {
		if(this.currentEtage.etageNum == this.currentPerson.wantedEtage) {
			this.currentPerson.leaveElevator();
			this.personIsWaiting = false;
			setTimeout(function() { spawnPerson(); }, 3000)
		}
	}
}

var ElevatorButton = function(up) {
	this.X = (width/2) - (towerWidth/2) - (elevatorWidth*2);
	this.isUp = up;
	if(up)
		this.Y = height-110;
	else
		this.Y = height-50;
	this.draw = function() {
		ctx.fillStyle = '#000000';
		ctx.beginPath();
		ctx.rect(this.X, this.Y, 50, 50);
		ctx.closePath();
		ctx.fill();
	}
}

var EtageButton = function() {
	this.X = (width/2) - 75;
	this.Y = 0;
	this.draw = function() {
		ctx.fillStyle = '#000000';
		ctx.beginPath();
		ctx.rect(this.X, this.Y, 150, 30);
		ctx.closePath();
		ctx.fill();
	}
	this.setNewPosition = function() {
		this.Y = height-(totalEtages*etageHeight)-50;
	}
}

// keeps track of the amount of money the player has
var MoneyHandler = function(){

	this.draw = function(){
		ctx.fillStyle = "black";
		ctx.font = "bold 16px Arial";
		ctx.fillText("Cash: "+moneyAmount, 10, 20);
	}
	this.add = function(kindOfAddition){
		// console.log('moneyHandler.add called: ' + moneyAmount);

		switch (kindOfAddition){
			case "elevatorTip":
				// tips the player gets from bringing people to the right floor
				moneyAmount += 10;
				break;
			case "floorProfit":
				// profit made from the stocked and active floors
				moneyAmount += this.giveMeRandom(1,6);
				break;

			default:
				console.warn('Er gaat iets mis met moneyHandler.add!');
		}
	}
	this.subtract = function(kindOfSubtraction){
		// console.log('moneyHandler.subtract called');

		switch (kindOfSubtraction){
			case "boughtFloor":
				moneyAmount -= 1000;
				break;
			case "thieves":

				break;

			default:
				console.warn('Er gaat iets mis met moneyHandler.subtract!');
		}
	}
	this.checkBalance = function(balance){
		if(balance < 0){
			// game over?
		}
	}
	// generates random number
	this.giveMeRandom = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

var clear = function()
{
	ctx.fillStyle = '#FFFFFF';
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath();
	ctx.fill();
}

//temporary
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}