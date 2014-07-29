___ = {
  hex_to_uintX_array: function(hex, size) {
    var arr = [];
    for (var i = 0, l = hex.length; i < l; i += size) {
        arr.push((parseInt(hex.substring(i, i+size), 16)));
    }
    return arr;
  }
};
___.hex_to_uint8_array  = function(hex) { return ___.hex_to_uintX_array(hex, 2); }
___.hex_to_uint16_array = function(hex) { return ___.hex_to_uintX_array(hex, 4); }
___.hex_to_uint32_array = function(hex) { return ___.hex_to_uintX_array(hex, 8); }
