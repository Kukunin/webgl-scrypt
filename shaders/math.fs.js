/* Note: shift should be a power of two, e.g. to rotate 3 steps, use 2^3. */
vec2 rotr (in vec2 a, in float shift)
{
    vec2 ret = a / shift;
    ret = floor(ret) + fract(ret.yx) * float(Ox10000);
    return ret;
}

float xor16 (in float a, in float b)
{
    float ret = float(0);
    float fact = float(Ox8000);
    const int maxi = 16;

    for (int i=0; i < maxi; i++)
    {
        if ((max(a,b) >= fact) && (min(a,b) < fact))
            ret += fact;

        if (a >= fact) a -= fact;
            if (b >= fact) b -= fact;

                fact /= 2.0;
    }
    return ret;
}

vec2 xor (in vec2 a, in vec2 b)
{
        return vec2 (xor16 (a.x, b.x), xor16 (a.y, b.y));
}

vec2 safe_add (in vec2 a, in vec2 b)
{
    vec2 ret = a + b;
    if (ret.y >= float(Ox10000)) {
        ret += vec2(1.0, -1.*float(Ox10000));
    }
    if (ret.x >= float(Ox10000)) {
        ret.x -= float(Ox10000);
    }
    return ret;
}

float and16 (in float a, in float b)
{
	float ret = float(0);
	float fact = float (Ox8000);
        const int maxi = 16;

	for (int i=0; i < maxi; i++)
	{
            if (min(a, b) >= fact)
                ret += fact;

            if (a >= fact)
		a -= fact;
            if (b >= fact)
		b -= fact;

            fact /= 2.0;
	}
	return ret;
}

vec2 and (in vec2 a, in vec2 b)
{
      return vec2 (and16 (a.x, b.x), and16 (a.y, b.y));
}
