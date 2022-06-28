/*
  Blink
  Turns on an LED on for one second, then off for one second, repeatedly.

  This example code is in the public domain.
 */

#include <Arduino.h>

//
// consts
//

#define PIN_VACTROL_R      3
#define PIN_VACTROL_L      4
#define PIN_LED_1          5
#define PIN_LED_2          6

#define PIN_BUTTON_1       14
#define PIN_BUTTON_2       15
#define PIN_BUTTON_3       16

#define PIN_CV             A6
#define PIN_POT_1          A7
#define PIN_POT_2          A8
#define PIN_POT_3          A9

#define ANALOG_WRITE_FREQ  36000

void setup() {
  pinMode(PIN_VACTROL_L, OUTPUT);
  pinMode(PIN_VACTROL_R, OUTPUT);
  pinMode(PIN_LED_1, OUTPUT);
  pinMode(PIN_LED_2, OUTPUT);

  analogWriteFrequency(PIN_VACTROL_L, ANALOG_WRITE_FREQ);
  analogWriteFrequency(PIN_VACTROL_R, ANALOG_WRITE_FREQ);
  analogWriteFrequency(PIN_LED_1, ANALOG_WRITE_FREQ);
  analogWriteFrequency(PIN_LED_2, ANALOG_WRITE_FREQ);

  pinMode(PIN_BUTTON_1, INPUT_PULLUP);
  pinMode(PIN_BUTTON_2, INPUT_PULLUP);
  pinMode(PIN_BUTTON_3, INPUT_PULLUP);

  pinMode(PIN_CV, INPUT);
  pinMode(PIN_POT_1, INPUT);
  pinMode(PIN_POT_2, INPUT);
  pinMode(PIN_POT_3, INPUT);
}

int a = 0;
int d = 1;

void loop() {
  // analogWrite(PIN_VACTROL_L, a);
  // analogWrite(PIN_VACTROL_R, a);
  // analogWrite(PIN_LED_1, a);
  // analogWrite(PIN_LED_2, a);

  analogWrite(PIN_VACTROL_L, 255);
  analogWrite(PIN_VACTROL_R, 255);
  analogWrite(PIN_LED_1, 255);
  analogWrite(PIN_LED_2, 255);

  a += d;
  if (a >= 255) {
    d = -1;
  }
  if (a <= 0) {
    d = 1;
  }

  delay(100);
}
