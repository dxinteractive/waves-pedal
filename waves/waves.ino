#include <Arduino.h>
#include <Wire.h>
#include "./src/MPR121/mpr121.h"
#include <Audio.h>
#include <SPI.h>
#include <SD.h>
#include <SerialFlash.h>
#include <Bounce.h>

// GUItool: begin automatically generated code
AudioSynthWaveformSine   sine1;          //xy=280,1777.5
AudioOutputAnalog        dac1;           //xy=423,1775.5
AudioConnection          patchCord1(sine1, dac1);
// GUItool: end automatically generated code

//
// consts
//

#define PIN_VACTROL_L      4
#define PIN_VACTROL_R      3
#define PIN_LED_1          5
#define PIN_LED_2          6
#define PIN_CV_OUT         A14

// #define PIN_BUTTON_TAP     14
#define PIN_BUTTON_SWITCH  10
#define PIN_BUTTON_REC     15
#define PIN_BUTTON_SEL     16

#define PIN_CV_IN          A6
#define PIN_POT_DEPTH      A7
#define PIN_POT_RATE       A8
#define PIN_POT_RANDOM     A9

#define ANALOG_WRITE_FREQ  36000
#define ANALOG_READ_MAX    1023
#define BUTTON_DEBOUNCE_MS 15

//
// global instances
//

Bounce rec = Bounce(PIN_BUTTON_REC, BUTTON_DEBOUNCE_MS);
Bounce sel = Bounce(PIN_BUTTON_SEL, BUTTON_DEBOUNCE_MS);
Bounce sup = Bounce(PIN_BUTTON_SWITCH, BUTTON_DEBOUNCE_MS);

//
// setup
//

void setup() {
  // Serial.begin(9600);
  AudioMemory(10);

  pinMode(PIN_VACTROL_L, OUTPUT);
  pinMode(PIN_VACTROL_R, OUTPUT);
  pinMode(PIN_LED_1, OUTPUT);
  pinMode(PIN_LED_2, OUTPUT);
  pinMode(PIN_CV_OUT, OUTPUT);

  analogWriteFrequency(PIN_VACTROL_L, ANALOG_WRITE_FREQ);
  analogWriteFrequency(PIN_VACTROL_R, ANALOG_WRITE_FREQ);
  analogWriteFrequency(PIN_LED_1, ANALOG_WRITE_FREQ);
  analogWriteFrequency(PIN_LED_2, ANALOG_WRITE_FREQ);

  pinMode(PIN_BUTTON_SWITCH, INPUT_PULLUP);
  pinMode(PIN_BUTTON_SEL, INPUT_PULLUP);
  pinMode(PIN_BUTTON_REC, INPUT_PULLUP);

  pinMode(PIN_CV_IN, INPUT);
  pinMode(PIN_POT_DEPTH, INPUT);
  pinMode(PIN_POT_RATE, INPUT);
  pinMode(PIN_POT_RANDOM, INPUT);

  Wire.begin();
  CapaTouch.begin();
}

//
// reads
//

int mapConstrain(int x, int imin, int imax, int omin, int omax) {
  return constrain(map(x, imin, imax, omin, omax), omin, omax);
}

float readRate() {
  analogRead(PIN_POT_RATE);
  analogRead(PIN_POT_RATE);
  int x = analogRead(PIN_POT_RATE);
  float f = mapConstrain(x, 1023, 0, 0, ANALOG_READ_MAX);
  return f / ANALOG_READ_MAX;
}

float readDepth() {
  analogRead(PIN_POT_DEPTH);
  analogRead(PIN_POT_DEPTH);
  int x = analogRead(PIN_POT_DEPTH);
  float f = mapConstrain(x, 20, 1023, 0, ANALOG_READ_MAX);
  return f / ANALOG_READ_MAX;
}

float readRandom() {
  analogRead(PIN_POT_RANDOM);
  analogRead(PIN_POT_RANDOM);
  int x = analogRead(PIN_POT_RANDOM);
  float f = mapConstrain(x, 1020, 4, 0, ANALOG_READ_MAX);
  return f / ANALOG_READ_MAX;
}

float readCV() {
  analogRead(PIN_CV_IN);
  analogRead(PIN_CV_IN);
  float f = analogRead(PIN_CV_IN);
  return f / ANALOG_READ_MAX;
}

//
// loop
//

void loop() {
  // write leds
  // takes 3us
  // analogWrite(PIN_VACTROL_L, 255);
  // analogWrite(PIN_VACTROL_R, 255);
  // analogWrite(PIN_LED_1, 255);
  // analogWrite(PIN_LED_2, 255);
  // analogWrite(PIN_CV_OUT, 255);
  // https://www.pjrc.com/teensy/gui/index.html?info=AudioOutputAnalog

  // read touch pad
  // 580us
  // x = CapaTouch.getX(); // 1-9
  // y = CapaTouch.getY(); // 1-13

  // read pots and cv
  // 120us
  // float rate = readRate();
  // float depth = readDepth();
  // float random = readRandom();
  // float cv = readCV();

  // 2us
  // rec.update();
  // sel.update();
  // sup.update();

  // int start = micros();


  // AudioNoInterrupts();
  // waveform1.phase(knob_A3 * 360.0);
  // AudioInterrupts();


  // delay(200);
  // Serial.println(":)");
}
