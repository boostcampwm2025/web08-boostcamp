-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: update data (buffer)
-- ARGV[2]: TTL in seconds
-- RETURN: { len: number, offset: number }

local updatesKey = KEYS[1]
local offsetKey = KEYS[2]
local updateData = ARGV[1]
local ttl = tonumber(ARGV[2])

-- Push update to the list
local len = redis.call('RPUSH', updatesKey, updateData)

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', offsetKey)
local offset = tonumber(offsetStr or "0")

-- Set TTL
redis.call('EXPIRE', updatesKey, ttl)
if offsetStr then redis.call('EXPIRE', offsetKey, ttl) end

-- Return length and offset
return { len, offset }
