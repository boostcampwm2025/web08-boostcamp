-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: update data (buffer)
-- ARGV[2]: TTL in seconds
-- RETURN: { len: number, offset: number }

local ttl = tonumber(ARGV[2])

-- Push update to the list
local len = redis.call('RPUSH', KEYS[1], ARGV[1])

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', KEYS[2])
local offset = tonumber(offsetStr or "0")

-- Set TTL
redis.call('EXPIRE', KEYS[1], ttl, 'NX')
if offsetStr then redis.call('EXPIRE', KEYS[2], ttl) end

-- Return length and offset
return { len, offset }
