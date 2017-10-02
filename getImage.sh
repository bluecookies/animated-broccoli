#!/usr/local/bin/bash
# get-images.sh
echo $BASH_VERSION
SRC_URL="http://delivery.comic-walker.com/production/delivery/$1/epub_brws_fixedlayout/VGA/00/"
FILE="item/xhtml/p-"
mkdir -p images

filepath=$FILE"cover.xhtml/0"
wget -O ./images/001.jpeg $SRC_URL$filepath".jpeg" && rm charsums
python -c 'print(sum(bytearray("'$filepath'")))' >> charsums
for num in $(seq -f "%03g" ${2:-2} 999)
do
	filepath=$FILE$num".xhtml/0"
  wget -O ./images/${num}.jpeg $SRC_URL$filepath".jpeg" || break
  python -c 'print(sum(bytearray("'$filepath'")))' >> charsums
done