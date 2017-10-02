# animated-broccoli
read image

get u1 from document.cookie
get license from query to cdn with browserid, version, u1 and formats
decode license with base64
~~decrypt with rc4 64 bit - key is md5hash(BID + u1 + BASE_KEY + salt)
where decoded license is salted__ + eight byte salt + the rest~~


convert BID + u1 + BASE_KEY + salt into array of 4 byte integers
???
