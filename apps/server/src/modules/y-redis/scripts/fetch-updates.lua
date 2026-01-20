-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: clock (logical clock to start fetching from)
-- ARGV[2]: TTL in seconds
-- RETURN: { updates: Buffer[], offset: number }

local updatesKey = KEYS[1]
local offsetKey = KEYS[2]
local clock = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', offsetKey)
local offset = tonumber(offsetStr or "0")

-- Calculate physical start index
local index = clock - offset

-- Consistency Recovery
-- The local clock is behind the Redis offset (clock < offset).
-- This occurs if Redis was compacted but the DB snapshot update is still in progress.
-- Return an empty list to let the app trigger a snapshot reload from the database.
if clock < offset then
  return { {}, offset }
end

-- Fetch updates from physical index to end
local updates = redis.call('LRANGE', updatesKey, index, -1)

-- Set TTL
if #updates > 0 then redis.call('EXPIRE', updatesKey, ttl, 'NX') end
if offsetStr then redis.call('EXPIRE', offsetKey, ttl, 'NX') end

-- Return updates and offset
return { updates, offset }
