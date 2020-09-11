/**
 * Original code from
 * https://github.com/waveshare/pxt-Servo
 * MIT License
 * additional Code by Michael Klein 31.12.19
 * 
 * Default I2C Adress is 0x40
 * 
 */

//% weight=5 color=#0fbc11 icon="\uf1b6"
namespace Servo {
    let PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06

    let initialized = false

    // List of servos for the servo block to use.
    export enum Servos {
        //% block="舵机0"
        Servo0 = 0,
        //% block="舵机1"
        Servo1 = 1,
        //% block="舵机2"
        Servo2 = 2,
        //% block="舵机3"
        Servo3 = 3,
        //% block="舵机4"
        Servo4 = 4,
        //% block="舵机5"
        Servo5 = 5,
        //% block="舵机6"
        Servo6 = 6,
        //% block="舵机7"
        Servo7 = 7,
        //% block="舵机8"
        Servo8 = 8,
        //% block="舵机9"
        Servo9 = 9,
        //% block="舵机10"
        Servo10 = 10,
        //% block="舵机11"
        Servo11 = 11,
        //% block="舵机12"
        Servo12 = 12,
        //% block="舵机13"
        Servo13 = 13,
        //% block="舵机14"
        Servo14 = 14,
        //% block="舵机15"
        Servo15 = 15
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        setPwm(0, 0, 4095);
        for (let idx = 1; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

	/**
	 * Servo Winkel setzen
	 * @param degree [0-180] degree of servo; eg: 90, 0, 180
	*/
    //% blockId=Servo block="控制舵机： |%channel| 旋转 |%degree=protractorPicker| 度"
    //% weight=85
    //% channel.fieldEditor="gridpicker"
    //% channel.fieldOptions.width=220
    //% channel.fieldOptions.columns=4
    //% degree.min=0 degree.max=180
    export function Servo(channel: Servos, degree: number): void {
        if (!initialized) {
            initPCA9685();
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600); // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000;
        setPwm(channel, 0, value);
    }

	/**
	 * Servo Puls setzen
	 * @param pulse [500-2500] pulse of servo; eg: 1500, 500, 2500
	*/
    //% blockId=ServoPulse block="控制舵机： |%channel| 旋转 |%pulse| 毫秒"
    //% weight=85
    //% pulse.min=500 pulse.max=2500
    //% channel.fieldEditor="gridpicker"
    //% channel.fieldOptions.width=220
    //% channel.fieldOptions.columns=4
    export function ServoPulse(channel: Servos, pulse: number): void {
        if (!initialized) {
            initPCA9685();
        }
        // 50hz: 20,000 us
        let value = pulse * 4096 / 20000;
        setPwm(channel, 0, value);
    }

    //% blockId=SetI2cAdress block="重新设置舵机驱动板的IIC地址"
    export function SetI2cAdress(): void {
         PCA9685_ADDRESS = 0x7F
    }
} 
