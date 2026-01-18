-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: update data (buffer)
-- RETURN: { len: number, offset: number }

-- Push update to the list
local len = redis.call('RPUSH', KEYS[1], ARGV[1])

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', KEYS[2])
local offset = tonumber(offsetStr or "0")

-- Return length and offset
return { len, offset }
