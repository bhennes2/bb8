(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    'use strict'

    function pageLoad() {

        // Check the current part of Mbot
        let noBluetooth = document.getElementById("noBluetooth");
        let stepConnect = document.getElementById("stepConnect");
        let stepControl = document.getElementById("stepControl");
        // Check if the bluetooth is available
        if (navigator.bluetooth == undefined) {
            console.error("No navigator.bluetooth found.");
            stepConnect.style.display = "none";
            noBluetooth.style.display = "flex";
        } else {
            // Display the connect button
            stepConnect.style.display = "flex";
            noBluetooth.style.display = "none";
            let ollie = require("./ollie/ollie");

            // Check the connection
            document.getElementById("connectBtn").addEventListener('click', _ => {
                // Request the device
                ollie.request()
                    .then(_ => {
                        // Connect to the ollie
                        return ollie.connect()
                        .then(()=>{
                            return ollie.init()
                        });
                    })
                    .then(_ => {
                        var x = document.getElementById('bb8-connect');
                        x.play();
                        // Connection is done, we show the controls
                        stepConnect.style.display = "none";
                        stepControl.style.display = "flex";
                        
                        let Joystick = require('./components/joystick.js');		
                        new Joystick('joystick', (data) => {
                           //console.log(data.angle);
                           ollie.processMotor(data.angle, data.power);
                        });		
                        let partJoystick = document.querySelector('.part-joystick');
                        let partBtn = document.querySelector('.part-button');
                        let switchParts = document.getElementById('switchParts');		 +                        
                         // Switch between button and joystick		
                         switchParts.addEventListener('click', function(evt) {		
                             if (this.checked) {		
                                 partBtn.style.display = 'none';		
                                 partJoystick.style.display = '';		
                             } else {		
                                 partBtn.style.display = '';		
                                 partJoystick.style.display = 'none';		
                             }		
                         });
                        
                        // Control the robot by buttons
                        let btnUp = document.getElementById('btnUp');
                        let btnDown = document.getElementById('btnDown');
                        let btnLeft = document.getElementById('btnLeft');
                        let btnRight = document.getElementById('btnRight');

                        btnUp.addEventListener('touchstart', _ => { ollie.processMotor(0,50) });
                        btnDown.addEventListener('touchstart', _ => { ollie.processMotor(180,50) });
                        btnLeft.addEventListener('touchstart', _ => { ollie.processMotor(270,50) });
                        btnRight.addEventListener('touchstart', _ => { ollie.processMotor(90,50) });

                        btnUp.addEventListener('touchend', _ => { ollie.processMotor(0, 0) });
                        btnDown.addEventListener('touchend', _ => { ollie.processMotor(180, 0) });
                        btnLeft.addEventListener('touchend', _ => { ollie.processMotor(270, 0) });
                        btnRight.addEventListener('touchend', _ => { ollie.processMotor(90, 0) });
                        
                        // Tricks with the robot
                        document.getElementById('btnTrick1').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.forward, ollie.Motors.reverse)
                        });
                        document.getElementById('btnTrick2').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.reverse, ollie.Motors.forward)
                        });
                        document.getElementById('btnTrick3').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.forward, ollie.Motors.forward)
                        });
                        document.getElementById('btnTrick4').addEventListener('click', _=>{ 
                            ollie.processSpin(ollie.Motors.reverse, ollie.Motors.reverse)
                        });

                        // Color the robot
                        let ColorPicker = require('./components/colorpicker.js');
                        new ColorPicker((rgb) => {
                            ollie.processColor(rgb.red, rgb.blue, rgb.green);
                        });
                    })
            });



        }

    }



    window.addEventListener('load', pageLoad);

    /*if ('serviceWorker' in navigator) {        
        navigator.serviceWorker.register('./service-worker.js', {scope : location.pathname}).then(function(reg) {
            console.log('Service Worker Register for scope : %s',reg.scope);
        });
    }*/

})();

},{"./components/colorpicker.js":2,"./components/joystick.js":3,"./ollie/ollie":4}],2:[function(require,module,exports){

class ColorPicker {
    constructor(callback) {
        this.img = new Image();
        this.img.src = './assets/images/color-wheel.png';
        this.callback = callback;
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.img.onload = this._load.bind(this);
    }


    _load() {
        
        this.canvas.width = 150 * devicePixelRatio;
        this.canvas.height = 150 * devicePixelRatio;
        this.canvas.style.width = "150px";
        this.canvas.style.height = "150px";
        this.canvas.addEventListener('click', this._calculateRgb.bind(this));

        this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
    }


    _calculateRgb(evt) {
        // Refresh canvas in case user zooms and devicePixelRatio changes.
        this.canvas.width = 150 * devicePixelRatio;
        this.canvas.height = 150 * devicePixelRatio;
        this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

        let rect = this.canvas.getBoundingClientRect();
        let x = Math.round((evt.clientX - rect.left) * devicePixelRatio);
        let y = Math.round((evt.clientY - rect.top) * devicePixelRatio);
        let data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

        let r = data[((this.canvas.width * y) + x) * 4];
        let g = data[((this.canvas.width * y) + x) * 4 + 1];
        let b = data[((this.canvas.width * y) + x) * 4 + 2];

        this.callback({
            red: r,
            blue: b,
            green: g
        });


        this.context.beginPath();
        this.context.arc(x, y + 2, 10 * devicePixelRatio, 0, 2 * Math.PI, false);
        this.context.shadowColor = '#333';
        this.context.shadowBlur = 4 * devicePixelRatio;
        this.context.fillStyle = 'white';
        this.context.fill();
    }


}

module.exports = ColorPicker;
},{}],3:[function(require,module,exports){
class Joystick {

    constructor(id, callback) {
        this.joystick = nipplejs.create({
            zone: document.getElementById(id),
            mode: 'static',
            position: {
                left: '50%',
                top: '50%'
            },
            size: 200,
            color: '#c10435'
        });
        this.callback = callback;

        /*function LogF(evt, data){
            console.log(evt,data);
        }
        this.joystick.on('move', LogF);
        this.joystick.on('start', LogF);
        this.joystick.on('dir', LogF);
        this.joystick.on('plain', LogF);
        this.joystick.on('shown', LogF);
        this.joystick.on('hidden', LogF);
        this.joystick.on('destroy', LogF);
        this.joystick.on('pressure', LogF);
        this.joystick.on('end', LogF);*/

        this.joystick.on('move', this._move.bind(this));
        this.joystick.on('end', this._end.bind(this));
        this.lastPower = 0;
        this.lastAngle = 0;
    }

    _move(evt, data) {        
        if (data.angle) {            
            let power = Math.round((data.distance / 100) * 100);
            let angle = data.angle.degree;
            if (power != this.lastPower
            || angle != this.lastAngle) {
                this.lastPower = power;   
                this.lastAngle = angle;
                this.callback({
                    angle : Math.abs(360 - ((this.lastAngle + 270) % 360)),
                    power : this.lastPower
                });
            }
        }
        

    }

    _end(evt, data) {
        this.lastPower = 0;
        this.callback({
            angle: this.lastAngle,
            power: 0
        });
    }

}

module.exports = Joystick;
},{}],4:[function(require,module,exports){
'use strict'

/**
 * General configuration (UUID)
*/
class Config {

    constructor() {
    }
    
    radioService() { return "22bb746f-2bb0-7554-2d6f-726568705327" }
    robotService() { return "22bb746f-2ba0-7554-2d6f-726568705327" }
    controlCharacteristic() { return "22bb746f-2ba1-7554-2d6f-726568705327" }
    antiDOSCharateristic() { return "22bb746f-2bbd-7554-2d6f-726568705327" }
    powerCharateristic() { return "22bb746f-2bb2-7554-2d6f-726568705327" }
    wakeUpCPUCharateristic() { return "22bb746f-2bbf-7554-2d6f-726568705327" }
}

    

/**
 * Class for the robot
 * */
class Ollie {
    constructor() {
        this.device = null;
        this.config = new Config();
        this.onDisconnected = this.onDisconnected.bind(this);
        this.buzzerIndex = 0;
        this.sequence = 0;
        this.busy = false;
        this.Motors = {
            off : 0x00,
            forward : 0x01,
            reverse : 0x02,
            brake : 0x03,
            ignore : 0x04
        }
    }

    /*
    Request the device with bluetooth
    */
    request() {
        let options = {
            "filters": [{
                "services": [this.config.radioService()]
            },{
                "services": [this.config.robotService()]
            }],
            "optionalServices": [this.config.radioService(), this.config.robotService()]
        };        
        return navigator.bluetooth.requestDevice(options)
            .then(device => {
                this.device = device;
                this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
                return device;
            });
    }

    /**
     * Connect to the device
     * */
    connect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        } else {
            return this.device.gatt.connect();
        }
    }
    
    init(){
        if(!this.device){
            return Promise.reject('Device is not connected.');
        }else{
            
            return this._writeCharacteristic(this.config.radioService(), 
                    this.config.antiDOSCharateristic(),
                    new Uint8Array('011i3'.split('').map(c => c.charCodeAt())))
            .then(()=>{
                 console.log('> Found Anti DOS characteristic');
                 return this._writeCharacteristic(this.config.radioService(), 
                    this.config.powerCharateristic(),
                    new Uint8Array([0x07]))
            })
            .then(()=>{
                  console.log('> Found TX Power characteristic');
                  return this._writeCharacteristic(this.config.radioService(), 
                    this.config.wakeUpCPUCharateristic(),
                    new Uint8Array([0x01]))
            })
            .then(()=>{                
                console.log('Wake CPU write done.');             
                //Set rgbLed to 0
                let color = 0x01;
                color &= 0xFF;
                return this._sendCommand(0x02, 0x20, new Uint8Array([color]))
            })
            .then(() => {
                console.log('Rgb Led set to 0');
                // set BackLed to 127
                return this._sendCommand(0x02, 0x21, new Uint8Array([127]));
            })
            .then(()=>{
                console.log('Back Led set to 127');
                // set stabilisation to 0
                let flag = 0;
                flag &= 0x01;
                return this._sendCommand(0x02, 0x02, new Uint8Array([flag]));
            })
            .then(()=>{
                console.log('Stabilisation set to 0');
                // Set heading to 0
                let heading = 0;
                return this._sendCommand(0x02, 0x01, new Uint8Array([heading >> 8, heading & 0xFF]));
            })
            .then(()=>{
                console.log('Heading set to 0, device is ready !');
            })
            .catch(error => {
                console.error(error);
            })
        }
    }

    /**
     * Control the motors of robot
    */
    processMotor(heading, power) {
        console.log(`Roll heading=${heading}, power=${power}`);
        if (this.busy && power > 0) {
            console.warn('ollie is busy');
            // Return if another operation pending
            return Promise.reject();
        }
        this.busy = true;
        let did = 0x02; // Virtual device ID
        let cid = 0x30; // Roll command
        // Roll command data: speed, heading (MSB), heading (LSB), state
        let data = new Uint8Array([power, heading >> 8, heading & 0xFF, 1]);

        return this._sendCommand(did, cid, data)
        .then(_ => {
            console.log('processMotor success');
        })
        .catch(error => {
            console.error('processMotor fail', error);
            if (power === 0){
                this.processMotor(heading, motor);
            }
        })
       .then(_ => {
            this.busy = false;
        });
    }

    processColor(red,blue,green){
        console.log('Set color: r='+red+',g='+green+',b='+blue);
        if (this.busy) {
            console.log('ollie is busy');
            // Return if another operation pending
            Promise.reject();
        }
        this.busy = true;
        let did = 0x02; // Virtual device ID
        let cid = 0x20; // Set RGB LED Output command
        // Color command data: red, green, blue, flag
        let data = new Uint8Array([red, green, blue, 0]);

        return this._sendCommand(did, cid, data).then(() => {
            console.log("color set ! ");
        })
        .catch((error)=>{
            console.error('processColor fail',error);
        })
        .then(_=>{
            this.busy = false;
        });
    }
    
    processSpin(lmotor, rmotor){
        console.log('Spin');
        if (this.busy){
            console.warn('ollie is busy');
            return Promise.reject();
        }
        this.busy = true;
        let did = 0x02; //Virtual device ID
        let cid = 0x33; // Set raw Motors command
        
              
        let lmode = lmotor & 0x07;
        let lpower = 200 & 0xFF;
        let rmode = rmotor & 0x07;
        let rpower = 200 & 0xFF;
        
        let data = new Uint8Array([lmode, lpower, rmode, rpower]);

        return this._sendCommand(did, cid, data).then(() => {
            console.log('first command spin sucess!');
            return new Promise((resolve, reject)=>{
                setTimeout(()=> {
                    let lmode = this.Motors.off & 0x07;
                    let lpower = 200;
                    let rmode = this.Motors.off & 0x07;
                    let rpower = 200;
                    
                    let data = new Uint8Array([lmode, lpower, rmode, rpower]);

                    this._sendCommand(did, cid, data)
                    .then(_ => {     
                        console.log('second command sucess');                   
                        resolve();
                    })
                    .catch((error)=>{
                        console.error('second command fail',error);
                        reject(error);
                    }); 
                }, 2000);    
            });
                
        })
        .catch((error)=>{
            console.error(error);
        })
        .then(_=>{
            this.busy = false;
        });
        
        
        
    }

    disconnect() {
        if (!this.device) {
            return Promise.reject('Device is not connected.');
        } else {
            return this.device.gatt.disconnect();
        }
    }

    onDisconnected() {
        console.log('Device is disconnected.');
    }
    
    _intToHexArray(value, numBytes) {
        var hexArray = new Array(numBytes);

        for (var i = numBytes - 1; i >= 0; i--) {
            hexArray[i] = value & 0xFF;
            value >>= 8;
        }

        return hexArray;
     };


    _sendCommand(did, cid, data) {
        // Create client command packets
        // API docs: https://github.com/orbotix/DeveloperResources/blob/master/docs/Sphero_API_1.50.pdf
        // Next sequence number
        let seq = this.sequence & 255;
        this.sequence += 1;
        // Start of packet #2
        let sop2 = 0xfc;
        sop2 |= 1; // Answer
        sop2 |= 2; // Reset timeout
        // Data length
        let dlen = data.byteLength + 1;
        let sum = data.reduce((a, b) => {
        return a + b;
        });
        // Checksum
        let chk = (sum + did + cid + seq + dlen) & 255;
        chk ^= 255;
        let checksum = new Uint8Array([chk]);

        let packets = new Uint8Array([0xff, sop2, did, cid, seq, dlen]);
        // Append arrays: packet + data + checksum
        let array = new Uint8Array(packets.byteLength + data.byteLength + checksum.byteLength);
        array.set(packets, 0);
        array.set(data, packets.byteLength);
        array.set(checksum, packets.byteLength + data.byteLength);
        return this._writeCharacteristic(this.config.robotService(), this.config.controlCharacteristic(), array);          
    }


  

    _writeCharacteristic(serviceUID, characteristicUID, value) {
        return this.device.gatt.getPrimaryService(serviceUID)
            .then(service => service.getCharacteristic(characteristicUID))
            .then(characteristic => characteristic.writeValue(value));
    }


}


let ollie = new Ollie();

module.exports = ollie;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9jb2xvcnBpY2tlci5qcyIsInNjcmlwdHMvY29tcG9uZW50cy9qb3lzdGljay5qcyIsInNjcmlwdHMvb2xsaWUvb2xsaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCdcblxuICAgIGZ1bmN0aW9uIHBhZ2VMb2FkKCkge1xuXG4gICAgICAgIC8vIENoZWNrIHRoZSBjdXJyZW50IHBhcnQgb2YgTWJvdFxuICAgICAgICBsZXQgbm9CbHVldG9vdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vQmx1ZXRvb3RoXCIpO1xuICAgICAgICBsZXQgc3RlcENvbm5lY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb25uZWN0XCIpO1xuICAgICAgICBsZXQgc3RlcENvbnRyb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXBDb250cm9sXCIpO1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmx1ZXRvb3RoIGlzIGF2YWlsYWJsZVxuICAgICAgICBpZiAobmF2aWdhdG9yLmJsdWV0b290aCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBuYXZpZ2F0b3IuYmx1ZXRvb3RoIGZvdW5kLlwiKTtcbiAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIG5vQmx1ZXRvb3RoLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbm5lY3QgYnV0dG9uXG4gICAgICAgICAgICBzdGVwQ29ubmVjdC5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgICBub0JsdWV0b290aC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBsZXQgb2xsaWUgPSByZXF1aXJlKFwiLi9vbGxpZS9vbGxpZVwiKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ubmVjdEJ0blwiKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xuICAgICAgICAgICAgICAgIC8vIFJlcXVlc3QgdGhlIGRldmljZVxuICAgICAgICAgICAgICAgIG9sbGllLnJlcXVlc3QoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3QgdG8gdGhlIG9sbGllXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xsaWUuY29ubmVjdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGxpZS5pbml0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihfID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JiOC1jb25uZWN0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB4LnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbm5lY3Rpb24gaXMgZG9uZSwgd2Ugc2hvdyB0aGUgY29udHJvbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb25uZWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb250cm9sLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IEpveXN0aWNrID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2pveXN0aWNrLmpzJyk7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEpveXN0aWNrKCdqb3lzdGljaycsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEuYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc01vdG9yKGRhdGEuYW5nbGUsIGRhdGEucG93ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnRKb3lzdGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0LWpveXN0aWNrJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFydEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0LWJ1dHRvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN3aXRjaFBhcnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3aXRjaFBhcnRzJyk7XHRcdCArICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpdGNoIGJldHdlZW4gYnV0dG9uIGFuZCBqb3lzdGlja1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hQYXJ0cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2dCkge1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Sm95c3RpY2suc3R5bGUuZGlzcGxheSA9ICcnO1x0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0QnRuLnN0eWxlLmRpc3BsYXkgPSAnJztcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Sm95c3RpY2suc3R5bGUuZGlzcGxheSA9ICdub25lJztcdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cdFx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnRyb2wgdGhlIHJvYm90IGJ5IGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBidG5VcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5VcCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0bkRvd24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuRG93bicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0bkxlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuTGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJ0blJpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blJpZ2h0Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blVwLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBfID0+IHsgb2xsaWUucHJvY2Vzc01vdG9yKDAsNTApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuRG93bi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigxODAsNTApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuTGVmdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigyNzAsNTApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoOTAsNTApIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBidG5VcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidG5Eb3duLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3RvcigxODAsIDApIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnRuTGVmdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIF8gPT4geyBvbGxpZS5wcm9jZXNzTW90b3IoMjcwLCAwKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ0blJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgXyA9PiB7IG9sbGllLnByb2Nlc3NNb3Rvcig5MCwgMCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWNrcyB3aXRoIHRoZSByb2JvdFxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrMScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMuZm9yd2FyZCwgb2xsaWUuTW90b3JzLnJldmVyc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5UcmljazInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF89PnsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc1NwaW4ob2xsaWUuTW90b3JzLnJldmVyc2UsIG9sbGllLk1vdG9ycy5mb3J3YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuVHJpY2szJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfPT57IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sbGllLnByb2Nlc3NTcGluKG9sbGllLk1vdG9ycy5mb3J3YXJkLCBvbGxpZS5Nb3RvcnMuZm9yd2FyZClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0blRyaWNrNCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXz0+eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGxpZS5wcm9jZXNzU3BpbihvbGxpZS5Nb3RvcnMucmV2ZXJzZSwgb2xsaWUuTW90b3JzLnJldmVyc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29sb3IgdGhlIHJvYm90XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgQ29sb3JQaWNrZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29sb3JwaWNrZXIuanMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb2xvclBpY2tlcigocmdiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xsaWUucHJvY2Vzc0NvbG9yKHJnYi5yZWQsIHJnYi5ibHVlLCByZ2IuZ3JlZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcGFnZUxvYWQpO1xuXG4gICAgLyppZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikgeyAgICAgICAgXG4gICAgICAgIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCcuL3NlcnZpY2Utd29ya2VyLmpzJywge3Njb3BlIDogbG9jYXRpb24ucGF0aG5hbWV9KS50aGVuKGZ1bmN0aW9uKHJlZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyIFJlZ2lzdGVyIGZvciBzY29wZSA6ICVzJyxyZWcuc2NvcGUpO1xuICAgICAgICB9KTtcbiAgICB9Ki9cblxufSkoKTtcbiIsIlxuY2xhc3MgQ29sb3JQaWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICcuL2Fzc2V0cy9pbWFnZXMvY29sb3Itd2hlZWwucG5nJztcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmltZy5vbmxvYWQgPSB0aGlzLl9sb2FkLmJpbmQodGhpcyk7XG4gICAgfVxuXG5cbiAgICBfbG9hZCgpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gMTUwICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBcIjE1MHB4XCI7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTUwcHhcIjtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jYWxjdWxhdGVSZ2IuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG5cbiAgICBfY2FsY3VsYXRlUmdiKGV2dCkge1xuICAgICAgICAvLyBSZWZyZXNoIGNhbnZhcyBpbiBjYXNlIHVzZXIgem9vbXMgYW5kIGRldmljZVBpeGVsUmF0aW8gY2hhbmdlcy5cbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAxNTAgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAqIGRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICBsZXQgeSA9IE1hdGgucm91bmQoKGV2dC5jbGllbnRZIC0gcmVjdC50b3ApICogZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5jb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KS5kYXRhO1xuXG4gICAgICAgIGxldCByID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDRdO1xuICAgICAgICBsZXQgZyA9IGRhdGFbKCh0aGlzLmNhbnZhcy53aWR0aCAqIHkpICsgeCkgKiA0ICsgMV07XG4gICAgICAgIGxldCBiID0gZGF0YVsoKHRoaXMuY2FudmFzLndpZHRoICogeSkgKyB4KSAqIDQgKyAyXTtcblxuICAgICAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgICAgICAgIHJlZDogcixcbiAgICAgICAgICAgIGJsdWU6IGIsXG4gICAgICAgICAgICBncmVlbjogZ1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmFyYyh4LCB5ICsgMiwgMTAgKiBkZXZpY2VQaXhlbFJhdGlvLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmNvbnRleHQuc2hhZG93Q29sb3IgPSAnIzMzMyc7XG4gICAgICAgIHRoaXMuY29udGV4dC5zaGFkb3dCbHVyID0gNCAqIGRldmljZVBpeGVsUmF0aW87XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3JQaWNrZXI7IiwiY2xhc3MgSm95c3RpY2sge1xuXG4gICAgY29uc3RydWN0b3IoaWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuam95c3RpY2sgPSBuaXBwbGVqcy5jcmVhdGUoe1xuICAgICAgICAgICAgem9uZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLFxuICAgICAgICAgICAgbW9kZTogJ3N0YXRpYycsXG4gICAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIGxlZnQ6ICc1MCUnLFxuICAgICAgICAgICAgICAgIHRvcDogJzUwJSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaXplOiAyMDAsXG4gICAgICAgICAgICBjb2xvcjogJyNjMTA0MzUnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAgICAgLypmdW5jdGlvbiBMb2dGKGV2dCwgZGF0YSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhldnQsZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignbW92ZScsIExvZ0YpO1xuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdzdGFydCcsIExvZ0YpO1xuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdkaXInLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbigncGxhaW4nLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignc2hvd24nLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignaGlkZGVuJywgTG9nRik7XG4gICAgICAgIHRoaXMuam95c3RpY2sub24oJ2Rlc3Ryb3knLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbigncHJlc3N1cmUnLCBMb2dGKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZW5kJywgTG9nRik7Ki9cblxuICAgICAgICB0aGlzLmpveXN0aWNrLm9uKCdtb3ZlJywgdGhpcy5fbW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5qb3lzdGljay5vbignZW5kJywgdGhpcy5fZW5kLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmxhc3RQb3dlciA9IDA7XG4gICAgICAgIHRoaXMubGFzdEFuZ2xlID0gMDtcbiAgICB9XG5cbiAgICBfbW92ZShldnQsIGRhdGEpIHsgICAgICAgIFxuICAgICAgICBpZiAoZGF0YS5hbmdsZSkgeyAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHBvd2VyID0gTWF0aC5yb3VuZCgoZGF0YS5kaXN0YW5jZSAvIDEwMCkgKiAxMDApO1xuICAgICAgICAgICAgbGV0IGFuZ2xlID0gZGF0YS5hbmdsZS5kZWdyZWU7XG4gICAgICAgICAgICBpZiAocG93ZXIgIT0gdGhpcy5sYXN0UG93ZXJcbiAgICAgICAgICAgIHx8IGFuZ2xlICE9IHRoaXMubGFzdEFuZ2xlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0UG93ZXIgPSBwb3dlcjsgICBcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RBbmdsZSA9IGFuZ2xlO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA6IE1hdGguYWJzKDM2MCAtICgodGhpcy5sYXN0QW5nbGUgKyAyNzApICUgMzYwKSksXG4gICAgICAgICAgICAgICAgICAgIHBvd2VyIDogdGhpcy5sYXN0UG93ZXJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgIH1cblxuICAgIF9lbmQoZXZ0LCBkYXRhKSB7XG4gICAgICAgIHRoaXMubGFzdFBvd2VyID0gMDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgICBhbmdsZTogdGhpcy5sYXN0QW5nbGUsXG4gICAgICAgICAgICBwb3dlcjogMFxuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBKb3lzdGljazsiLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBHZW5lcmFsIGNvbmZpZ3VyYXRpb24gKFVVSUQpXG4qL1xuY2xhc3MgQ29uZmlnIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cbiAgICBcbiAgICByYWRpb1NlcnZpY2UoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYjAtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICByb2JvdFNlcnZpY2UoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTAtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBjb250cm9sQ2hhcmFjdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYTEtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbiAgICBhbnRpRE9TQ2hhcmF0ZXJpc3RpYygpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiZC03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxuICAgIHBvd2VyQ2hhcmF0ZXJpc3RpYygpIHsgcmV0dXJuIFwiMjJiYjc0NmYtMmJiMi03NTU0LTJkNmYtNzI2NTY4NzA1MzI3XCIgfVxuICAgIHdha2VVcENQVUNoYXJhdGVyaXN0aWMoKSB7IHJldHVybiBcIjIyYmI3NDZmLTJiYmYtNzU1NC0yZDZmLTcyNjU2ODcwNTMyN1wiIH1cbn1cblxuICAgIFxuXG4vKipcbiAqIENsYXNzIGZvciB0aGUgcm9ib3RcbiAqICovXG5jbGFzcyBPbGxpZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGV2aWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKCk7XG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0ZWQgPSB0aGlzLm9uRGlzY29ubmVjdGVkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnV6emVySW5kZXggPSAwO1xuICAgICAgICB0aGlzLnNlcXVlbmNlID0gMDtcbiAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuTW90b3JzID0ge1xuICAgICAgICAgICAgb2ZmIDogMHgwMCxcbiAgICAgICAgICAgIGZvcndhcmQgOiAweDAxLFxuICAgICAgICAgICAgcmV2ZXJzZSA6IDB4MDIsXG4gICAgICAgICAgICBicmFrZSA6IDB4MDMsXG4gICAgICAgICAgICBpZ25vcmUgOiAweDA0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgIFJlcXVlc3QgdGhlIGRldmljZSB3aXRoIGJsdWV0b290aFxuICAgICovXG4gICAgcmVxdWVzdCgpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBcImZpbHRlcnNcIjogW3tcbiAgICAgICAgICAgICAgICBcInNlcnZpY2VzXCI6IFt0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKV1cbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIFwic2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJvYm90U2VydmljZSgpXVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBcIm9wdGlvbmFsU2VydmljZXNcIjogW3RoaXMuY29uZmlnLnJhZGlvU2VydmljZSgpLCB0aGlzLmNvbmZpZy5yb2JvdFNlcnZpY2UoKV1cbiAgICAgICAgfTsgICAgICAgIFxuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmJsdWV0b290aC5yZXF1ZXN0RGV2aWNlKG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihkZXZpY2UgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlLmFkZEV2ZW50TGlzdGVuZXIoJ2dhdHRzZXJ2ZXJkaXNjb25uZWN0ZWQnLCB0aGlzLm9uRGlzY29ubmVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdCB0byB0aGUgZGV2aWNlXG4gICAgICogKi9cbiAgICBjb25uZWN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGluaXQoKXtcbiAgICAgICAgaWYoIXRoaXMuZGV2aWNlKXtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRGV2aWNlIGlzIG5vdCBjb25uZWN0ZWQuJyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmFudGlET1NDaGFyYXRlcmlzdGljKCksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KCcwMTFpMycuc3BsaXQoJycpLm1hcChjID0+IGMuY2hhckNvZGVBdCgpKSkpXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPiBGb3VuZCBBbnRpIERPUyBjaGFyYWN0ZXJpc3RpYycpO1xuICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fd3JpdGVDaGFyYWN0ZXJpc3RpYyh0aGlzLmNvbmZpZy5yYWRpb1NlcnZpY2UoKSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnBvd2VyQ2hhcmF0ZXJpc3RpYygpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgVWludDhBcnJheShbMHgwN10pKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPiBGb3VuZCBUWCBQb3dlciBjaGFyYWN0ZXJpc3RpYycpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucmFkaW9TZXJ2aWNlKCksIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy53YWtlVXBDUFVDaGFyYXRlcmlzdGljKCksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KFsweDAxXSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCk9PnsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dha2UgQ1BVIHdyaXRlIGRvbmUuJyk7ICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vU2V0IHJnYkxlZCB0byAwXG4gICAgICAgICAgICAgICAgbGV0IGNvbG9yID0gMHgwMTtcbiAgICAgICAgICAgICAgICBjb2xvciAmPSAweEZGO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDIwLCBuZXcgVWludDhBcnJheShbY29sb3JdKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JnYiBMZWQgc2V0IHRvIDAnKTtcbiAgICAgICAgICAgICAgICAvLyBzZXQgQmFja0xlZCB0byAxMjdcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoMHgwMiwgMHgyMSwgbmV3IFVpbnQ4QXJyYXkoWzEyN10pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWNrIExlZCBzZXQgdG8gMTI3Jyk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IHN0YWJpbGlzYXRpb24gdG8gMFxuICAgICAgICAgICAgICAgIGxldCBmbGFnID0gMDtcbiAgICAgICAgICAgICAgICBmbGFnICY9IDB4MDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRDb21tYW5kKDB4MDIsIDB4MDIsIG5ldyBVaW50OEFycmF5KFtmbGFnXSkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpPT57XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0YWJpbGlzYXRpb24gc2V0IHRvIDAnKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgaGVhZGluZyB0byAwXG4gICAgICAgICAgICAgICAgbGV0IGhlYWRpbmcgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZCgweDAyLCAweDAxLCBuZXcgVWludDhBcnJheShbaGVhZGluZyA+PiA4LCBoZWFkaW5nICYgMHhGRl0pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIZWFkaW5nIHNldCB0byAwLCBkZXZpY2UgaXMgcmVhZHkgIScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udHJvbCB0aGUgbW90b3JzIG9mIHJvYm90XG4gICAgKi9cbiAgICBwcm9jZXNzTW90b3IoaGVhZGluZywgcG93ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFJvbGwgaGVhZGluZz0ke2hlYWRpbmd9LCBwb3dlcj0ke3Bvd2VyfWApO1xuICAgICAgICBpZiAodGhpcy5idXN5ICYmIHBvd2VyID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdvbGxpZSBpcyBidXN5Jyk7XG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgYW5vdGhlciBvcGVyYXRpb24gcGVuZGluZ1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgICAgbGV0IGRpZCA9IDB4MDI7IC8vIFZpcnR1YWwgZGV2aWNlIElEXG4gICAgICAgIGxldCBjaWQgPSAweDMwOyAvLyBSb2xsIGNvbW1hbmRcbiAgICAgICAgLy8gUm9sbCBjb21tYW5kIGRhdGE6IHNwZWVkLCBoZWFkaW5nIChNU0IpLCBoZWFkaW5nIChMU0IpLCBzdGF0ZVxuICAgICAgICBsZXQgZGF0YSA9IG5ldyBVaW50OEFycmF5KFtwb3dlciwgaGVhZGluZyA+PiA4LCBoZWFkaW5nICYgMHhGRiwgMV0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSlcbiAgICAgICAgLnRoZW4oXyA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJvY2Vzc01vdG9yIHN1Y2Nlc3MnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3Byb2Nlc3NNb3RvciBmYWlsJywgZXJyb3IpO1xuICAgICAgICAgICAgaWYgKHBvd2VyID09PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NNb3RvcihoZWFkaW5nLCBtb3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgLnRoZW4oXyA9PiB7XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0NvbG9yKHJlZCxibHVlLGdyZWVuKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1NldCBjb2xvcjogcj0nK3JlZCsnLGc9JytncmVlbisnLGI9JytibHVlKTtcbiAgICAgICAgaWYgKHRoaXMuYnVzeSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29sbGllIGlzIGJ1c3knKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBhbm90aGVyIG9wZXJhdGlvbiBwZW5kaW5nXG4gICAgICAgICAgICBQcm9taXNlLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvLyBWaXJ0dWFsIGRldmljZSBJRFxuICAgICAgICBsZXQgY2lkID0gMHgyMDsgLy8gU2V0IFJHQiBMRUQgT3V0cHV0IGNvbW1hbmRcbiAgICAgICAgLy8gQ29sb3IgY29tbWFuZCBkYXRhOiByZWQsIGdyZWVuLCBibHVlLCBmbGFnXG4gICAgICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoW3JlZCwgZ3JlZW4sIGJsdWUsIDBdKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb2xvciBzZXQgISBcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpPT57XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdwcm9jZXNzQ29sb3IgZmFpbCcsZXJyb3IpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihfPT57XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByb2Nlc3NTcGluKGxtb3Rvciwgcm1vdG9yKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1NwaW4nKTtcbiAgICAgICAgaWYgKHRoaXMuYnVzeSl7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ29sbGllIGlzIGJ1c3knKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVzeSA9IHRydWU7XG4gICAgICAgIGxldCBkaWQgPSAweDAyOyAvL1ZpcnR1YWwgZGV2aWNlIElEXG4gICAgICAgIGxldCBjaWQgPSAweDMzOyAvLyBTZXQgcmF3IE1vdG9ycyBjb21tYW5kXG4gICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgbGV0IGxtb2RlID0gbG1vdG9yICYgMHgwNztcbiAgICAgICAgbGV0IGxwb3dlciA9IDIwMCAmIDB4RkY7XG4gICAgICAgIGxldCBybW9kZSA9IHJtb3RvciAmIDB4MDc7XG4gICAgICAgIGxldCBycG93ZXIgPSAyMDAgJiAweEZGO1xuICAgICAgICBcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgVWludDhBcnJheShbbG1vZGUsIGxwb3dlciwgcm1vZGUsIHJwb3dlcl0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kQ29tbWFuZChkaWQsIGNpZCwgZGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmlyc3QgY29tbWFuZCBzcGluIHN1Y2VzcyEnKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsbW9kZSA9IHRoaXMuTW90b3JzLm9mZiAmIDB4MDc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBscG93ZXIgPSAyMDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBybW9kZSA9IHRoaXMuTW90b3JzLm9mZiAmIDB4MDc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBycG93ZXIgPSAyMDA7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IG5ldyBVaW50OEFycmF5KFtsbW9kZSwgbHBvd2VyLCBybW9kZSwgcnBvd2VyXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VuZENvbW1hbmQoZGlkLCBjaWQsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKF8gPT4geyAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2Vjb25kIGNvbW1hbmQgc3VjZXNzJyk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignc2Vjb25kIGNvbW1hbmQgZmFpbCcsZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgICAgIH0sIDIwMDApOyAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKT0+e1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKF89PntcbiAgICAgICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0KCkge1xuICAgICAgICBpZiAoIXRoaXMuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0RldmljZSBpcyBub3QgY29ubmVjdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlLmdhdHQuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25EaXNjb25uZWN0ZWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXZpY2UgaXMgZGlzY29ubmVjdGVkLicpO1xuICAgIH1cbiAgICBcbiAgICBfaW50VG9IZXhBcnJheSh2YWx1ZSwgbnVtQnl0ZXMpIHtcbiAgICAgICAgdmFyIGhleEFycmF5ID0gbmV3IEFycmF5KG51bUJ5dGVzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gbnVtQnl0ZXMgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaGV4QXJyYXlbaV0gPSB2YWx1ZSAmIDB4RkY7XG4gICAgICAgICAgICB2YWx1ZSA+Pj0gODtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoZXhBcnJheTtcbiAgICAgfTtcblxuXG4gICAgX3NlbmRDb21tYW5kKGRpZCwgY2lkLCBkYXRhKSB7XG4gICAgICAgIC8vIENyZWF0ZSBjbGllbnQgY29tbWFuZCBwYWNrZXRzXG4gICAgICAgIC8vIEFQSSBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vb3Jib3RpeC9EZXZlbG9wZXJSZXNvdXJjZXMvYmxvYi9tYXN0ZXIvZG9jcy9TcGhlcm9fQVBJXzEuNTAucGRmXG4gICAgICAgIC8vIE5leHQgc2VxdWVuY2UgbnVtYmVyXG4gICAgICAgIGxldCBzZXEgPSB0aGlzLnNlcXVlbmNlICYgMjU1O1xuICAgICAgICB0aGlzLnNlcXVlbmNlICs9IDE7XG4gICAgICAgIC8vIFN0YXJ0IG9mIHBhY2tldCAjMlxuICAgICAgICBsZXQgc29wMiA9IDB4ZmM7XG4gICAgICAgIHNvcDIgfD0gMTsgLy8gQW5zd2VyXG4gICAgICAgIHNvcDIgfD0gMjsgLy8gUmVzZXQgdGltZW91dFxuICAgICAgICAvLyBEYXRhIGxlbmd0aFxuICAgICAgICBsZXQgZGxlbiA9IGRhdGEuYnl0ZUxlbmd0aCArIDE7XG4gICAgICAgIGxldCBzdW0gPSBkYXRhLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBDaGVja3N1bVxuICAgICAgICBsZXQgY2hrID0gKHN1bSArIGRpZCArIGNpZCArIHNlcSArIGRsZW4pICYgMjU1O1xuICAgICAgICBjaGsgXj0gMjU1O1xuICAgICAgICBsZXQgY2hlY2tzdW0gPSBuZXcgVWludDhBcnJheShbY2hrXSk7XG5cbiAgICAgICAgbGV0IHBhY2tldHMgPSBuZXcgVWludDhBcnJheShbMHhmZiwgc29wMiwgZGlkLCBjaWQsIHNlcSwgZGxlbl0pO1xuICAgICAgICAvLyBBcHBlbmQgYXJyYXlzOiBwYWNrZXQgKyBkYXRhICsgY2hlY2tzdW1cbiAgICAgICAgbGV0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkocGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoICsgY2hlY2tzdW0uYnl0ZUxlbmd0aCk7XG4gICAgICAgIGFycmF5LnNldChwYWNrZXRzLCAwKTtcbiAgICAgICAgYXJyYXkuc2V0KGRhdGEsIHBhY2tldHMuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGFycmF5LnNldChjaGVja3N1bSwgcGFja2V0cy5ieXRlTGVuZ3RoICsgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dyaXRlQ2hhcmFjdGVyaXN0aWModGhpcy5jb25maWcucm9ib3RTZXJ2aWNlKCksIHRoaXMuY29uZmlnLmNvbnRyb2xDaGFyYWN0ZXJpc3RpYygpLCBhcnJheSk7ICAgICAgICAgIFxuICAgIH1cblxuXG4gIFxuXG4gICAgX3dyaXRlQ2hhcmFjdGVyaXN0aWMoc2VydmljZVVJRCwgY2hhcmFjdGVyaXN0aWNVSUQsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRldmljZS5nYXR0LmdldFByaW1hcnlTZXJ2aWNlKHNlcnZpY2VVSUQpXG4gICAgICAgICAgICAudGhlbihzZXJ2aWNlID0+IHNlcnZpY2UuZ2V0Q2hhcmFjdGVyaXN0aWMoY2hhcmFjdGVyaXN0aWNVSUQpKVxuICAgICAgICAgICAgLnRoZW4oY2hhcmFjdGVyaXN0aWMgPT4gY2hhcmFjdGVyaXN0aWMud3JpdGVWYWx1ZSh2YWx1ZSkpO1xuICAgIH1cblxuXG59XG5cblxubGV0IG9sbGllID0gbmV3IE9sbGllKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gb2xsaWU7Il19
