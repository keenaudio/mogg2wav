#!/bin/bash -e
chans=`soxi -c "$1"`
filename=`basename "$1"`
while [ $chans -ge 1 ]; do
   chans0=`printf %02i $chans`   # 2 digits hence up to 99 chans
   out=`echo "$filename"|sed "s/\(.*\)\.\(.*\)/\1\/\1-$chans0.\2/"`
   sox -V0 -S "$1" "$out" remix $chans
   chans=$(( $chans-1 ))
done
echo "done yo"