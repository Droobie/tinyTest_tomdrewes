var	 width = 1024,
 	 height = 600,
 	 screenPosX = 0,
 	 screenPosY = 0,
 	 towerWidth = 350,
	 gLoop,
	 etageHeight = 75,
	 totalEtages = 0,
	 etageCategories = [],
	 etageTypes = [],
	 etageArr = [],
	 etageButton,
	 elevator,
	 elevatorWidth = 60,
	 elevatorButtons = [],
	 personArr = [],
	 userData,
	 money = 1000,
 	 canv = document.getElementById('canv'),
	 ctx = canv.getContext('2d'),
	 moneyHandler,
	 mouseDown = false,
	 mouseDownPos = [];
	 canv.width;
	 canv.height;
$(document).ready(function()
{
	//before we do anything, get the data of the current user
	getUserData();

});
window.onbeforeunload = function() {
    saveData();
   // return "asd";
}
function saveData() {
	//store everything in the database
	var ids = "";
	for(var i = 0; i < etageArr.length; i++) {
		if(i != 0)
			ids+=",";
		ids += etageArr[i].etageID;
	}
	$.ajax({
		url: 'php/saveData.php',
		type: "POST",
		data: {userid:userData.ID,etages:ids,money:moneyHandler.checkBalance()}
	}).done(function(data) {
		
	});
}
function getUserData() {
	$.ajax({
		url: 'php/getData.php',
		type: "POST",
		data: {target:'user'}
	}).done(function(data) {
		userData = JSON.parse(data);
		init();
	});
}

function init()
{
	getSizes();
	createLevel();
	setEvents();
	gLoop = setInterval( gameLoop, 1000/50 );
}
function getSizes() {
	canv.width = width = $(window).width();
	canv.height = height = $(window).height();
}
var gameLoop = function()
{
	clear();
	background.draw();
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

function getEtageCategories() {
	$.ajax({
		url: 'php/getData.php',
		type: "POST",
		data: {target:'categories'}
	}).done(function(data) {
		etageCategories = JSON.parse(data);
	});
}

function createLevel() {
	getEtageCategories();
	background = new Background();
	etageButton = new EtageButton();
	elevator = new Elevator();
	elevatorButtons.push(new ElevatorButton(false), new ElevatorButton(true))
	$.ajax({
		url: 'php/getData.php',
		type: "POST",
		data: {target:'etages'}
	}).done(function(data) {
		etageTypes = JSON.parse(data);
		placeAllEtages();
	});

	//setEtage();

	moneyHandler = new MoneyHandler();

	//temporary at start, needs to be at random later => 3 seconds to give us time to build some etages
	setTimeout(function() { spawnPerson(); }, 3000)
}

function setEvents() {
	canv.addEventListener('mousedown', onMouseDown);
	canv.addEventListener('mouseup', onMouseUp);
	canv.addEventListener('mousemove', onMouseMove);
}

function onWindowResize() {
	getSizes();
}

function onMouseMove(e) {
	if(mouseDown) {
		var oL = e.pageX-$(canv).offset().left; //make vars here for readability
		var oT = e.pageY-$(canv).offset().top;
		screenPosY += (mouseDownPos[1] - oT);
		mouseDownPos = [oL, oT];
		if(screenPosY+height > height) screenPosY = 0;
	}
}
function onMouseDown(e) {
	var oL = e.pageX-$(canv).offset().left; //make vars here for readability
	var oT = e.pageY-$(canv).offset().top;
	var clickFound = false;
	//check if click on new etage button
	if(oL > etageButton.X && oL < etageButton.X + 150 && oT > etageButton.Y-screenPosY && oT < etageButton.Y+30-screenPosY) {
		clickFound = true;
		etageButton.setEtageMenu();
	}
	if(etageButton.isOpen) {
		//if categoriemenu is opened, check if the click is within the menu area
		if(oL > (width/2) - (towerWidth/2)+20 && oL < (width/2) - (towerWidth/2)+towerWidth-20 && oT > etageButton.Y-screenPosY+60 && oT < etageButton.Y-screenPosY+460) {
			var newEtage = null;
			//if it is, check which button is clicked			
			for(var i = 0; i < etageCategories.length; i++) {
				var p = etageButton.Y-screenPosY + 60+(i*45);
				if(oT > p && oT < p+40) {
					//if a button is found, check if you got enough money
					if(moneyHandler.checkBalance() > 100 * totalEtages) {
						//if you got enough money, get all etage types for this category
						for(var c = 0; c < etageCategories.length; c++) {
							if(etageCategories[c][1] == etageCategories[i][1]) {
								var tA = [];
								for(var e = 0; e < etageTypes.length; e++) {
									if(etageTypes[e][2] == etageCategories[c][0]) {
										tA.push(etageTypes[e]);
									}
								}
								//pick one random
								var r = (Math.floor(Math.random()*(tA.length-1)))+1;
								newEtage = tA[r];
							}
						}
					}
				}
			}
		if(newEtage !== null) 
			moneyHandler.changeAmount(- (100 * totalEtages));
			etageButton.setEtageMenu();
			setEtage(newEtage[1], newEtage[0], true);
		}
	}
	elevatorButtons.forEach(function(button) {
		if(oL > button.X && oL < button.X + 50 && oT > button.Y && oT < button.Y+50) {
			clickFound = true;
			elevator.isMoving = true;
			elevator.goingUp = button.isUp;
			elevator.speed = 2;
			elevator.isSnapping = false;
		}
	});
	if(!clickFound) {
		mouseDown = true;
		mouseDownPos = [oL, oT];
	}
}
function onMouseUp(e) {
	var oL = e.pageX-$(canv).offset().left; //make vars here for readability
	var oT = e.pageY-$(canv).offset().top;
	elevatorButtons.forEach(function(button) {
		if(oL > button.X && oL < button.X + 50 && oT > button.Y && oT < button.Y+50) {
			elevator.isSnapping = true;
		}
	});
	mouseDown = false;
}

var Background = function() {
	this.calculateColor = function() {
		var towerHeight = totalEtages * etageHeight;
		if(towerHeight < height) towerHeight = height;
		towerHeight = towerHeight/255;
		var b = parseInt(parseInt(-screenPosY / towerHeight,10)/2);
		if(b > 255) b = 255;
		if(String(b).length === 1) b = "0"+b;
		var r = parseInt(124-(b/2));
		if(String(r).length === 1) r = "0"+r;
		var g = parseInt(124-(b/2));
		if(String(g).length === 1) g = "0"+g;
		return "rgb("+r+","+g+","+b+")";
	}
	this.draw = function() {
		ctx.fillStyle = this.calculateColor();
		ctx.beginPath();
		ctx.rect(0, 0, width, height);
		ctx.closePath();
		ctx.fill();
	}
}

function placeAllEtages() {
	var arr = userData.etages.split(',');
	arr.forEach(function(n) {
		for(var i = 0; i < etageTypes.length; i++) {
			if(etageTypes[i][0] == n) {
				setEtage(etageTypes[i][1], n, false);
			}
		}
	});
}

function setEtage(name, n, save) {
	totalEtages++;
	etageArr.push(new Etage(name, n));
	etageButton.setNewPosition();
	if(save) 
		saveData();
}

var Etage = function(name, n) {
	this.color = getRandomColor();
	this.etageNum = totalEtages;
	this.etageID = n;
	this.X = (width/2) - (towerWidth/2);
	this.Y = height-(this.etageNum*etageHeight);
	this.category = name;
	//this.category = etageTypes[giveMeRandom(0,3)][1][giveMeRandom(0,2)];

	this.getCorrectImage = function(){
		switch(this.category){
			case "shoes":
				console.info('this floor is of the type shoes: ' + this.category);
				return "brown";
				break;
			case "wellness":
				console.info('this floor is of the type wellness: ' + this.category);
				return "hotpink";
				break;
			case "police":
				console.info('this floor is of the type police: ' + this.category);
				return "blue";
				break;
			default:
				return this.color;
		}
	}
	this.floorImage = this.getCorrectImage();

	this.draw = function() {
		//draw the sprite here instead
		//console.log(this.Y-screenPosY)

		// ctx.fillStyle = this.color;
		ctx.fillStyle = this.floorImage;
		ctx.beginPath();
		ctx.rect(this.X, this.Y-screenPosY, towerWidth, etageHeight);
		ctx.closePath();
		ctx.fill();

		//add etagenumber
		ctx.fillStyle = "#333";
		ctx.beginPath();
		ctx.rect(this.X+10, this.Y-screenPosY+30, etageHeight-40, etageHeight-40);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "white";
		ctx.font = "bold 20px Arial";
		ctx.fillText(this.etageNum, this.X+21, this.Y-screenPosY +55);

		// add textbar
		ctx.fillStyle = "#333";
		ctx.beginPath();
		ctx.rect(this.X, this.Y-screenPosY, towerWidth, 20);
		ctx.closePath();
		ctx.fill();
		// add text
		ctx.fillStyle = "white";
		ctx.font = "bold 12px Arial";
		ctx.fillText(this.category, this.X +7, this.Y-screenPosY +13);
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
	this.inElevator = false;
	this.inEtage = false;

	this.faceArr = [0,20,40,60,80];
	this.currentFace = this.faceArr[giveMeRandom(0,4)];

	this.draw = function() {
		// face
		this.image = new Image();
		this.image.src = 'img/sprite-faces.png';
		ctx.drawImage(this.image, 0, this.currentFace, 25, 20, this.X, this.Y-screenPosY, 25, 20);

		// body
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.X, this.Y-screenPosY + 20, 25, 30);
		ctx.closePath();
		ctx.fill();

		//num
		if(!this.inEtage) {
			ctx.fillStyle = "#333";
			ctx.beginPath();
			ctx.rect(this.X+3, this.Y-screenPosY+25, 20, 20);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = "white";
			ctx.font = "bold 16px Arial";
			ctx.fillText(this.wantedEtage, this.X+8, this.Y-screenPosY+42);
		}
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
		moneyHandler.changeAmount(giveMeRandom(1, 6))
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
		ctx.rect(this.X, this.Y-screenPosY, elevatorWidth, etageHeight);
		ctx.closePath();
		ctx.fill();
	}
	this.move = function() {
		if(this.isMoving) {
			if(!this.isSnapping) {
				//The elevator is moving normally, just keep going!
				if(this.goingUp) {
					this.Y -= this.speed;
					if(this.Y < height/2) {
						screenPosY -= this.speed;
					}
				} else {
					this.Y += this.speed;
					if(this.Y > height/4) {
						screenPosY += this.speed;
					}
					if(screenPosY+height > height) screenPosY = 0;
				}

				//You can't go lower then ground level #doh
				if(this.Y+etageHeight > height) this.Y = height-etageHeight;
				//You cant go higher then the highest level #doh
				if(this.Y <  height-(totalEtages*etageHeight)) this.Y = height-(totalEtages*etageHeight);
			} else {
				var self = this;
				etageArr.forEach(function(etage) {
					//something is going wrong here, he takes one etage higher then expected
					if(etage.Y-screenPosY < self.Y-screenPosY && self.goingUp || etage.Y-screenPosY > self.Y-screenPosY && !self.goingUp) {
						if(self.Y-screenPosY-2 < etage.Y-screenPosY && self.Y-screenPosY+2 > etage.Y-screenPosY) {
							self.Y = etage.Y;
							self.isSnapping = false;
							self.isMoving = false;
							self.speed = 2;
							self.currentEtage = etage;
							if(self.isPopulated)
								self.checkPerson();
							moneyHandler.changeAmount(self.currentEtage.etageNum);
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
					//You can't go lower then ground level #doh
					if(this.Y+etageHeight > height) this.Y = height-etageHeight;
					//You cant go higher then the highest level #doh
					if(this.Y <  height-(totalEtages*etageHeight)) this.Y = height-(totalEtages*etageHeight);
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
	this.isOpen = false;
	this.draw = function() {
		// draw button
		ctx.fillStyle = '#000000';
		ctx.beginPath();
		ctx.rect(this.X, this.Y-screenPosY, 150, 30);
		ctx.closePath();
		ctx.fill();

		// draw button text
		ctx.fillStyle = "white";
		ctx.font = "bold 16px Arial";
		ctx.fillText("Needed: "+ 100 * totalEtages, this.X + 30, this.Y-screenPosY + 20);
		if(this.isOpen) {
			// draw square
			ctx.fillStyle = '#333333';
			ctx.beginPath();
			ctx.rect((width/2) - (towerWidth/2)+10, this.Y-screenPosY + 50, towerWidth-20, 400);
			ctx.closePath();
			ctx.fill();
			for(var i = 0; i < etageCategories.length; i++) {	
				// draw button background and text
				ctx.fillStyle = '#494747';
				ctx.beginPath();
				ctx.rect((width/2) - (towerWidth/2)+20, this.Y-screenPosY + 60+(i*45), towerWidth-40, 40);
				ctx.closePath();
				ctx.fill();
				ctx.fillStyle = "white";
				ctx.font = "bold 16px Arial";
				ctx.fillText(etageCategories[i][1], (width/2) - (towerWidth/2)+30, this.Y-screenPosY + 85 + (i*45));
			}
		}
	}
	this.setNewPosition = function() {
		this.Y = height-(totalEtages*etageHeight)-50;
	}
	this.setEtageMenu = function() {
		this.isOpen = !this.isOpen;
	}
}

// keeps track of the amount of money the player has
var MoneyHandler = function(){
	this.moneyAmount = parseInt(userData.money);
	this.draw = function(){
		ctx.fillStyle = "black";
		ctx.font = "bold 16px Arial";
		ctx.fillText("Cash: "+this.moneyAmount, 10, 20);
	}
	this.changeAmount = function(amount) {
		this.moneyAmount += amount;
	}
	this.checkBalance = function(balance){
		return this.moneyAmount;
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
function giveMeRandom (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}