#!/bin/bash

#
#  Time to wake up set here. Here it's 8am
#
WAKEUP_HOUR=8
WAKEUP_MINUTE=0

#
# Run this at midnight to set the alarm
#
if [ x`whoami` != "xroot" ]; then
  echo "Need to run with sudo!"
  exit 1
fi
if [ ! -e /sys/class/rtc/rtc0/wakealarm ]; then
  echo "Your don't seem to have the /sys/class/rtc/rtc0/wakealarm interface"
  exit 1
fi


MINS=$((WAKEUP_HOUR * 60 + $WAKEUP_MINUTE))
SECS=$((MINS * 60))
echo $SECS
EPOCH=`cat /sys/class/rtc/rtc0/since_epoch`
SKEW=$((`date '+%s'`- $EPOCH))

WAKEUP=$((SECS + $SKEW))
echo 0 > /sys/class/rtc/rtc0/wakealarm
echo $WAKEUP > /sys/class/rtc/rtc0/wakealarm

echo "Now shutting down..."
sync
sync
shutdown -h now
