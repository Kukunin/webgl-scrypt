___ = {
  byte_to_hex: function(b) {
    var tab = '0123456789abcdef';
    b = b & 0xff;
    return tab.charAt(b / 16) +
           tab.charAt(b % 16);
  },
  hex_to_uintX_array: function(hex, size) {
    var arr = [];
    for (var i = 0, l = hex.length; i < l; i += size) {
        arr.push((parseInt(hex.substring(i, i+size), 16)));
    }
    return arr;
  },
  uint16_array_to_hex: function(arr) {
    var hex = '';
    for (var i = 0; i < arr.length; i++) {
      hex += ___.byte_to_hex(arr[i] >>>  8);
      hex += ___.byte_to_hex(arr[i]       );
    }
    return hex;
  }
};
___.hex_to_uint8_array  = function(hex) { return ___.hex_to_uintX_array(hex, 2); }
___.hex_to_uint16_array = function(hex) { return ___.hex_to_uintX_array(hex, 4); }
___.hex_to_uint32_array = function(hex) { return ___.hex_to_uintX_array(hex, 8); }
