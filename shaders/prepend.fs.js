precision mediump float;

#define Ox10000 65536.0
#define Ox8000  32768.0

#define Ox5c5c 23644.0
#define Ox3636 13878.0

#define POW_2_01 2.0
#define POW_2_02 4.0
#define POW_2_03 8.0
#define POW_2_04 16.0
#define POW_2_05 32.0
#define POW_2_06 64.0
#define POW_2_07 128.0
#define POW_2_08 256.0
#define POW_2_09 512.0
#define POW_2_10 1024.0
#define POW_2_11 2048.0
#define POW_2_12 4096.0
#define POW_2_13 8192.0
#define POW_2_14 16384.0

#define TMP_HASH_OFFSET          0
#define TMP_HASH_OFFSET_END      8
#define TMP_WORK_OFFSET          8
#define TMP_WORK_OFFSET_END      24
#define NONCED_HEADER_OFFSET     72
#define NONCED_HEADER_OFFSET_END 92
#define HEADER_HASH1_OFFSET      92
#define HEADER_HASH1_OFFSET_END  100
#define PADDED_HEADER_OFFSET     100
#define PADDED_HEADER_OFFSET_END 116
#define IKEY_OFFSET              116
#define IKEY_OFFSET_END          132
#define OKEY_OFFSET              132
#define OKEY_OFFSET_END          148
#define HMAC_KEY_HASH_OFFSET     148
#define HMAC_KEY_HASH_OFFSET_END 156
#define IKEY_HASH1_OFFSET        156
#define IKEY_HASH1_OFFSET_END    164
#define OKEY_HASH1_OFFSET        164
#define OKEY_HASH1_OFFSET_END    172
#define INITIAL_HASH_OFFSET      172
#define INITIAL_HASH_OFFSET_END  180
#define TEMP_HASH_OFFSET         180
#define TEMP_HASH_OFFSET_END     188
#define FINAL_SCRYPT_OFFSET      188
#define FINAL_SCRYPT_OFFSET_END  196
#define SCRYPT_X_OFFSET          196
#define SCRYPT_X_OFFSET_END      228
#define TMP_SCRYPT_X_OFFSET      228
#define TMP_SCRYPT_X_OFFSET_END  244
#define SCRYPT_V_OFFSET          244
#define SCRYPT_V_OFFSET_END      33012

#define BLOCK_SIZE 33012.
#define TEXTURE_SIZE %%TEXTURE_SIZE%%.

vec4 toRGBA(vec2 arg) {
      float V = float(arg.x);
      float R = floor(V / POW_2_08);
      V -= R * POW_2_08;
      float G = V;
      V = float(arg.y);
      float B = floor(V / POW_2_08);
      V -= B * POW_2_08;
      float A = V;
      return vec4(R/255., G/255., B/255., A/255.);
}
