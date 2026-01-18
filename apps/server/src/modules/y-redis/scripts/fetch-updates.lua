-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: clock (logical clock to start fetching from)
-- RETURN: { updates: Buffer[], offset: number }

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', KEYS[2])
local offset = tonumber(offsetStr or "0")

-- Calculate physical start index
local clock = tonumber(ARGV[1])
local index = clock - offset

-- Consistency Recovery
-- The local clock is behind the Redis offset (clock < offset).
-- This occurs if Redis was compacted but the DB snapshot update is still in progress.
-- Return an empty list to let the app trigger a snapshot reload from the database.
if clock < offset then
  return { {}, offset }
end

-- Fetch updates from physical index to end
local updates = redis.call('LRANGE', KEYS[1], index, -1)

-- Return updates and offset
return { updates, offset }
